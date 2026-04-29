import { pool } from '../config/database.js'

const getEventsByCalendar = async (req, res) => {
  try {
    const { calendar_id } = req.params
    const result = await pool.query(
      'SELECT * FROM events WHERE calendar_id = $1 ORDER BY start_time',
      [calendar_id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getEventById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id])
    if (!result.rows.length) return res.status(404).json({ error: 'Event not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createEvent = async (req, res) => {
  try {
    const { user_id, calendar_id, name, start_time, end_time, title } = req.body
    const result = await pool.query(
      `INSERT INTO events (user_id, calendar_id, name, start_time, end_time, title)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, calendar_id, name, start_time, end_time, title]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params
    const { user_id, calendar_id, name, start_time, end_time, title } = req.body
    const result = await pool.query(
      `UPDATE events SET user_id=$1, calendar_id=$2, name=$3, start_time=$4, end_time=$5, title=$6
       WHERE id=$7 RETURNING *`,
      [user_id, calendar_id, name, start_time, end_time, title, id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Event not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM events WHERE id = $1', [id])
    res.json({ message: 'Event deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { getEventsByCalendar, getEventById, createEvent, updateEvent, deleteEvent }