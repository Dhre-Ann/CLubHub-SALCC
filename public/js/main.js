document.addEventListener("DOMContentLoaded", () => {
    
    // Filter by club name
    const clubNameInput = document.getElementById('search-club-name');
    const clubs = document.querySelectorAll('[data-tags]');

    if (clubNameInput){
        clubNameInput.addEventListener('input', () => {
            const filter = clubNameInput.value.toLowerCase();
            clubs.forEach(club => {
                const clubName = club.querySelector('h3').textContent.toLowerCase();
                console.log("clubname: ", clubName);
                if (clubName.includes(filter)) {
                    club.style.display = '';
                } else {
                    club.style.display = 'none';
                }
            });
        });
    }
    

    
    // const clubNameInput = document.getElementById('search-club-name');
    // const clubs = document.querySelectorAll('#club-container');

    // // Search and filter by typing club name
    // if (clubNameInput){
    //     clubNameInput.addEventListener('input', () => {
    //         const filter = clubNameInput.value.toLowerCase(); // This monitors key strokes as you type
    //         clubs.forEach(club => {
    //             let clubName = club.querySelector('h3');
    //             clubName = clubName.textContent.toLowerCase();
    //             // if the clubs name includes characters user types in...
    //             if (clubName.includes(filter)) {
    //                 console.log("clubName: ",clubName);
    //                 console.log("filter: ", filter);
    //                 club.style.display = '';
    //             } else {
    //                 club.style.display = 'none';
    //             }
    //         });
    //     });
    // }
    

    // Filter by tags
    const tagInput = document.getElementById('tag-search');
    const tagsContainer = document.getElementById('tag-dropdown');

    // Get unique tags from clubs
    const tags = new Set();
    clubs.forEach(club => {
        const clubTags = club.getAttribute('data-tags').split(' ');
        clubTags.forEach(tag => tags.add(tag));
    });

    // Create tag elements
    if(tags){
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.classList.add('p-1', 'text-gray-700', 'font-medium', 'cursor-pointer', 'hover:bg-gray-200', 'rounded');
            tagElement.textContent = tag;
            tagElement.addEventListener('click', () => {
                filterClubsByTag(tag.toLowerCase());
            });
            tagsContainer.appendChild(tagElement);
        });
    }
    

    // Show tags container on input focus
    if (tagInput){
        tagInput.addEventListener('focus', () => {
            tagsContainer.classList.remove('hidden');
        });
    }
    

    function filterClubsByTag(selectedTag) {
        clubs.forEach(club => {
            const clubTags = club.getAttribute('data-tags').toLowerCase().split(' ');
            if (clubTags.includes(selectedTag)) {
                club.style.display = '';
            } else {
                club.style.display = 'none';
            }
        });
    }

    // Hide tag dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if(tagInput && tagsContainer){
            if (!tagInput.contains(e.target) && !tagsContainer.contains(e.target)) {
                tagsContainer.classList.add('hidden');
            } 
        }
        
    });
});


// Toggle header nav bar
const toggleNavBarBtn = document.querySelector('#toggle-nav-bar');
const toggleNavBarIcon = document.querySelector('#toggle-nav-bar-i');
const navBarDropDownMenu = document.querySelector('#nav-bar-dropdown-menu');

if (toggleNavBarBtn) {
    toggleNavBarBtn.onclick = function () {
        navBarDropDownMenu.classList.toggle('hidden');
        const navBarDropDownMenuIsOpen = !navBarDropDownMenu.classList.contains('hidden');

        toggleNavBarIcon.classList = navBarDropDownMenuIsOpen
            ? 'fa-solid fa-xmark'
            : 'fa-solid fa-bars';
    }
}





