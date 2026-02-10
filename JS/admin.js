let events = JSON.parse(localStorage.getItem("events")) || [];

// Admin auth modal interactions
document.addEventListener('DOMContentLoaded', () => {
    const openAdmin = document.getElementById('openAdminSignIn');
    const adminModal = document.getElementById('adminAuth');
    const closeAdmin = document.getElementById('closeAdminAuth');
    const doAdmin = document.getElementById('doAdminSignIn');
    const adminMsg = document.getElementById('adminAuthMsg');
    const showPwd = document.getElementById('showAdminPwd');
    const refreshAdminOTP = document.getElementById('adminRefreshOTP');

    const ADMIN_EMAIL = 'admin@eventflow.local';
    const ADMIN_PWD = 'admin123';

    let currentAdminOTP = null;

    function generateAdminOTP() {
        // Generate a random 6-digit OTP
        currentAdminOTP = String(Math.floor(100000 + Math.random() * 900000));
        const otpDisplay = document.getElementById('adminOtpDisplay');
        if (otpDisplay) {
            otpDisplay.innerText = currentAdminOTP;
            // Add pulse animation
            otpDisplay.style.animation = 'none';
            setTimeout(() => {
                otpDisplay.style.animation = 'pulse 2s ease-in-out infinite';
            }, 10);
        }
        const otpInput = document.getElementById('adminOtpInput');
        if (otpInput) otpInput.value = '';
    }

    function showAdminModal() {
        adminModal && adminModal.setAttribute('aria-hidden', 'false');
        generateAdminOTP();
    }

    function hideAdminModal() {
        adminModal && adminModal.setAttribute('aria-hidden', 'true');
        adminMsg && (adminMsg.innerText = '');
    }

    openAdmin && openAdmin.addEventListener('click', showAdminModal);
    closeAdmin && closeAdmin.addEventListener('click', hideAdminModal);
    
    if (showPwd) {
        showPwd.addEventListener('change', function() {
            document.getElementById('adminPassword').type = this.checked ? 'text' : 'password';
        });
    }

    // Refresh OTP button handler
    if (refreshAdminOTP) {
        refreshAdminOTP.addEventListener('click', (e) => {
            e.preventDefault();
            generateAdminOTP();
        });
    }

    doAdmin && doAdmin.addEventListener('click', () => {
        const email = document.getElementById('adminEmail').value.trim().toLowerCase();
        const pwd = document.getElementById('adminPassword').value;
        const otpValue = document.getElementById('adminOtpInput') ? document.getElementById('adminOtpInput').value.trim() : '';

        // Validate OTP
        if (!otpValue) {
            adminMsg.innerText = '📱 Please enter the OTP displayed above.';
            return;
        }
        if (otpValue !== currentAdminOTP) {
            adminMsg.innerText = '❌ Incorrect OTP. Try again or generate a new one.';
            generateAdminOTP();
            return;
        }

        // Validate credentials
        if (email === ADMIN_EMAIL && pwd === ADMIN_PWD) {
            adminMsg.innerText = '✅ Welcome, Admin! OTP Verified.';
            localStorage.setItem('currentAdmin', JSON.stringify({ email }));
            setTimeout(hideAdminModal, 700);
        } else {
            adminMsg.innerText = 'Invalid admin credentials';
        }
    });

    if (location.hash === '#signin') showAdminModal();
});

function renderEvents() {
    let table = document.getElementById("eventTable");
    let tableSection = document.getElementById("tableSection");
    let noEventsMsg = document.getElementById("noEventsMsg");
    
    table.innerHTML = "";

    if (events.length === 0) {
        tableSection.style.display = "none";
        return;
    }

    tableSection.style.display = "block";
    noEventsMsg.style.display = events.length > 0 ? "none" : "block";

    events.forEach((e, i) => {
        table.innerHTML += `
            <tr class="table-row-animate">
                <td class="table-cell-index">${i + 1}</td>
                <td class="table-cell">${e.name}</td>
                <td class="table-cell">${e.club}</td>
                <td class="table-cell">${e.venue}</td>
                <td class="table-cell">${formatDateTime(e.start)}</td>
                <td class="table-cell">${formatDateTime(e.end)}</td>
                <td class="table-cell">${e.coord}</td>
                <td class="table-cell-action">
                    <button class="btn-delete" onclick="deleteEvent(${i})">Delete</button>
                </td>
            </tr>
        `;
    });

    document.getElementById("eventCount").innerText = events.length;
}

function formatDateTime(dateTimeString) {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleString('en-US', options);
}

function deleteEvent(index) {
    if (confirm('Are you sure you want to delete this event?')) {
        events.splice(index, 1);
        localStorage.setItem("events", JSON.stringify(events));
        renderEvents();
    }
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
    // Get form elements properly
    const nameInput = document.getElementById('name');
    const clubInput = document.getElementById('club');
    const venueInput = document.getElementById('venue');
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    const coordInput = document.getElementById('coord');

    let event = {
        name: nameInput.value.trim(),
        club: clubInput.value,
        venue: venueInput.value,
        start: startInput.value,
        end: endInput.value,
        coord: coordInput.value.trim()
    };

    if (!event.name || !event.club || !event.venue || !event.start || !event.end) {
        showNotification("Please fill all required fields", "error");
        return;
    }

    if (isSlotBooked(event.venue, event.start, event.end)) {
        showNotification("❌ Slot already booked for this venue!", "error");
        return;
    }

    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));

    renderEvents();

    showNotification(`✅ Event "${event.name}" created successfully!`, "success");

    // Clear form
    nameInput.value = "";
    coordInput.value = "";
    clubInput.value = "";
    venueInput.value = "";
    startInput.value = "";
    endInput.value = "";
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === "success" ? "#4caf50" : "#f44336"};
        color: white;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.4s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = "slideInLeft 0.4s ease reverse";
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

renderEvents();

/* METRICS: render counts from localStorage */
function getNumber(key) { return Number(localStorage.getItem(key) || 0) }

function renderMetrics() {
    const pv = getNumber('pageViews');
    const vis = getNumber('visitors');
    const applied = getNumber('appliedCount');

    const elPV = document.getElementById('pageViewsCount');
    const elVis = document.getElementById('visitorsCount');
    const elApplied = document.getElementById('appliedCount');

    if (elPV) elPV.innerText = pv;
    if (elVis) elVis.innerText = vis;
    if (elApplied) elApplied.innerText = applied;
}

renderMetrics();

// Refresh metrics when localStorage changes from other tabs/windows
window.addEventListener('storage', function() { renderMetrics(); });


