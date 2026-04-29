import './config/loadEnv.js'
import express from 'express'
import cors from 'cors'
import userRoutes from './routes/user.js'
import calendarRoutes from './routes/calendar.js'
import calendarUserRoutes from './routes/calendarUser.js'
import eventRoutes from './routes/event.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// ✅ FIXED CORS CONFIG
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://web103-capstone-project-1.onrender.com' // 👈 your frontend
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

// routes
app.use('/api/users', userRoutes)
app.use('/api/calendars', calendarRoutes)
app.use('/api/calendars', calendarUserRoutes)
app.use('/api/events', eventRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}).on('error', (err) => {
  console.error('Server failed to start:', err);
})

export default app