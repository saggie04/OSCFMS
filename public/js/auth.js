// auth.js - handles register / login UI and API calls
const form = document.getElementById('authForm');
const toggle = document.getElementById('toggleMode');
const nameField = document.getElementById('nameField');
const pageTitle = document.getElementById('pageTitle');
const subText = document.getElementById('subText');
const submitBtn = document.getElementById('submitBtn');
const message = document.getElementById('message');

let mode = 'login'; // or 'register'

toggle.addEventListener('click', () => {
  mode = mode === 'login' ? 'register' : 'login';
  updateUI();
});

function updateUI() {
  if (mode === 'login') {
    pageTitle.textContent = 'Login';
    subText.textContent = 'Access your dashboard';
    nameField.style.display = 'none';
    submitBtn.textContent = 'Login';
    toggle.textContent = 'Register';
    document.getElementById('switchText').textContent = "Don't have an account?";
  } else {
    pageTitle.textContent = 'Register';
    subText.textContent = 'Create a new account';
    nameField.style.display = 'block';
    submitBtn.textContent = 'Register';
    toggle.textContent = 'Login';
    document.getElementById('switchText').textContent = 'Already have an account?';
  }
}

// quick guest
document.getElementById('guestBtn').addEventListener('click', () => {
  message.textContent = 'Continue as guest — opening dashboard (read-only)';
  setTimeout(()=> { window.location.href = '/dashboard.html' }, 800);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  message.style.color = 'black';
  message.textContent = 'Working…';
  const name = (document.getElementById('name').value || '').trim();
  const email = (document.getElementById('email').value || '').trim();
  const password = (document.getElementById('password').value || '').trim();

  if (!email || !password || (mode === 'register' && !name)) {
    message.style.color = 'red';
    message.textContent = 'Please fill required fields';
    return;
  }

  try {
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      message.style.color = 'red';
      message.textContent = data.error || 'Failed';
      return;
    }

    // store token and redirect to dashboard
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      message.style.color = 'green';
      message.textContent = 'Success — redirecting to dashboard';
      setTimeout(()=> window.location.href = '/dashboard.html', 700);
    } else {
      // maybe registration returned token in `token` key
      localStorage.setItem('auth_token', data.token || '');
      window.location.href = '/dashboard.html';
    }
  } catch (err) {
    console.error(err);
    message.style.color = 'red';
    message.textContent = 'Server error';
  }
});

// initialize UI
updateUI();
