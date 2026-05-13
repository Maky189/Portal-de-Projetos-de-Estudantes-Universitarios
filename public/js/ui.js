const CRUMBS = {
  projects: 'Projetos',
  authPage: 'Entrar',
  createProject: 'Novo projeto',
  profilePage: 'A minha conta',
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const id = name === 'projects' ? 'projectsPage'
           : name === 'createProject' ? 'createProjectPage'
           : name;
  document.getElementById(id).classList.remove('hidden');

  const crumb = document.getElementById('crumbNow');
  if (crumb) crumb.textContent = CRUMBS[name] || '';

  if (name === 'projects') loadProjects();
  if (name === 'createProject') resetProjectForm();
  if (name === 'profilePage') loadProfile();
}

function updateSidebar() {
  const authBtn = document.getElementById('crestAuth');
  const newBtn = document.getElementById('crestNew');
  const profileBtn = document.getElementById('crestProfile');
  const session = document.getElementById('sessionLine');
  const crestId = document.getElementById('crestId');

  if (currentToken && currentUser) {
    authBtn.querySelector('span').textContent = 'Sair';
    authBtn.onclick = logout;
    newBtn.classList.remove('hidden');
    profileBtn.classList.remove('hidden');
    session.innerHTML = `Olá, <b>${escapeHtml(currentUser.username)}</b>`;
    crestId.innerHTML = `
      <strong>${escapeHtml(currentUser.name || currentUser.username)}</strong>
      <span>Está autenticado. Pode adicionar e editar os seus projetos.</span>
      <div class="meta">UTILIZADOR · ${escapeHtml(currentUser.username).toUpperCase()}</div>`;
  } else {
    authBtn.querySelector('span').textContent = 'Entrar';
    authBtn.onclick = openLogin;
    newBtn.classList.add('hidden');
    profileBtn.classList.add('hidden');
    session.textContent = 'Sem sessão';
    crestId.innerHTML = `
      <strong>Bem-vindo</strong>
      <span>Faça login para ver e partilhar os seus projetos.</span>
      <div class="meta">SEM SESSÃO</div>`;
  }
}

let statusTimer = null;
function showStatus(message, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = `show ${type}`;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function showNotice(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
}

function clearNotice(id) {
  const el = document.getElementById(id);
  el.textContent = '';
  el.classList.remove('show');
}
