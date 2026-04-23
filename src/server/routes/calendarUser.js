const express = require('express')
const router = express.Router()
const { getUsersInCalendar, addUserToCalendar, updateCalendarUser, removeUserFromCalendar } = require('../controllers/calendarUserController')

// All scoped under /calendars/:calendar_id/users
router.get('/:calendar_id/users', getUsersInCalendar)
router.post('/:calendar_id/users', addUserToCalendar)
router.put('/:calendar_id/users/:user_id', updateCalendarUser)
router.delete('/:calendar_id/users/:user_id', removeUserFromCalendar)

module.exports = router