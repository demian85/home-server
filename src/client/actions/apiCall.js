import types from './types';

function requestInit(method, path) {
  return { type: types.API_CALL_INIT, method, path };
}

function requestError(err) {
  return { type: types.API_CALL_ERROR, error: err };
}

function requestSuccess(payload) {
  return { type: types.API_CALL_SUCCESS, payload };
}

function req(method, path, headers = {}, body = null) {
  if (body) {
    Object.assign(headers, { 'Content-Type': 'application/json' });
  }
  const url = `${path}`;
  return fetch(url, {
    method,
    headers,
    cache: 'no-cache',
    body: body && JSON.stringify(body),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      const data = ['HEAD', 'DELETE'].includes(method) ? response.text() : response.json();
      return data;
    });
}

function call(method, path, body) {
  const jwt = String(localStorage.jwt);
  return req(method, path, { Authorization: jwt }, body);
}

export default function apiCall(method, path, body = null) {
  return async (dispatch, getState) => {
    try {
      dispatch(requestInit(method, path));
      const result = await call(method, path, body);
      dispatch(requestSuccess(result));
      return result;
    } catch (err) {
      console.error(err);
      dispatch(requestError(err));
      throw err;
    }
  };
}
