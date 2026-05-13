function extractUsername(profileUrl) {
  if (typeof profileUrl !== 'string') return null;
  const match = profileUrl.match(/^https?:\/\/(www\.)?github\.com\/([^\/?#\s]+)/i);
  if (!match) return null;
  const username = match[2];
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(username)) return null;
  return username;
}

async function fetchUserRepos(username) {
  const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner&sort=updated`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'portal-projetos-app',
      Accept: 'application/vnd.github+json',
    },
  });
  if (res.status === 404) {
    const err = new Error('GitHub user not found');
    err.status = 404;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`GitHub API error (${res.status})`);
    err.status = 502;
    throw err;
  }
  const data = await res.json();
  return data.map(r => ({
    title: r.name,
    description: r.description || '',
    githubUrl: r.html_url,
  }));
}

module.exports = { extractUsername, fetchUserRepos };
