import api from '../api/apiManager';
import { USER_ENDPOINTS } from '../api/endpoints';

export const getUserProfile = async () => {
  return await api.get(USER_ENDPOINTS.PROFILE);
};

export const updateUserProfile = async (data) => {
  return await api.put(USER_ENDPOINTS.PROFILE, data);
};

export const getScannedContacts = async () => {
  return await api.get(USER_ENDPOINTS.SCANNED);
};
