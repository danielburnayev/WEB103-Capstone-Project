const express = require('express')
const router = express.Router()
const { getEventsByCalendar, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController')

router.get('/calendar/:calendar_id', getEventsByCalendar)
router.get('/:id', getEventById)
router.post('/', createEvent)
router.put('/:id', updateEvent)
router.delete('/:id', deleteEvent)

module.exports = router