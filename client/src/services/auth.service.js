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

export const sendOTP = async (mobile, type = 'login') => {
  return await api.post('/auth/send-otp', { mobile, type });
};

export const verifyOTP = async (mobile, otp) => {
  return await api.post('/auth/verify-otp', { mobile, otp });
};

export const forgotPassword = async (mobile) => {
  return await api.post('/auth/forgot-password', { mobile });
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
