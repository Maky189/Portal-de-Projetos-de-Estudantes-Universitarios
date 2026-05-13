async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (currentToken) headers.Authorization = `Bearer ${currentToken}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401 && currentToken) {
    clearSession();
    updateSidebar();
    showStatus('a sua sessão acabou — entre outra vez', 'error');
    showPage('authPage');
    throw new Error('unauthorized');
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && (data.error || (data.errors && data.errors.join(', ')))) || 'erro de servidor';
    throw new Error(msg);
  }
  return data;
}
