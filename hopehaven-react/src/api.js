
const API_URL = "https://hopehaven-2.onrender.com";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
   response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'Cannot connect to the server. Make sure Spring Boot is running on port 8080.'
    );
  }

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data !== null
        ? data.message ||
          data.messages?.childId ||
          data.error
        : null) ||
      (response.status === 401
        ? 'Your session has expired. Please log in again.'
        : response.status === 403
          ? 'Your account does not have permission to perform this action.'
          : `Request failed (${response.status}).`);

    throw new Error(
      String(message)
        .replace(/^409 CONFLICT\s*/i, '')
        .replace(/^"(.*)"$/, '$1')
    );
  }

  return data;
}
