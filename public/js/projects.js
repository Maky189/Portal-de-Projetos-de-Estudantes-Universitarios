async function loadProjects() {
  const list = document.getElementById('projectsList');
  const count = document.getElementById('entryCount');

  try {
    const projects = await api('/projects');
    list.innerHTML = '';

    if (!projects.length) {
      const msg = currentToken ? 'Ainda não tem projetos' : 'Ainda não há projetos';
      list.innerHTML = `<li class="empty"><h3>${msg}</h3></li>`;
      count.textContent = '0 projetos';
      return;
    }

    count.textContent = `${projects.length} projeto${projects.length === 1 ? '' : 's'}`;
    projects.forEach((p, i) => list.appendChild(renderProject(p, i + 1)));
  } catch (err) {
    if (err.message !== 'unauthorized') showStatus(err.message, 'error');
  }
}

function renderProject(p, idx) {
  const li = document.createElement('li');
  li.className = 'entry';
  const desc = p.description && p.description.trim() ? p.description : 'Sem descrição.';
  const isOwner = currentUser && currentUser.id === p.author_id;

  li.innerHTML = `
    <div class="num">#${String(idx).padStart(3, '0')}</div>
    <div class="body">
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(desc)}</p>
      <div class="links">
        <a href="${escapeHtml(p.github_url)}" target="_blank" rel="noopener">Ver no GitHub</a>
        ${isOwner ? `<button type="button" onclick="editProject(${p.id})">Editar</button>` : ''}
      </div>
    </div>
    <div class="author">${escapeHtml(p.author_name)}</div>
    <div class="date">${formatDate(p.created_at)}</div>`;
  return li;
}

async function editProject(id) {
  try {
    const p = await api(`/projects/${id}`);
    document.getElementById('projectId').value = p.id;
    document.getElementById('projectTitle').value = p.title;
    document.getElementById('projectDescription').value = p.description || '';
    document.getElementById('projectGithubUrl').value = p.github_url;
    document.getElementById('editorKicker').textContent = 'Editar projeto';
    document.getElementById('projectFormTitle').textContent = 'Editar projeto.';
    document.getElementById('deleteProjectBtn').classList.remove('hidden');
    document.getElementById('submitProjectBtn').textContent = 'Guardar';

    document.querySelectorAll('.page').forEach(x => x.classList.add('hidden'));
    document.getElementById('createProjectPage').classList.remove('hidden');
    document.getElementById('crumbNow').textContent = 'Editar projeto';
  } catch (err) {
    showStatus(err.message, 'error');
  }
}

function resetProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  document.getElementById('editorKicker').textContent = 'Novo projeto';
  document.getElementById('projectFormTitle').textContent = 'Novo projeto.';
  document.getElementById('deleteProjectBtn').classList.add('hidden');
  document.getElementById('submitProjectBtn').textContent = 'Guardar';
  clearNotice('projectError');
}

async function handleProjectSubmit(event) {
  event.preventDefault();
  clearNotice('projectError');

  const id = document.getElementById('projectId').value;
  const body = {
    title: document.getElementById('projectTitle').value,
    description: document.getElementById('projectDescription').value,
    githubUrl: document.getElementById('projectGithubUrl').value,
  };

  try {
    await api(id ? `/projects/${id}` : '/projects', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    });
    showStatus(id ? 'projeto atualizado' : 'projeto guardado');
    resetProjectForm();
    showPage('projects');
  } catch (err) {
    showNotice('projectError', err.message);
  }
}

async function handleProjectDelete() {
  const id = document.getElementById('projectId').value;
  if (!id || !confirm('Apagar este projeto?')) return;
  try {
    await api(`/projects/${id}`, { method: 'DELETE' });
    showStatus('projeto apagado');
    resetProjectForm();
    showPage('projects');
  } catch (err) {
    showNotice('projectError', err.message);
  }
}
