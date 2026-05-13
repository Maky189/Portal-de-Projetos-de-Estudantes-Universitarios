// API Configuration
const API_URL = '';
let currentUser = null;
let currentToken = null;
let isRegistering = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  if (currentToken) {
    updateNavigation();
    loadProjects();
    showPage('projects');
  } else {
    showPage('authPage');
  }
});

// Storage Functions
function saveToStorage() {
  if (currentToken) {
    localStorage.setItem('token', currentToken);
    localStorage.setItem('user', JSON.stringify(currentUser));
  }
}

function loadFromStorage() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    currentToken = token;
    currentUser = JSON.parse(user);
  }
}

function clearStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = null;
  currentUser = null;
}

// Navigation
function updateNavigation() {
  const authBtn = document.getElementById('authBtn');
  if (currentToken) {
    authBtn.textContent = `👤 ${currentUser.username}`;
    authBtn.onclick = () => showPage('profilePage');
    document.getElementById('createProjectBtn').classList.remove('hidden');
  } else {
    authBtn.textContent = 'Login';
    authBtn.onclick = () => handleAuthClick();
    document.getElementById('createProjectBtn').classList.add('hidden');
  }
}

function handleAuthClick() {
  isRegistering = false;
  showPage('authPage');
  resetAuthForm();
}

function showPage(pageName) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });

  if (pageName === 'authPage') {
    document.getElementById('authPage').classList.remove('hidden');
  } else if (pageName === 'projects') {
    document.getElementById('projectsPage').classList.remove('hidden');
    loadProjects();
  } else if (pageName === 'createProject') {
    document.getElementById('createProjectPage').classList.remove('hidden');
    resetProjectForm();
  } else if (pageName === 'profilePage') {
    document.getElementById('profilePage').classList.remove('hidden');
    loadUserProfile();
  }
}

// Auth Functions
function toggleAuth(event) {
  event.preventDefault();
  isRegistering = !isRegistering;
  const authTitle = document.getElementById('authTitle');
  const registerFields = document.getElementById('registerFields');
  const authToggle = document.getElementById('authToggle');
  const submitBtn = document.querySelector('#authForm button[type="submit"]');

  if (isRegistering) {
    authTitle.textContent = 'Registre-se';
    registerFields.classList.remove('hidden');
    authToggle.innerHTML = 'Já tem conta? <a href="#" onclick="toggleAuth(event)">Faça login</a>';
    submitBtn.textContent = 'Registrar';
  } else {
    authTitle.textContent = 'Login';
    registerFields.classList.add('hidden');
    authToggle.innerHTML = 'Não tem conta? <a href="#" onclick="toggleAuth(event)">Registre-se</a>';
    submitBtn.textContent = 'Entrar';
  }
  clearAuthError();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearAuthError();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    let endpoint = '/auth/login';
    let body = { username, password };

    if (isRegistering) {
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const githubProfile = document.getElementById('githubProfile').value;

      if (!name || !email) {
        showAuthError('Nome e Email são obrigatórios');
        return;
      }

      endpoint = '/auth/register';
      body = { username, password, name, email, githubProfile };
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      showAuthError(data.error || 'Erro na autenticação');
      return;
    }

    currentUser = data.user;
    currentToken = data.token;
    saveToStorage();
    updateNavigation();
    showToast(
      isRegistering ? 'Registrado com sucesso!' : 'Login realizado com sucesso!',
      'success'
    );
    resetAuthForm();
    showPage('projects');
  } catch (error) {
    showAuthError('Erro ao conectar com o servidor');
    console.error(error);
  }
}

function handleLogout() {
  if (confirm('Deseja fazer logout?')) {
    clearStorage();
    updateNavigation();
    resetAuthForm();
    showPage('authPage');
    showToast('Logout realizado', 'success');
  }
}

function resetAuthForm() {
  document.getElementById('authForm').reset();
  document.getElementById('registerFields').classList.add('hidden');
  isRegistering = false;
  clearAuthError();
}

