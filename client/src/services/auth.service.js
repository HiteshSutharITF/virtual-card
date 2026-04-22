import api from '../api/apiManager';
import { AUTH_ENDPOINTS } from '../api/endpoints';

export const adminLogin = async (credentials) => {
  return await api.post(AUTH_ENDPOINTS.ADMIN_LOGIN, credentials);
};

export const userLogin = async (credentials) => {
  return await api.post(AUTH_ENDPOINTS.USER_LOGIN, credentials);
};

export const registerUser = async (userData) => {
  return await api.post(AUTH_ENDPOINTS.REGISTER, userData);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
