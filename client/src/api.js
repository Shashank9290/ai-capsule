// api.js
// Thin fetch wrapper. credentials: 'include' ensures the HttpOnly "token"
// cookie is sent with every request so the backend can authenticate us.

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (res.status === 401) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

export const getMe = () => request('/auth/me');
export const logout = () => request('/auth/logout', { method: 'POST' });

export const getCapsules = () => request('/capsules');
export const createCapsule = (data) =>
  request('/capsules', { method: 'POST', body: JSON.stringify(data) });
export const updateCapsule = (id, data) =>
  request(`/capsules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCapsule = (id) =>
  request(`/capsules/${id}`, { method: 'DELETE' });
