/**
 * Base API Client
 * Provides common functionality for all API modules
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class BaseApiClient {
  protected baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  protected async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    console.log('[API CLIENT] Request:', options.method || 'GET', endpoint);
    const token = await this.getAuthToken();
    console.log('[API CLIENT] Auth token:', token ? 'Present' : 'None');

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for requests with a body
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('[API CLIENT] Fetching:', `${this.baseURL}${endpoint}`);
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log('[API CLIENT] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorBody: unknown = null;
      let fallbackMessage = `HTTP ${response.status}`;

      if (contentType.includes('application/json')) {
        errorBody = await response.json().catch(() => null);
      } else {
        const textBody = await response.text().catch(() => '');
        errorBody = textBody || null;
      }

      if (typeof errorBody === 'string' && errorBody.trim()) {
        fallbackMessage = errorBody;
      } else if (
        errorBody &&
        typeof errorBody === 'object' &&
        'message' in (errorBody as Record<string, unknown>)
      ) {
        const message = (errorBody as Record<string, unknown>).message;
        if (Array.isArray(message)) {
          fallbackMessage = message.join(', ');
        } else if (typeof message === 'string' && message.trim()) {
          fallbackMessage = message;
        }
      }

      console.error('[API CLIENT] Error response:', {
        url: `${this.baseURL}${endpoint}`,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        message: fallbackMessage,
      });
      throw new Error(fallbackMessage);
    }

    // Check for empty response
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return {} as T;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      const result = JSON.parse(text);
      console.log('[API CLIENT] Success response:', result);
      return result;
    } catch (e) {
      console.error('[API CLIENT] Failed to parse JSON response:', e);
      // Return text as fallback if it's not JSON
      return text as unknown as T;
    }
  }

  protected async downloadBlob(endpoint: string): Promise<Blob> {
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, { headers });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  }
}
