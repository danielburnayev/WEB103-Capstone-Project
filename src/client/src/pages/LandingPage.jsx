import { useEffect, useState } from "react";
import Header from "../components/Header";
import CreateCalendar from "../components/CreateCalendar";
import { useNavigate } from "react-router-dom";
import { getAllCalendars } from "../services/calendarsAPI.jsx";
import { getUsersInCalendar } from "../services/calendarUsersAPI.jsx";

function LandingPage() {
  const navigate = useNavigate();
  const [showCreateCalendar, setShowCreateCalendar] = useState(false);
  const [myCalendars, setMyCalendars] = useState([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const [calendarLoadError, setCalendarLoadError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    const savedUserId = Number(window.localStorage.getItem("insync-user-id"));
    const savedEmail = window.localStorage.getItem("insync-user-email") ?? "";
    if (Number.isInteger(savedUserId) && savedUserId > 0) {
      setCurrentUserId(savedUserId);
      setCurrentUserEmail(savedEmail);
    } else {
      setCurrentUserId(null);
      setCurrentUserEmail("");
    }
  }, []);

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
          {
            label: "Sign Out",
            onClick: () => {
              window.localStorage.removeItem("insync-user-id");
              window.localStorage.removeItem("insync-user-email");
              setCurrentUserId(null);
              setCurrentUserEmail("");
              setMyCalendars([]);
            },
          },
        ]
      : [{ label: "Sign Up", onClick: () => navigate("/signup") }]),
    { label: "Join Calendar", onClick: () => navigate("/join") },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header navItems={landingNavItems} />
      <main className="flex flex-col items-center justify-center gap-15 h-full">
         <div className="flex flex-col items-center justify-center gap-5">
            <h2 className="text-4xl font-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit.</h2>
            <p className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, voluptatum.</p>
            {currentUserEmail ? (
              <p className="text-sm text-gray-500">Logged in as {currentUserEmail}</p>
            ) : null}
            <button className="bg-black text-white px-7 py-4 rounded" onClick={() => setShowCreateCalendar(true)}>
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
                  className="bg-white rounded-lg border border-gray-300 p-4 text-left hover:bg-gray-50"
                >
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