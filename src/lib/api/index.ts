/**
 * API Client
 * Central export point for all API modules
 */

export { adminApi } from './admins';
export { membersApi } from './members';
export { analyticsApi } from './analytics';
export { authApi } from './auth';
export { reportsApi } from './reports';
export { carSalesApi } from './car-sales';
export { carExpensesApi } from './car-expenses';
export { logsApi } from './logs';
export { eventsApi } from './events';
export { inventoryRequestsApi } from './inventory-requests';
export { tasksApi } from './tasks';

// For backward compatibility, export a default api object
import { adminApi } from './admins';
import { membersApi } from './members';
import { analyticsApi } from './analytics';
import { authApi } from './auth';
import { reportsApi } from './reports';
import { carSalesApi } from './car-sales';
import { eventsApi } from './events';
import { inventoryRequestsApi } from './inventory-requests';

export const api = {
  // Admin methods
  adminSignIn: adminApi.signin.bind(adminApi),
  adminSignOut: adminApi.signout.bind(adminApi),
  getAllAdmins: adminApi.list.bind(adminApi),
  getAdminProfile: adminApi.getProfile.bind(adminApi),
  updateAdminProfile: adminApi.updateProfile.bind(adminApi),
  deleteAdminProfile: adminApi.deleteProfile.bind(adminApi),
  getAuditLogs: adminApi.getAuditLogs.bind(adminApi),
  
  // Auth methods
  getProfile: authApi.getProfile.bind(authApi),
  
  // Members methods
  getAllMembers: membersApi.getAll.bind(membersApi),
  getAllMembersWithStats: membersApi.getAllWithStats.bind(membersApi),
  getMemberById: membersApi.getById.bind(membersApi),
  getMemberStats: membersApi.getStats.bind(membersApi),
  getMemberCars: membersApi.getCars.bind(membersApi),
  
  // Analytics methods
  getGlobalKPIs: analyticsApi.getGlobalKPIs.bind(analyticsApi),
  getMemberProfitData: analyticsApi.getMemberProfitData.bind(analyticsApi),
  getAgeBandAnalytics: analyticsApi.getAgeBandAnalytics.bind(analyticsApi),
  
  // Reports methods
  downloadGlobalAnalyticsCSV: reportsApi.downloadGlobalAnalyticsCSV.bind(reportsApi),
  
  // Car Sales methods
  getCarSales: carSalesApi.list.bind(carSalesApi),
  getCarSaleById: carSalesApi.getById.bind(carSalesApi),
  getCarSaleByCarId: carSalesApi.getByCarId.bind(carSalesApi),
  getCarSalesByMemberId: carSalesApi.getByMemberId.bind(carSalesApi),
  createCarSale: carSalesApi.create.bind(carSalesApi),
  
  // Events methods
  createEvent: eventsApi.create.bind(eventsApi),
  getAllEvents: eventsApi.getAll.bind(eventsApi),
  getEventById: eventsApi.getById.bind(eventsApi),
  updateEvent: eventsApi.update.bind(eventsApi),
  deleteEvent: eventsApi.delete.bind(eventsApi),
  getEventsByDateRange: eventsApi.getByDateRange.bind(eventsApi),
};
