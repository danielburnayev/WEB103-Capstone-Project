import { useNavigate, useParams } from "react-router-dom";
import CalendarUserSidebar from "../components/CalendarUserSidebar.jsx";
import Calendar from "../components/Calendar.jsx";
import Button from "../components/Button.jsx";

export default function SharedCalendarPage(props) {
    const { code } = useParams();
    const name = props.name;
    const nav = useNavigate();

    return (
        <>
            <div className={"flex flex-row items-center justify-start pl-5 pr-5 h-[5vh] gap-5"}>
                <Button text="Back" id="back-btn" onClick={() => nav("/")}/>
                <h2 className="font-bold">{name}</h2>
                <p>Code: {code}</p>
            </div>

            <div className={"flex flex-row items-center justify-start h-[95vh]"}>
                <CalendarUserSidebar />
                <Calendar />
            </div>

        </>
    );
}