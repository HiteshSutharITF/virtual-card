import api from '../api/apiManager';
import { ADMIN_ENDPOINTS } from '../api/endpoints';

export const getAdminProfile = async () => {
  return await api.get(ADMIN_ENDPOINTS.PROFILE);
};

export const updateAdminProfile = async (data) => {
  return await api.put(ADMIN_ENDPOINTS.PROFILE, data);
};

export const getAllUsers = async () => {
  return await api.get(ADMIN_ENDPOINTS.USERS);
};

export const adminCreateUser = async (data) => {
  return await api.post(ADMIN_ENDPOINTS.CREATE_USER, data);
};

export const adminUpdateUser = async (id, data) => {
  return await api.put(ADMIN_ENDPOINTS.UPDATE_USER(id), data);
};

export const updateUserStatus = async (id, status) => {
  return await api.put(ADMIN_ENDPOINTS.USER_STATUS(id), { status });
};

export const getUserScannedContacts = async (id) => {
  return await api.get(ADMIN_ENDPOINTS.USER_SCANNED(id));
};

export const getOtpLogs = async () => {
  return await api.get('/admin/otp-logs');
};

export const deleteAllOtpLogs = async () => {
  return await api.delete('/admin/otp-logs');
};

export const getReferralsByUserId = async (id) => {
  return await api.get(`/admin/users/${id}/referrals`);
};

export const getGlobalSettings = async () => {
  return await api.get('/admin/settings');
};

export const updateGlobalSettings = async (data) => {
  return await api.put('/admin/settings', data);
};

export const getAllSubscriptions = async () => {
  return await api.get('/admin/subscriptions');
};

export const addUserPayment = async (id, data) => {
  return await api.post(`/admin/users/${id}/payment`, data);
};

export const updateSubscriptionExpiry = async (id, data) => {
  return await api.put(`/admin/users/${id}/expiry`, data);
};

export const updateScannedContact = async (id, data) => {
  return await api.put(ADMIN_ENDPOINTS.UPDATE_SCANNED(id), data);
};
