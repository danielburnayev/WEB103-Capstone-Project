import { apiUrl } from "../apiBase.js";

const API_URL = apiUrl("/api/calendars");

// get all calendars
export const getAllCalendars = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Failed to fetch calendars");
    }
    return response.json();
};

// get one calendar by numeric ID
export const getCalendar = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {return {};}
    return response.json();
};

/** Resolve a calendar by its 6-character join code (case-insensitive). */
export const getCalendarByJoinCode = async (joinCode) => {
    const code = `${joinCode || ""}`.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const response = await fetch(`${API_URL}/code/${encodeURIComponent(code)}`);
    if (response.status === 404) {
        throw new Error(
            "That PIN doesn't match any calendar. Double-check the code or ask whoever shared it with you."
        );
    }
    if (!response.ok) {
        let message = "Failed to look up calendar.";
        try {
            const body = await response.json();
            if (typeof body?.error === "string") message = body.error;
        } catch {
            /* non-JSON error body */
        }
        throw new Error(message);
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
