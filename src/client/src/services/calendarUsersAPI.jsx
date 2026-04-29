import { apiUrl } from "../apiBase.js";

const API_URL = apiUrl("/api/calendars");

// get all users in a calendar
export const getUsersInCalendar = async (calendarId) => {
  const response = await fetch(`${API_URL}/${calendarId}/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch calendar users");
  }
  return response.json();
};

// add a user to a calendar
export const addUserToCalendar = async (calendarId, calendarUserData) => {
  /*
  calendarUserData should be an object like:
  {
    user_id: 1,
    username: "Grace",
    color: "#3b82f6"
  }
  */
  const response = await fetch(`${API_URL}/${calendarId}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(calendarUserData),
  });
  if (!response.ok) throw new Error("Failed to add user to calendar");
  return response.json();
};

// update a calendar user
export const updateCalendarUser = async (calendarId, userId, calendarUserData) => {
  /*
  calendarUserData can include updated fields:
  username, color
  */
  const response = await fetch(`${API_URL}/${calendarId}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(calendarUserData),
  });
  if (!response.ok) throw new Error("Failed to update calendar user");
  return response.json();
};

// remove a user from a calendar
export const removeUserFromCalendar = async (calendarId, userId) => {
  const response = await fetch(`${API_URL}/${calendarId}/users/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to remove user from calendar");
  return response.json();
};