//Dashboard Calendar
const dashboardCalendar = document.querySelector(".calendar-container"),
    date = document.querySelector(".calendar-date"),
    daysContainer = document.querySelector(".calendar-days"),
    prevDay = document.querySelector(".prev"),
    nextDay = document.querySelector(".next"),
    todayBtn = document.querySelector(".go-to-today-btn"),
    goToBtn = document.querySelector(".go-to-btn"),
    dateInput = document.querySelector(".calendar-date-input"),
    eventDay = document.querySelector(".event-day"),
    eventDate = document.querySelector(".event-date"),
    eventsContainer = document.querySelector(".calendar-events"),
    addEventSubmit = document.querySelector(".add-event-btn");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

//default events array
// const eventsArray = [
//     {
//         day: 28,
//         month: 2,
//         year: 2024,
//         events: [
//             {
//                 title: "Event 1 lorem ipsum dolar sit genfa tersd dsad",
//                 time: "10:00 AM",
//             },
//             {
//                 title: "Event 2",
//                 time: "11:00 AM",
//             },
//         ],
//     },
//     {
//         day: 18,
//         month: 2,
//         year: 2024,
//         events: [
//             {
//                 title: "Event 1 lorem ipsum dolar sit genfa tersd dsad",
//                 time: "10:00 AM",
//             },
//         ],
//     },
// ];


//set empty array
let eventsArray = [];

//call get
getEvents();

//function to add days
function initCalendar() {

    //getting prev month days, current month days, next month days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const day = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay() - 1;

    //update date top of calendar
    date.innerHTML = months[month] + " " + year;

    //adding days
    let days = "";

    //previous month days
    for (let x = day; x > 0; x--) {
        days += `<div class="day prev-date" >${prevDays - x + 1}</div>`;
    }

    //current month days
    for (let i = 1; i <= lastDate; i++) {

        // check if event is present on current day
        let event = false;
        eventsArray.forEach((eventObj) => {
            if (
                eventObj.day === i &&
                eventObj.month === month + 1 &&
                eventObj.year === year
            ) {
                //if event found
                event = true;
            }
        })

        //if day is today add class today
        if (
            i === new Date().getDate() &&
            year === new Date().getFullYear() &&
            month === new Date().getMonth()
        ) {

            activeDay = i;
            getActiveDay(i);
            updateEvents(i);

            //if event found, add new class
            //add active on today at startup
            if (event) {
                days += `<div class="day today active event" >${i}</div>`;
            } else {
                days += `<div class="day today active">${i}</div>`;
            }
        }

        //adding remaining days
        else {
            if (event) {
                days += `<div class="day event" >${i}</div>`;
            } else {
                days += `<div class="day">${i}</div>`;
            }

        }
    }

    //next months
    for (let j = 1; j <= nextDays; j++) {
        days += `<div class="day next-date " >${j}</div>`;
    }
    daysContainer.innerHTML = days;

    //adding listener function
    addListener();
}
if (dashboardCalendar) {
    // Your code that manipulates the calendar element
    initCalendar();
}


//previous month
function prevMonth() {
    month--;
    if (month < 0) {
        month = 11;
        year--;
    }
    initCalendar();
}

//next month
function nextMonth() {
    month++;
    if (month > 11) {
        month = 0;
        year++;
    }
    initCalendar();
}

//adding event listener on prev and next icons

if (prevDay && nextDay){
    prevDay.addEventListener("click", prevMonth);
    nextDay.addEventListener("click", nextMonth);
}
// prevDay.addEventListener("click", prevMonth);
// nextDay.addEventListener("click", nextMonth);

//go to today
if (todayBtn) {
todayBtn.addEventListener("click", () => {
    today = new Date();
    month = today.getMonth();
    year = today.getFullYear();
    initCalendar();
})
}

if (dateInput){
dateInput.addEventListener("input", (e) => {
    //allowing only numbers
    dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
    if (dateInput.value.length === 2) {
        //add a slash if 2 numbers are entered
        dateInput.value += "/";
    }
    if (dateInput.value.length > 7) {
        //do not all more than 7 characters
        dateInput.value = dateInput.value.slice(0, 7);
    }
    //removing slash if backspace pressed
    if (e.inputType === "deleteContentBackward") {
        if (dateInput.value.length === 3) {
            dateInput.value = dateInput.value.slice(0, 2);
        }
    }
});
}

