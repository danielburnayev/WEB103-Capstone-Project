const express = require('express')
const router = express.Router()
const { getAllCalendars, getCalendarById, createCalendar, updateCalendar, deleteCalendar } = require('../controllers/calendarController')

router.get('/', getAllCalendars)
router.get('/:id', getCalendarById)
router.post('/', createCalendar)
router.put('/:id', updateCalendar)
router.delete('/:id', deleteCalendar)

module.exports = router