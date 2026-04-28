import { useEffect, useState } from "react";
import Header from "../components/Header";
import CreateCalendar from "../components/CreateCalendar";
import { useNavigate } from "react-router-dom";
import { deleteCalendar, getAllCalendars } from "../services/calendarsAPI.jsx";
import { getUsersInCalendar } from "../services/calendarUsersAPI.jsx";

function LandingPage() {
  const navigate = useNavigate();
  const [showCreateCalendar, setShowCreateCalendar] = useState(false);
  const [myCalendars, setMyCalendars] = useState([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const [calendarLoadError, setCalendarLoadError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [createdCalendarIds, setCreatedCalendarIds] = useState([]);
  const [calendarToDelete, setCalendarToDelete] = useState(null);
  const [isDeletingCalendar, setIsDeletingCalendar] = useState(false);

  useEffect(() => {
    const savedUserId = Number(window.localStorage.getItem("insync-user-id"));
    const savedEmail = window.localStorage.getItem("insync-user-email") ?? "";
    const savedUsername = window.localStorage.getItem("insync-last-username") ?? "";
    if (Number.isInteger(savedUserId) && savedUserId > 0) {
      setCurrentUserId(savedUserId);
      setCurrentUserEmail(savedEmail);
      setCurrentUsername(savedUsername);
    } else {
      setCurrentUserId(null);
      setCurrentUserEmail("");
      setCurrentUsername("");
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setCreatedCalendarIds([]);
      return;
    }
    const createdRaw = window.localStorage.getItem("insync-created-calendars-by-user");
    const createdByUser = createdRaw ? JSON.parse(createdRaw) : {};
    const ids = Array.isArray(createdByUser[`${currentUserId}`]) ? createdByUser[`${currentUserId}`] : [];
    setCreatedCalendarIds(ids.map(Number));
  }, [currentUserId]);

  function removeCreatedCalendarForCurrentUser(calendarId) {
    const userId = window.localStorage.getItem("insync-user-id");
    if (!userId) return;
    const createdRaw = window.localStorage.getItem("insync-created-calendars-by-user");
    const createdByUser = createdRaw ? JSON.parse(createdRaw) : {};
    const userCreated = Array.isArray(createdByUser[userId]) ? createdByUser[userId] : [];
    createdByUser[userId] = userCreated.filter((id) => Number(id) !== Number(calendarId));
    window.localStorage.setItem("insync-created-calendars-by-user", JSON.stringify(createdByUser));
    setCreatedCalendarIds((prev) => prev.filter((id) => Number(id) !== Number(calendarId)));
  }

  async function handleDeleteCalendar() {
    if (!calendarToDelete?.id) return;
    try {
      setIsDeletingCalendar(true);
      await deleteCalendar(calendarToDelete.id);
      setMyCalendars((prev) => prev.filter((calendar) => Number(calendar.id) !== Number(calendarToDelete.id)));
      removeCreatedCalendarForCurrentUser(calendarToDelete.id);
      setCalendarToDelete(null);
    } catch (error) {
      setCalendarLoadError(error.message || "Failed to delete calendar.");
    } finally {
      setIsDeletingCalendar(false);
    }
  }

  useEffect(() => {
    async function loadMyCalendars() {
      if (!currentUserId) {
        setMyCalendars([]);
        return;
      }

      try {
        setIsLoadingCalendars(true);
        setCalendarLoadError("");
        const calendars = await getAllCalendars();
        const memberChecks = await Promise.all(
          calendars.map(async (calendar) => {
            const users = await getUsersInCalendar(calendar.id);
            const isMember = users.some((user) => Number(user.user_id) === Number(currentUserId));
            return isMember ? calendar : null;
          })
        );
        setMyCalendars(memberChecks.filter(Boolean));
      } catch (error) {
        setCalendarLoadError(error.message || "Failed to load calendars.");
      } finally {
        setIsLoadingCalendars(false);
      }
    }

    loadMyCalendars();
  }, [currentUserId]);

  const landingNavItems = [
    ...(currentUserId
      ? [
          { label: "Customize Profile", onClick: () => navigate("/profile") },
          {
            label: "Sign Out",
            variant: "primary",
            onClick: () => {
              window.localStorage.removeItem("insync-user-id");
              window.localStorage.removeItem("insync-user-email");
              setCurrentUserId(null);
              setCurrentUserEmail("");
              setCurrentUsername("");
              setMyCalendars([]);
            },
          },
        ]
      : [
          { label: "Log In", onClick: () => navigate("/login") },
          { label: "Sign Up", variant: "primary", onClick: () => navigate("/signup") },
        ]),
    { label: "Join Calendar", onClick: () => navigate("/join") },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header navItems={landingNavItems} />
      {calendarToDelete ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4">
            <h3 className="text-xl font-bold">Delete calendar?</h3>
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{calendarToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCalendarToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 hover:border-gray-400 active:scale-[0.98]"
                disabled={isDeletingCalendar}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCalendar}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
                disabled={isDeletingCalendar}
              >
                {isDeletingCalendar ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <main className="flex flex-col items-center justify-center gap-15 h-full">
         <div className="flex flex-col items-center justify-center gap-5">
            <h2 className="text-4xl font-medium">
              {currentUserId
                ? `Welcome to InSync Calendar, ${currentUsername || currentUserEmail.split("@")[0] || "there"}!`
                : "Welcome to InSync Calendar"}
            </h2>
            <p className="text-gray-700">
              Plan together, stay in sync, and jump back into your shared calendars quickly.
            </p>
            {currentUserEmail ? (
              <p className="text-sm text-gray-500">Logged in as {currentUserEmail}</p>
            ) : null}
            <button
              className="bg-black text-white px-7 py-4 rounded-xl transition hover:bg-gray-800 active:scale-[0.98]"
              onClick={() => setShowCreateCalendar(true)}
            >
              Create Calendar
            </button>
         </div>
         <section className="bg-gray-200 w-200 h-200 rounded-xl p-6 overflow-y-auto">
          {!currentUserId ? (
            <div className="h-full flex items-center justify-center text-gray-700">
              Sign up to see calendars you are part of.
            </div>
          ) : isLoadingCalendars ? (
            <div className="h-full flex items-center justify-center text-gray-700">Loading your calendars...</div>
          ) : calendarLoadError ? (
            <div className="h-full flex items-center justify-center text-red-700">{calendarLoadError}</div>
          ) : myCalendars.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-700">
              You are not part of any calendars yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCalendars.map((calendar) => (
                <button
                  key={calendar.id}
                  onClick={() => navigate(`/calendar/${calendar.join_code}`)}
                  className="group relative bg-white rounded-lg border border-gray-300 p-4 text-left transition hover:bg-gray-50 hover:border-gray-400 active:scale-[0.99]"
                >
                  {createdCalendarIds.includes(Number(calendar.id)) ? (
                    <span
                      role="button"
                      aria-label="Delete calendar"
                      title="Delete calendar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalendarToDelete(calendar);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setCalendarToDelete(calendar);
                        }
                      }}
                      tabIndex={0}
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 bg-white/90 border border-red-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition hover:bg-red-50"
                    >
                      🗑
                    </span>
                  ) : null}
                  <p className="font-semibold text-lg">{calendar.name}</p>
                  <p className="text-sm text-gray-600">Code: {calendar.join_code}</p>
                </button>
              ))}
            </div>
          )}
         </section>
      </main>
      {showCreateCalendar && <CreateCalendar onClose={() => setShowCreateCalendar(false)} />}
    </div>
  );
}

export default LandingPage;