if (goToBtn) {
goToBtn.addEventListener("click", goToDate);
}

//function to go to entered date
function goToDate() {
    const dateArray = dateInput.value.split("/");
    //date validation
    if (dateArray.length === 2) {
        if (dateArray[0] > 0 && dateArray[0] < 13 && dateArray[1].length === 4) {
            month = dateArray[0] - 1;
            year = dateArray[1];
            initCalendar();
            return;
        }
    }
    //if invalid date
    alert("Invalid Date");
}

const addEventBtn = document.querySelector(".add-event"),
    addEventContainer = document.querySelector(".add-event-wrapper"),
    addEventCloseBtn = document.querySelector(".close"),
    addEventTitle = document.querySelector(".event-name"),
    addEventFrom = document.querySelector(".event-time-from"),
    addEventTo = document.querySelector(".event-time-to");

if (addEventBtn){
addEventBtn.addEventListener("click", () => {
    addEventContainer.classList.toggle("active");
});
}
if (addEventCloseBtn){
addEventCloseBtn.addEventListener("click", () => {
    addEventContainer.classList.remove("active");
});
}

const dashboardHome = document.querySelector(".dashboard-home");
if (dashboardHome) {
document.addEventListener("click", (e) => {
    //if click outside
    if (e.target != addEventBtn && !addEventContainer.contains(e.target)) {
        addEventContainer.classList.remove("active");
    }
});
}

//allow only 50 chars in title
if (addEventTitle){
addEventTitle.addEventListener("input", (e) => {
    addEventTitle.value = addEventTitle.value.slice(0, 50);
});
}

//time format - from
if (addEventFrom) {
addEventFrom.addEventListener("input", (e) => {
    //remove anything else other than numbers
    addEventFrom.value = addEventFrom.value.replace(/[^0-9:]/g, "");
    //if two numbers are entered, auto add :
    if (addEventFrom.value.length === 2) {
        addEventFrom.value += ":";
    }
    //prevent user from entering more than 5 chars 
    if (addEventFrom.value.length > 5) {
        addEventFrom.value = addEventFrom.value.slice(0, 5);
    }
});
}

//time format - to
if (addEventTo) {
addEventTo.addEventListener("input", (e) => {
    //remove anything else other than numbers
    addEventTo.value = addEventTo.value.replace(/[^0-9:]/g, "");
    //if two numbers are entered, auto add :
    if (addEventTo.value.length === 2) {
        addEventTo.value += ":";
    }
    //prevent user from entering more than 5 chars 
    if (addEventTo.value.length > 5) {
        addEventTo.value = addEventTo.value.slice(0, 5);
    }
});
}

//function to add listener on days for events things
function addListener() {
    const days = document.querySelectorAll(".day");
    days.forEach((day) => {
        day.addEventListener("click", (e) => {
            //setting current day as active
            activeDay = Number(e.target.innerHTML);

            //call active day after click
            getActiveDay(e.target.innerHTML);
            updateEvents(Number(e.target.innerHTML));

            //remove active from already active day
            days.forEach((day) => {
                day.classList.remove("active");
            });

            //if prev month day clicked go to prev month and add active
            if (e.target.classList.contains("prev-date")) {
                prevMonth();

                setTimeout(() => {
                    //selecting all days of that month
                    const days = document.querySelectorAll(".day");

                    //add active to clicked after going to prev month
                    days.forEach((day) => {
                        if (!day.classList.contains("prev-date") &&
                            day.innerHTML === e.target.innerHTML) {
                            day.classList.add("active");
                        }
                    });
                }, 100);

                //same with next month days
            } else if (e.target.classList.contains("next-date")) {
                nextMonth();

                setTimeout(() => {
                    //selecting all days of that month
                    const days = document.querySelectorAll(".day");

                    //add active to clicked after going to next month
                    days.forEach((day) => {
                        if (!day.classList.contains("next-date") &&
                            day.innerHTML === e.target.innerHTML) {
                            day.classList.add("active");
                        }
                    });
                }, 100);
            } else {
                //remaining current month days
                e.target.classList.add("active");
            }

        });
    });
}

