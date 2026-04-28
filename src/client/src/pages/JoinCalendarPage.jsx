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
      <div className="absolute top-6 left-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-white border border-gray-300 rounded px-4 py-2 text-sm font-medium transition hover:bg-gray-100 hover:border-gray-400 active:scale-[0.98]"
        >
          Back
        </button>
      </div>
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
            className="bg-black text-white py-3 rounded font-semibold transition hover:bg-gray-800 active:scale-[0.98]"
          >
            Enter
          </button>
        </form>
      </main>
    </div>
  );
}

export default JoinCalendarPage;
