import CalendarUserSidebar from "../components/CalendarUserSidebar.jsx";
import Calendar from "../components/Calendar.jsx";
import Button from "../components/Button.jsx";

export default function SharedCalendarPage(props) {
    const name = props.name;
    const code = props.code;

    return (
        <>
            <div className={"flex flex-row items-center justify-between pl-5 pr-5 h-[5vh]"}>
                <div className={"flex flex-row items-center justify-start gap-5"}>
                    <Button text="Back" id="back-btn"/>
                    <div className={"flex flex-row items-center justify-center gap-4"}>
                        <h2 className="font-bold">{name}</h2>
                        <p>Code: {code}</p>
                    </div>
                </div>
                <Button text="Find Times" id="find-times-btn"/>
            </div>

            <div className={"flex flex-row items-center justify-start h-[95vh]"}>
                <CalendarUserSidebar />
                <Calendar />
            </div>

        </>
    );
}