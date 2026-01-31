/**
 * Car Sales API Client
 * Handles all car sales-related API operations
 * 
 * Note: car_sales table uses immutable snapshots of car data at time of sale
 * This preserves historical data even if the car is modified or deleted later
 */

import { BaseApiClient } from './base';

export interface CarSale {
  id: string;
  car_id: string;
  member_id: string;
  sold_price: number;
  sold_date: string;
  // Immutable snapshots from the time of sale
  vin_snapshot: string;
  make_snapshot: string;
  model_snapshot: string;
  year_snapshot: number;
  purchase_price_snapshot: number;
  purchase_date_snapshot: string;
  additional_expenses_snapshot: number;
  profit: number;
  net_profit: number;
  franchise_fee_percentage: number;
  franchise_fee_amount: number;
  created_at: string;
}

export interface CreateCarSaleDto {
  car_id: string;
  member_id: string;
  sold_price: number;
  sold_date?: string;
}

class CarSalesApiClient extends BaseApiClient {
  /**
   * Get all car sales (sorted by created_at desc)
   */
  async list(): Promise<CarSale[]> {
    return this.request<CarSale[]>('/car-sales');
  }

  /**
   * Get a single car sale by ID
   */
  async getById(id: string): Promise<CarSale> {
    return this.request<CarSale>(`/car-sales/${id}`);
  }

  /**
   * Get car sales by car ID (single record - one car can only be sold once)
   */
  async getByCarId(carId: string): Promise<CarSale> {
    return this.request<CarSale>(`/car-sales/car/${carId}`);
  }

  /**
   * Get car sales by member ID (multiple records - one member can buy multiple cars)
   */
  async getByMemberId(memberId: string): Promise<CarSale[]> {
    return this.request<CarSale[]>(`/car-sales/member/${memberId}`);
  }

  /**
   * Create a new car sale
   * Note: This will automatically update the car status to SOLD
   */
  async create(data: CreateCarSaleDto): Promise<CarSale> {
    return this.request<CarSale>('/car-sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const carSalesApi = new CarSalesApiClient();
