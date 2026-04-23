import express from 'express'
import { getEventsByCalendar, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js'

const router = express.Router()

router.get('/calendar/:calendar_id', getEventsByCalendar)
router.get('/:id', getEventById)
router.post('/', createEvent)
router.put('/:id', updateEvent)
router.delete('/:id', deleteEvent)

export default router