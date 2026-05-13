function openLogin() {
  isRegistering = false;
  resetAuthForm();
  showPage('authPage');
}

function toggleAuth(event) {
  event.preventDefault();
  isRegistering = !isRegistering;

  const kicker = document.getElementById('authKicker');
  const title = document.getElementById('authTitle');
  const reg = document.getElementById('registerFields');
  const toggle = document.getElementById('authToggle');
  const btn = document.getElementById('authSubmitBtn');

  if (isRegistering) {
    kicker.textContent = 'Criar conta';
    title.textContent = 'Criar conta.';
    reg.classList.remove('hidden');
    toggle.innerHTML = 'Já tem conta? <a href="#" onclick="toggleAuth(event)">Entrar</a>';
    btn.textContent = 'Criar conta';
  } else {
    kicker.textContent = 'Entrar';
    title.textContent = 'Entrar.';
    reg.classList.add('hidden');
    toggle.innerHTML = 'Não tem conta? <a href="#" onclick="toggleAuth(event)">Criar uma</a>';
    btn.textContent = 'Entrar';
  }
  clearNotice('authError');
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearNotice('authError');

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  let body = { username, password };
  let endpoint = '/auth/login';

  if (isRegistering) {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const githubProfile = document.getElementById('githubProfile').value;

    if (!name || !email || !githubProfile) {
      showNotice('authError', 'Preencha todos os campos.');
      return;
    }
    endpoint = '/auth/register';
    body = { username, password, name, email, githubProfile };
  }

  try {
    const data = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
    currentUser = data.user;
    currentToken = data.token;
    saveSession();
    updateSidebar();
    showStatus(isRegistering ? 'conta criada' : 'entrou na sua conta');
    resetAuthForm();
    showPage('projects');
  } catch (err) {
    showNotice('authError', err.message);
  }
}

function logout() {
  if (!confirm('Quer sair?')) return;
  clearSession();
  updateSidebar();
  resetAuthForm();
  showStatus('saiu da sua conta');
  showPage('projects');
}

function resetAuthForm() {
  document.getElementById('authForm').reset();
  document.getElementById('registerFields').classList.add('hidden');
  document.getElementById('authKicker').textContent = 'Entrar';
  document.getElementById('authTitle').textContent = 'Entrar.';
  document.getElementById('authToggle').innerHTML = 'Não tem conta? <a href="#" onclick="toggleAuth(event)">Criar uma</a>';
  document.getElementById('authSubmitBtn').textContent = 'Entrar';
  isRegistering = false;
  clearNotice('authError');
}

async function loadProfile() {
  if (!currentToken) { showPage('authPage'); return; }
  try {
    const u = await api('/auth/me');
    document.getElementById('profileUsername').textContent = u.username;
    document.getElementById('profileName').textContent = u.name;
    document.getElementById('profileEmail').textContent = u.email;

    const gh = document.getElementById('profileGithub');
    if (u.github_profile) {
      gh.innerHTML = `<a href="${escapeHtml(u.github_profile)}" target="_blank" rel="noopener">${escapeHtml(u.github_profile)}</a>`;
    } else {
      gh.textContent = '—';
    }
    document.getElementById('profileCreatedAt').textContent = formatDate(u.created_at);
  } catch (err) {
    showStatus(err.message, 'error');
  }
}
