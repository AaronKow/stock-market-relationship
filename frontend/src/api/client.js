const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson && payload?.message ? payload.message : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  if (isJson && payload && typeof payload === 'object' && Object.hasOwn(payload, 'data')) {
    return payload.data;
  }

  return payload;
}

export async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    return await parseResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Unable to connect to API service.', 0, error);
  }
}

export { API_BASE_URL };