//display active day events and date

function getActiveDay(date) {
    const day = new Date(year, month, date);
    const dayName = day.toString().split(" ")[0];
    eventDay.innerHTML = dayName;
    eventDate.innerHTML = date + " " + months[month] + " " + year;
}

//function to show events of the day
function updateEvents(date) {
    let events = "";
    eventsArray.forEach((event) => {
        //get events of active day only
        if (
            date === event.day &&
            month + 1 === event.month &&
            year === event.year
        ) {
            //then show event on documnet
            event.events.forEach((event) => {
                events += `<div class="event"> <div class="title"> <i class="fas fa-circle"></i> <h3 class="event-title">${event.title}</h3> </div> <div class="event-time"> <span class= "event-time">${event.time}</span> </div> </div>`;

            });
        }
    });

    //if nothing found

    if (events === "") {
        events = `<div class="no-event"> <h3>No Events</h3></div>`;
    }

    eventsContainer.innerHTML = events;
    //save evnts when update called
    saveEvents();
}

//function to add event
if (addEventSubmit){
addEventSubmit.addEventListener("click", () => {
    const eventTitle = addEventTitle.value;
    const eventTimeFrom = addEventFrom.value;
    const eventTimeTo = addEventTo.value;

    //validations
    if (
        eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "") {
        alert("Please fill all the fields.");
        return;
    }

    const timeFromArray = eventTimeFrom.split(":");
    const timeToArray = eventTimeTo.split(":");

    if (
        timeFromArray.length != 2 ||
        timeToArray.length != 2 ||
        timeFromArray[0] > 23 ||
        timeFromArray[1] > 59 ||
        timeToArray[0] > 23 ||
        timeToArray[1] > 59
    ) {
        alert("Invalid Time Format");
    }

    const timeFrom = convertTime(eventTimeFrom);
    const timeTo = convertTime(eventTimeTo);

    const newEvent = {
        title: eventTitle,
        time: timeFrom + " - " + timeTo,
    };

    let eventAdded = false;

    //check if event array not empty
    if (eventsArray.length > 0) {
        //check if current day already has an event, and add to that
        eventsArray.forEach((item) => {
            if (
                item.day == activeDay &&
                item.month == month + 1 &&
                item.year == year
            ) {
                item.events.push(newEvent);
                eventAdded = true;
            }
        });
    }

    //if event array empty or current day has no events create new one
    if (!eventAdded) {
        eventsArray.push({
            day: activeDay,
            month: month + 1,
            year: year,
            events: [newEvent],
        });
    }

    //remove active from add event form
    addEventContainer.classList.remove("active")
    //clear all the fields
    addEventTitle.value = "";
    addEventFrom.value = "";
    addEventTo.value = "";

    //show added events
    updateEvents(activeDay);

    //add events class to newly added events
    const activeDayElem = document.querySelector(".day.active");
    if (!activeDayElem.classList.contains("event")){
        activeDayElem.classList.add("event");
    }
});
}

function convertTime(time) {
    let timeArray = time.split(":");
    let timeHour = timeArray[0];
    let timeMin = timeArray[1];
    let timeFormat = timeHour >= 12 ? "PM" : "AM";
    timeHour = timeHour % 12 || 12;
    time = timeHour + ":" + timeMin + " " + timeFormat;
    return time;
}

//function to remove an event on click

