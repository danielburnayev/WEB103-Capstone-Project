import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/user.js'
import calendarRoutes from './routes/calendar.js'
import calendarUserRoutes from './routes/calendarUser.js'
import eventRoutes from './routes/event.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

app.use('/api/users', userRoutes)
app.use('/api/calendars', calendarRoutes)
app.use('/api/calendars', calendarUserRoutes)
app.use('/api/events', eventRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app