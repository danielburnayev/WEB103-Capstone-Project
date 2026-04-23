require('dotenv').config()
import { pool } from './database'

const resetDatabase = async () => {
  console.log('DB name:', process.env.PGDATABASE)

  try {
    await pool.query('BEGIN')

    // Drop tables (child → parent order)
    await pool.query('DROP TABLE IF EXISTS events')
    await pool.query('DROP TABLE IF EXISTS calendar_users')
    await pool.query('DROP TABLE IF EXISTS calendars')
    await pool.query('DROP TABLE IF EXISTS users')

    // USERS
    await pool.query(`
      CREATE TABLE users (
        id SERIAL UNIQUE NOT NULL PRIMARY KEY,
        email VARCHAR(50) UNIQUE,
        password VARCHAR(255),
        is_guest BOOLEAN
      )
    `)

    // CALENDARS
    await pool.query(`
      CREATE TABLE calendars (
        id SERIAL UNIQUE NOT NULL PRIMARY KEY,
        name VARCHAR(20),
        join_code VARCHAR(6) UNIQUE
      )
    `)

    // CALENDAR_USERS (junction table — FK to both users and calendars)
    await pool.query(`
      CREATE TABLE calendar_users (
        user_id SERIAL REFERENCES users(id) ON DELETE CASCADE,
        calendar_id SERIAL REFERENCES calendars(id) ON DELETE CASCADE,
        username VARCHAR(50),
        color VARCHAR(7),
        PRIMARY KEY (user_id, calendar_id)
      )
    `)

    // EVENTS (FK to both users and calendars)
    await pool.query(`
      CREATE TABLE events (
        id SERIAL UNIQUE NOT NULL PRIMARY KEY,
        user_id SERIAL REFERENCES users(id) ON DELETE CASCADE,
        calendar_id SERIAL REFERENCES calendars(id) ON DELETE CASCADE,
        name VARCHAR(25),
        start_time TIMESTAMPTZ,
        end_time TIMESTAMPTZ,
        title VARCHAR(50)
      )
    `)

    // Seed users
    await pool.query(`
      INSERT INTO users (email, password, is_guest) VALUES
      ('john@example.com', 'hashedpassword1', false),
      ('jane@example.com', 'hashedpassword2', false),
      ('guest@example.com', 'hashedpassword3', true)
    `)

    // Seed calendars
    await pool.query(`
      INSERT INTO calendars (name, join_code) VALUES
      ('Work', 'ABC123'),
      ('Personal', 'DEF456'),
      ('School', 'GHI789')
    `)

    // Seed calendar_users
    await pool.query(`
      INSERT INTO calendar_users (user_id, calendar_id, username, color) VALUES
      (1, 1, 'john_doe', '#FF5733'),
      (1, 2, 'john_doe', '#33FF57'),
      (2, 3, 'jane_doe', '#3357FF')
    `)

    // Seed events
    await pool.query(`
      INSERT INTO events (user_id, calendar_id, name, start_time, end_time, title) VALUES
      (1, 1, 'Team Meeting', '2026-04-22 10:00+00', '2026-04-22 11:00+00', 'Weekly Sync'),
      (1, 2, 'Gym',          '2026-04-22 18:00+00', '2026-04-22 19:00+00', 'Workout Session'),
      (2, 3, 'Lecture',      '2026-04-23 09:00+00', '2026-04-23 10:30+00', 'CS Class')
    `)

    await pool.query('COMMIT')

    console.log('✅ users, calendars, calendar_users, and events tables reset!')
    process.exit(0)
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error('❌ Error resetting database:', err)
    process.exit(1)
  }
}

resetDatabase()