export async function apiCall(path, method = 'GET', body = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    body,
    headers: {
      Authorization: localStorage.auth.apiKey
    }
  });
  return res.body && res.json();
}
