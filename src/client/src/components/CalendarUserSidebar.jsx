import CalendarUserDisplay from "../components/CalendarUserDisplay.jsx";
import Button from "../components/Button.jsx";

export default function CalendarUserSidebar(props) {
    const activeMode = props.activeMode ?? "none";

    function getModeButtonStyle(mode) {
        return activeMode === mode ? "bg-yellow-300 border-yellow-500 text-black font-bold hover:bg-yellow-300" : "";
    }

    return (
        <aside className={"h-full w-[260px] bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col"}>
            <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-sm" />
                    <h3 className="text-lg font-bold tracking-tight">GROUP NAME</h3>
                </div>
                <p className="text-base font-semibold tracking-wide">{props.code || "---"}</p>
            </div>

            <div className={"flex flex-col items-start justify-start gap-4 pt-4"}>
                <CalendarUserDisplay username={props.username || "You"} color={props.color || "#007bff"} displayingYou={true} />

                <div className={"flex flex-wrap items-center justify-start gap-2 w-full"}>
                    <Button text="Add" id="add-event-btn" onClick={props.onAddEvent} className="flex-1"/>
                    <Button
                        text="Edit"
                        id="edit-event-btn"
                        className={`flex-1 ${getModeButtonStyle("edit")}`}
                        onClick={props.onToggleEditMode}
                    />
                    <Button
                        text="Remove"
                        id="remove-event-btn"
                        className={`flex-1 ${getModeButtonStyle("remove")}`}
                        onClick={props.onToggleRemoveMode}
                    />
                </div>

                <div className={"flex flex-col items-stretch justify-start gap-2 w-full"}>
                    <Button text="See Blockers" id="see-blockers-btn" className="w-full"/>
                    <Button text="See Availability" id="see-availability-btn" className="w-full"/>
                </div>

                <form className="flex flex-col gap-2 w-full pt-1">
                    <input type="text" placeholder="Pin for Shared Calendar" 
                           className="border border-gray-300 rounded-xl px-3 py-2 text-sm"/>
                    <Button text="Join Other Calendar" id="join-other-calendar-btn" className="w-full"/>
                </form>
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-200 flex-1 min-h-0 w-full">
                <h2 className="font-bold text-lg mb-2">Other Members</h2>
                <div className={"flex flex-col items-center justify-start gap-2 overflow-y-auto w-full h-full pr-1"}>
                    {Array.from({ length: 4 }, (_, i) => i + 1).map((i) => (
                        <CalendarUserDisplay key={i} username={`User ${i}`} color="#007bff" displayingYou={false} />
                    ))} {/* will be replaced with a list of actual users */}
                </div>
            </div>
        </aside>
    );
}