import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import { times, daysOfWeek, months } from "../services/calendar-data.js";
import { createEvent } from "../services/eventsAPI.jsx";

const CALENDAR_HEIGHT = 1056;
const MINUTES_IN_DAY = 1440;
const MIN_EVENT_MINUTES = 15;

export default function Calendar({ code, username }) {
    const [currDate, setCurrDate] = useState(new Date());
    const [currTotalMinutes, setCurrTotalMinutes] = useState(60 * currDate.getHours() + currDate.getMinutes());

    const [focusedDate, setFocusedDate] = useState(new Date());
    const [year, setYear] = useState(currDate.getFullYear());
    const [month, setMonth] = useState(months[currDate.getMonth()]);
    const [day, setDay] = useState(currDate.getDay());
    const [weekDates, setWeekDates] = useState(getDatesOfWeek(new Date()));
    const [isWeekView, setIsWeekView] = useState(true);
    const [displayDays, setDisplayDays] = useState(daysOfWeek);
    const [showEventDetailPopup, setShowEventDetailPopup] = useState(false);
    const [eventDraft, setEventDraft] = useState(null);
    const [eventTitle, setEventTitle] = useState("");
    const [calendarId, setCalendarId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [eventsByDate, setEventsByDate] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isContextReady, setIsContextReady] = useState(false);

    function formatDateKey(date) {
        return [
            date.getFullYear(),
            `${date.getMonth() + 1}`.padStart(2, "0"),
            `${date.getDate()}`.padStart(2, "0"),
        ].join("-");
    }

    function getDatesOfWeek(selectDate) {
        const dates = [];
        const dayOfWeek = selectDate.getDay();

        for (let i = 0; i < 7; i++) {
            const dummyDate = new Date(selectDate);
            dummyDate.setDate(selectDate.getDate() + (i - dayOfWeek));
            dates.push(dummyDate);
        }

        return dates;
    }

    function minutesToTime(minutes) {
        let hour = Math.floor(minutes / 60);
        const minute = `${minutes % 60}`.padStart(2, "0");
        const isAM = hour < 12;
        if (hour === 0) hour = 12;
        if (hour > 12) hour -= 12;
        return `${hour}:${minute}${isAM ? "am" : "pm"}`;
    }

    function minutesToInputTime(minutes) {
        const safeMinutes = Math.max(0, Math.min(MINUTES_IN_DAY - 1, minutes));
        const hour = `${Math.floor(safeMinutes / 60)}`.padStart(2, "0");
        const minute = `${safeMinutes % 60}`.padStart(2, "0");
        return `${hour}:${minute}`;
    }

    function inputTimeToMinutes(value) {
        const [hours, minutes] = value.split(":").map(Number);
        if (
            !Number.isFinite(hours) ||
            !Number.isFinite(minutes) ||
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59
        ) {
            return null;
        }
        return (hours * 60) + minutes;
    }

    function minutesToDayDate(date, minutes) {
        const dayDate = new Date(date);
        dayDate.setHours(0, 0, 0, 0);
        dayDate.setMinutes(minutes);
        return dayDate.toISOString();
    }

    function mapEventToRenderBlock(event) {
        const startDate = new Date(event.start_time);
        const endDate = new Date(event.end_time);
        const startMinutes = (startDate.getHours() * 60) + startDate.getMinutes();
        const endMinutes = Math.max(startMinutes + MIN_EVENT_MINUTES, (endDate.getHours() * 60) + endDate.getMinutes());
        return {
            id: event.id,
            title: event.title || event.name || "Untitled event",
            name: event.name || username || "Guest",
            startMinutes,
            endMinutes,
            isDraft: false,
        };
    }

    const visibleEvents = useMemo(() => {
        const mapped = {};
        Object.entries(eventsByDate).forEach(([dateKey, events]) => {
            mapped[dateKey] = events.map(mapEventToRenderBlock);
        });

        if (eventDraft) {
            const dateKey = formatDateKey(eventDraft.date);
            const draftBlock = {
                id: "draft",
                title: eventTitle || "New event",
                name: username || "Guest",
                startMinutes: eventDraft.startMinutes,
                endMinutes: eventDraft.endMinutes,
                isDraft: true,
            };
            mapped[dateKey] = [...(mapped[dateKey] || []), draftBlock];
        }
        return mapped;
    }, [eventsByDate, eventDraft, eventTitle, username]);

    useEffect(() => {
        const timerId = setInterval(() => {
            const newDate = new Date();
            setCurrDate(newDate);
            setCurrTotalMinutes(60 * newDate.getHours() + newDate.getMinutes());
        }, 1000 * 60);

        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        async function createGuestUser() {
            const safeName = (username || "guest").replaceAll(/\s+/g, "-").toLowerCase();
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: `${safeName}-${Date.now()}@guest.local`,
                    password: "guest",
                    is_guest: true,
                }),
            });
            if (!response.ok) throw new Error("Failed to create user");
            const user = await response.json();
            window.localStorage.setItem("insync-user-id", `${user.id}`);
            return user.id;
        }

        async function resolveContext() {
            setIsContextReady(false);
            setErrorMessage("");
            try {
                if (!code) throw new Error("Missing calendar code in URL.");

                const calendarResponse = await fetch("/api/calendars");
                if (!calendarResponse.ok) throw new Error("Failed to load calendars");
                const calendars = await calendarResponse.json();
                let foundCalendar = calendars.find((calendar) => `${calendar.join_code}` === `${code}`);

                // Auto-create the calendar if this join code does not exist yet.
                if (!foundCalendar) {
                    const createCalendarResponse = await fetch("/api/calendars", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: `Shared ${code}`,
                            join_code: `${code}`.slice(0, 6).toUpperCase(),
                        }),
                    });
                    if (!createCalendarResponse.ok) throw new Error("Failed to create calendar");
                    foundCalendar = await createCalendarResponse.json();
                }
                setCalendarId(foundCalendar.id);

                const cachedIdRaw = window.localStorage.getItem("insync-user-id");
                const cachedId = Number(cachedIdRaw);
                let resolvedUserId = null;

                if (Number.isInteger(cachedId) && cachedId > 0) {
                    const checkUserResponse = await fetch(`/api/users/${cachedId}`);
                    if (checkUserResponse.ok) {
                        resolvedUserId = cachedId;
                    }
                }

                if (!resolvedUserId) {
                    resolvedUserId = await createGuestUser();
                }

                setCurrentUserId(resolvedUserId);
                setIsContextReady(true);
            } catch (error) {
                setErrorMessage(error.message);
            }
        }

        resolveContext();
    }, [code, username]);

    useEffect(() => {
        async function loadEvents() {
            if (!calendarId) return;
            try {
                const response = await fetch(`/api/events/calendar/${calendarId}`);
                if (!response.ok) throw new Error("Failed to load events");
                const events = await response.json();
                const grouped = {};
                events.forEach((event) => {
                    const eventDate = new Date(event.start_time);
                    const dateKey = formatDateKey(eventDate);
                    if (!grouped[dateKey]) grouped[dateKey] = [];
                    grouped[dateKey].push(event);
                });
                setEventsByDate(grouped);
            } catch (error) {
                setErrorMessage(error.message);
            }
        }
        loadEvents();
    }, [calendarId]);

    function changeFocusedTime(daysChanged = 0, millisecondsChanged = 0) {
        if (daysChanged === 0 && millisecondsChanged === 0) return;

        const newFocusedDate = new Date(focusedDate);
        newFocusedDate.setTime(newFocusedDate.getTime() + ((daysChanged !== 0) ? (daysChanged * 24 * 60 * 60 * 1000) : millisecondsChanged));

        setFocusedDate(newFocusedDate);
        setYear(newFocusedDate.getFullYear());
        setMonth(months[newFocusedDate.getMonth()]);
        setDay(newFocusedDate.getDay());
        setWeekDates(isWeekView ? getDatesOfWeek(newFocusedDate) : [newFocusedDate]);
        if (!isWeekView) setDisplayDays([daysOfWeek[newFocusedDate.getDay()]]);
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

    function setUpEventCreationPopup(draftData) {
        setEventDraft(draftData);
        setEventTitle("");
        setErrorMessage("");
        setShowEventDetailPopup(true);
    }

    function closePopupAndClearDraft() {
        setShowEventDetailPopup(false);
        setEventDraft(null);
        setEventTitle("");
    }

    function updateDraftTime(boundary, rawValue) {
        if (!eventDraft) return;
        const converted = inputTimeToMinutes(rawValue);
        if (converted === null) return;

        if (boundary === "start") {
            const nextStart = converted;
            const nextEnd = Math.max(nextStart + MIN_EVENT_MINUTES, eventDraft.endMinutes);
            setEventDraft({
                ...eventDraft,
                startMinutes: nextStart,
                endMinutes: Math.min(nextEnd, MINUTES_IN_DAY),
            });
            return;
        }

        const nextEnd = converted;
        const nextStart = Math.min(eventDraft.startMinutes, Math.max(0, nextEnd - MIN_EVENT_MINUTES));
        setEventDraft({
            ...eventDraft,
            startMinutes: nextStart,
            endMinutes: Math.max(nextEnd, nextStart + MIN_EVENT_MINUTES),
        });
    }

    async function saveEventFromPopup() {
        if (!eventDraft) {
            return;
        }
        if (!calendarId || !currentUserId) {
            setErrorMessage("Still loading calendar/user. Please try again.");
            return;
        }
        if (!eventTitle.trim()) {
            setErrorMessage("Please add an event title.");
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                user_id: currentUserId,
                calendar_id: calendarId,
                name: username || "Guest",
                title: eventTitle.trim(),
                start_time: minutesToDayDate(eventDraft.date, eventDraft.startMinutes),
                end_time: minutesToDayDate(eventDraft.date, eventDraft.endMinutes),
            };
            const created = await createEvent(payload);
            const dateKey = formatDateKey(new Date(created.start_time));
            setEventsByDate((prev) => ({
                ...prev,
                [dateKey]: [...(prev[dateKey] || []), created],
            }));
            closePopupAndClearDraft();
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSaving(false);
        }
    }

    useEffect(() => {
        document.body.onkeydown = (event) => trackKeyPress(event);
        return () => {
            document.body.onkeydown = null;
        };
    });

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

                <div className={"flex flex-row items-center justify-center w-[92.5%] h-[1056px]"}> {/* events container */}
                    {weekDates.map((date, index) => (
                        <CalendarDayColumn key={`${formatDateKey(date)}-${index}`} 
                                           id={`${daysOfWeek[index]}-column`} 
                                           weekday={isWeekView} 
                                           date={date} 
                                           events={visibleEvents[formatDateKey(date)] || []}
                                           triggerEventPopup={setUpEventCreationPopup}/>
                    ))}
                </div>

                {((isWeekView && isCurrDayInFocusedWeek()) || (!isWeekView && isCurrDateFocusedDate())) ? 
                    <div className={`absolute ${isWeekView ? 'w-[13.21%]' : 'w-full'} border border-red-500 z-101`}
                        style={{top: `${CALENDAR_HEIGHT * (currTotalMinutes / MINUTES_IN_DAY)}px`, left: (isWeekView) ? `calc(7.5% + (${currDate.getDay()} * 13.21%))` : '7.5%'}}/> // horz. current time display line
                    :
                    <></>
                }
                </div>

            <div className={"absolute top-0 left-[7.5%] h-full border-[0.5px] z-100"}/> {/* vertical line separating time slots from events */}

            {Array.from({ length: (isWeekView) ? 6 : 0 }, (_, i) => i + 1).map((i) => (
                    <div key={`vert ${i}`} className={"absolute top-[5%] h-[95%] border-[0.5px] z-100"} 
                        style={{left: `calc(7.5% + (${i} * 13.21%))`}}/>
            ))} {/* vertical lines making event boundaries clear */}

            <div className={`${showEventDetailPopup ? "block" : "hidden"} absolute top-0 left-0 w-full h-full bg-[#9e9effab] z-1000`}>
                <div className="flex flex-col gap-4 items-start justify-start w-[360px] min-h-[220px] bg-[#9e9eff] rounded-md p-4 mt-6 ml-6">
                    <div className="flex w-full justify-between items-center">
                        <h3 className="font-bold text-lg">Create Event</h3>
                        <Button text="X" id="leave-event-creator-btn" onClick={closePopupAndClearDraft}/>
                    </div>
                    <p><span className="font-semibold">User:</span> {username || "Guest"}</p>
                    <p>
                        <span className="font-semibold">Time:</span>{" "}
                        {eventDraft ? `${minutesToTime(eventDraft.startMinutes)} - ${minutesToTime(eventDraft.endMinutes)}` : "--"}
                    </p>
                    <div className="w-full flex items-center gap-2">
                        <label className="text-sm font-semibold">Start</label>
                        <input
                            type="time"
                            value={eventDraft ? minutesToInputTime(eventDraft.startMinutes) : "00:00"}
                            onChange={(event) => updateDraftTime("start", event.target.value)}
                            className="border px-2 py-1 rounded w-full"
                        />
                    </div>
                    <div className="w-full flex items-center gap-2">
                        <label className="text-sm font-semibold">End</label>
                        <input
                            type="time"
                            value={eventDraft ? minutesToInputTime(eventDraft.endMinutes) : "00:15"}
                            onChange={(event) => updateDraftTime("end", event.target.value)}
                            className="border px-2 py-1 rounded w-full"
                        />
                    </div>
                    <input
                        type="text"
                        value={eventTitle}
                        placeholder="Event title"
                        onChange={(event) => setEventTitle(event.target.value)}
                        className="w-full border px-2 py-1 rounded"
                    />
                    {errorMessage ? <p className="text-red-700 text-sm">{errorMessage}</p> : null}
                    <Button
                        text={isSaving ? "Saving..." : (isContextReady ? "Save Event" : "Loading...")}
                        id="save-event-btn"
                        onClick={saveEventFromPopup}
                        disabled={!isContextReady || isSaving}
                    />
                </div>
            </div> {/* event cover to add/edit/delete events*/}
        </div>
    );
}