function showAuthError(message) {
  const errorDiv = document.getElementById('authError');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

function clearAuthError() {
  const errorDiv = document.getElementById('authError');
  errorDiv.textContent = '';
  errorDiv.classList.remove('show');
}

// Projects Functions
async function loadProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`);
    const projects = await response.json();

    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';

    if (!projects || projects.length === 0) {
      projectsList.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <h3>Nenhum projeto ainda</h3>
          <p>Seja o primeiro a compartilhar seu projeto!</p>
        </div>
      `;
      return;
    }

    projects.forEach(project => {
      const card = createProjectCard(project);
      projectsList.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    showToast('Erro ao carregar projetos', 'error');
  }
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';

  const date = new Date(project.created_at).toLocaleDateString('pt-BR');
  const description = project.description || 'Sem descrição';

  card.innerHTML = `
    <h3>${escapeHtml(project.title)}</h3>
    <div class="author">Por ${escapeHtml(project.author_name)}</div>
    <p>${escapeHtml(description)}</p>
    <a href="${escapeHtml(project.github_url)}" target="_blank" class="github-link">
      📦 Ver no GitHub
    </a>
    <div class="project-date">${date}</div>
    ${currentUser && currentUser.id === project.author_id ? `
      <div class="project-actions">
        <button class="btn btn-small" onclick="editProject(${project.id})">Editar</button>
      </div>
    ` : ''}
  `;

  return card;
}

function editProject(projectId) {
  // Fetch project details and show edit form
  fetch(`${API_URL}/projects/${projectId}`)
    .then(res => res.json())
    .then(project => {
      document.getElementById('projectId').value = project.id;
      document.getElementById('projectTitle').value = project.title;
      document.getElementById('projectDescription').value = project.description || '';
      document.getElementById('projectGithubUrl').value = project.github_url;
      document.getElementById('projectFormTitle').textContent = 'Editar Projeto';
      document.getElementById('deleteProjectBtn').classList.remove('hidden');
      document.getElementById('submitProjectBtn').textContent = 'Atualizar Projeto';
      showPage('createProjectPage');
    })
    .catch(error => {
      console.error('Erro ao carregar projeto:', error);
      showToast('Erro ao carregar projeto', 'error');
    });
}

function resetProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  document.getElementById('projectFormTitle').textContent = 'Novo Projeto';
  document.getElementById('deleteProjectBtn').classList.add('hidden');
  document.getElementById('submitProjectBtn').textContent = 'Salvar Projeto';
  clearProjectError();
}

async function handleProjectSubmit(event) {
  event.preventDefault();
  clearProjectError();

  if (!currentToken) {
    showToast('Você precisa estar autenticado', 'error');
    return;
  }

  const projectId = document.getElementById('projectId').value;
  const title = document.getElementById('projectTitle').value;
  const description = document.getElementById('projectDescription').value;
  const githubUrl = document.getElementById('projectGithubUrl').value;

  const body = { title, description, githubUrl };

  try {
    let endpoint = '/projects';
    let method = 'POST';

    if (projectId) {
      endpoint = `/projects/${projectId}`;
      method = 'PUT';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors) {
        showProjectError(data.errors.join(', '));
      } else {
        showProjectError(data.error || 'Erro ao salvar projeto');
      }
      return;
    }

    showToast(
      projectId ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!',
      'success'
    );
    resetProjectForm();
    showPage('projects');
  } catch (error) {
    showProjectError('Erro ao conectar com o servidor');
    console.error(error);
  }
}

async function handleProjectDelete() {
  const projectId = document.getElementById('projectId').value;

  if (!projectId) {
    showProjectError('ID do projeto não encontrado');
    return;
  }

  if (!confirm('Tem certeza que deseja deletar este projeto?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      showProjectError(data.error || 'Erro ao deletar projeto');
      return;
    }

    showToast('Projeto deletado com sucesso!', 'success');
    resetProjectForm();
    showPage('projects');
  } catch (error) {
    showProjectError('Erro ao conectar com o servidor');
    console.error(error);
  }
}

function showProjectError(message) {
  const errorDiv = document.getElementById('projectError');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

function clearProjectError() {
  const errorDiv = document.getElementById('projectError');
  errorDiv.textContent = '';
  errorDiv.classList.remove('show');
}

// Profile Functions
async function loadUserProfile() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      showToast('Erro ao carregar perfil', 'error');
      return;
    }

    const user = await response.json();

    document.getElementById('profileUsername').textContent = escapeHtml(user.username);
    document.getElementById('profileName').textContent = escapeHtml(user.name);
    document.getElementById('profileEmail').textContent = escapeHtml(user.email);
    document.getElementById('profileGithub').textContent = user.github_profile
      ? `<a href="${escapeHtml(user.github_profile)}" target="_blank">${escapeHtml(user.github_profile)}</a>`
      : 'Não informado';
    const date = new Date(user.created_at).toLocaleDateString('pt-BR');
    document.getElementById('profileCreatedAt').textContent = date;
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showToast('Erro ao carregar perfil', 'error');
  }
}

// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Utility Functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
