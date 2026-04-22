import api from '../api/apiManager';
import { WHATSAPP_ENDPOINTS } from '../api/endpoints';

export const getWhatsAppStatus = async () => {
  return await api.get(WHATSAPP_ENDPOINTS.STATUS);
};

export const connectWhatsApp = async () => {
  return await api.post(WHATSAPP_ENDPOINTS.CONNECT);
};

export const disconnectWhatsApp = async () => {
  return await api.post(WHATSAPP_ENDPOINTS.DISCONNECT);
};
