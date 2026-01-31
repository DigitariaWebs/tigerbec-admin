import { BaseApiClient } from './base';

export interface CarExpense {
  id: string;
  car_id: string;
  member_id: string;
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export class CarExpensesApi extends BaseApiClient {
  async getByCarId(carId: string): Promise<CarExpense[]> {
    return this.request(`/car-expenses/car/${carId}`, {
      method: 'GET',
    });
  }

  async getTotalExpenses(carId: string): Promise<{ car_id: string; total_expenses: number }> {
    return this.request(`/car-expenses/car/${carId}/total`, {
      method: 'GET',
    });
  }
}

export const carExpensesApi = new CarExpensesApi();
