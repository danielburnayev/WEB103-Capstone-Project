function Header({ navItems = [] }) {
  return (
    <header className="flex flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200 mb-30">
      <span className="text-xl font-bold">InSync Calendar</span>
      <nav className="flex flex-row gap-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`px-3 py-2 rounded text-sm font-medium transition active:scale-[0.98] ${
              item.variant === "primary"
                ? "bg-black text-white hover:bg-gray-800"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Header;
