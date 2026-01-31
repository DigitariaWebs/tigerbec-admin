/**
 * Reports API Module
 * Handles report downloads
 */

import { BaseApiClient } from './base';

export class ReportsApi extends BaseApiClient {
  /**
   * Download global analytics CSV
   */
  async downloadGlobalAnalyticsCSV(): Promise<Blob> {
    return this.downloadBlob('/reports/global-analytics/csv');
  }
}

export const reportsApi = new ReportsApi();
