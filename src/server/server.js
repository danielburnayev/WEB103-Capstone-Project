const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

// Routes
const userRoutes = require('./routes/user')
const calendarRoutes = require('./routes/calendar')
const calendarUserRoutes = require('./routes/calendarUser')
const eventRoutes = require('./routes/event')

app.use('/api/users', userRoutes)
app.use('/api/calendars', calendarRoutes)
app.use('/api/calendars', calendarUserRoutes)
app.use('/api/events', eventRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app