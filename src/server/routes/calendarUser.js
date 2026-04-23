import express from 'express'
import { getUsersInCalendar, addUserToCalendar, updateCalendarUser, removeUserFromCalendar } from '../controllers/calendarUserController.js'

const router = express.Router()

router.get('/:calendar_id/users', getUsersInCalendar)
router.post('/:calendar_id/users', addUserToCalendar)
router.put('/:calendar_id/users/:user_id', updateCalendarUser)
router.delete('/:calendar_id/users/:user_id', removeUserFromCalendar)

export default router