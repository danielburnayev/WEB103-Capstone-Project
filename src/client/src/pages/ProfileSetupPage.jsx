import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const pin = state?.pin ?? "";
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[4].value);

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return;
    navigate(`/calendar/${pin}`, { state: { username, color: selectedColor } });
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <main className="flex flex-col flex-1 items-center justify-center gap-10">
        <h2 className="text-3xl font-bold">Set up your profile</h2>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-10 w-full max-w-md px-6">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3 text-center text-lg"
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
            className="bg-black text-white py-3 rounded font-semibold px-7"
          >
            Save
          </button>
        </form>
      </main>
    </div>
  );
}

export default ProfileSetupPage;
