let events = JSON.parse(localStorage.getItem("events")) || [];

// Admin auth modal interactions
document.addEventListener('DOMContentLoaded', () => {
    const openAdmin = document.getElementById('openAdminSignIn');
    const adminModal = document.getElementById('adminAuth');
    const closeAdmin = document.getElementById('closeAdminAuth');
    const doAdmin = document.getElementById('doAdminSignIn');
    const adminMsg = document.getElementById('adminAuthMsg');
    const showPwd = document.getElementById('showAdminPwd');

    const ADMIN_EMAIL = 'admin@eventflow.local';
    const ADMIN_PWD = 'admin123';

    function showAdminModal(){ adminModal && adminModal.setAttribute('aria-hidden','false'); }
    function hideAdminModal(){ adminModal && adminModal.setAttribute('aria-hidden','true'); adminMsg && (adminMsg.innerText=''); }

    openAdmin && openAdmin.addEventListener('click', showAdminModal);
    closeAdmin && closeAdmin.addEventListener('click', hideAdminModal);
    showPwd && showPwd.addEventListener('change', function(){ document.getElementById('adminPassword').type = this.checked ? 'text' : 'password'; });

    doAdmin && doAdmin.addEventListener('click', () => {
        const email = document.getElementById('adminEmail').value.trim().toLowerCase();
        const pwd = document.getElementById('adminPassword').value;
        if(email === ADMIN_EMAIL && pwd === ADMIN_PWD){
            adminMsg.innerText = 'Welcome, Admin!';
            localStorage.setItem('currentAdmin', JSON.stringify({ email }));
            setTimeout(hideAdminModal, 700);
        } else {
            adminMsg.innerText = 'Invalid admin credentials';
        }
    });

    if(location.hash === '#signin') showAdminModal();
});

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

