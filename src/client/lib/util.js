export async function apiCall(path, method = 'GET', body = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    body,
    headers: {
      Authorization: API_KEY
    }
  });
  return res.body && res.json();
}