if (eventsContainer){
eventsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("event")) {
        const eventTitle = e.target.children[0].children[1].innerHTML;
        //get the title of event then search in array by title and delete
        eventsArray.forEach((event) => {
            if (
                event.day === activeDay &&
                event.month === month + 1 &&
                event.year === year
            ) {
                event.events.forEach((item, index) => {
                    if (item.title === eventTitle) {
                        event.events.splice(index, 1);
                    }
                });

                //if no event remaining on tht day remove complete day
                if (event.events.length === 0) {
                    eventsArray.splice(eventsArray.indexOf(event), 1);

                    //after remove comple day also remove active calss of that day
                    const activeDayElem = document.querySelector(".day.active");
                    if (activeDayElem.classList.contains("event")) {
                        activeDayElem.classList.remove("event");
                    }
                }
            }
        });

        //after removing from array update event
        updateEvents(activeDay);
    }
});
}

//storing events in local storage
function saveEvents() {
    console.log("yes");
    localStorage.setItem("events", JSON.stringify(eventsArray));
}

function getEvents() {
    if (localStorage.getItem("events") === null){
        return;
    }       
    eventsArray.push(...JSON.parse(localStorage.getItem("events")));
    
}




// //Dashboard Calendar
// const dashboardCalendar = document.querySelector("#calendar-container"),
//     date = document.querySelector("#calendar-date"),
//     daysContainer = document.querySelector("#calendar-days"),
//     prevDay = document.querySelector("#prev"),
//     nextDay = document.querySelector("#next"),
//     todayBtn = document.querySelector("#go-to-today-btn"),
//     goToBtn = document.querySelector("#go-to-btn"),
//     dateInput = document.querySelector("#calendar-date-input"),
//     eventDay = document.querySelector("#event-day"),
//     eventDate = document.querySelector("#event-date"),
//     eventsContainer = document.querySelector("#calendar-events"),
//     addEventSubmit = document.querySelector("#add-event-btn");


//     let today = new Date();
//     let activeDay;
//     let month = today.getMonth();
//     let year = today.getFullYear();
    
//     const months = [
//         "January",
//         "February",
//         "March",
//         "April",
//         "May",
//         "June",
//         "July",
//         "August",
//         "September",
//         "October",
//         "November",
//         "December"
//     ];

//     //set empty array
// let eventsArray = [];

// //call get
// // getEvents();

// //function to add days
// function initCalendar() {

//     //getting prev month days, current month days, next month days
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const prevLastDay = new Date(year, month, 0);
//     const prevDays = prevLastDay.getDate();
//     const lastDate = lastDay.getDate();
//     const day = firstDay.getDay();
//     const nextDays = 7 - lastDay.getDay() - 1;

//     //update date top of calendar
//     date.innerHTML = months[month] + " " + year;

//     //adding days
//     let days = "";

//     //previous month days
//     for (let x = day; x > 0; x--) {
//         days += `<div class="day prev-date" >${prevDays - x + 1}</div>`;
//     }

//     //current month days
//     for (let i = 1; i <= lastDate; i++) {

//         // check if event is present on current day
//         let event = false;
//         eventsArray.forEach((eventObj) => {
//             if (
//                 eventObj.day === i &&
//                 eventObj.month === month + 1 &&
//                 eventObj.year === year
//             ) {
//                 //if event found
//                 event = true;
//             }
//         })

//         //if day is today add class today
//         if (
//             i === new Date().getDate() &&
//             year === new Date().getFullYear() &&
//             month === new Date().getMonth()
//         ) {

//             activeDay = i;
//             getActiveDay(i);
//             updateEvents(i);

//             //if event found, add new class
//             //add active on today at startup
//             if (event) {
//                 days += `<div class="day today active event" >${i}</div>`;
//             } else {
//                 days += `<div class="day today active">${i}</div>`;
//             }
//         }

//         //adding remaining days
//         else {
//             if (event) {
//                 days += `<div class="day event" >${i}</div>`;
//             } else {
//                 days += `<div class="day">${i}</div>`;
//             }

//         }
//     }



