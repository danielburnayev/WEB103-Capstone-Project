function Header({ navItems = [] }) {
  return (
    <header className="flex flex-row items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <span className="text-xl font-bold text-blue-500">Calendify</span>
      <nav className="flex flex-row gap-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="text-gray-600 hover:text-blue-500 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Header;
