import CalendarUserSidebar from "../components/CalendarUserSidebar.jsx";
import Calendar from "../components/Calendar.jsx";
import Button from "../components/Button.jsx";
import { useLocation, useParams } from "react-router-dom";

export default function SharedCalendarPage() {
    const { code } = useParams();
    const { state } = useLocation();
    const username = state?.username ?? "Guest";
    const color = state?.color ?? "#3b82f6";

    return (
        <>
            <div className={"flex flex-row items-center justify-start pl-5 pr-5 h-[5vh] gap-5"}>
                <Button text="Back" id="back-btn"/>
                <h2 className="font-bold">Shared Calendar</h2>
                <p>Code: {code}</p>
            </div>

            <div className={"flex flex-row items-center justify-start h-[95vh]"}>
                <CalendarUserSidebar />
                <Calendar code={code} username={username} color={color} />
            </div>

        </>
    );
}