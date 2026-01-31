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
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      console.error('[API CLIENT] Error response:', error);
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[API CLIENT] Success response:', result);
    return result;
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
