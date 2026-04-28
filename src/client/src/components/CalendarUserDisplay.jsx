
export default function CalendarUserDisplay(props) {
    const username = props.username;
    const color = props.color;
    const displayingYou = props.displayingYou;

    const userColorStyle = {
        backgroundColor: color
    };

    return (   
         <div className="flex flex-row justify-start w-full">
            <div className={"flex flex-row items-center justify-start w-full gap-3 p-2 rounded-xl hover:bg-gray-100 transition"}>
                <div className={"w-[20px] h-[20px] rounded-full border border-black/10"} style={userColorStyle}/>
                <p className={`${(displayingYou) ? "text-base font-semibold" : "text-sm font-medium text-gray-600"} select-none`}>{username}</p>
            </div>
        </div>
    );
}