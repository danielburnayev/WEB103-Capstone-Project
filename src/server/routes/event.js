import express from 'express'
import { getEventsByCalendar, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js'

const eventRoutes = express.Router()

eventRoutes.get('/calendar/:calendar_id', getEventsByCalendar)
eventRoutes.get('/:id', getEventById)
eventRoutes.post('/', createEvent)
eventRoutes.put('/:id', updateEvent)
eventRoutes.delete('/:id', deleteEvent)

export default eventRoutes