// User auth interactions: sign-in / sign-up modal, basic localStorage handling
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openSignIn = document.getElementById('openSignIn');
    const openSignUp = document.getElementById('openSignUp');
    const closeAuth = document.getElementById('closeAuth');
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const doSignIn = document.getElementById('doSignIn');
    const doSignUp = document.getElementById('doSignUp');
    const authMsg = document.getElementById('authMsg');

    // OTP functionality
    let currentOTP = null;
    let currentCaptchaAnswer = null;

    function generateOTP() {
        // Generate a random 6-digit OTP
        currentOTP = String(Math.floor(100000 + Math.random() * 900000));
        const otpDisplay = document.getElementById('otpDisplay');
        if (otpDisplay) {
            otpDisplay.innerText = currentOTP;
            // Add animation effect
            otpDisplay.style.animation = 'none';
            setTimeout(() => {
                otpDisplay.style.animation = 'pulse 2s ease-in-out infinite';
            }, 10);
        }
    }

    // Refresh OTP button handler
    const refreshOTPBtn = document.getElementById('refreshOTP');
    if (refreshOTPBtn) {
        refreshOTPBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateOTP();
            const otpInput = document.getElementById('otpInput');
            if (otpInput) otpInput.value = '';
        });
    }

    function showModal(openTab='signin'){
        authModal.setAttribute('aria-hidden','false');
        if(openTab === 'signup') switchToSignUp(); else switchToSignIn();
        // Generate new OTP when modal opens
        generateOTP();
    }
    function hideModal(){ 
        if(authModal) authModal.setAttribute('aria-hidden','true'); 
        if(authMsg) authMsg.innerText = '';
    }

    function switchToSignIn(){ 
        tabSignIn?.classList.add('active'); 
        tabSignUp?.classList.remove('active'); 
        signInForm?.classList.remove('hidden'); 
        signUpForm?.classList.add('hidden');
        generateOTP();
    }
    function switchToSignUp(){ 
        tabSignUp?.classList.add('active'); 
        tabSignIn?.classList.remove('active'); 
        signUpForm?.classList.remove('hidden'); 
        signInForm?.classList.add('hidden');
    }

    openSignIn && openSignIn.addEventListener('click', () => showModal('signin'));
    openSignUp && openSignUp.addEventListener('click', () => showModal('signup'));
    closeAuth && closeAuth.addEventListener('click', hideModal);
    tabSignIn && tabSignIn.addEventListener('click', switchToSignIn);
    tabSignUp && tabSignUp.addEventListener('click', switchToSignUp);

    // password toggles
    document.getElementById('showSignInPwd')?.addEventListener('change', function(){
        const p = document.getElementById('signinPassword'); if(p) p.type = this.checked ? 'text' : 'password';
    });
    document.getElementById('showSignUpPwd')?.addEventListener('change', function(){
        const a = document.getElementById('signupPassword'); const b = document.getElementById('signupPassword2');
        if(a) a.type = this.checked ? 'text' : 'password';
        if(b) b.type = this.checked ? 'text' : 'password';
    });

    function getUsers(){ return JSON.parse(localStorage.getItem('users')||'[]') }
    function saveUsers(u){ localStorage.setItem('users', JSON.stringify(u)) }


    // Password strength helper with explicit requirement feedback
    function evaluatePasswordStrength(p){
        const res = { score: 0, label: 'Too weak', lengthOk: false, hasLower:false, hasUpper:false, hasNumber:false, hasSpecial:false, missing: [] };
        if(!p || p.length === 0){ res.label = 'Too short'; res.missing = ['8+ characters', 'One uppercase letter', 'One special character']; return res }
        res.lengthOk = p.length >= 8;
        res.hasLower = /[a-z]/.test(p);
        res.hasUpper = /[A-Z]/.test(p);
        res.hasNumber = /\d/.test(p);
        res.hasSpecial = /[^A-Za-z0-9]/.test(p);
        // collect missing required items (explicit)
        if(!res.lengthOk) res.missing.push('8+ characters');
        if(!res.hasUpper) res.missing.push('One uppercase letter');
        if(!res.hasSpecial) res.missing.push('One special character');
        // compute a score 0..4 for the bar
        const checks = [res.lengthOk, res.hasLower, res.hasUpper, res.hasNumber, res.hasSpecial];
        const total = checks.filter(Boolean).length; // 0..5
        const scoreIndex = Math.max(0, Math.min(4, total - 1));
        const labels = ['Too short','Weak','Fair','Good','Strong'];
        res.score = scoreIndex;
        res.label = (res.missing.length > 0) ? 'Needs: ' + res.missing.join(', ') : labels[scoreIndex];
        return res;
    }

    // live update strength indicator if present
    const pwdEl = document.getElementById('signupPassword');
    const pwdBar = document.getElementById('pwdStrength');
    const pwdLabel = document.getElementById('pwdStrengthLabel');
    if(pwdEl){
        pwdEl.addEventListener('input', function(){
            const r = evaluatePasswordStrength(this.value);
            if(pwdBar) pwdBar.setAttribute('data-strength', String(r.score));
            if(pwdLabel) pwdLabel.innerText = r.label;
        });
    }

    // Simple client-side math CAPTCHA for sign-in
    function generateCaptcha(){
        // simple random math: a + b where a in 1..9, b in 1..9
        const a = Math.floor(Math.random()*9)+1;
        const b = Math.floor(Math.random()*9)+1;
        currentCaptchaAnswer = String(a + b);
        const el = document.getElementById('captchaQuestion');
        if(el) el.innerText = `What is ${a} + ${b}?`;
        const ans = document.getElementById('captchaAnswer'); if(ans) ans.value = '';
    }
    document.getElementById('refreshCaptcha')?.addEventListener('click', (e) => {
        e.preventDefault();
        generateCaptcha();
    });


    // central signup handler so other pages can call it (exposed as window.doSignUpClick)
    function handleSignUp(){
        const nameEl = document.getElementById('signupName');
        const emailEl = document.getElementById('signupEmail');
        const pwdEl = document.getElementById('signupPassword');
        const pwd2El = document.getElementById('signupPassword2');
        const authMsgEl = document.getElementById('authMsg');
        const name = nameEl ? nameEl.value.trim() : '';
        const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
        const pwd = pwdEl ? pwdEl.value : '';
        const pwd2 = pwd2El ? pwd2El.value : '';
        if(!authMsgEl) return;
        authMsgEl.innerText = '';
        if(!name || !email || !pwd){ authMsgEl.innerText = 'Please fill all fields'; return }
        if(pwd !== pwd2){ authMsgEl.innerText = 'Passwords do not match'; return }
        const r = evaluatePasswordStrength(pwd);
        if(r.missing.length > 0){ authMsgEl.innerText = 'Password requirements: ' + r.missing.join(', '); return }
        // minimal strength threshold (require at least 3 checks true: length, upper, lower/number/special)
        if(r.score < 2){ authMsgEl.innerText = 'Password is too weak — choose a stronger password.'; return }
        const users = getUsers();
        if(users.some(u=>u.email===email)){ authMsgEl.innerText = 'Account already exists. Try signing in.'; return }
        users.push({ name, email, password: pwd });
        saveUsers(users);
        authMsgEl.innerText = 'Account created! You can now sign in.';
        // if modal present, switch to sign-in
        if(typeof switchToSignIn === 'function') switchToSignIn();
    }

    // attach handler and expose it
    if(doSignUp) doSignUp.addEventListener('click', handleSignUp);
    window.doSignUpClick = handleSignUp;

    if(doSignIn) doSignIn.addEventListener('click', () => {
        const email = document.getElementById('signinEmail').value.trim().toLowerCase();
        const pwd = document.getElementById('signinPassword').value;
        const otpValue = document.getElementById('otpInput') ? document.getElementById('otpInput').value.trim() : '';
        const captchaVal = document.getElementById('captchaAnswer') ? document.getElementById('captchaAnswer').value.trim() : '';
        
        // Validate OTP
        if(!otpValue) {
            if(authMsg) authMsg.innerText = '📱 Please enter the OTP displayed above.';
            return;
        }
        if(otpValue !== currentOTP) {
            if(authMsg) authMsg.innerText = '❌ Incorrect OTP. Try again or generate a new one.';
            generateOTP();
            document.getElementById('otpInput').value = '';
            return;
        }
        
        // Validate CAPTCHA
        if(!captchaVal || captchaVal !== currentCaptchaAnswer){
            if(authMsg) authMsg.innerText = 'CAPTCHA incorrect — try again.';
            generateCaptcha();
            return;
        }
        
        const users = getUsers();
        const u = users.find(x=>x.email===email && x.password===pwd);
        if(!authMsg){
            const localAuth = document.getElementById('authMsg');
            if(localAuth) localAuth.innerText = 'Invalid credentials';
            return;
        }
        if(!u){ authMsg.innerText = 'Invalid credentials'; return }
        authMsg.innerText = `✅ Welcome, ${u.name || 'User'}! OTP Verified.`;
        // store current user session (simple)
        localStorage.setItem('currentUser', JSON.stringify({ name: u.name, email: u.email }));
        setTimeout(()=> hideModal(), 900);
    });

    // generate initial captcha when modal exists / on load
    if(document.getElementById('authModal')) {
        generateCaptcha();
        generateOTP();
    }

    // open modal on hash
    if(location.hash === '#signin') showModal('signin');
    if(location.hash === '#signup') showModal('signup');
});

