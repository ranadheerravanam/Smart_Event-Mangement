let events = JSON.parse(localStorage.getItem("events")) || [];

function renderEvents() {
    let table = document.getElementById("eventTable");
    table.innerHTML = "";

    events.forEach((e, i) => {
        table.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${e.name}</td>
                <td>${e.club}</td>
                <td>${e.venue}</td>
                <td>${e.start}</td>
                <td>${e.end}</td>
                <td>${e.coord}</td>
            </tr>
        `;
    });

    document.getElementById("eventCount").innerText = events.length;
}

/* CHECK SLOT CONFLICT */
function isSlotBooked(venue, start, end) {
    let newStart = new Date(start);
    let newEnd = new Date(end);

    return events.some(e => {
        if (e.venue !== venue) return false;

        let existingStart = new Date(e.start);
        let existingEnd = new Date(e.end);

        return newStart < existingEnd && newEnd > existingStart;
    });
}

function addEvent() {
    let event = {
        name: name.value.trim(),
        club: club.value,
        venue: venue.value,
        start: start.value,
        end: end.value,
        coord: coord.value.trim()
    };

    if (!event.name || !event.club || !event.venue || !event.start || !event.end) {
        alert("Please fill all required fields");
        return;
    }

    if (isSlotBooked(event.venue, event.start, event.end)) {
        alert("❌ Slot already booked for this venue!");
        return;
    }

    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));

    renderEvents();

    name.value = coord.value = "";
    club.value = venue.value = "";
    start.value = end.value = "";
}

renderEvents();

