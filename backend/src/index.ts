import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import appsRouter from './routes/apps'
import deployRouter from './routes/deploy'
import authRouter from './routes/auth'
import reviewsRouter from './routes/reviews'
import vendorRouter from './routes/vendor'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Routes
app.use('/apps', appsRouter)
app.use('/deploy', deployRouter)
app.use('/auth', authRouter)
app.use('/vendor', vendorRouter)

// Reviews are nested under apps
app.use('/apps', reviewsRouter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
})

export default app
