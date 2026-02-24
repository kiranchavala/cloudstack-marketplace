import { Router, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import {
  deployVirtualMachine,
  getAsyncJobResult,
  getVMDetails,
  stopVirtualMachine,
  startVirtualMachine,
  destroyVirtualMachine,
} from '../services/cloudstack'
import { getUserdataForApp } from '../utils/userdata'

const router = Router()
const prisma = new PrismaClient()

// POST /deploy — deploy an app for the authenticated user
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { appSlug, zoneId, serviceOfferingId } = req.body

    if (!appSlug || !zoneId || !serviceOfferingId) {
      res.status(400).json({ error: 'appSlug, zoneId, and serviceOfferingId are required' })
      return
    }

    const app = await prisma.app.findUnique({ where: { slug: appSlug } })
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const templateId =
      app.cloudstackTemplateId ||
      process.env.CLOUDSTACK_DEFAULT_TEMPLATE_ID ||
      app.slug

    const userdata = app.userdata || getUserdataForApp(appSlug)

    // Deploy to CloudStack
    const vmResult = await deployVirtualMachine({
      templateId,
      serviceOfferingId,
      zoneId,
      name: `${app.slug}-${Date.now()}`,
      keypair: process.env.CLOUDSTACK_KEYPAIR_NAME,
      userdata,
    })

    // Persist the deployment
    const deployment = await prisma.deployment.create({
      data: {
        userId: req.user!.id,
        appId: app.id,
        cloudstackVmId: vmResult.id || '',
        cloudstackJobId: vmResult.jobid,
        status: vmResult.jobid ? 'deploying' : 'running',
        region: zoneId,
        size: serviceOfferingId,
        ipAddress: vmResult.nic?.[0]?.ipaddress,
      },
    })

    res.status(201).json({ deployment })
  } catch (err) {
    next(err)
  }
})

// GET /deploy/my — list deployments for the authenticated user
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deployments = await prisma.deployment.findMany({
      where: { userId: req.user!.id },
      include: { app: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ deployments })
  } catch (err) {
    next(err)
  }
})

// GET /deploy/status/:deploymentId — poll deployment status
router.get(
  '/status/:deploymentId',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { deploymentId } = req.params
      const deployment = await prisma.deployment.findFirst({
        where: { id: deploymentId, userId: req.user!.id },
        include: { app: true },
      })

      if (!deployment) {
        res.status(404).json({ error: 'Deployment not found' })
        return
      }

      if (deployment.status === 'deploying' && deployment.cloudstackJobId) {
        const jobResult = await getAsyncJobResult(deployment.cloudstackJobId)

        if (jobResult.jobstatus === 0) {
          res.json({ status: 'deploying', message: 'VM is being provisioned...', deployment })
          return
        }

        if (jobResult.jobstatus === 1) {
          const vm = (jobResult.jobresult as Record<string, unknown>)
            ?.virtualmachine as import('../services/cloudstack').CloudStackVM | undefined
          const ipAddress = vm?.nic?.find((n) => n.isdefault)?.ipaddress || vm?.nic?.[0]?.ipaddress

          const updated = await prisma.deployment.update({
            where: { id: deploymentId },
            data: {
              status: 'running',
              cloudstackVmId: vm?.id || deployment.cloudstackVmId,
              ipAddress: ipAddress || deployment.ipAddress,
            },
            include: { app: true },
          })
          res.json({ status: 'running', deployment: updated })
          return
        }

        if (jobResult.jobstatus === 2) {
          const updated = await prisma.deployment.update({
            where: { id: deploymentId },
            data: { status: 'failed' },
            include: { app: true },
          })
          res.json({ status: 'failed', deployment: updated })
          return
        }
      }

      if (deployment.status === 'running' && deployment.cloudstackVmId) {
        try {
          const vm = await getVMDetails(deployment.cloudstackVmId)
          res.json({ status: deployment.status, deployment, vmState: vm.state })
          return
        } catch {
          // Fall through to return cached status
        }
      }

      res.json({ status: deployment.status, deployment })
    } catch (err) {
      next(err)
    }
  }
)

// POST /deploy/:deploymentId/stop — stop a VM
router.post(
  '/:deploymentId/stop',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { deploymentId } = req.params
      const deployment = await prisma.deployment.findFirst({
        where: { id: deploymentId, userId: req.user!.id },
      })

      if (!deployment) {
        res.status(404).json({ error: 'Deployment not found' })
        return
      }

      if (!deployment.cloudstackVmId) {
        res.status(400).json({ error: 'No VM associated with this deployment' })
        return
      }

      const { jobId } = await stopVirtualMachine(deployment.cloudstackVmId)

      const updated = await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'stopped', cloudstackJobId: jobId },
        include: { app: true },
      })

      res.json({ deployment: updated })
    } catch (err) {
      next(err)
    }
  }
)

// POST /deploy/:deploymentId/start — start a VM
router.post(
  '/:deploymentId/start',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { deploymentId } = req.params
      const deployment = await prisma.deployment.findFirst({
        where: { id: deploymentId, userId: req.user!.id },
      })

      if (!deployment) {
        res.status(404).json({ error: 'Deployment not found' })
        return
      }

      if (!deployment.cloudstackVmId) {
        res.status(400).json({ error: 'No VM associated with this deployment' })
        return
      }

      const { jobId } = await startVirtualMachine(deployment.cloudstackVmId)

      const updated = await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'running', cloudstackJobId: jobId },
        include: { app: true },
      })

      res.json({ deployment: updated })
    } catch (err) {
      next(err)
    }
  }
)

// DELETE /deploy/:deploymentId — destroy a VM
router.delete(
  '/:deploymentId',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { deploymentId } = req.params
      const deployment = await prisma.deployment.findFirst({
        where: { id: deploymentId, userId: req.user!.id },
      })

      if (!deployment) {
        res.status(404).json({ error: 'Deployment not found' })
        return
      }

      if (!deployment.cloudstackVmId) {
        res.status(400).json({ error: 'No VM associated with this deployment' })
        return
      }

      await destroyVirtualMachine(deployment.cloudstackVmId)

      const updated = await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'destroyed', destroyedAt: new Date() },
        include: { app: true },
      })

      res.json({ deployment: updated })
    } catch (err) {
      next(err)
    }
  }
)

export default router
