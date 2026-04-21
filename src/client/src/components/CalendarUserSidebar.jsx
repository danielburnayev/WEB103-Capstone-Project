import CalendarUserDisplay from "../components/CalendarUserDisplay.jsx";
import Button from "../components/Button.jsx";

export default function CalendarUserSidebar() {
    return (
        <div className={"flex flex-col items-start justify-start h-full w-[12.5%] pt-3"}>
            <div className={"flex flex-col items-center justify-start gap-5 h-[50%] w-full"}>
                <CalendarUserDisplay username="You" color="#007bff" displayingYou={true} />

                <div className={"flex flex-row items-center justify-start gap-3"}>
                    <Button text="Add" id="add-event-btn"/>
                    <Button text="Edit" id="edit-event-btn"/>
                    <Button text="Remove" id="remove-event-btn"/>
                </div>

                <div className={"flex flex-col items-center justify-start gap-2"}>
                    <Button text="See Blockers" id="see-blockers-btn"/>
                    <Button text="See Availability" id="see-availability-btn"/>
                </div>

                <form className="flex flex-col gap-1 w-[95%]">
                    <input type="text" placeholder="Pin for Shared Calendar" 
                           className="border"/>
                    <Button text="Join Other Calendar" id="join-other-calendar-btn"/>
                </form>
            </div>
            
            <div className="h-[50%] w-[95%]">
                <h2 className="font-bold h-[5%]">Other Users:</h2>
                <div className={"flex flex-col items-center justify-start gap-5 overflow-y-auto w-full h-[95%] pt-1"}>
                    {Array.from({ length: 4 }, (_, i) => i + 1).map((i) => (
                        <CalendarUserDisplay key={i} username={`User ${i}`} color="#007bff" displayingYou={false} />
                    ))} {/* will be replaced with a list of actual users */}
                </div>
            </div>
        </div>
    );
}