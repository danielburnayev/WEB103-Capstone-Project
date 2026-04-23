import { useState } from 'react';

function CreateCalendar({ onClose }) {

  const [calendarName, setCalendarName] = useState('');
  const [error, setError] = useState('');

  const handleCreateCalendar = () => {
    if (!calendarName.trim()) {
      setError('Please enter a calendar name.');
      return;
    }
    setError('');
    // TODO: Implement calendar creation logic here (e.g., API call)
    console.log('Creating calendar:', calendarName);
  }

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
          <h2 className="text-xl">Create Calendar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Calendar Name"
            className={`border border-gray-300 rounded px-4 py-3 shadow-sm focus:outline-none ${error && !calendarName.trim() ? 'border-red-500 border-2' : ''}`}
            value={calendarName}
            onChange={(e) => { setCalendarName(e.target.value); setError(''); }}
          />
          {error && !calendarName.trim() && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <button className={`bg-black text-white px-7 py-3 rounded font-semibold hover:opacity-80 transition ${error && !calendarName.trim() ? 'opacity-50' : 'opacity-100'}`} onClick={handleCreateCalendar}>
          Create Calendar
        </button>
      </div>
    </div>
  );
}

export default CreateCalendar;
