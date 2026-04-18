import { useState } from "react"; 
import Button from "../components/Button.jsx";
import { times, daysOfWeek, months } from "../services/calendar-data.js";

export default function Calendar() {
    const [currDate, setCurrDate] = useState(new Date());
    const [currTotalMinutes, setCurrTotalMinutes] = useState(60 * currDate.getHours() + currDate.getMinutes());

    const [focusedDate, setFocusedDate] = useState(new Date());
    const [year, setYear] = useState(currDate.getFullYear());
    const [month, setMonth] = useState(months[currDate.getMonth()]);
    const [day, setDay] = useState(currDate.getDay());
    const [weekDates, setWeekDates] = useState(getDatesOfWeek(new Date()));
    const [isWeekView, setIsWeekView] = useState(true);
    const [displayDays, setDisplayDays] = useState(daysOfWeek);

    setInterval(() => {
        const newDate = new Date();

        setCurrDate(newDate);
        setCurrTotalMinutes(60 * newDate.getHours() + newDate.getMinutes());
    }, 1000 * 60); // updates every minute
    

    function getDatesOfWeek(selectDate) {
        let dates = [];
        let dummyDate = new Date();

        for (let i = 0; i < 7; i++) {
            dummyDate.setTime(selectDate.getTime() + ((i - day) * 24 * 60 * 60 * 1000));
            dates.push(structuredClone(dummyDate));
        }

        return dates;
    }

    function changeFocusedTime(daysChanged=0, millisecondsChanged=0) {
        if (daysChanged == 0 && millisecondsChanged == 0) {return;}

        const newFocusedDate = new Date(focusedDate);
        newFocusedDate.setTime(newFocusedDate.getTime() + ((daysChanged != 0) ? (daysChanged * 24 * 60 * 60 * 1000) : millisecondsChanged));

        setFocusedDate(newFocusedDate);
        setYear(newFocusedDate.getFullYear());
        setMonth(months[newFocusedDate.getMonth()]);
        setDay(newFocusedDate.getDay());
        setWeekDates((isWeekView) ? getDatesOfWeek(newFocusedDate) : [newFocusedDate]);
        if (!isWeekView) {setDisplayDays([daysOfWeek[newFocusedDate.getDay()]]);}
    }

    function changeCalendarView(isWeek, providedDate = undefined) {
        setIsWeekView(isWeek);

        if (!isWeek) {
            const appliedDate = providedDate === undefined ? focusedDate : providedDate;
            setWeekDates([appliedDate]);
            setDisplayDays([daysOfWeek[appliedDate.getDay()]]);
        } else {
            setWeekDates(getDatesOfWeek(focusedDate));
            setDisplayDays(daysOfWeek);
        }
    }

    function isCurrDayInFocusedWeek() {
        let inDisplayedWeek = false;

        for (let i = 0; i < weekDates.length; i++) {
            inDisplayedWeek ||= currDate.getDate() === weekDates[i].getDate()
        }

        return currDate.getFullYear() === focusedDate.getFullYear() && 
                currDate.getMonth() === focusedDate.getMonth() && 
                inDisplayedWeek;
    }

    function isCurrDateFocusedDate() {
        return currDate.getFullYear() === focusedDate.getFullYear() && 
                currDate.getMonth() === focusedDate.getMonth() && 
                currDate.getDay() === focusedDate.getDay() && 
                currDate.getDate() === focusedDate.getDate();
    }

    function trackKeyPress(keyPressEvent) {
        if (keyPressEvent.key === "ArrowLeft") {changeFocusedTime(isWeekView ? -7 : -1);} 
        else if (keyPressEvent.key === "ArrowRight") {changeFocusedTime(isWeekView ? 7 : 1);}
        else if (keyPressEvent.key === "w") {changeCalendarView(true);}
        else if (keyPressEvent.key === "d") {changeCalendarView(false);}
        else if (keyPressEvent.key === "t") {changeFocusedTime(0, currDate.getTime() - focusedDate.getTime());}
    }

    function clickOnDateLabel(weekdayIndex, givenDate) {
        changeFocusedTime(weekdayIndex - currDate.getDay()); 
        changeCalendarView(false, givenDate);
    }

    document.body.onkeydown = (event) => trackKeyPress(event);

    return (
        <div className={"relative h-full w-[87.5%] bg-gray-300 rounded-xl"}>
            <div className={"flex flex-row h-[10%] border-b"}> {/* top portion (buttons, dates, month, year) */}
                <div className={"flex flex-col items-center justify-center w-[7.5%] h-full"}> {/* calendar buttons container */}
                    <div className={"flex flex-row items-center justify-center"}>
                        <Button text="<-" id="back-calendar-btn" onClick={() => changeFocusedTime(isWeekView ? -7 : -1)}/>
                        <Button text="->" id="forward-calendar-btn" onClick={() => changeFocusedTime(isWeekView ? 7 : 1)}/>
                        <Button text="Today" id="today-calendar-btn" onClick={() => changeFocusedTime(0, currDate.getTime() - focusedDate.getTime())}/>
                    </div>

                    <div className={"flex flex-row items-center justify-center"}>
                        <Button text="Day" id="day-calendar-btn" onClick={() => changeCalendarView(false)}/>
                        <Button text="Week" id="week-calendar-btn" onClick={() => changeCalendarView(true)}/>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-start w-[92.5%] h-full"> {/* month, year, and dates/days display */}
                    <h2 className="font-bold">{month} {year}</h2> {/* month and year */}
                    <div className={"flex flex-row items-center justify-around w-full h-full"}> {/* dates/days */}
                        {displayDays.map((day, index) => (
                            <div key={`day-date-${index}`} className="flex flex-col items-center justify-end w-[14.285%] h-full cursor-pointer hover:bg-gray-400"
                                 onClick={() => {clickOnDateLabel(index, weekDates[index])}}>    
                                <p key={`day-${index}`}>{day}</p>
                                <p key={`date-${index}`} 
                                   className={`${(weekDates[index].getDate() === currDate.getDate() && 
                                                  weekDates[index].getMonth() === currDate.getMonth() && 
                                                  weekDates[index].getFullYear() === currDate.getFullYear()) ? 'bg-blue-300' : 'bg-transparent'} rounded-full aspect-square text-center`}>
                                        {weekDates[index].getDate()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={"relative flex flex-row h-[90%] overflow-y-scroll"}> {/* calendar content (times, events) */}
                <div className={"flex flex-col items-center justify-start w-[7.5%] h-full gap-5"}> {/* time slots container */}
                    {times.map((time, index) => (
                        <div key={`time-container-${index}`} className="absolute left-0 pb-5" style={{top: `calc(44px * ${index})`}}> 
                            <div key={`horz-${index}`} className={"w-[87.5vw] border-[0.25px] border-gray-100"}/> {/* horizontal guidelines for hour-long representation and leading to corresponding to specific time labels */}
                            <p key={`time-${index}`} className={"select-none ml-2"}>{time}</p> {/* time labels */}
                        </div>
                    ))}
                </div>

                {(isWeekView) ? 
                    <div className={"flex flex-row items-center justify-center w-[92.5%] h-[1056px]"}> {/* events container */}
                        <CalendarDayColumn id="sunday-column" weekday={true}/>
                        <CalendarDayColumn id="monday-column" weekday={true}/>
                        <CalendarDayColumn id="tuesday-column" weekday={true}/>
                        <CalendarDayColumn id="wednesday-column" weekday={true}/>
                        <CalendarDayColumn id="thrusday-column" weekday={true}/>
                        <CalendarDayColumn id="friday-column" weekday={true}/>
                        <CalendarDayColumn id="saturday-column" weekday={true}/>
                    </div>
                    :
                    <div className={"flex flex-row items-center justify-center w-[92.5%] h-[1056px]"}> {/* events container */}
                        <CalendarDayColumn id="day-column" weekday={false}/>
                    </div>
                }

                {((isWeekView && isCurrDayInFocusedWeek()) || (!isWeekView && isCurrDateFocusedDate())) ? 
                    <div className={`absolute ${isWeekView ? 'w-[13.21%]' : 'w-full'} border border-red-500 z-101`}
                        style={{top: `${1056 * (currTotalMinutes / 1440)}px`, left: (isWeekView) ? `calc(7.5% + (${currDate.getDay()} * 13.21%))` : '7.5%'}}/> // horz. current time display line
                    :
                    <></>
                }
                </div>

            <div className={"absolute top-0 left-[7.5%] h-full border-[0.5px] z-100"}/> {/* vertical line separating time slots from events */}

            {Array.from({ length: (isWeekView) ? 6 : 0 }, (_, i) => i + 1).map((i) => (
                    <div key={`vert ${i}`} className={"absolute top-[5%] h-[95%] border-[0.5px] z-100"} 
                        style={{left: `calc(7.5% + (${i} * 13.21%))`}}/>
            ))} {/* vertical lines making event boundaries clear */}
        </div>
    );
}

function CalendarDayColumn(props) {
    const [creatingEvent, setCreatingEvent] = useState(false);
    const [events, setEvents] = useState([]);
    const [bottom, setBottom] = useState(undefined);

    const id = props.id;

    function startEventCreation(mouseEvent) {
        let startPos = mouseEvent.nativeEvent.offsetY;

        setCreatingEvent(true);

        events.push({top: `${startPos}px`});
        setBottom(startPos);
        setEvents(events);
    }

    function createEvent(mouseEvent) {
        changeEventSize(mouseEvent);
        setCreatingEvent(false);
    }

    function changeEventSize(mouseEvent) {
        if (!creatingEvent) {return;}

        let endPos = mouseEvent.nativeEvent.offsetY;
        let eventsCopy = structuredClone(events);
        let currEventStyle = eventsCopy[eventsCopy.length - 1];
        let currEventTop = parseInt(currEventStyle.top.substring(0, currEventStyle.top.length - 2));

        if (endPos < currEventTop) {
            currEventStyle.top = endPos + "px";
            currEventStyle.height = (bottom - endPos) + "px";
        }
        else if (endPos > currEventTop) {
            console.log("set");

            currEventStyle.height = Math.abs(endPos - currEventTop) + "px";
            setBottom(endPos);
        }

        eventsCopy[eventsCopy.length - 1] = currEventStyle;
        setEvents(eventsCopy);
    }

    return (
        <div className={`relative ${(props.weekday) ? "w-[14.285%]" : "w-full"} h-full`} id={id}
             onMouseDown={(event) => startEventCreation(event)}
             onMouseMove={(event) => changeEventSize(event)}
             onMouseUp={(event) => createEvent(event)}
            >
            
            {events.map((event, index) => (
                <div key={`${id}-event-${index}`} className={"absolute w-full border bg-amber-300 pointer-events-none"} style={event}></div>
            ))}
        </div>
    );
}