//     // POTENTIAL TAILWIND FLAGG BELOW !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//     //next months
//     for (let j = 1; j <= nextDays; j++) {
//         days += `<div class="day next-date w-2/12 h-14 flex items-center justify-center cursor-pointer text-[rgb(20,20,66)] border-solid border-1 border-[#f5f5f5] transition-shadow transition-opacity"" >${j}</div>`;
//     }
//     daysContainer.innerHTML = days;

//     //adding listener function
//     addListener();
// }
// if (dashboardCalendar) {
//     // Your code that manipulates the calendar element
//     initCalendar();
// }

// //previous month
// function prevMonth() {
//     month--;
//     if (month < 0) {
//         month = 11;
//         year--;
//     }
//     initCalendar();
// }

// //next month
// function nextMonth() {
//     month++;
//     if (month > 11) {
//         month = 0;
//         year++;
//     }
//     initCalendar();
// }

// //adding event listener on prev and next icons

// if (prevDay && nextDay){
//     prevDay.addEventListener("click", prevMonth);
//     nextDay.addEventListener("click", nextMonth);
// }

// //go to today
// if (todayBtn) {
//     todayBtn.addEventListener("click", () => {
//         today = new Date();
//         month = today.getMonth();
//         year = today.getFullYear();
//         initCalendar();
//     })
//     }
    
//     if (dateInput){
//     dateInput.addEventListener("input", (e) => {
//         //allowing only numbers
//         dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
//         if (dateInput.value.length === 2) {
//             //add a slash if 2 numbers are entered
//             dateInput.value += "/";
//         }
//         if (dateInput.value.length > 7) {
//             //do not all more than 7 characters
//             dateInput.value = dateInput.value.slice(0, 7);
//         }
//         //removing slash if backspace pressed
//         if (e.inputType === "deleteContentBackward") {
//             if (dateInput.value.length === 3) {
//                 dateInput.value = dateInput.value.slice(0, 2);
//             }
//         }
//     });
//     }
    
//     if (goToBtn) {
//     goToBtn.addEventListener("click", goToDate);
//     }
    
//     //function to go to entered date
//     function goToDate() {
//         const dateArray = dateInput.value.split("/");
//         //date validation
//         if (dateArray.length === 2) {
//             if (dateArray[0] > 0 && dateArray[0] < 13 && dateArray[1].length === 4) {
//                 month = dateArray[0] - 1;
//                 year = dateArray[1];
//                 initCalendar();
//                 return;
//             }
//         }
//         //if invalid date
//         alert("Invalid Date");
//     }
    
//     const addEventBtn = document.querySelector(".add-event"),
//         addEventContainer = document.querySelector(".add-event-wrapper"),
//         addEventCloseBtn = document.querySelector(".close"),
//         addEventTitle = document.querySelector(".event-name"),
//         addEventFrom = document.querySelector(".event-time-from"),
//         addEventTo = document.querySelector(".event-time-to");
    
//     if (addEventBtn){
//     addEventBtn.addEventListener("click", () => {
//         addEventContainer.classList.toggle("active");
//     });
//     }
//     if (addEventCloseBtn){
//     addEventCloseBtn.addEventListener("click", () => {
//         addEventContainer.classList.remove("active");
//     });
//     }
    
//     const dashboardHome = document.querySelector(".dashboard-home");
//     if (dashboardHome) {
//     document.addEventListener("click", (e) => {
//         //if click outside
//         if (e.target != addEventBtn && !addEventContainer.contains(e.target)) {
//             addEventContainer.classList.remove("active");
//         }
//     });
//     }
    
//     //allow only 50 chars in title
//     if (addEventTitle){
//     addEventTitle.addEventListener("input", (e) => {
//         addEventTitle.value = addEventTitle.value.slice(0, 50);
//     });
//     }
    
