import Button from "../components/Button.jsx";
import { times, daysOfWeek, months } from "../services/calendar-data.js";

export default function Calendar() {
    let todaysDate = new Date();
    let currMonth = months[todaysDate.getMonth()];
    let currYear = todaysDate.getFullYear();
    let currDay = todaysDate.getDay();

    function getDayNDaysFromPresent(days) {
        let dummyDate = new Date();
        dummyDate.setTime(todaysDate.getTime() + (days * 24 * 60 * 60 * 1000));

        return dummyDate.getDate();
    }

    return (
        <div className={"relative h-full w-[87.5%] bg-gray-300 rounded-xl"}>
            <div className={"flex flex-row h-[10%] border-b"}> {/* top portion (buttons, dates, month, year) */}
                <div className={"flex flex-col items-center justify-center w-[7.5%] h-full"}> {/* calendar buttons container */}
                    <div className={"flex flex-row items-center justify-center"}>
                        <Button text="<-" id="back-calendar-btn"/>
                        <Button text="->" id="forward-calendar-btn"/>
                    </div>

                    <div className={"flex flex-row items-center justify-center"}>
                        <Button text="Day" id="day-calendar-btn"/>
                        <Button text="Week" id="week-calendar-btn"/>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-start w-[92.5%] h-full"> {/* month, year, and dates/days display */}
                    <h2 className="font-bold">{currMonth} {currYear}</h2>
                    <div className={"flex flex-row items-center justify-around w-full h-full"}> 
                        {daysOfWeek.map((day, index) => (
                            <div className="flex flex-col items-center justify-end w-[14.285%] h-full">    
                                <p key={index}>{day}</p>
                                <p key={`date-${index}`} 
                                   className={`${index === currDay ? 'bg-blue-300' : 'bg-transparent'} rounded-full aspect-square text-center`}>
                                        {getDayNDaysFromPresent(index - currDay)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={"relative flex flex-row h-[90%] overflow-y-scroll"}> {/* calendar content (times, events) */}
                <div className={"flex flex-col items-center justify-start w-[7.5%] h-full gap-5"}> {/* time slots container */}
                    {times.map((time, index) => (
                        <div className="absolute left-0 pb-5" style={{top: `calc(44px * ${index})`}}> 
                            <div className={"w-[87.5vw] border-[0.25px] border-gray-100"}/> {/* horizontal guidelines for hour-long representation and leading to corresponding to specific time labels */}
                            <p key={index} className={"select-none"}>{time}</p> {/* time labels */}
                        </div>
                    ))}
                </div>

                <div className={"flex flex-row items-center justify-center w-[92.5%] h-[1056px]"}> {/* events container */}
                    <div className={"relative w-[14.285%] h-full"}></div> 
                    <div className={"relative w-[14.285%] h-full"}></div>
                    <div className={"relative w-[14.285%] h-full"}></div>
                    <div className={"relative w-[14.285%] h-full"}></div>
                    <div className={"relative w-[14.285%] h-full"}></div>
                    <div className={"relative w-[14.285%] h-full"}></div>
                    <div className={"relative w-[14.285%] h-full"}></div>
                </div>
            </div>

            <div className={"absolute top-0 left-[7.5%] h-full border-[0.5px] z-100"}/> {/* vertical line separating time slots from events */}

            {Array.from({ length: 6 }, (_, i) => i + 1).map((i) => (
                    <div key={i} className={"absolute top-[5%] h-[95%] border-[0.5px] z-100"} 
                        style={{left: `calc(7.5% + (${i} * 13.21%))`}}/>
            ))} {/* vertical lines making event boundaries clear */}
        </div>
    );
}