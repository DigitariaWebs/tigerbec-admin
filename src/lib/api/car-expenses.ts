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

export interface CreateCarExpenseDto {
  car_id: string;
  amount: number;
  description: string;
  expense_date?: string;
}

export interface UpdateCarExpenseDto {
  amount?: number;
  description?: string;
  expense_date?: string;
}

export class CarExpensesApi extends BaseApiClient {
  async create(data: CreateCarExpenseDto): Promise<CarExpense> {
    return this.request('/car-expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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

  async update(id: string, data: UpdateCarExpenseDto): Promise<CarExpense> {
    return this.request(`/car-expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.request(`/car-expenses/${id}`, {
      method: 'DELETE',
    });
  }
}

export const carExpensesApi = new CarExpensesApi();
