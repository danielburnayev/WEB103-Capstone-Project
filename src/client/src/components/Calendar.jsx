import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import { times, daysOfWeek, months } from "../services/calendar-data.js";
import { createEvent, updateEvent, deleteEvent } from "../services/eventsAPI.jsx";
import { createCalendar, getAllCalendars } from "../services/calendarsAPI.jsx";
import { getCalendarDisplay, setCalendarDisplay } from "../services/calendarDisplayStorage.js";

const CALENDAR_HEIGHT = 1056;
const MINUTES_IN_DAY = 1440;
const MIN_EVENT_MINUTES = 15;

const Calendar = forwardRef(function Calendar({ code, username, color = "#fcd34d", eventActionMode = "none", onChangeEventActionMode = () => {}, addActionNonce = 0, onViewModeChange = () => {} }, ref) {
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
    const [memberColorsByUserId, setMemberColorsByUserId] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isContextReady, setIsContextReady] = useState(false);
    const [popupMode, setPopupMode] = useState("create");
    const [editingEventId, setEditingEventId] = useState(null);

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
        const persistedMemberColor = memberColorsByUserId[event.user_id];
        return {
            id: event.id,
            title: event.title || event.name || "Untitled event",
            name: event.name || username || "Guest",
            date: startDate,
            startMinutes,
            endMinutes,
            color: persistedMemberColor || event.color || ((event.name || "").trim().toLowerCase() === (username || "").trim().toLowerCase() ? color : undefined),
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
                color,
                isDraft: true,
            };
            mapped[dateKey] = [...(mapped[dateKey] || []), draftBlock];
        }
        return mapped;
    }, [eventsByDate, eventDraft, eventTitle, username, memberColorsByUserId]);

    useEffect(() => {
        const timerId = setInterval(() => {
            const newDate = new Date();
            setCurrDate(newDate);
            setCurrTotalMinutes(60 * newDate.getHours() + newDate.getMinutes());
        }, 1000 * 60);

        return () => clearInterval(timerId);
    }, []);

    async function createGuestUserForCalendar() {
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

    async function ensureUserMembership(calendarId, userId) {
        const isLoggedInUser = Boolean(window.localStorage.getItem("insync-user-email"));
        const perCalendar = getCalendarDisplay(code);
        const existingMembershipResponse = await fetch(`/api/calendars/${calendarId}/users`);
        if (!existingMembershipResponse.ok) {
            throw new Error("Failed to check calendar membership");
        }

        const members = await existingMembershipResponse.json();
        const existingMember = members.find((member) => Number(member.user_id) === Number(userId));
        if (existingMember) {
            if (!isLoggedInUser && existingMember.username && code) {
                setCalendarDisplay(code, {
                    username: `${existingMember.username}`,
                    color: existingMember.color || "#3b82f6",
                });
            }
            return;
        }

        const fallbackName = (
            username ||
            perCalendar?.username ||
            "Member"
        ).trim();
        const fallbackColor = color || perCalendar?.color || "#3b82f6";
        const addMembershipResponse = await fetch(`/api/calendars/${calendarId}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                username: fallbackName.slice(0, 50),
                color: fallbackColor,
            }),
        });
        if (!addMembershipResponse.ok) {
            throw new Error("Failed to join calendar");
        }
        if (!isLoggedInUser && code) {
            setCalendarDisplay(code, {
                username: fallbackName.slice(0, 50),
                color: fallbackColor,
            });
        }
    }

    // Only `code` triggers full calendar/user bootstrap. Including username/color here used to rerun
    // resolveContext whenever profile display hydrated, resetting isContextReady — leaving Save stuck on Loading.
    useEffect(() => {
        let cancelled = false;

        async function resolveContext() {
            setIsContextReady(false);
            setCalendarId(null);
            setCurrentUserId(null);
            setErrorMessage("");
            try {
                if (!code) throw new Error("Missing calendar code in URL.");

                const calendars = await getAllCalendars();
                const codeKey = `${code}`.trim().toUpperCase();
                let foundCalendar = calendars.find(
                    (calendar) => `${calendar.join_code}`.trim().toUpperCase() === codeKey
                );

                if (!foundCalendar) {
                    foundCalendar = await createCalendar({
                        name: `Shared ${code}`,
                        join_code: `${code}`.slice(0, 6).toUpperCase(),
                    });
                }

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
                    resolvedUserId = await createGuestUserForCalendar();
                }

                if (cancelled) return;

                setCalendarId(foundCalendar.id);
                setCurrentUserId(resolvedUserId);
                setIsContextReady(true);
            } catch (error) {
                if (!cancelled) {
                    setErrorMessage(error.message);
                }
            }
        }

        resolveContext();
        return () => {
            cancelled = true;
        };
    }, [code]);

    useEffect(() => {
        if (!calendarId || !currentUserId) return;

        let cancelled = false;

        async function syncMembership() {
            try {
                await ensureUserMembership(calendarId, currentUserId);
            } catch (membershipError) {
                if (!cancelled) {
                    console.error("Membership sync warning:", membershipError);
                    setErrorMessage("Joined with limited permissions. You can still create events.");
                }
            }
        }

        syncMembership();
        return () => {
            cancelled = true;
        };
    }, [calendarId, currentUserId, code, username, color]);

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

    useEffect(() => {
        async function loadMemberColors() {
            if (!calendarId) return;
            try {
                const response = await fetch(`/api/calendars/${calendarId}/users`);
                if (!response.ok) throw new Error("Failed to load calendar members");
                const members = await response.json();
                const nextColors = {};
                members.forEach((member) => {
                    if (member?.user_id && member?.color) {
                        nextColors[member.user_id] = member.color;
                    }
                });
                setMemberColorsByUserId(nextColors);
            } catch (error) {
                setErrorMessage(error.message);
            }
        }

        loadMemberColors();
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
        onViewModeChange(isWeek ? "week" : "day");

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
        if (showEventDetailPopup) return;
        const el = keyPressEvent.target;
        const tag = el?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) {
            return;
        }
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
        setPopupMode("create");
        setEditingEventId(null);
        setEventDraft(draftData);
        setEventTitle("");
        setErrorMessage("");
        setShowEventDetailPopup(true);
    }

    function closePopupAndClearDraft() {
        setShowEventDetailPopup(false);
        setEventDraft(null);
        setEventTitle("");
        setPopupMode("create");
        setEditingEventId(null);
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
                color,
            };
            if (popupMode === "edit" && editingEventId) {
                const updated = await updateEvent(editingEventId, payload);
                const updatedId = updated.id;
                setEventsByDate((prev) => {
                    const next = {};
                    Object.entries(prev).forEach(([dateKey, events]) => {
                        next[dateKey] = events.filter((event) => event.id !== updatedId);
                    });
                    const updatedDateKey = formatDateKey(new Date(updated.start_time));
                    next[updatedDateKey] = [...(next[updatedDateKey] || []), updated];
                    return next;
                });
                onChangeEventActionMode("none");
            } else {
                const created = await createEvent(payload);
                const dateKey = formatDateKey(new Date(created.start_time));
                setEventsByDate((prev) => ({
                    ...prev,
                    [dateKey]: [...(prev[dateKey] || []), created],
                }));
            }
            closePopupAndClearDraft();
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleEventClick(eventBlock) {
        if (!eventBlock || eventBlock.id === "draft") return;

        if (eventActionMode === "remove") {
            try {
                await deleteEvent(eventBlock.id);
                setEventsByDate((prev) => {
                    const next = {};
                    Object.entries(prev).forEach(([dateKey, events]) => {
                        next[dateKey] = events.filter((event) => event.id !== eventBlock.id);
                    });
                    return next;
                });
                onChangeEventActionMode("none");
            } catch (error) {
                setErrorMessage(error.message);
            }
            return;
        }

        if (eventActionMode === "edit") {
            setPopupMode("edit");
            setEditingEventId(eventBlock.id);
            setEventDraft({
                date: eventBlock.date ? new Date(eventBlock.date) : new Date(focusedDate),
                startMinutes: eventBlock.startMinutes,
                endMinutes: eventBlock.endMinutes,
            });
            setEventTitle(eventBlock.title || "");
            setErrorMessage("");
            setShowEventDetailPopup(true);
        }
    }

    useEffect(() => {
        if (!addActionNonce) return;
        const startMinutes = currDate.getHours() * 60;
        setUpEventCreationPopup({
            date: new Date(focusedDate),
            startMinutes,
            endMinutes: Math.min(MINUTES_IN_DAY, startMinutes + 60),
        });
    }, [addActionNonce]);

    useEffect(() => {
        document.body.onkeydown = (event) => trackKeyPress(event);
        return () => {
            document.body.onkeydown = null;
        };
    });

    useImperativeHandle(ref, () => ({
        goBack: () => changeFocusedTime(isWeekView ? -7 : -1),
        goForward: () => changeFocusedTime(isWeekView ? 7 : 1),
        goToday: () => changeFocusedTime(0, currDate.getTime() - focusedDate.getTime()),
        setDayView: () => changeCalendarView(false),
        setWeekView: () => changeCalendarView(true),
    }), [isWeekView, currDate, focusedDate]);

    return (
        <div className="flex-1 h-full flex flex-col gap-2">
            <section className={"relative h-full flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"}>
                <div className={"flex flex-row h-[14%] border-b border-gray-200 bg-gray-50"}> {/* header month + dates */}
                    <div className="flex flex-col items-center justify-start w-full h-full pt-1"> {/* month, year, and dates/days display */}
                        <h2 className="font-bold text-xl tracking-tight pt-1">{month} {year}</h2> {/* month and year */}
                        <div className={`flex flex-row items-center w-full h-full pb-2 ${isWeekView ? "justify-around pl-[14%]" : "justify-center pl-0"}`}> {/* dates/days */}
                        {displayDays.map((day, index) => (
                            <div key={`day-date-${index}`} className={`flex flex-col items-center justify-end ${isWeekView ? "w-[14.285%]" : "w-full"} h-full cursor-pointer hover:bg-gray-100 transition py-1`}
                                 onClick={() => {clickOnDateLabel(index, weekDates[index])}}>    
                                <p key={`day-${index}`} className="text-sm font-medium text-gray-600">{day}</p>
                                <p key={`date-${index}`} 
                                   className={`${(weekDates[index].getDate() === currDate.getDate() && 
                                                  weekDates[index].getMonth() === currDate.getMonth() && 
                                                  weekDates[index].getFullYear() === currDate.getFullYear()) ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-800'} rounded-full aspect-square text-center w-7 h-7 flex items-center justify-center`}>
                                        {weekDates[index].getDate()}
                                </p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            
            <div className={"relative flex flex-row h-[86%] overflow-y-scroll bg-white"}> {/* calendar content (times, events) */}
                <div className={"flex flex-col items-center justify-start w-[14%] h-full gap-5"}> {/* time slots container */}
                    {times.map((time, index) => (
                        <div key={`time-container-${index}`} className="absolute left-0 pb-5" style={{top: `calc(44px * ${index})`}}> 
                            <div key={`horz-${index}`} className={"w-[87.5vw] border-[0.5px] border-gray-200"}/> {/* horizontal guidelines for hour-long representation and leading to corresponding to specific time labels */}
                            <p key={`time-${index}`} className={"select-none ml-2 text-xs text-gray-500"}>{time}</p> {/* time labels */}
                        </div>
                    ))}
                </div>

                <div className={"flex flex-row items-center justify-center w-[86%] h-[1056px]"}> {/* events container */}
                    {weekDates.map((date, index) => (
                        <CalendarDayColumn key={`${formatDateKey(date)}-${index}`} 
                                           id={`${daysOfWeek[index]}-column`} 
                                           weekday={isWeekView} 
                                           date={date} 
                                           events={visibleEvents[formatDateKey(date)] || []}
                                           triggerEventPopup={setUpEventCreationPopup}
                                           eventActionMode={eventActionMode}
                                           userColor={color}
                                           onEventClick={handleEventClick}/>
                    ))}
                </div>

                {((isWeekView && isCurrDayInFocusedWeek()) || (!isWeekView && isCurrDateFocusedDate())) ? 
                    <div className={`absolute ${isWeekView ? 'w-[12.28%]' : 'w-full'} border border-red-500 z-101`}
                        style={{top: `${CALENDAR_HEIGHT * (currTotalMinutes / MINUTES_IN_DAY)}px`, left: (isWeekView) ? `calc(14% + (${currDate.getDay()} * 12.28%))` : '14%'}}/> // horz. current time display line
                    :
                    <></>
                }
                </div>

            <div className={"absolute top-0 left-[14%] h-full border-[0.5px] border-gray-200 z-100"}/> {/* vertical line separating time slots from events */}

            {Array.from({ length: (isWeekView) ? 6 : 0 }, (_, i) => i + 1).map((i) => (
                    <div key={`vert ${i}`} className={"absolute top-[5%] h-[95%] border-[0.5px] border-gray-200 z-100"} 
                        style={{left: `calc(14% + (${i} * 12.28%))`}}/>
            ))} {/* vertical lines making event boundaries clear */}

            <div className={`${showEventDetailPopup ? "block" : "hidden"} absolute top-0 left-0 w-full h-full bg-black/20 z-1000`}>
                <div className="flex flex-col gap-4 items-start justify-start w-[380px] min-h-[260px] bg-white rounded-xl p-5 mt-10 ml-10 shadow-xl border border-gray-200">
                    <div className="flex w-full justify-between items-center">
                        <h3 className="font-bold text-lg">{popupMode === "edit" ? "Edit Event" : "Create Event"}</h3>
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
                            className="border border-gray-300 px-2 py-1 rounded w-full"
                        />
                    </div>
                    <div className="w-full flex items-center gap-2">
                        <label className="text-sm font-semibold">End</label>
                        <input
                            type="time"
                            value={eventDraft ? minutesToInputTime(eventDraft.endMinutes) : "00:15"}
                            onChange={(event) => updateDraftTime("end", event.target.value)}
                            className="border border-gray-300 px-2 py-1 rounded w-full"
                        />
                    </div>
                    <input
                        type="text"
                        value={eventTitle}
                        placeholder="Event title"
                        onChange={(event) => setEventTitle(event.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 rounded"
                    />
                    {errorMessage ? <p className="text-red-700 text-sm">{errorMessage}</p> : null}
                    <Button
                        text={
                            isSaving
                                ? "Saving..."
                                : (isContextReady ? (popupMode === "edit" ? "Save Changes" : "Save Event") : "Loading...")
                        }
                        id="save-event-btn"
                        onClick={saveEventFromPopup}
                        disabled={!isContextReady || isSaving}
                    />
                </div>
            </div> {/* event cover to add/edit/delete events*/}
            </section>
        </div>
    );
});

export default Calendar;



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

    function minutesToLabel(minutes) {
        let hour = Math.floor(minutes / 60);
        const minute = `${minutes % 60}`.padStart(2, "0");
        const isAM = hour < 12;
        if (hour === 0) hour = 12;
        if (hour > 12) hour -= 12;
        return `${hour}:${minute}${isAM ? "am" : "pm"}`;
    }

    function startEventCreation(mouseEvent) {        
        if (props.eventActionMode !== "none") return;
        const startPos = mouseEvent.nativeEvent.offsetY;
        setCreatingEvent(true);
        setEventStartY(startPos);
        setEventEndY(startPos);
    }

    function changeEventSize(mouseEvent) {
        if (props.eventActionMode !== "none") return;
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
    const previewStyle = {
        top: `${previewTop}px`,
        height: `${previewHeight}px`,
        backgroundColor: `${props.userColor || "#fcd34d"}33`,
        borderColor: props.userColor || "#fcd34d",
    };

    return (
        <div className={`relative ${(isWeekday) ? "w-[14.285%]" : "w-full"} h-full`} id={id} key={id}
             onMouseDown={(event) => startEventCreation(event)}
             onMouseMove={(event) => changeEventSize(event)}
             onMouseUp={() => setEventSize()}
            >

            {creatingEvent ? (
                <div
                    className="absolute w-full border-2 pointer-events-none z-20 rounded-md"
                    style={previewStyle}
                />
            ) : null}
            
            {props.events.map((event, index) => {
                const top = (event.startMinutes / MINUTES_IN_DAY) * CALENDAR_HEIGHT;
                const height = Math.max(18, ((event.endMinutes - event.startMinutes) / MINUTES_IN_DAY) * CALENDAR_HEIGHT);
                const showTime = height >= 34;
                const showName = height >= 52;
                const eventStyle = event.color
                    ? {
                        backgroundColor: `${event.color}33`,
                        borderColor: event.color,
                      }
                    : undefined;
                return (
                <div key={`${id}-event-${index}`} 
                     className={`absolute w-full border-2 rounded-md shadow-sm overflow-hidden ${!event.color ? (event.isDraft ? "bg-amber-100 border-amber-400" : "bg-amber-200 border-amber-600") : ""} ${event.isDraft || props.eventActionMode === "none" ? "pointer-events-none" : "pointer-events-auto cursor-pointer ring-2 ring-yellow-300"}`}
                     style={{ top: `${top}px`, height: `${height}px`, ...eventStyle }}
                     onClick={() => props.onEventClick?.({
                        ...event,
                        date: props.date,
                     })}>
                        <p className="select-none text-xs px-1 truncate leading-4">{event.title}</p>
                        {showTime ? (
                            <p className="select-none text-[10px] px-1 truncate leading-4">
                                {minutesToLabel(event.startMinutes)} - {minutesToLabel(event.endMinutes)}
                            </p>
                        ) : null}
                        {showName ? (
                            <p className="select-none text-[10px] px-1 truncate leading-4">{event.name}</p>
                        ) : null}

                </div>
            )})}
        </div>
    );
}