function CalendarDayColumn(props) {
    const [creatingEvent, setCreatingEvent] = useState(false);
    const [eventStartY, setEventStartY] = useState(0);
    const [eventEndY, setEventEndY] = useState(0);

    const id = props.id;
    const isWeekday = props.weekday;

    function yToMinutes(yPos) {
        const normalized = Math.max(0, Math.min(CALENDAR_HEIGHT, yPos));
        return Math.floor((normalized / CALENDAR_HEIGHT) * MINUTES_IN_DAY);
    }

    function startEventCreation(mouseEvent) {        
        const startPos = mouseEvent.nativeEvent.offsetY;
        setCreatingEvent(true);
        setEventStartY(startPos);
        setEventEndY(startPos);
    }

    function changeEventSize(mouseEvent) {
        if (!creatingEvent) return;
        setEventEndY(mouseEvent.nativeEvent.offsetY);
    }

    function setEventSize() {
        if (!creatingEvent) return;
        setCreatingEvent(false);

        const startY = Math.max(0, Math.min(eventStartY, eventEndY));
        const endY = Math.min(CALENDAR_HEIGHT, Math.max(eventStartY, eventEndY));
        let startMinutes = yToMinutes(startY);
        let endMinutes = yToMinutes(endY);
        if (endMinutes - startMinutes < MIN_EVENT_MINUTES) {
            endMinutes = Math.min(MINUTES_IN_DAY, startMinutes + MIN_EVENT_MINUTES);
        }

        props.triggerEventPopup({
            date: props.date,
            startMinutes,
            endMinutes,
        });
    }

    const previewTop = Math.max(0, Math.min(eventStartY, eventEndY));
    const previewBottom = Math.min(CALENDAR_HEIGHT, Math.max(eventStartY, eventEndY));
    const previewHeight = Math.max(18, previewBottom - previewTop);

    return (
        <div className={`relative ${(isWeekday) ? "w-[14.285%]" : "w-full"} h-full`} id={id} key={id}
             onMouseDown={(event) => startEventCreation(event)}
             onMouseMove={(event) => changeEventSize(event)}
             onMouseUp={() => setEventSize()}
            >

            {creatingEvent ? (
                <div
                    className="absolute w-full border border-amber-600 bg-amber-200/70 pointer-events-none z-20"
                    style={{ top: `${previewTop}px`, height: `${previewHeight}px` }}
                />
            ) : null}
            
            {props.events.map((event, index) => {
                const top = (event.startMinutes / MINUTES_IN_DAY) * CALENDAR_HEIGHT;
                const height = Math.max(18, ((event.endMinutes - event.startMinutes) / MINUTES_IN_DAY) * CALENDAR_HEIGHT);
                return (
                <div key={`${id}-event-${index}`} 
                     className={`absolute w-full border ${event.isDraft ? "bg-amber-200 border-amber-500" : "bg-amber-300 border-amber-700"} pointer-events-none`}
                     style={{ top: `${top}px`, height: `${height}px` }}>
                        <p className="select-none text-xs px-1 truncate">{event.title}</p>
                        <p className="select-none text-[10px] px-1">{event.name}</p>

                </div>
            )})}
        </div>
    );
}