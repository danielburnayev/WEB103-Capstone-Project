import Header from "../components/Header";

const landingNavItems = [
  { label: "Join Calendar", onClick: () => {} },
  { label: "Sign Up", onClick: () => {} },
];

function LandingPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header navItems={landingNavItems} />
    </div>
  );
}

export default LandingPage;