import { Router, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// POST /vendor/submit — submit a new app for review (requires auth)
router.post('/submit', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, category, tags, icon, version, osType } = req.body

    if (!name || !slug || !description || !category || !version) {
      res.status(400).json({ error: 'name, slug, description, category, and version are required' })
      return
    }

    const existing = await prisma.app.findUnique({ where: { slug } })
    if (existing) {
      res.status(409).json({ error: 'An app with this slug already exists' })
      return
    }

    const app = await prisma.app.create({
      data: {
        name,
        slug,
        description,
        category,
        tags: tags || [],
        icon: icon || '📦',
        version,
        osType: osType || 'Ubuntu 22.04',
        status: 'pending',
        vendorId: req.user!.id,
      },
    })

    res.status(201).json({ app })
  } catch (err) {
    next(err)
  }
})

export default router
