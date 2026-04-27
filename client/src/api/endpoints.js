export const AUTH_ENDPOINTS = {
  ADMIN_LOGIN: '/auth/admin/login',
  USER_LOGIN: '/auth/user/login',
  REGISTER: '/auth/register',
};

export const ADMIN_ENDPOINTS = {
  PROFILE: '/admin/profile',
  USERS: '/admin/users',
  CREATE_USER: '/admin/users',
  UPDATE_USER: (id) => `/admin/users/${id}`,
  USER_STATUS: (id) => `/admin/users/${id}/status`,
  USER_SCANNED: (id) => `/admin/users/${id}/scanned`,
};

export const USER_ENDPOINTS = {
  PROFILE: '/user/profile',
  SCANNED: '/user/scanned',
  SCANNED_EXPORT: '/user/scanned/export',
  AFFILIATE_STATS: '/user/affiliate/stats',
  AFFILIATE_TEMPLATES: '/user/affiliate/templates',
};

export const WHATSAPP_ENDPOINTS = {
  STATUS: '/whatsapp/status',
  CONNECT: '/whatsapp/connect',
  DISCONNECT: '/whatsapp/disconnect',
};
