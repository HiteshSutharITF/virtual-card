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

export const updateUserStatus = async (id, status) => {
  return await api.put(ADMIN_ENDPOINTS.USER_STATUS(id), { status });
};

export const getUserScannedContacts = async (id) => {
  return await api.get(ADMIN_ENDPOINTS.USER_SCANNED(id));
};
