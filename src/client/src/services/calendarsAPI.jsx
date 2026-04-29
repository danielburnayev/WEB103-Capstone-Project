const API_URL = "http://localhost:3000/api/calendars";

// get all calendars
export const getAllCalendars = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Failed to fetch calendars");
    }
    return response.json();
};

// get one calendar by ID
export const getCalendar = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch calendar");
    }
    return response.json();
};

// create a calendar
export const createCalendar = async (calendarData) => {
    /*
    calendarData should be an object like:
    {
      name: "Work",
      join_code: "ABC123"
    }
    */
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendarData),
    });
    if (!response.ok) throw new Error("Failed to create calendar");
    return response.json();
};

// update a calendar
export const updateCalendar = async (id, calendarData) => {
    /*
    calendarData can include updated fields:
    name, join_code
    */
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendarData),
    });
    if (!response.ok) throw new Error("Failed to update calendar");
    return response.json();
};

// delete a calendar
export const deleteCalendar = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete calendar");
    return response.json();
};
