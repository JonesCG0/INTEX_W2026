export const AUTH_ERROR_EVENT = 'project-haven:auth-error';
export const DELETE_CONFIRMATION_HEADER = 'X-ProjectHaven-Delete-Confirm';
export const DELETE_CONFIRMATION_VALUE = 'DELETE';

type ApiFetchOptions = RequestInit & {
  skipAuthHandling?: boolean;
  confirmDelete?: boolean;
};

export class ApiError extends Error {
  status: number;
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.name = 'ApiError';
    this.status = response.status;
    this.response = response;
  }
}

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}) {
  const { skipAuthHandling = false, confirmDelete = false, headers, credentials, ...rest } = init;
  const requestHeaders = new Headers(headers ?? undefined);

  if (confirmDelete) {
    // Add the explicit delete confirmation header when the caller needs it.
    requestHeaders.set(DELETE_CONFIRMATION_HEADER, DELETE_CONFIRMATION_VALUE);
  }

  const response = await fetch(input, {
    ...rest,
    headers: requestHeaders,
    credentials: credentials ?? 'include',
  });

  if (!skipAuthHandling && (response.status === 401 || response.status === 403)) {
    // Let the auth provider handle redirects for expired or forbidden sessions.
    window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, { detail: { status: response.status } }));
  }

  return response;
}

export async function readApiErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get('content-type') ?? '';

  try {
    // Prefer a JSON error payload when the backend sends one.
    if (contentType.includes('application/json')) {
      const payload = await response.clone().json();
      if (typeof payload?.error === 'string' && payload.error.trim()) {
        return payload.error;
      }
      if (typeof payload?.message === 'string' && payload.message.trim()) {
        return payload.message;
      }
    }

    const text = await response.clone().text();
    if (text.trim()) {
      return text;
    }
  } catch {
    // Fall through to the fallback message.
  }

  return fallback;
}

export async function ensureApiSuccess(response: Response, fallback: string) {
  if (response.ok) {
    return response;
  }

  // Turn non-OK responses into a typed error with a readable message.
  throw new ApiError(await readApiErrorMessage(response, fallback), response);
}
