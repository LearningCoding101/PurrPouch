import api from "./api";

// Admin-specific API calls

// Get all orders (admin-only)
export const getAllOrders = (page = 0, size = 10, status = null) => {
  let url = `/admin/orders?page=${page}&size=${size}`;
  if (status) {
    url += `&status=${status}`;
  }
  return api.get(url);
};

// Get order details (admin-only)
export const getOrderDetails = (orderId) => {
  return api.get(`/admin/orders/${orderId}`);
};

// Update order status (admin-only)
export const updateOrderStatus = (orderId, status) => {
  return api.put(`/admin/orders/${orderId}/status`, { status });
};

// Get all users (admin-only)
export const getAllUsers = (page = 0, size = 10) => {
  return api.get(`/admin/users?page=${page}&size=${size}`);
};

// Get user details (admin-only)
export const getUserDetails = (userId) => {
  return api.get(`/admin/users/${userId}`);
};

// Update user role (admin-only)
export const updateUserRole = (userId, role) => {
  return api.put(`/admin/users/${userId}/role`, { role });
};

// Create default admin account
export const createDefaultAdmin = (email, password, username) => {
  return api.post("/admin/create-default-admin", {
    email,
    password,
    username,
  });
};

// Get all deliveries (admin-only)
export const getAllDeliveries = (page = 0, size = 10, status = null) => {
  let url = `/admin/deliveries?page=${page}&size=${size}`;
  if (status) {
    url += `&status=${status}`;
  }
  return api.get(url);
};

// Update delivery status (admin-only)
export const updateDeliveryStatus = (deliveryId, status) => {
  return api.put(`/admin/deliveries/${deliveryId}/status`, { status });
};

// Get analytics data (admin-only)
export const getOrderAnalytics = (timeFrame = "week") => {
  return api.get(`/admin/analytics/orders?timeFrame=${timeFrame}`);
};

export const getRevenueAnalytics = (timeFrame = "week") => {
  return api.get(`/admin/analytics/revenue?timeFrame=${timeFrame}`);
};

export const getCustomerAnalytics = (timeFrame = "week") => {
  return api.get(`/admin/analytics/customers?timeFrame=${timeFrame}`);
};