/* Render events created via admin (stored in localStorage) into the user events grid */
function formatDateTimeForUser(dateTimeString){
    try{
        const d = new Date(dateTimeString);
        return d.toLocaleDateString() + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }catch(e){ return dateTimeString }
}

function renderUserEvents(){
    const grid = document.getElementById('eventsGrid');
    if(!grid) return;
    const events = JSON.parse(localStorage.getItem('events')||'[]');
    grid.innerHTML = '';
    if(events.length === 0){
        grid.innerHTML = '<div class="event-empty" style="color:var(--muted);">No upcoming events. Admins can create events from the admin panel.</div>';
    } else {
        events.forEach((e, i) => {
            const startMeta = formatDateTimeForUser(e.start);
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-header">
                    <h3>${e.name}</h3>
                    <span class="chip">${e.club}</span>
                </div>
                <p class="event-meta">${e.venue} • ${startMeta}</p>
                <p class="event-desc">${e.coord ? 'Coordinators: ' + e.coord : ''}</p>
                <div class="event-actions"><button class="btn-primary" onclick="registerForEvent(${i})">Register</button><button class="btn-outline">Details</button></div>
            `;
            grid.appendChild(card);
        });
    }

    // update main events counter (first .stat-number on the page)
    const statNums = document.querySelectorAll('.stat-number');
    if(statNums && statNums.length>0) statNums[0].innerText = String(events.length);
}

window.registerForEvent = function(index){
    // increment appliedCount and give user feedback
    const a = Number(localStorage.getItem('appliedCount')||0);
    localStorage.setItem('appliedCount', String(a+1));
    try{ localStorage.setItem('applied-last', Date.now().toString()) }catch(e){}
    alert('You are registered (demo). Thank you!');
}

// initial render and updates when localStorage changes
document.addEventListener('DOMContentLoaded', renderUserEvents);
window.addEventListener('storage', function(e){
    if(e.key === 'events' || e.key === 'applied-last' || e.key === 'appliedCount') renderUserEvents();
});

