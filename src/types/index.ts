export enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
}

export enum CarStatus {
  INVENTORY = 'inventory',
  SOLD = 'sold',
}

export interface Profile {
  id?: string; // Optional for backward compatibility
  user_id?: string; // Backend uses user_id
  name: string; // Backend uses name
  full_name?: string; // Optional for compatibility
  phone?: string; // Backend field
  date_of_birth: string;
  role: UserRole;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id?: string; // Optional for backward compatibility
  user_id?: string; // Backend uses user_id
  full_name?: string; // Frontend convention
  name?: string; // Backend uses name
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active?: boolean;
  role?: AdminRole; // Changed from UserRole to AdminRole
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: string;
  member_id: string;
  vin: string;
  make?: string;
  model: string;
  year: number;
  mileage: number;
  purchase_price: string;
  purchase_date: string | null;
  status: CarStatus;
  sale_price: string | null;
  sale_date: string | null;
  notes: string | null;
  profit: string | null;
  created_at: string;
  updated_at: string;
  // Additional fields from car_sales (only for sold cars)
  additional_expenses?: number;
  net_profit?: number;
  franchise_fee?: number;
}

export interface MemberKPIs {
  total_invested: string;
  total_gained: string;
  total_profit: string;
  profit_ratio: number;
  total_cars_bought: number;
  total_cars_sold: number;
}

export interface GlobalKPIs {
  total_invested: string;
  total_profit: string;
  total_franchise_fees: string;
  total_cars_bought: number;
  total_cars_sold: number;
  total_members: number;
  average_profit_ratio: number;
}

export interface MemberProfitData {
  member_id: string;
  member_name: string;
  profit: string;
  profit_ratio: number;
  total_invested: string;
  [key: string]: string | number;
}

export interface AgeBandAnalytics {
  age_band: string;
  profit_ratio: number;
  cars_purchased: number;
  total_profit: string;
  member_count: number;
  [key: string]: string | number;
}

export interface MemberStats {
  user_id: string;
  name: string;
  date_of_birth: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  balance?: number;
  member: Profile
  total_cars: number
  cars_sold: number
  total_invested: string
  total_profit: string
  profit_ratio: number
  wallet_balance?: number
  financial?: {
    totalInvestment: string
    totalRevenue: string
    totalGrossProfit: number
    totalNetProfit: number
    totalFranchiseFees: number
    totalAdditionalExpenses: number
    profitMargin: number
    netProfitMargin: number
  }
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CarSale {
  id: string;
  car_id: string;
  member_id: string;
  sold_price: string;
  sold_date: string;
  vin_snapshot: string;
  make_snapshot: string;
  model_snapshot: string;
  year_snapshot: number;
  purchase_price_snapshot: string;
  purchase_date_snapshot: string;
  profit: string;
  created_at: string;
  // Joined data from related tables
  member_name?: string;
  member_email?: string;
}

export interface CarSaleFilters {
  member_id?: string;
  car_id?: string;
  start_date?: string;
  end_date?: string;
  min_profit?: number;
  max_profit?: number;
  model?: string;
  year?: number;
}

export interface CarSaleStats {
  total_sales: number;
  total_revenue: string;
  total_profit: string;
  average_profit: string;
  average_profit_ratio: number;
}
