function CreateCalendar({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-8 flex flex-col gap-5 w-96 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Calendar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <input
          type="text"
          placeholder="Calendar Name"
          className="border border-gray-300 rounded px-4 py-3"
        />
        <button className="bg-black text-white px-7 py-3 rounded font-semibold hover:opacity-80 transition">
          Create Calendar
        </button>
      </div>
    </div>
  );
}

export default CreateCalendar;
