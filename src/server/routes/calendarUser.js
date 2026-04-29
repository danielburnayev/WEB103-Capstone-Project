import express from 'express'
import { getUsersInCalendar, addUserToCalendar, updateCalendarUser, removeUserFromCalendar } from '../controllers/calendarUserController.js'

const calendarUserRoutes = express.Router()

calendarUserRoutes.get('/:calendar_id/users', getUsersInCalendar)
calendarUserRoutes.post('/:calendar_id/users', addUserToCalendar)
calendarUserRoutes.put('/:calendar_id/users/:user_id', updateCalendarUser)
calendarUserRoutes.delete('/:calendar_id/users/:user_id', removeUserFromCalendar)

export default calendarUserRoutes