const pool = require('../db')

const getUsersInCalendar = async (req, res) => {
  try {
    const { calendar_id } = req.params
    const result = await pool.query(
      'SELECT * FROM calendar_users WHERE calendar_id = $1',
      [calendar_id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const addUserToCalendar = async (req, res) => {
  try {
    const { calendar_id } = req.params
    const { user_id, username, color } = req.body
    const result = await pool.query(
      'INSERT INTO calendar_users (user_id, calendar_id, username, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, calendar_id, username, color]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateCalendarUser = async (req, res) => {
  try {
    const { calendar_id, user_id } = req.params
    const { username, color } = req.body
    const result = await pool.query(
      'UPDATE calendar_users SET username=$1, color=$2 WHERE user_id=$3 AND calendar_id=$4 RETURNING *',
      [username, color, user_id, calendar_id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'CalendarUser not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const removeUserFromCalendar = async (req, res) => {
  try {
    const { calendar_id, user_id } = req.params
    await pool.query(
      'DELETE FROM calendar_users WHERE user_id=$1 AND calendar_id=$2',
      [user_id, calendar_id]
    )
    res.json({ message: 'User removed from calendar' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getUsersInCalendar, addUserToCalendar, updateCalendarUser, removeUserFromCalendar }