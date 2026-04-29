import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getAllCalendars } from "../services/calendarsAPI.jsx";
import { addUserToCalendar, getUsersInCalendar, updateCalendarUser } from "../services/calendarUsersAPI.jsx";
import { getCalendarDisplay, setCalendarDisplay } from "../services/calendarDisplayStorage.js";

const colorOptions = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
];

function ProfileSetupPage() {
  const { state } = useLocation();
  const { joinCode: joinCodeFromRoute } = useParams();
  const navigate = useNavigate();

  const pinFromJoin = state?.pin ?? "";
  const effectiveJoinCode = (joinCodeFromRoute || pinFromJoin).trim();
  const isPickerMode = !effectiveJoinCode;

  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[4].value);
  const [myCalendars, setMyCalendars] = useState([]);
  const [isLoadingPicker, setIsLoadingPicker] = useState(false);

  useEffect(() => {
    if (!effectiveJoinCode) return;
    const saved = getCalendarDisplay(effectiveJoinCode);
    setUsername(saved?.username ?? "");
    setSelectedColor(saved?.color ?? colorOptions[4].value);
  }, [effectiveJoinCode]);

  useEffect(() => {
    if (!isPickerMode) return;
    const userId = Number(window.localStorage.getItem("insync-user-id"));
    if (!Number.isInteger(userId) || userId <= 0) {
      setMyCalendars([]);
      return;
    }
    let cancelled = false;
    async function load() {
      setIsLoadingPicker(true);
      try {
        const calendars = await getAllCalendars();
        const memberChecks = await Promise.all(
          calendars.map(async (calendar) => {
            const users = await getUsersInCalendar(calendar.id);
            const isMember = users.some((u) => Number(u.user_id) === userId);
            return isMember ? calendar : null;
          })
        );
        if (!cancelled) setMyCalendars(memberChecks.filter(Boolean));
      } catch {
        if (!cancelled) setMyCalendars([]);
      } finally {
        if (!cancelled) setIsLoadingPicker(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isPickerMode]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !effectiveJoinCode) return;
    const trimmedUsername = username.trim();
    const joinKey = effectiveJoinCode.toUpperCase();

    setCalendarDisplay(joinKey, { username: trimmedUsername, color: selectedColor });

    const userId = Number(window.localStorage.getItem("insync-user-id"));
    if (Number.isInteger(userId) && userId > 0) {
      try {
        const calendars = await getAllCalendars();
        const matched = calendars.find(
          (c) => `${c.join_code}`.toUpperCase() === joinKey
        );
        if (matched?.id) {
          const members = await getUsersInCalendar(matched.id);
          const alreadyMember = members.some((u) => Number(u.user_id) === userId);
          const payload = {
            username: trimmedUsername.slice(0, 50),
            color: selectedColor,
          };
          if (alreadyMember) {
            await updateCalendarUser(matched.id, userId, payload);
          } else {
            await addUserToCalendar(matched.id, {
              user_id: userId,
              ...payload,
            });
          }
        }
      } catch {
        // local display still saved; membership row may sync next visit
      }
    }

    if (pinFromJoin) {
      navigate(`/calendar/${effectiveJoinCode}`, {
        state: { username: trimmedUsername, color: selectedColor },
      });
      return;
    }
    navigate(`/calendar/${effectiveJoinCode}`);
  }

  function handleBack() {
    if (isPickerMode) {
      navigate("/");
      return;
    }
    if (pinFromJoin) {
      navigate("/join");
      return;
    }
    navigate("/");
  }

  if (isPickerMode) {
    return (
      <div className="flex flex-col h-screen">
        <div className="absolute top-6 left-6">
          <button
            type="button"
            onClick={handleBack}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-gray-100 hover:border-gray-400 active:scale-[0.98]"
          >
            Back
          </button>
        </div>
        <main className="flex flex-col flex-1 items-center justify-center gap-8 px-6">
          <h2 className="text-3xl font-bold text-center">Customize profile for a calendar</h2>
          <p className="text-gray-600 text-center max-w-md">
            Your name and color are saved separately for each calendar.
          </p>
          {isLoadingPicker ? (
            <p className="text-gray-600">Loading your calendars...</p>
          ) : myCalendars.length === 0 ? (
            <p className="text-gray-600">You are not part of any calendars yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 w-full max-w-md">
              {myCalendars.map((cal) => (
                <li key={cal.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${cal.join_code}`)}
                    className="w-full text-left border border-gray-300 rounded-xl px-4 py-3 bg-white transition hover:bg-gray-50 hover:border-gray-400 active:scale-[0.99]"
                  >
                    <span className="font-semibold">{cal.name}</span>
                    <span className="text-sm text-gray-600 block">Code: {cal.join_code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="absolute top-6 left-6">
        <button
          type="button"
          onClick={handleBack}
          className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-gray-100 hover:border-gray-400 active:scale-[0.98]"
        >
          Back
        </button>
      </div>
      <main className="flex flex-col flex-1 items-center justify-center gap-10">
        <h2 className="text-3xl font-bold text-center px-4">
          {pinFromJoin ? "Set up your profile" : "Customize your profile"}
        </h2>
        <p className="text-sm text-gray-500 -mt-6">Calendar: {effectiveJoinCode}</p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-10 w-full max-w-md px-6">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3 text-center text-lg w-full"
          />

          <div className="flex flex-col items-center gap-6 w-full">
            <p className="text-xl font-semibold">Select your profile badge</p>
            <div className="flex flex-row gap-5 flex-wrap justify-center">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className="relative w-10 h-10 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: color.value }}
                  aria-label={color.label}
                >
                  {selectedColor === color.value && (
                    <span className="absolute top-0 right-0 bg-white border-2 border-green-500 rounded text-green-500 text-xs w-6 h-6 flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-black text-white py-3 rounded-xl font-semibold px-7 transition hover:bg-gray-800 active:scale-[0.98]"
          >
            {pinFromJoin ? "Save" : "Save Profile"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ProfileSetupPage;
