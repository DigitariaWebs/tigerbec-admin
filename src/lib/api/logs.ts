/**
 * Logs API Client
 * Handles activity logs retrieval and filtering
 */

import { BaseApiClient } from './base';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: 'admin' | 'member';
  activity_type: string;
  resource_type: string;
  resource_id?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface LogsQueryParams {
  user_id?: string;
  user_email?: string;
  user_role?: 'admin' | 'member';
  activity_type?: string;
  resource_type?: string;
  resource_id?: string;
  status?: 'success' | 'failure';
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface LogsResponse {
  logs: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

class LogsApiClient extends BaseApiClient {
  /**
   * Get activity logs with optional filters
   */
  async getActivityLogs(params?: LogsQueryParams): Promise<LogsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/logs/activity${queryString ? `?${queryString}` : ''}`;
    
    return this.request<LogsResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get activity summary statistics
   */
  async getActivitySummary(params?: { start_date?: string; end_date?: string }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/logs/activity${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{
      total_activities: number;
      success_rate: number;
      activities_by_type: Record<string, number>;
      activities_by_resource: Record<string, number>;
      activities_by_status: Record<string, number>;
    }>(endpoint, {
      method: 'GET',
    });
  }
}

export const logsApi = new LogsApiClient();
