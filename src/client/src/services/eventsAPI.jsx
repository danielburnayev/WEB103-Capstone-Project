const API_URL = '/api/events'

// get all events
export const getAllEvents = async () => {
    const response = await fetch(API_URL)
    if (!response.ok) {
        throw new Error('Failed to fetch events')
    }
    return response.json()
}

// get one event by ID
export const getEvent = async (id) => {
    const response = await fetch(`${API_URL}/${id}`)
    if (!response.ok) {
        throw new Error('Failed to fetch event')
    }
    return response.json()
}

export const createEvent = async(eventData) => {
    /*
    eventData should be an object like:
    {
      id: 1,
      user_id: 1,
      calendar_id: 1,
      name: 'Club meeting',
      start_time: '2026-04-22 10:00:00+00' or newDate.toISOString()
      end_time: '2026-04-22 10:00:00+00' or newDate.toISOString()
      title: 'weekly sync'
    }
  */
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    })
    if (!response.ok) throw new Error('Failed to create event');
    return response.json()
}

// update an event with new info
export const updateEvent = async (id, eventData) => {
  /*
    eventData can include updated fields:
    name, start_time, end_time, title
  */
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  })
  if (!response.ok) throw new Error('Failed to update event')
  return response.json()
}

// delete an event
export const deleteEvent = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete event')
  return response.json()
}