import { useState } from "react"; 

export default function CalendarDayColumn(props) {
    const [creatingEvent, setCreatingEvent] = useState(false);
    const [displayedEvents, setDisplayedEvents] = useState([]); // have this take in events from thr calendar
    const [bottom, setBottom] = useState(undefined);
    const [top, setTop] = useState(undefined);
    const [eventFocused, setEventFocused] = useState(false);

    const id = props.id;
    const isWeekday = props.weekday;
    // const user = props.user;
    // const color = props.color;

    function startEventCreation(mouseEvent) {
        console.log();
        if (eventFocused) {
            console.log("did something");

            return;
        }
        console.log("another");

        let startPos = mouseEvent.nativeEvent.offsetY;

        displayedEvents.push({style: {top: `${startPos}px`, height: "0px"}});
        setCreatingEvent(true);
        setTop(startPos);
        setBottom(startPos);
        setDisplayedEvents(displayedEvents);
    }

    function changeEventSize(mouseEvent) { // needs minor fixing for stabilizing the event when mouse repeatedly goes up and down past the event's height
        if (!creatingEvent) {return;}

        let currPos = mouseEvent.nativeEvent.offsetY;
        let eventsCopy = structuredClone(displayedEvents);
        let currEventStyle = eventsCopy[eventsCopy.length - 1];

        if (currPos < top || (currPos - top < bottom - currPos)) {
            currEventStyle.style.top = currPos + "px";
            setTop(currPos);
        }
        else if (currPos > bottom || (currPos - top > bottom - currPos)) {
            currEventStyle.style.top = top + "px";
            setBottom(currPos);
        }

        const currTop = parseInt(currEventStyle.style.top.substring(0, currEventStyle.style.top.length - 2));
        currEventStyle.style.height = Math.abs(currTop - bottom) + "px";
        eventsCopy[eventsCopy.length - 1] = currEventStyle;
        changeEventTimes(currEventStyle);
        setDisplayedEvents(eventsCopy);
    }

    function setEventSize(mouseEvent) {
        changeEventSize(mouseEvent);
        setCreatingEvent(false);

        props.triggerEventPopup(structuredClone(displayedEvents[displayedEvents.length - 1]));
    }

    function changeEventTimes(givenEventStyle) {
        function getTimesFromEvent(eventPixelLoc) {
            let hour = eventPixelLoc / 1056 * 24;
            if (hour === 24) {hour -= 0.01;}

            const minute = Math.floor((hour - Math.floor(hour)) * 60) + "";
            hour = Math.floor(hour);

            const isAM = hour <= 12;
            if (!isAM) {hour -= 12;}
            if (hour == 0) {hour = 12;}

            return `${hour}:${minute.padStart(2, "0")}${isAM ? "am" : "pm"}`;
        }
        
        const eventTop = parseInt(givenEventStyle.style.top.substring(0, givenEventStyle.style.top.length - 2));
        const eventBottom = eventTop + parseInt(givenEventStyle.style.height.substring(0, givenEventStyle.style.height.length - 2));

        const startTime = getTimesFromEvent(eventTop);
        const endTime = getTimesFromEvent(eventBottom);

        givenEventStyle.startTime = startTime;
        givenEventStyle.endTime = endTime;
    }

    function trackKeyPress(keyEvent) {
        if (keyEvent.key === "Escape" && creatingEvent) {
            console.log("escaping out of creating an event!");

            let eventsCopy = structuredClone(displayedEvents);
            eventsCopy.pop();

            setDisplayedEvents(eventsCopy);
            setCreatingEvent(false);
        }
    }

    document.body.onkeyup = (event) => trackKeyPress(event); // so we don't override the onkeydown event in Calendar

    return (
        <div className={`relative ${(isWeekday) ? "w-[14.285%]" : "w-full"} h-full`} id={id} key={id}
             onMouseDown={(event) => startEventCreation(event)}
             onMouseMove={(event) => changeEventSize(event)}
             onMouseUp={(event) => setEventSize(event)}
            >
            
            {displayedEvents.map((event, index) => (
                <div key={`${id}-event-${index}`} 
                     className={`absolute w-full border bg-amber-300 ${creatingEvent ? "pointer-events-none" : "pointer-events-auto"}`} 
                     style={event.style}
                     onMouseDown={() => {console.log(`focused on ${id}-event-${index}`); setEventFocused(true);}}>

                        <p className="select-none">{event.startTime} - {event.endTime}</p>

                </div>
            ))}
        </div>
    );
}