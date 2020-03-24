export async function apiCall(path, method = 'GET', body = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    body,
    headers: {
      Authorization: localStorage.auth.apiKey,
    },
  });
  return res.body && res.json();
}

export function getDevicePowerStateFromPayload(payload) {
  const stateValue = String(payload).toLowerCase();
  return stateValue === 'on' || stateValue === '1';
}
