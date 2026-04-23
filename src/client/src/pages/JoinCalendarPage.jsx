import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinCalendarPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleJoinCalendar(e) {
    e.preventDefault();
    if (!pin.trim()) {
      setError("Please enter a calendar PIN.");
      return;
    }
    setError("");
    navigate("/join/profile", { state: { pin } });
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex flex-col flex-1 items-center justify-center gap-8">
        <h1 className="text-4xl font-bold tracking-tight">InSync Calendar</h1>
        <form onSubmit={handleJoinCalendar} className="flex flex-col gap-4 w-80">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Calendar PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={`border border-gray-300 rounded px-4 py-3 text-center text-lg shadow-sm ${error && !pin.trim() ? 'border-red-500 border-2' : ''}`}
            />
            {error && !pin.trim() && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <button
            type="submit"
            className={`bg-black text-white py-3 rounded font-semibold ${error && !pin.trim() ? 'opacity-50' : 'hover:opacity-80'}`}
          >
            Enter
          </button>
        </form>
      </main>
    </div>
  );
}

export default JoinCalendarPage;
