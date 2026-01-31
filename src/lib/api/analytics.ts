/**
 * Analytics API Module
 * Handles all analytics-related operations
 */

import { BaseApiClient } from './base';
import type { GlobalKPIs, MemberProfitData, AgeBandAnalytics } from '@/types';

export class AnalyticsApi extends BaseApiClient {
  /**
   * Get global KPIs
   */
  async getGlobalKPIs(params?: Record<string, string>): Promise<GlobalKPIs> {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<GlobalKPIs>(`/analytics/global/kpis${query}`);
  }

  /**
   * Get member profit data
   */
  async getMemberProfitData(params?: Record<string, string>): Promise<MemberProfitData[]> {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<MemberProfitData[]>(`/analytics/global/member-profit${query}`);
  }

  /**
   * Get age band analytics
   */
  async getAgeBandAnalytics(params?: Record<string, string>): Promise<AgeBandAnalytics[]> {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<AgeBandAnalytics[]>(`/analytics/global/age-bands${query}`);
  }
}

export const analyticsApi = new AnalyticsApi();
