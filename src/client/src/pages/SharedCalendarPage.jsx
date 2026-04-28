import CalendarUserSidebar from "../components/CalendarUserSidebar.jsx";
import Calendar from "../components/Calendar.jsx";
import Button from "../components/Button.jsx";
import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";

export default function SharedCalendarPage() {
    const { code } = useParams();
    const { state } = useLocation();
    const username = state?.username ?? "Guest";
    const color = state?.color ?? "#3b82f6";
    const [eventActionMode, setEventActionMode] = useState("none");
    const [addActionNonce, setAddActionNonce] = useState(0);

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
        <>
            <div className={"flex flex-row items-center justify-start pl-5 pr-5 h-[5vh] gap-5"}>
                <Button text="Back" id="back-btn"/>
                <h2 className="font-bold">Shared Calendar</h2>
                <p>Code: {code}</p>
            </div>

            <div className={"flex flex-row items-center justify-start h-[95vh]"}>
                <CalendarUserSidebar
                    activeMode={eventActionMode}
                    onAddEvent={handleAddEvent}
                    onToggleEditMode={toggleEditMode}
                    onToggleRemoveMode={toggleRemoveMode}
                />
                <Calendar
                    code={code}
                    username={username}
                    color={color}
                    eventActionMode={eventActionMode}
                    onChangeEventActionMode={setEventActionMode}
                    addActionNonce={addActionNonce}
                />
            </div>

        </>
    );
}