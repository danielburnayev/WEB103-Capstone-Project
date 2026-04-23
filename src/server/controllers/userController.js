import { pool } from '../config/database.js'

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createUser = async (req, res) => {
  try {
    const { email, password, is_guest } = req.body
    const result = await pool.query(
      'INSERT INTO users (email, password, is_guest) VALUES ($1, $2, $3) RETURNING *',
      [email, password, is_guest ?? false]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { email, password, is_guest } = req.body
    const result = await pool.query(
      'UPDATE users SET email=$1, password=$2, is_guest=$3 WHERE id=$4 RETURNING *',
      [email, password, is_guest, id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM users WHERE id = $1', [id])
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { getAllUsers, getUserById, createUser, updateUser, deleteUser }