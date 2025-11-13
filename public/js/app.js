// app.js - frontend logic
const form = document.getElementById('feedbackForm');
const loadBtn = document.getElementById('loadBtn');
const msg = document.getElementById('message');
const list = document.getElementById('feedbackList');


function showMessage(text, ok = true) {
msg.textContent = text;
msg.style.color = ok ? 'green' : 'red';
}


// POST feedback
form.addEventListener('submit', async (e) => {
e.preventDefault();
showMessage('Submitting...');


const payload = {
name: document.getElementById('name').value.trim(),
course: document.getElementById('course').value,
rating: Number(document.getElementById('rating').value),
comments: document.getElementById('comments').value.trim()
};


// client-side validation
if (!payload.name || !payload.course || !payload.rating) {
return showMessage('Please fill name, course and rating.', false);
}
if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
return showMessage('Rating must be an integer between 1 and 5.', false);
}


try {
const res = await fetch('/api/feedback', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload)
});
const data = await res.json();
if (!res.ok) throw new Error(data.error || 'Failed');


showMessage('Feedback submitted — thank you!');
form.reset();
loadFeedbacks();
} catch (err) {
console.error(err);
showMessage('Error: ' + (err.message || 'server error'), false);
}
});


// GET feedbacks
async function loadFeedbacks(course) {
try {
list.innerHTML = 'Loading...';
const url = course ? `/api/feedback?course=${encodeURIComponent(course)}` : '/api/feedback';
const res = await fetch(url);
const items = await res.json();
if (!Array.isArray(items)) throw new Error('Invalid response');


if (items.length === 0) {
list.innerHTML = '<i>No feedbacks yet.</i>';
return;
}


list.innerHTML = '';
items.forEach(it => {
const div = document.createElement('div');
div.className = 'feedback-item';
div.innerHTML = `
<div class="feedback-meta"><strong>${escapeHtml(it.name)}</strong> — ${escapeHtml(it.course)} — ${it.rating}/5</div>
<div class="feedback-text">${escapeHtml(it.comments || '')}</div>
<div class="feedback-time">${new Date(it.createdAt).toLocaleString()}</div>
`;
list.appendChild(div);
});
} catch (err) {
console.error(err);
list.innerHTML = '<span style="color:red">Failed to load feedbacks</span>';
}
}


loadBtn.addEventListener('click', () => loadFeedbacks());


// small helper to avoid HTML injection
function escapeHtml(s) {
if (!s) return '';
return s.replace(/[&<>"']/g, (c) => ({
'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
})[c]);
}


// load initial list o