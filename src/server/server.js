import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import userRoutes from './routes/user.js'
import calendarRoutes from './routes/calendar.js'
import calendarUserRoutes from './routes/calendarUser.js'
import eventRoutes from './routes/event.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173'
}));

// specifying api path for server to use
app.use('/api/users', userRoutes)
app.use('/api/calendars', calendarRoutes)
app.use('/api/calendars', calendarUserRoutes)
app.use('/api/events', eventRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});

export default app