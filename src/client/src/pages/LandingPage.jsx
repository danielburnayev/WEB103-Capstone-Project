import Header from "../components/Header";

const landingNavItems = [
   { label: "Sign Up", onClick: () => {} },
   { label: "Join Calendar", onClick: () => {} },
];

function LandingPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header navItems={landingNavItems} />
      <main className="flex flex-col items-center justify-center gap-15 h-full">
         <div className="flex flex-col items-center justify-center gap-5">
            <h2 className="text-4xl font-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit.</h2>
            <p className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, voluptatum.</p>
            <button className="bg-black text-white px-7 py-4 rounded">Create Calendar</button>
         </div>
         <div className="bg-gray-200 w-200 h-200"></div>
      </main>
    </div>
  );
}

export default LandingPage;