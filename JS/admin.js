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


