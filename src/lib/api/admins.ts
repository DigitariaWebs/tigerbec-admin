/**
 * Admin API Module
 * Handles all admin-related operations
 */

import { BaseApiClient } from './base';
import type { Admin, AuditLog } from '@/types';

export class AdminApi extends BaseApiClient {
  /**
   * Create a new admin account (public endpoint)
   */
  async signup(data: { 
    email: string; 
    password: string; 
    full_name: string;
  }): Promise<{ admin: Admin; access_token: string }> {
    return this.request('/admin/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Admin login (public endpoint)
   */
  async signin(data: { email: string; password: string }): Promise<{ 
    admin: Admin; 
    access_token: string;
  }> {
    console.log('[ADMIN API] signin called with:', { ...data, password: '[REDACTED]' });
    
    const response = await fetch(`${this.baseURL}/admin/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    console.log('[ADMIN API] signin response:', result);
    console.log('[ADMIN API] admin object:', result.admin);
    console.log('[ADMIN API] admin role:', result.admin?.role);
    
    // Store token in localStorage and cookies
    if (typeof window !== 'undefined' && result.access_token) {
      localStorage.setItem('admin_token', result.access_token);
      if (result.admin) {
        localStorage.setItem('admin_user', JSON.stringify(result.admin));
        console.log('[ADMIN API] Stored admin in localStorage:', result.admin);
      }
      // Set cookie for middleware
      document.cookie = `admin_token=${result.access_token}; path=/; samesite=lax`;
    }
    
    return result;
  }

  /**
   * Admin logout
   */
  async signout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Clear cookie
      document.cookie = 'admin_token=; path=/; samesite=lax; max-age=0';
    }
  }

  /**
   * Get all admins (admin only)
   */
  async list(): Promise<Admin[]> {
    return this.request<Admin[]>('/admin/list');
  }

  /**
   * Get admin profile by ID (admin only)
   */
  async getProfile(id: string): Promise<Admin> {
    return this.request<Admin>(`/admin/profile/${id}`);
  }

  /**
   * Update admin profile (admin only)
   */
  async updateProfile(
    id: string, 
    data: Partial<Pick<Admin, 'full_name' | 'email'>>
  ): Promise<Admin> {
    return this.request<Admin>(`/admin/profile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Modify admin profile using PATCH (admin only)
   */
  async modify(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      avatar_url?: string;
      is_active?: boolean;
    }
  ): Promise<Admin> {
    return this.request<Admin>(`/admin/profile/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete admin account (admin only)
   */
  async deleteProfile(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/profile/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get audit logs with optional filters (admin only)
   */
  async getAuditLogs(params?: Record<string, string>): Promise<AuditLog[]> {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<AuditLog[]>(`/admin/audit-logs${query}`);
  }

  /**
   * Create a new admin (admin only)
   */
  async create(data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role?: 'admin' | 'super_admin';
  }): Promise<Admin> {
    return this.request<Admin>('/admin/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(
    id: string, 
    newPassword: string,
    userType: 'admin' | 'member' = 'admin'
  ): Promise<{ message: string }> {
    const endpoint = userType === 'admin' 
      ? `/admin/profile/${id}/reset-password`
      : `/members/${id}/password`;
    
    const method = userType === 'admin' ? 'POST' : 'PUT';
    const body = userType === 'admin'
      ? { new_password: newPassword }
      : { password: newPassword };
    
    return this.request<{ message: string }>(endpoint, {
      method,
      body: JSON.stringify(body),
    });
  }

  /**
   * Delete all project operational data after password verification (super admin only)
   */
  async deleteProjectData(password: string): Promise<{
    message: string;
    deleted_counts: Record<string, number>;
  }> {
    return this.request<{
      message: string;
      deleted_counts: Record<string, number>;
    }>('/admin/settings/delete-project-data', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }
}

export const adminApi = new AdminApi();