//     //time format - from
//     if (addEventFrom) {
//     addEventFrom.addEventListener("input", (e) => {
//         //remove anything else other than numbers
//         addEventFrom.value = addEventFrom.value.replace(/[^0-9:]/g, "");
//         //if two numbers are entered, auto add :
//         if (addEventFrom.value.length === 2) {
//             addEventFrom.value += ":";
//         }
//         //prevent user from entering more than 5 chars 
//         if (addEventFrom.value.length > 5) {
//             addEventFrom.value = addEventFrom.value.slice(0, 5);
//         }
//     });
//     }
    
//     //time format - to
//     if (addEventTo) {
//     addEventTo.addEventListener("input", (e) => {
//         //remove anything else other than numbers
//         addEventTo.value = addEventTo.value.replace(/[^0-9:]/g, "");
//         //if two numbers are entered, auto add :
//         if (addEventTo.value.length === 2) {
//             addEventTo.value += ":";
//         }
//         //prevent user from entering more than 5 chars 
//         if (addEventTo.value.length > 5) {
//             addEventTo.value = addEventTo.value.slice(0, 5);
//         }
//     });
//     }
    
//     //function to add listener on days for events things
//     function addListener() {
//         const days = document.querySelectorAll(".day");
//         days.forEach((day) => {
//             day.addEventListener("click", (e) => {
//                 //setting current day as active
//                 activeDay = Number(e.target.innerHTML);
    
//                 //call active day after click
//                 getActiveDay(e.target.innerHTML);
//                 updateEvents(Number(e.target.innerHTML));
    
//                 //remove active from already active day
//                 days.forEach((day) => {
//                     day.classList.remove("active");
//                 });
    
//                 //if prev month day clicked go to prev month and add active
//                 if (e.target.classList.contains("prev-date")) {
//                     prevMonth();
    
//                     setTimeout(() => {
//                         //selecting all days of that month
//                         const days = document.querySelectorAll(".day");
    
//                         //add active to clicked after going to prev month
//                         days.forEach((day) => {
//                             if (!day.classList.contains("prev-date") &&
//                                 day.innerHTML === e.target.innerHTML) {
//                                 day.classList.add("active");
//                             }
//                         });
//                     }, 100);
    
//                     //same with next month days
//                 } else if (e.target.classList.contains("next-date")) {
//                     nextMonth();
    
//                     setTimeout(() => {
//                         //selecting all days of that month
//                         const days = document.querySelectorAll(".day");
    
//                         //add active to clicked after going to next month
//                         days.forEach((day) => {
//                             if (!day.classList.contains("next-date") &&
//                                 day.innerHTML === e.target.innerHTML) {
//                                 day.classList.add("active");
//                             }
//                         });
//                     }, 100);
//                 } else {
//                     //remaining current month days
//                     e.target.classList.add("active");
//                 }
    
//             });
//         });
//     }
    
//     //display active day events and date
    
//     function getActiveDay(date) {
//         const day = new Date(year, month, date);
//         const dayName = day.toString().split(" ")[0];
//         eventDay.innerHTML = dayName;
//         eventDate.innerHTML = date + " " + months[month] + " " + year;
//     }
    
//     //function to show events of the day
//     function updateEvents(date) {
//         let events = "";
//         eventsArray.forEach((event) => {
//             //get events of active day only
//             if (
//                 date === event.day &&
//                 month + 1 === event.month &&
//                 year === event.year
//             ) {
//                 //then show event on documnet
//                 event.events.forEach((event) => {
//                     events += `<div class="event"> <div class="title"> <i class="fas fa-circle"></i> <h3 class="event-title">${event.title}</h3> </div> <div class="event-time"> <span class= "event-time">${event.time}</span> </div> </div>`;
    
//                 });
//             }
//         });
    
//         //if nothing found
    
//         if (events === "") {
//             events = `<div class="no-event"> <h3>No Events</h3></div>`;
//         }
    
//         eventsContainer.innerHTML = events;
//         //save evnts when update called
//         saveEvents();
//     }
    
//     //function to add event
//     if (addEventSubmit){
//     addEventSubmit.addEventListener("click", () => {
//         const eventTitle = addEventTitle.value;
//         const eventTimeFrom = addEventFrom.value;
//         const eventTimeTo = addEventTo.value;
    
