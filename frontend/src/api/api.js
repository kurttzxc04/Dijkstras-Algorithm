/**
 * Centralized API Configuration
 * 
 * This is the single source of truth for all backend communication.
 * The backend URL is read from environment variables at build time.
 * UI components MUST NOT access this file directly.
 * 
 * Usage: Import service files from ./pathfindingService.js instead.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Validates that the API URL is properly configured
 * @throws {Error} If REACT_APP_API_URL is not set
 */
function validateApiUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      'API_BASE_URL is not configured. ' +
      'Please set REACT_APP_API_URL environment variable.'
    );
  }
}

/**
 * Generic fetch wrapper for all API requests
 * Handles common error scenarios and response validation
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/api/cpp')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} If request fails or response is invalid
 */
async function apiCall(endpoint, options = {}) {
  validateApiUrl();

  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} from ${endpoint}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw with context for debugging
    throw new Error(
      `API request failed for ${endpoint}: ${error.message}`
    );
  }
}

/**
 * POST request helper
 * @param {string} endpoint - The API endpoint
 * @param {Object} body - Request body as JS object
 * @returns {Promise<Object>} API response
 */
export async function post(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * GET request helper
 * @param {string} endpoint - The API endpoint
 * @returns {Promise<Object>} API response
 */
export async function get(endpoint) {
  return apiCall(endpoint, {
    method: 'GET',
  });
}

const apiClient = {
  post,
  get,
};

export default apiClient;
