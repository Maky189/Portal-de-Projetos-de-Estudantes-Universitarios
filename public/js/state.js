let currentUser = null;
let currentToken = null;
let isRegistering = false;

function saveSession() {
  localStorage.setItem('token', currentToken);
  localStorage.setItem('user', JSON.stringify(currentUser));
}

function loadSession() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    currentToken = token;
    currentUser = JSON.parse(user);
  }
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = null;
  currentUser = null;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
