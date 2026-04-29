import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCalendarByJoinCode } from "../services/calendarsAPI.jsx";

function JoinCalendarPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleJoinCalendar(e) {
    e.preventDefault();

    const normalized = pin.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (!normalized) {
      setError("Please enter a calendar code.");
      return;
    }
    if (normalized.length !== 6) {
      setError("Calendar codes are 6 characters.");
      return;
    }

    setError("");

    try {
      await getCalendarByJoinCode(normalized);
      navigate("/join/profile", { state: { pin: normalized } });
    } catch (err) {
      setError(err.message || "Could not join that calendar.");
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="absolute top-6 left-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-gray-100 hover:border-gray-400 active:scale-[0.98]"
        >
          Back
        </button>
      </div>
      <main className="flex flex-col flex-1 items-center justify-center gap-8">
        <h1 className="text-4xl font-bold tracking-tight">InSync Calendar</h1>
        <form onSubmit={handleJoinCalendar} className="flex flex-col gap-4 w-80">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Calendar PIN"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
              }
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className={`border border-gray-300 rounded px-4 py-3 text-center text-lg shadow-sm tracking-widest uppercase ${error ? "border-red-500 border-2" : ""}`}
            />
            {error ? <p className="text-red-500 text-sm text-center">{error}</p> : null}
          </div>
          <button
            type="submit"
            className="bg-black text-white py-3 rounded-xl font-semibold transition hover:bg-gray-800 active:scale-[0.98]"
          >
            Enter
          </button>
        </form>
      </main>
    </div>
  );
}

export default JoinCalendarPage;
