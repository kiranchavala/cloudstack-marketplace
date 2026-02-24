import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /apps — list all active apps with optional search & category filter
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category, page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: Record<string, unknown> = { status: 'active' }
    if (category) where.category = { equals: category as string, mode: 'insensitive' }
    if (q) {
      where.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { tags: { has: q as string } },
      ]
    }

    const [apps, total] = await Promise.all([
      prisma.app.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: { vendor: { select: { id: true, email: true } } },
      }),
      prisma.app.count({ where }),
    ])

    res.json({ apps, total })
  } catch (err) {
    next(err)
  }
})

// GET /apps/:slug — get a single app by slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await prisma.app.findUnique({
      where: { slug: req.params.slug },
      include: {
        vendor: { select: { id: true, email: true } },
        reviews: {
          include: { user: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    res.json({ app })
  } catch (err) {
    next(err)
  }
})

export default router
