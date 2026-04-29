import express from 'express'
import { getAllCalendars, getCalendarById, createCalendar, updateCalendar, deleteCalendar } from '../controllers/calendarController.js'

const calendarRoutes = express.Router()

calendarRoutes.get('/', getAllCalendars)
calendarRoutes.get('/:id', getCalendarById)
calendarRoutes.post('/', createCalendar)
calendarRoutes.put('/:id', updateCalendar)
calendarRoutes.delete('/:id', deleteCalendar)

export default calendarRoutes