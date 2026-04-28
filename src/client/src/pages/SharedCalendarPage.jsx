import CalendarUserSidebar from "../components/CalendarUserSidebar.jsx";
import Calendar from "../components/Calendar.jsx";
import Button from "../components/Button.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function SharedCalendarPage() {
    const { code } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const username = state?.username ?? "Guest";
    const color = state?.color ?? "#3b82f6";
    const [eventActionMode, setEventActionMode] = useState("none");
    const [addActionNonce, setAddActionNonce] = useState(0);
    const [calendarViewMode, setCalendarViewMode] = useState("week");
    const [showCreatedToast, setShowCreatedToast] = useState(Boolean(state?.joinCodeCopied));
    const calendarRef = useRef(null);

    useEffect(() => {
        if (!state?.joinCodeCopied) return;
        const timeoutId = window.setTimeout(() => setShowCreatedToast(false), 2500);
        return () => window.clearTimeout(timeoutId);
    }, [state?.joinCodeCopied]);

    function handleAddEvent() {
        setEventActionMode("none");
        setAddActionNonce((prev) => prev + 1);
    }

    function toggleEditMode() {
        setEventActionMode((prev) => (prev === "edit" ? "none" : "edit"));
    }

    function toggleRemoveMode() {
        setEventActionMode((prev) => (prev === "remove" ? "none" : "remove"));
    }

    return (
        <div className="min-h-screen bg-gray-100 px-5 py-4">
            {showCreatedToast ? (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-4 py-2 rounded shadow-lg">
                    Calendar created. Join code copied to clipboard.
                </div>
            ) : null}
            <div className={"flex flex-row items-center justify-between h-[52px] gap-4 mb-4"}>
                <div className="flex items-center gap-4">
                <Button text="Back" id="back-btn" onClick={() => navigate("/")} className="px-4"/>
                <h2 className="font-bold text-2xl tracking-tight">Shared Calendar</h2>
                <p className="text-sm text-gray-600">Code: <span className="font-semibold text-gray-800">{code}</span></p>
                </div>

                <div className="flex items-center gap-2">
                    <Button text="<-" id="back-calendar-btn" onClick={() => calendarRef.current?.goBack()} className="px-2 py-1 min-w-[34px]"/>
                    <Button text="->" id="forward-calendar-btn" onClick={() => calendarRef.current?.goForward()} className="px-2 py-1 min-w-[34px]"/>
                    <Button text="Today" id="today-calendar-btn" onClick={() => calendarRef.current?.goToday()}/>
                    <Button
                        text="Day"
                        id="day-calendar-btn"
                        onClick={() => calendarRef.current?.setDayView()}
                        className={`${calendarViewMode === "day" ? "bg-yellow-300 border-yellow-500 text-black hover:bg-yellow-300" : ""}`}
                    />
                    <Button
                        text="Week"
                        id="week-calendar-btn"
                        onClick={() => calendarRef.current?.setWeekView()}
                        className={`${calendarViewMode === "week" ? "bg-yellow-300 border-yellow-500 text-black hover:bg-yellow-300" : ""}`}
                    />
                </div>
            </div>

            <div className={"flex flex-row items-start justify-start gap-4 h-[calc(100vh-100px)]"}>
                <CalendarUserSidebar
                    activeMode={eventActionMode}
                    onAddEvent={handleAddEvent}
                    onToggleEditMode={toggleEditMode}
                    onToggleRemoveMode={toggleRemoveMode}
                    username={username}
                    color={color}
                    code={code}
                />
                <Calendar
                    ref={calendarRef}
                    code={code}
                    username={username}
                    color={color}
                    eventActionMode={eventActionMode}
                    onChangeEventActionMode={setEventActionMode}
                    addActionNonce={addActionNonce}
                    onViewModeChange={setCalendarViewMode}
                />
            </div>
        </div>
    );
}