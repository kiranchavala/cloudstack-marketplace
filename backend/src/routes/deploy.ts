import { Router, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { deployVirtualMachine } from '../services/cloudstack'

const router = Router()
const prisma = new PrismaClient()

// POST /deploy — deploy an app for the authenticated user
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { appSlug, region, size } = req.body

    if (!appSlug || !region || !size) {
      res.status(400).json({ error: 'appSlug, region, and size are required' })
      return
    }

    const app = await prisma.app.findUnique({ where: { slug: appSlug } })
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    // Deploy to CloudStack
    const vmResult = await deployVirtualMachine({
      templateId: app.slug,
      serviceOfferingId: size,
      zoneId: region,
      name: `${app.slug}-${Date.now()}`,
    })

    // Persist the deployment
    const deployment = await prisma.deployment.create({
      data: {
        userId: req.user!.id,
        appId: app.id,
        cloudstackVmId: vmResult.vmId,
        status: 'pending',
        region,
        size,
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

export default router
