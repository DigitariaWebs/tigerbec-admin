/**
 * Auth API Module
 * Handles authentication operations
 */

import { BaseApiClient } from './base';
import type { Profile } from '@/types';

export class AuthApi extends BaseApiClient {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<Profile> {
    return this.request<Profile>('/auth/me');
  }
}

export const authApi = new AuthApi();
