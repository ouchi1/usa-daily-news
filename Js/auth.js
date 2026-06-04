// ==================== AUTHENTICATION SYSTEM ====================
let users = JSON.parse(localStorage.getItem('news_users') || '[]');
let currentUser = JSON.parse(sessionStorage.getItem('news_current_user') || 'null');

const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeLogin = document.querySelector('.close-login');
const tabBtns = document.querySelectorAll('.tab-btn');
const loginFormDiv = document.getElementById('loginForm');
const signupFormDiv = document.getElementById('signupForm');
const submitLoginBtn = document.getElementById('submitLoginBtn');
const submitSignupBtn = document.getElementById('submitSignupBtn');
const loginMessage = document.getElementById('loginMessage');
const signupMessage = document.getElementById('signupMessage');
const userDropdown = document.getElementById('userDropdown');
const userNameDisplay = document.getElementById('userNameDisplay');
const logoutBtnElem = document.getElementById('logoutBtn');

export function updateUIForUser() {
  if (currentUser) {
    loginBtn.innerHTML = `<i class="fas fa-user-check"></i> ${currentUser.name}`;
    loginBtn.classList.add('logged-in');
    userNameDisplay.textContent = `${currentUser.name}`;
    userDropdown.classList.add('show');
  } else {
    loginBtn.innerHTML = `<i class="fas fa-user"></i> Login`;
    loginBtn.classList.remove('logged-in');
    userDropdown.classList.remove('show');
  }
}

function showToast(msg) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = { id: user.id, name: user.name, email: user.email };
    sessionStorage.setItem('news_current_user', JSON.stringify(currentUser));
    updateUIForUser();
    loginModal.style.display = 'none';
    showToast(`Welcome back, ${user.name}! 🎉`);
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  } else {
    loginMessage.textContent = 'Invalid email or password';
    loginMessage.className = 'form-message error';
    setTimeout(() => { loginMessage.textContent = ''; loginMessage.className = ''; }, 3000);
  }
}

function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  if (!name || !email || !password || !confirm) {
    signupMessage.textContent = 'Please fill all fields';
    signupMessage.className = 'form-message error';
    setTimeout(() => { signupMessage.textContent = ''; signupMessage.className = ''; }, 3000);
    return;
  }
  if (password.length < 6) {
    signupMessage.textContent = 'Password must be at least 6 characters';
    signupMessage.className = 'form-message error';
    setTimeout(() => { signupMessage.textContent = ''; signupMessage.className = ''; }, 3000);
    return;
  }
  if (password !== confirm) {
    signupMessage.textContent = 'Passwords do not match';
    signupMessage.className = 'form-message error';
    setTimeout(() => { signupMessage.textContent = ''; signupMessage.className = ''; }, 3000);
    return;
  }
  if (users.some(u => u.email === email)) {
    signupMessage.textContent = 'Email already registered';
    signupMessage.className = 'form-message error';
    setTimeout(() => { signupMessage.textContent = ''; signupMessage.className = ''; }, 3000);
    return;
  }
  
  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  localStorage.setItem('news_users', JSON.stringify(users));
  currentUser = { id: newUser.id, name: newUser.name, email: newUser.email };
  sessionStorage.setItem('news_current_user', JSON.stringify(currentUser));
  updateUIForUser();
  loginModal.style.display = 'none';
  showToast(`Welcome to NewsFlash, ${name}! 🎉`);
  
  document.getElementById('signupName').value = '';
  document.getElementById('signupEmail').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupConfirm').value = '';
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('news_current_user');
  updateUIForUser();
  showToast('Logged out. See you soon! 👋');
}

export function initAuth() {
  if (loginBtn) loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
  if (closeLogin) closeLogin.addEventListener('click', () => loginModal.style.display = 'none');
  if (submitLoginBtn) submitLoginBtn.addEventListener('click', handleLogin);
  if (submitSignupBtn) submitSignupBtn.addEventListener('click', handleSignup);
  if (logoutBtnElem) logoutBtnElem.addEventListener('click', logout);
  
  window.addEventListener('click', (e) => { if (e.target === loginModal) loginModal.style.display = 'none'; });
  
  document.getElementById('loginEmail')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('loginPassword')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
  
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loginFormDiv.classList.toggle('active', btn.dataset.tab === 'login');
    signupFormDiv.classList.toggle('active', btn.dataset.tab === 'signup');
  }));
  
  updateUIForUser();
}