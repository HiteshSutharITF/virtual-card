import api from '../api/apiManager';
import { USER_ENDPOINTS } from '../api/endpoints';

export const getUserProfile = async () => {
  return await api.get(USER_ENDPOINTS.PROFILE);
};

export const updateUserProfile = async (data) => {
  return await api.put(USER_ENDPOINTS.PROFILE, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getScannedContacts = async () => {
  return await api.get(USER_ENDPOINTS.SCANNED);
};

export const exportScannedContacts = async () => {
  return await api.get(USER_ENDPOINTS.SCANNED_EXPORT, {
    responseType: 'blob',
  });
};
