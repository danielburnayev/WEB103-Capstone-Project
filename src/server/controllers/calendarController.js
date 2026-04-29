import { pool } from '../config/database.js'

const getAllCalendars = async (req, res) => {
  console.log("entered all calendars");
  
  try {
    const result = await pool.query('SELECT * FROM calendars')
    console.log(result);
    res.status(200).json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getCalendarById = async (req, res) => {
  console.log("entered get calendar");
  
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM calendars WHERE id = $1', [id])
    if (!result.rows.length) return res.status(404).json({ error: 'Calendar not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createCalendar = async (req, res) => {
  console.log("entered create calendar");
  
  try {
    const { name, join_code } = req.body
    const result = await pool.query(
      'INSERT INTO calendars (name, join_code) VALUES ($1, $2) RETURNING *',
      [name, join_code]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateCalendar = async (req, res) => {
  console.log("entered update calendar");
  
  try {
    const { id } = req.params
    const { name, join_code } = req.body
    const result = await pool.query(
      'UPDATE calendars SET name=$1, join_code=$2 WHERE id=$3 RETURNING *',
      [name, join_code, id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Calendar not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteCalendar = async (req, res) => {
  console.log("entered delete calendar");
  
  try {
    const { id } = req.params
    await pool.query('DELETE FROM calendars WHERE id = $1', [id])
    res.json({ message: 'Calendar deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { getAllCalendars, getCalendarById, createCalendar, updateCalendar, deleteCalendar }