/**
 * Inventory Requests API Client
 * Handles all car inventory request approval operations
 */

import { BaseApiClient } from './base';


export interface InventoryRequest {
  id: string;
  member_id: string;
  vin: string;
  make?: string;
  model: string;
  year: number;
  purchase_price: number;
  purchase_date?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  member_name?: string;
  member_email?: string;
  reviewer_name?: string;
}

export interface InventoryRequestFilters {
  status?: 'pending' | 'approved' | 'rejected';
  member_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface ReviewRequestDto {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface InventoryRequestStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
}

class InventoryRequestsApiClient extends BaseApiClient {
  /**
   * Get all inventory requests (Admin only)
   */
  async getAll(filters?: InventoryRequestFilters): Promise<InventoryRequest[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.member_id) params.append('member_id', filters.member_id);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);

    const queryString = params.toString();
    const url = queryString ? `/inventory-requests?${queryString}` : '/inventory-requests';
    
    return this.request<InventoryRequest[]>(url);
  }

  /**
   * Get single request by ID
   */
  async getById(id: string): Promise<InventoryRequest> {
    return this.request<InventoryRequest>(`/inventory-requests/${id}`);
  }

  /**
   * Review a request (approve/reject)
   */
  async review(id: string, data: ReviewRequestDto): Promise<InventoryRequest> {
    return this.request<InventoryRequest>(`/inventory-requests/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get request statistics
   */
  async getStats(): Promise<InventoryRequestStats> {
    return this.request<InventoryRequestStats>('/inventory-requests/stats');
  }
}

export const inventoryRequestsApi = new InventoryRequestsApiClient();
