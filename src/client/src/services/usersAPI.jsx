import { apiUrl } from "../apiBase.js";

const API_URL = apiUrl("/api/users");

// get all users
export const getAllUsers = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

// get one user by ID
export const getUser = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    return [];
  }
  return response.json();
};

// create a user
export const createUser = async (userData) => {
  /*
  userData should be an object like:
  {
    email: "user@example.com",
    password: "securePassword123",
    is_guest: false
  }
  */
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
};

// update a user
export const updateUser = async (id, userData) => {
  /*
  userData can include updated fields:
  email, password, is_guest
  */
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
};

// delete a user
export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
};
