import { useState } from "react";
import Header from "../components/Header";
import CreateCalendar from "../components/CreateCalendar";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const [showCreateCalendar, setShowCreateCalendar] = useState(false);

  const landingNavItems = [
    { label: "Sign Up", onClick: () => {} },
    { label: "Join Calendar", onClick: () => navigate("/join") },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header navItems={landingNavItems} />
      <main className="flex flex-col items-center justify-center gap-15 h-full">
         <div className="flex flex-col items-center justify-center gap-5">
            <h2 className="text-4xl font-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit.</h2>
            <p className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, voluptatum.</p>
            <button className="bg-black text-white px-7 py-4 rounded" onClick={() => setShowCreateCalendar(true)}>
              Create Calendar
            </button>
         </div>
         <div className="bg-gray-200 w-200 h-200"></div>
      </main>
      {showCreateCalendar && <CreateCalendar onClose={() => setShowCreateCalendar(false)} />}
    </div>
  );
}

export default LandingPage;