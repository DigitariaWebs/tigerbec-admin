/**
 * Fund Requests API Client
 * Handles all fund request management operations for admins
 */

import { BaseApiClient } from './base';

export interface FundRequest {
  id: string;
  member_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  member_name?: string;
  member_email?: string;
  reviewer_name?: string;
  reviewer_email?: string;
}

export interface ReviewFundRequestDto {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface FundRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  total_amount_requested: number;
  total_amount_approved: number;
}

class FundRequestsApiClient extends BaseApiClient {
  /**
   * Get all fund requests (admin view)
   */
  async getAll(): Promise<FundRequest[]> {
    const response = await this.request<FundRequest[]>('/fund-requests', {
      method: 'GET',
    });
    return response;
  }

  /**
   * Get a specific fund request by ID
   */
  async getById(id: string): Promise<FundRequest> {
    const response = await this.request<FundRequest>(`/fund-requests/${id}`, {
      method: 'GET',
    });
    return response;
  }

  /**
   * Review (approve/reject) a fund request
   */
  async review(id: string, data: ReviewFundRequestDto): Promise<FundRequest> {
    const response = await this.request<FundRequest>(`/fund-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Get fund request statistics
   */
  async getStats(): Promise<FundRequestStats> {
    const response = await this.request<FundRequestStats>('/fund-requests/stats', {
      method: 'GET',
    });
    return response;
  }
}

export const fundRequestsApi = new FundRequestsApiClient();
