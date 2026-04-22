function Header({ navItems = [] }) {
  return (
    <header className="flex flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200 mb-30">
      <span className="text-xl font-bold">InSync Calendar</span>
      <nav className="flex flex-row gap-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="text-gray-600 cursor-pointer last:text-white last:bg-black last:px-3 last:py-2 last:rounded last:hover:opacity-85 transition"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Header;
