import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinCalendarPage() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!pin.trim()) return;
    navigate("/join/profile", { state: { pin } });
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex flex-col flex-1 items-center justify-center gap-8">
        <h1 className="text-4xl font-bold tracking-tight">InSync Calendar</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
          <input
            type="text"
            placeholder="Calendar PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3 text-center text-lg"
          />
          <button
            type="submit"
            className="bg-black text-white py-3 rounded font-semibold"
          >
            Enter
          </button>
        </form>
      </main>
    </div>
  );
}

export default JoinCalendarPage;
