import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCalendar, getAllCalendars } from "../services/calendarsAPI.jsx";
import { addUserToCalendar, getUsersInCalendar } from "../services/calendarUsersAPI.jsx";
import { getCalendarDisplay } from "../services/calendarDisplayStorage.js";

function CreateCalendar({ onClose }) {
  const navigate = useNavigate();
  const [calendarName, setCalendarName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  function saveCreatedCalendarForCurrentUser(calendarId) {
    const currentUserId = window.localStorage.getItem("insync-user-id");
    if (!currentUserId || !calendarId) return;

    const existingRaw = window.localStorage.getItem("insync-created-calendars-by-user");
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const userCreatedCalendars = Array.isArray(existing[currentUserId]) ? existing[currentUserId] : [];
    if (!userCreatedCalendars.includes(calendarId)) {
      existing[currentUserId] = [...userCreatedCalendars, calendarId];
      window.localStorage.setItem("insync-created-calendars-by-user", JSON.stringify(existing));
    }
  }

  function generateJoinCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  async function handleCreateCalendar() {
    const trimmedName = calendarName.trim();
    if (!trimmedName) {
      setError("Please enter a calendar name.");
      return;
    }

    try {
      setIsCreating(true);
      setError("");

      const existingCalendars = await getAllCalendars();
      const existingCodes = new Set(existingCalendars.map((calendar) => `${calendar.join_code}`.toUpperCase()));

      let joinCode = generateJoinCode();
      while (existingCodes.has(joinCode)) {
        joinCode = generateJoinCode();
      }

      const createdCalendar = await createCalendar({
        name: trimmedName,
        join_code: joinCode,
      });
      saveCreatedCalendarForCurrentUser(createdCalendar?.id);

      const currentUserId = Number(window.localStorage.getItem("insync-user-id"));
      const currentUserEmail = window.localStorage.getItem("insync-user-email") ?? "";
      const codeToUse = createdCalendar?.join_code || joinCode;
      const displayForCalendar = getCalendarDisplay(codeToUse);
      const derivedUsername = (
        displayForCalendar?.username ||
        currentUserEmail.split("@")[0] ||
        "You"
      ).slice(0, 50);
      const derivedColor = displayForCalendar?.color || "#3b82f6";
      const createdCalendarId = createdCalendar?.id;

      if (Number.isInteger(currentUserId) && currentUserId > 0 && createdCalendarId) {
        const existingMembers = await getUsersInCalendar(createdCalendarId);
        const isAlreadyMember = existingMembers.some((member) => Number(member.user_id) === currentUserId);
        if (!isAlreadyMember) {
          await addUserToCalendar(createdCalendarId, {
            user_id: currentUserId,
            username: derivedUsername,
            color: derivedColor,
          });
        }
      }
      try {
        await navigator.clipboard.writeText(codeToUse);
      } catch {
        // Ignore clipboard permission issues and continue navigation.
      }
      onClose?.();
      navigate(`/calendar/${codeToUse}`, {
        state: {
          joinCodeCopied: true,
        },
      });
    } catch (createError) {
      setError(createError.message || "Failed to create calendar.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-8 flex flex-col gap-5 w-96 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Calendar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <input
          type="text"
          placeholder="Calendar Name"
          value={calendarName}
          onChange={(e) => setCalendarName(e.target.value)}
          className="border border-gray-300 rounded px-4 py-3"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          className="bg-black text-white px-7 py-3 rounded-xl font-semibold transition hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleCreateCalendar}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Calendar"}
        </button>
      </div>
    </div>
  );
}

export default CreateCalendar;
