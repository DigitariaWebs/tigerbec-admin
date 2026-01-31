/**
 * Settings API Client
 * Handles app settings management (super admin only)
 */

import { BaseApiClient } from './base';

export interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingDto {
  setting_key: string;
  setting_value: string;
}

class SettingsApiClient extends BaseApiClient {
  /**
   * Get all app settings
   */
  async list(): Promise<AppSetting[]> {
    return this.request<AppSetting[]>('/admin/settings');
  }

  /**
   * Get a specific setting by key
   */
  async getByKey(key: string): Promise<AppSetting> {
    return this.request<AppSetting>(`/admin/settings/${key}`);
  }

  /**
   * Update a setting (super admin only)
   */
  async update(key: string, value: string): Promise<AppSetting> {
    return this.request<AppSetting>(`/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({
        setting_key: key,
        setting_value: value,
      }),
    });
  }

  /**
   * Get the franchise fee percentage
   */
  async getFranchiseFee(): Promise<number> {
    const setting = await this.getByKey('tctpro_franchise_fee');
    return parseFloat(setting.setting_value);
  }

  /**
   * Update the franchise fee percentage
   */
  async updateFranchiseFee(percentage: number): Promise<AppSetting> {
    return this.update('tctpro_franchise_fee', percentage.toString());
  }
}

export const settingsApi = new SettingsApiClient();
