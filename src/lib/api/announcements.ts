/**
 * Announcements API Client
 * Handles announcement management (super admin only) and viewing
 */

import { BaseApiClient } from './base';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'incentive' | 'alert' | 'celebration';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  image_url?: string;
  created_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type?: 'general' | 'incentive' | 'alert' | 'celebration';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  is_active?: boolean;
  expires_at?: string;
  image_url?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: 'general' | 'incentive' | 'alert' | 'celebration';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  is_active?: boolean;
  expires_at?: string;
  image_url?: string;
}

export interface QueryAnnouncementsDto {
  activeOnly?: boolean;
  type?: 'general' | 'incentive' | 'alert' | 'celebration';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

class AnnouncementsApiClient extends BaseApiClient {
  /**
   * Get all announcements (super admin only)
   */
  async list(query?: QueryAnnouncementsDto): Promise<Announcement[]> {
    const params = new URLSearchParams();
    if (query?.activeOnly) params.append('activeOnly', 'true');
    if (query?.type) params.append('type', query.type);
    if (query?.priority) params.append('priority', query.priority);
    
    const queryString = params.toString();
    return this.request<Announcement[]>(`/announcements${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get active announcements (all users)
   */
  async getActive(): Promise<Announcement[]> {
    return this.request<Announcement[]>('/announcements/active');
  }

  /**
   * Get a specific announcement by ID
   */
  async getById(id: string): Promise<Announcement> {
    return this.request<Announcement>(`/announcements/${id}`);
  }

  /**
   * Create a new announcement (super admin only)
   */
  async create(dto: CreateAnnouncementDto): Promise<Announcement> {
    return this.request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  /**
   * Update an announcement (super admin only)
   */
  async update(id: string, dto: UpdateAnnouncementDto): Promise<Announcement> {
    return this.request<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  /**
   * Delete an announcement (super admin only)
   */
  async delete(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }
}

export const announcementsApi = new AnnouncementsApiClient();
