import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /apps/:slug/reviews
router.get('/:slug/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await prisma.app.findUnique({ where: { slug: req.params.slug } })
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const reviews = await prisma.review.findMany({
      where: { appId: app.id },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ reviews })
  } catch (err) {
    next(err)
  }
})

// POST /apps/:slug/reviews — requires authentication
router.post(
  '/:slug/reviews',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { rating, comment } = req.body

      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' })
        return
      }

      const app = await prisma.app.findUnique({ where: { slug: req.params.slug } })
      if (!app) {
        res.status(404).json({ error: 'App not found' })
        return
      }

      const review = await prisma.review.create({
        data: {
          userId: req.user!.id,
          appId: app.id,
          rating: parseInt(rating),
          comment: comment || '',
        },
        include: { user: { select: { id: true, email: true } } },
      })

      res.status(201).json({ review })
    } catch (err) {
      next(err)
    }
  }
)

export default router
