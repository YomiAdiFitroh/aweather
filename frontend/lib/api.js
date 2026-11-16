const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// The access token lives in memory only (never localStorage), so XSS cannot read it.
// The refresh token is an httpOnly cookie that JavaScript cannot touch.
let accessToken = null;
let refreshing = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Shared promise: concurrent callers (and React StrictMode's double effect) reuse one
// refresh call. Two parallel refreshes would trip the server's token-reuse detection.
export function refreshSession() {
  if (!refreshing) {
    refreshing = request('/auth/refresh', { method: 'POST' })
      .then(async (res) => {
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data;
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function api(path, options) {
  let res = await request(path, options);

  // Access token expired? Refresh once, then retry the original request.
  if (res.status === 401 && !NO_REFRESH.includes(path)) {
    if (await refreshSession()) res = await request(path, options);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong');
    error.status = res.status;
    error.details = data.details;
    throw error;
  }
  return data;
}
