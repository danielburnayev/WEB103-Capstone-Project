import CalendarUserDisplay from "../components/CalendarUserDisplay.jsx";
import Button from "../components/Button.jsx";

export default function CalendarUserSidebar() {
    return (
        <div className={"flex flex-col items-start justify-start h-full w-[12.5%] pl-3 pt-3"}>
            <div className={"flex flex-col items-start justify-start gap-3 h-[20%]"}>
                <CalendarUserDisplay username="You" color="#007bff" displayingYou={true} />
                <div className={"flex flex-row items-center justify-start gap-3"}>
                    <Button text="+" id="add-event-btn"/>
                    <Button text="Edit" id="edit-event-btn"/>
                    <Button text="Remove" id="remove-event-btn"/>
                </div>
            </div>
            
            <div className="h-[80%] w-full">
                <h2 className="font-bold h-[5%]">Other Users:</h2>
                <div className={"flex flex-col items-start justify-start gap-5 overflow-y-auto w-full h-[95%] pt-1"}>
                    {Array.from({ length: 4 }, (_, i) => i + 1).map((i) => (
                        <CalendarUserDisplay key={i} username={`User ${i}`} color="#007bff" displayingYou={false} />
                    ))} {/* will be replaced with a list of actual users */}
                </div>
            </div>
        </div>
    );
}