import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { listZones, listServiceOfferings, listTemplates } from '../services/cloudstack'

const router = Router()

// GET /cloudstack/zones — list available zones
router.get('/zones', authMiddleware, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zones = await listZones()
    res.json({ zones })
  } catch (err) {
    next(err)
  }
})

// GET /cloudstack/offerings — list service offerings (VM sizes)
router.get('/offerings', authMiddleware, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const offerings = await listServiceOfferings()
    res.json({ offerings })
  } catch (err) {
    next(err)
  }
})

// GET /cloudstack/templates — list templates, optional ?zoneId=
router.get('/templates', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zoneId = typeof req.query?.zoneId === 'string' ? req.query.zoneId : undefined
    const templates = await listTemplates(zoneId)
    res.json({ templates })
  } catch (err) {
    next(err)
  }
})

export default router
