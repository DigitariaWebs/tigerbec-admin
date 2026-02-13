/**
 * Members API Module
 * Handles all member-related operations
 */

import { BaseApiClient } from './base';
import type { Profile, Car, MemberStats } from '@/types';

export interface MembersListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
  status?: 'active' | 'inactive' | 'all';
}

export interface MembersListResponse {
  data: Profile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    from: number;
    to: number;
  };
}

export class MembersApi extends BaseApiClient {
  /**
   * Get members with server-side pagination/search.
   */
  async list(params: MembersListParams = {}): Promise<MembersListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.status) query.set('status', params.status);

    const queryString = query.toString();
    return this.request<MembersListResponse>(`/members${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get all members
   */
  async getAll(): Promise<Profile[]> {
    const response = await this.request<MembersListResponse>('/members');
    return response.data;
  }

  /**
   * Get all members with stats
   */
  async getAllWithStats(): Promise<MemberStats[]> {
    const response = await this.request<{ data: MemberStats[] }>('/members');
    return response.data;
  }

  /**
   * Get member by ID
   */
  async getById(id: string): Promise<Profile> {
    return this.request<Profile>(`/members/${id}`);
  }

  /**
   * Get member stats
   */
  async getStats(id: string): Promise<MemberStats> {
    return this.request<MemberStats>(`/members/${id}/stats`);
  }

  /**
   * Get member's cars
   */
  async getCars(id: string): Promise<Car[]> {
    return this.request<Car[]>(`/members/${id}/cars`);
  }

  /**
   * Create a new member
   */
  async create(data: {
    name: string;
    email: string;
    dateOfBirth: string;
    password: string;
    phone?: string;
  }): Promise<Profile> {
    return this.request<Profile>('/members/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Modify member profile using PATCH (admin only)
   */
  async modify(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      date_of_birth?: string;
      avatar_url?: string;
      company?: string;
      country?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<Profile> {
    return this.request<Profile>(`/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a member (admin only)
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Admin adds funds directly to a member (auto-approved)
   */
  async addFunds(memberId: string, data: { amount: number; notes?: string }): Promise<unknown> {
    return this.request<unknown>(`/members/${memberId}/funds`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Admin removes funds from a member (auto-approved withdrawal adjustment)
   */
  async removeFunds(memberId: string, data: { amount: number; notes?: string }): Promise<unknown> {
    return this.request<unknown>(`/members/${memberId}/funds/remove`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Admin adds a car directly to a member's inventory
   */
  async addCar(memberId: string, data: {
    vin: string;
    make?: string;
    model: string;
    year: number;
    purchase_price: string;
    purchase_date?: string;
    notes?: string;
  }): Promise<Car> {
    return this.request<Car>(`/members/${memberId}/cars`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  /**
   * Update a car details
   */
  async updateCar(memberId: string, carId: string, data: Partial<Car>): Promise<Car> {
    return this.request<Car>(`/members/${memberId}/cars/${carId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a car
   */
  async deleteCar(memberId: string, carId: string): Promise<void> {
    return this.request<void>(`/members/${memberId}/cars/${carId}`, {
      method: 'DELETE',
    });
  }
}

export const membersApi = new MembersApi();