//         //validations
//         if (
//             eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "") {
//             alert("Please fill all the fields.");
//             return;
//         }
    
//         const timeFromArray = eventTimeFrom.split(":");
//         const timeToArray = eventTimeTo.split(":");
    
//         if (
//             timeFromArray.length != 2 ||
//             timeToArray.length != 2 ||
//             timeFromArray[0] > 23 ||
//             timeFromArray[1] > 59 ||
//             timeToArray[0] > 23 ||
//             timeToArray[1] > 59
//         ) {
//             alert("Invalid Time Format");
//         }
    
//         const timeFrom = convertTime(eventTimeFrom);
//         const timeTo = convertTime(eventTimeTo);
    
//         const newEvent = {
//             title: eventTitle,
//             time: timeFrom + " - " + timeTo,
//         };
    
//         let eventAdded = false;
    
//         //check if event array not empty
//         if (eventsArray.length > 0) {
//             //check if current day already has an event, and add to that
//             eventsArray.forEach((item) => {
//                 if (
//                     item.day == activeDay &&
//                     item.month == month + 1 &&
//                     item.year == year
//                 ) {
//                     item.events.push(newEvent);
//                     eventAdded = true;
//                 }
//             });
//         }
    
//         //if event array empty or current day has no events create new one
//         if (!eventAdded) {
//             eventsArray.push({
//                 day: activeDay,
//                 month: month + 1,
//                 year: year,
//                 events: [newEvent],
//             });
//         }
    
//         //remove active from add event form
//         addEventContainer.classList.remove("active")
//         //clear all the fields
//         addEventTitle.value = "";
//         addEventFrom.value = "";
//         addEventTo.value = "";
    
//         //show added events
//         updateEvents(activeDay);
    
//         //add events class to newly added events
//         const activeDayElem = document.querySelector(".day.active");
//         if (!activeDayElem.classList.contains("event")){
//             activeDayElem.classList.add("event");
//         }
//     });
//     }
    
//     function convertTime(time) {
//         let timeArray = time.split(":");
//         let timeHour = timeArray[0];
//         let timeMin = timeArray[1];
//         let timeFormat = timeHour >= 12 ? "PM" : "AM";
//         timeHour = timeHour % 12 || 12;
//         time = timeHour + ":" + timeMin + " " + timeFormat;
//         return time;
//     }
    
//     //function to remove an event on click
    
//     if (eventsContainer){
//     eventsContainer.addEventListener("click", (e) => {
//         if (e.target.classList.contains("event")) {
//             const eventTitle = e.target.children[0].children[1].innerHTML;
//             //get the title of event then search in array by title and delete
//             eventsArray.forEach((event) => {
//                 if (
//                     event.day === activeDay &&
//                     event.month === month + 1 &&
//                     event.year === year
//                 ) {
//                     event.events.forEach((item, index) => {
//                         if (item.title === eventTitle) {
//                             event.events.splice(index, 1);
//                         }
//                     });
    
//                     //if no event remaining on tht day remove complete day
//                     if (event.events.length === 0) {
//                         eventsArray.splice(eventsArray.indexOf(event), 1);
    
//                         //after remove comple day also remove active calss of that day
//                         const activeDayElem = document.querySelector(".day.active");
//                         if (activeDayElem.classList.contains("event")) {
//                             activeDayElem.classList.remove("event");
//                         }
//                     }
//                 }
//             });
    
//             //after removing from array update event
//             updateEvents(activeDay);
//         }
//     });
//     }
    
//     //storing events in local storage
//     function saveEvents() {
//         console.log("yes");
//         localStorage.setItem("events", JSON.stringify(eventsArray));
//     }
    
//     function getEvents() {
//         if (localStorage.getItem("events") === null){
//             return;
//         }       
//         eventsArray.push(...JSON.parse(localStorage.getItem("events")));
        
//     }