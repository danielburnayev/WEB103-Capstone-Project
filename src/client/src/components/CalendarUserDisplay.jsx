
export default function CalendarUserDisplay(props) {
    const username = props.username;
    const color = props.color;
    const displayingYou = props.displayingYou;

    const userColorStyle = {
        backgroundColor: color
    };

    return (   
         <div className="flex flex-row justify-start w-[95%]">
            <div className={"flex flex-row items-center justify-center w-fit gap-2 hover:scale-150 hover:translate-x-[25%]"}>
                <div className={"w-[20px] h-[20px] rounded-full"} style={userColorStyle}/>
                <p className={`${(displayingYou) ? "text-3xl" : "text-l"} select-none`}>{username}</p>
            </div>
        </div>
    );
}