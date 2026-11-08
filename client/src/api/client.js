// client/src/api/client.js
/**
 * ============================================================================
 * LIGHTWEIGHT HTTP CLIENT WRAPPER (Fetch API)
 * ============================================================================
 * Why Fetch Wrapper instead of Axios?
 * 1. Zero Extra Dependencies: Standard native browser Fetch API.
 * 2. Predictable Interceptors: Manually attaches the custom JWT Bearer token
 *    from localStorage and provides centralized response error parsing.
 * 3. 401 Expiration Handling: Automatically clears expired session credentials
 *    and signals re-authentication if token expires.
 * ============================================================================
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

export async function apiClient(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('recruithub_token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If server returns 401 with expired token, clear storage
      if (response.status === 401 && data.isExpired) {
        localStorage.removeItem('recruithub_token');
        localStorage.removeItem('recruithub_user');
        window.dispatchEvent(new Event('auth:expired'));
      }

      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}
