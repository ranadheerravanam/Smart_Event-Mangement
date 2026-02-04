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

	function showModal(openTab='signin'){
		authModal.setAttribute('aria-hidden','false');
		if(openTab === 'signup') switchToSignUp(); else switchToSignIn();
	}
	function hideModal(){ authModal.setAttribute('aria-hidden','true'); authMsg.innerText = '' }

	function switchToSignIn(){ tabSignIn.classList.add('active'); tabSignUp.classList.remove('active'); signInForm.classList.remove('hidden'); signUpForm.classList.add('hidden') }
	function switchToSignUp(){ tabSignUp.classList.add('active'); tabSignIn.classList.remove('active'); signUpForm.classList.remove('hidden'); signInForm.classList.add('hidden') }

	openSignIn && openSignIn.addEventListener('click', () => showModal('signin'));
	openSignUp && openSignUp.addEventListener('click', () => showModal('signup'));
	closeAuth && closeAuth.addEventListener('click', hideModal);
	tabSignIn && tabSignIn.addEventListener('click', switchToSignIn);
	tabSignUp && tabSignUp.addEventListener('click', switchToSignUp);

	// password toggles
	document.getElementById('showSignInPwd')?.addEventListener('change', function(){
		const p = document.getElementById('signinPassword'); p.type = this.checked ? 'text' : 'password';
	});
	document.getElementById('showSignUpPwd')?.addEventListener('change', function(){
		document.getElementById('signupPassword').type = this.checked ? 'text' : 'password';
		document.getElementById('signupPassword2').type = this.checked ? 'text' : 'password';
	});

	function getUsers(){ return JSON.parse(localStorage.getItem('users')||'[]') }
	function saveUsers(u){ localStorage.setItem('users', JSON.stringify(u)) }

	doSignUp && doSignUp.addEventListener('click', () => {
		const name = document.getElementById('signupName').value.trim();
		const email = document.getElementById('signupEmail').value.trim().toLowerCase();
		const pwd = document.getElementById('signupPassword').value;
		const pwd2 = document.getElementById('signupPassword2').value;
		if(!name || !email || !pwd){ authMsg.innerText = 'Please fill all fields'; return }
		if(pwd !== pwd2){ authMsg.innerText = 'Passwords do not match'; return }
		const users = getUsers();
		if(users.some(u=>u.email===email)){ authMsg.innerText = 'Account already exists. Try signing in.'; return }
		users.push({ name, email, password: pwd });
		saveUsers(users);
		authMsg.innerText = 'Account created! You can now sign in.';
		switchToSignIn();
	});

	doSignIn && doSignIn.addEventListener('click', () => {
		const email = document.getElementById('signinEmail').value.trim().toLowerCase();
		const pwd = document.getElementById('signinPassword').value;
		const users = getUsers();
		const u = users.find(x=>x.email===email && x.password===pwd);
		if(!u){ authMsg.innerText = 'Invalid credentials'; return }
		authMsg.innerText = `Welcome, ${u.name || 'User'}!`;
		// store current user session (simple)
		localStorage.setItem('currentUser', JSON.stringify({ name: u.name, email: u.email }));
		setTimeout(()=> hideModal(), 900);
	});

	// open modal on hash
	if(location.hash === '#signin') showModal('signin');
	if(location.hash === '#signup') showModal('signup');
});
