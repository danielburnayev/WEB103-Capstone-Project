import express from 'express'
import { getAllCalendars, getCalendarByJoinCode, getCalendarById, createCalendar, updateCalendar, deleteCalendar } from '../controllers/calendarController.js'

const calendarRoutes = express.Router()

calendarRoutes.get('/', getAllCalendars)
calendarRoutes.get('/code/:join_code', getCalendarByJoinCode)
calendarRoutes.get('/:id', getCalendarById)
calendarRoutes.post('/', createCalendar)
calendarRoutes.put('/:id', updateCalendar)
calendarRoutes.delete('/:id', deleteCalendar)

export default calendarRoutes