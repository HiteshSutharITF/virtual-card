================================================================================
  PRODUCT REQUIREMENTS DOCUMENT
  WhatsApp QR Contact Sharing Platform
  MERN Stack · Role-Based · WhatsApp Web JS Integration
  Version: 1.0.0 | Date: April 2026 | Status: Draft
================================================================================


================================================================================
01. EXECUTIVE SUMMARY
================================================================================

1.1 Product Overview
--------------------
The WhatsApp QR Contact Sharing Platform is a role-based web application built
on the MERN stack that enables businesses to use a centralized WhatsApp number
to facilitate seamless contact sharing between a QR code holder (user) and the
person who scans the QR code (scanner). The platform leverages WhatsApp Web JS
to automate message handling and contact sharing workflows.

1.2 Problem Statement
---------------------
Businesses and individuals frequently need a streamlined way to share contact
information with new connections. Traditional approaches require manual sharing,
are error-prone, and do not scale. This platform solves that by encoding contact
sharing instructions in a QR code that triggers automated WhatsApp workflows —
without the QR holder needing to be present.

1.3 Key Value Propositions
--------------------------
- Automated contact exchange via WhatsApp — zero manual intervention
- Centralized admin control over all users and their configurations
- Approval-based user onboarding for controlled access
- Per-user configurable messaging and contact-sharing toggles
- Full audit trail — every scan is logged with name, number, and timestamp
- Scalable, maintainable architecture using well-structured MERN patterns

1.4 Roles Summary
-----------------
ADMIN
  - Manage own profile (name, email, mobile, password)
  - Connect WhatsApp via QR using WhatsApp Web JS
  - Approve/reject user registrations
  - Create users directly from admin panel
  - View all users and their scanned contacts
  - Oversee system health

USER
  - Register via public page or be created by admin
  - Configure personal message and feature toggles
  - View own QR code on dashboard
  - View own scanned contacts log


================================================================================
02. FUNCTIONAL REQUIREMENTS
================================================================================

2.1 Authentication & Authorization
------------------------------------

2.1.1 Admin Login
  - Admin logs in using email + password
  - JWT token is issued on successful login
  - Secure password storage using bcrypt (min 10 salt rounds)
  - Token expiry: 7 days for admin, 24 hours for user

2.1.2 User Login
  - User logs in using mobile number + password
  - Login is blocked if account is pending approval or rejected
  - JWT token issued containing userId, role, and token

2.1.3 Route Protection
  - All API routes are protected via JWT middleware
  - Role-based middleware enforces admin-only and user-only endpoints
  - Unauthorized access returns standardized 401/403 responses

------------------------------------------------------------

2.2 Admin Profile Management
------------------------------
  - Admin can view and update: Full Name, Email ID, Mobile Number, Password
  - Mobile number is the WhatsApp number used for the centralized bot
  - Password update requires current password confirmation
  - Email must be unique across the system
  - Profile photo upload is optional (stored in /uploads/admin/)

------------------------------------------------------------

2.3 WhatsApp Integration (Admin)
----------------------------------

2.3.1 WhatsApp Connection
  - Admin dashboard has a "Connect WhatsApp" section
  - Clicking connect initializes WhatsApp Web JS session for the admin's number
  - A QR code is generated and displayed in the admin UI via a WebSocket event
  - Admin scans this QR code using their WhatsApp mobile app
  - Connection status displayed: Disconnected / QR Ready / Connected / Reconnecting

2.3.2 Session Persistence
  - WhatsApp session data is stored in server filesystem (/sessions/admin/)
  - On server restart, the session is auto-restored if valid
  - Admin can manually disconnect and reconnect from the dashboard

2.3.3 Incoming Message Handling
When a scanner sends a WhatsApp message to the admin number, the backend
processes it in the following order:

  1. Incoming message received via WhatsApp Web JS message event
  2. Message body is parsed to extract the User Token
  3. Token is validated against the database
  4. User configuration is fetched (isActive, isContactSharingEnabled, customMessage)
  5. If isActive is false → no action taken
  6. If isContactSharingEnabled is true → share QR holder's contact to scanner
  7. Share scanner's contact to QR holder (always, if feature enabled)
  8. Send custom message (with {name} variable resolved) to scanner
  9. Log the scanner's name, mobile number, and timestamp in ScannedContact collection

------------------------------------------------------------

2.4 User Management (Admin)
-----------------------------

2.4.1 Create User (Admin-Created)
  - Admin can directly create a user from the admin panel
  - Required fields: Full Name, Mobile Number, Business Name, Password
  - Auto-generated: User Token (UUID-based, unique)
  - Account status is set to approved automatically

2.4.2 Self-Registration (User-Initiated)
  - A public /register page is available without authentication
  - Required fields: Full Name, Mobile Number, Business Name, Password, Custom Message
  - After submission, account status is set to pending
  - Admin receives in-app badge notification about new pending registration
  - User cannot log in until the admin approves the registration

2.4.3 Approval Workflow
  - Admin sees a Pending Approvals list in the dashboard
  - For each pending user, admin can: Approve or Reject
  - Approved users gain access to the user panel
  - Rejected users receive an appropriate error on login

2.4.4 View All Users
  - Admin can see all users in a paginated, searchable table
  - Columns: Name, Mobile, Business Name, Status, Token, Created At, Actions
  - Admin can view a user's scanned contact history
  - Admin can enable/disable a user's account
  - Admin can delete a user (soft delete — isDeleted flag)

------------------------------------------------------------

2.5 User Panel
---------------

2.5.1 User Profile & Configuration
  - User can update: Full Name, Business Name, Mobile Number, Password
  - User can set/update Custom Message (supports {name} variable)
  - User can toggle: isActive (enable/disable entire feature)
  - User can toggle: isContactSharingEnabled (enable/disable contact sharing)

2.5.2 QR Code Display
  - User's dashboard displays a QR code generated from a deep link URL
  - QR encodes: https://wa.me/{ADMIN_NUMBER}?text=Please share the contact of
    {USER_NAME} - {BUSINESS_NAME} {USER_TOKEN}
  - QR code is downloadable as PNG
  - User Token is displayed below the QR code for reference

2.5.3 Scanned Contacts Log
  - User sees a table of all people who scanned their QR code
  - Columns: Scanner Name, Scanner Mobile, Date & Time
  - Paginated (20 per page), sorted by most recent
  - User can search/filter by name or number


================================================================================
03. SYSTEM WORKFLOW
================================================================================

3.1 QR Scan → Contact Share Flow
----------------------------------

  Step 1  | User (QR Holder)  | Generates and displays their unique QR code
  Step 2  | Scanner           | Scans the QR code with phone camera
  Step 3  | WhatsApp          | Opens WhatsApp with pre-filled message to Admin:
          |                   | "Please share the contact of {NAME} - {BUSINESS} {TOKEN}"
  Step 4  | Scanner           | Sends the pre-filled message to admin WhatsApp
  Step 5  | Backend (Bot)     | Receives incoming message via WhatsApp Web JS
  Step 6  | Backend           | Extracts and validates user token from message
  Step 7  | Backend           | Fetches user config: isActive, isContactSharingEnabled,
          |                   | customMessage
  Step 8  | Backend (enabled) | Sends QR Holder's vCard contact to the Scanner
  Step 9  | Backend (enabled) | Sends Scanner's vCard contact to the QR Holder
  Step 10 | Backend           | Sends custom message (with {name} resolved) to Scanner
  Step 11 | Backend           | Logs ScannedContact: scannerName, scannerMobile,
          |                   | userId, timestamp

3.2 User Registration Approval Flow
-------------------------------------
  1. User visits /register and submits registration form
  2. Backend creates user with status: pending
  3. Admin sees pending count badge in sidebar
  4. Admin navigates to Pending Approvals → views user details
  5. Admin clicks Approve or Reject
  6. User's status updates to approved or rejected
  7. Approved user can now log in and access user panel


================================================================================
04. PROJECT ARCHITECTURE & FOLDER STRUCTURE
================================================================================

4.1 Overall Architecture
--------------------------
  - Frontend  : React.js (Vite) with React Router, Axios, Context API / Zustand
  - Backend   : Node.js + Express.js with a modular MVC pattern
  - Database  : MongoDB with Mongoose ODM
  - WhatsApp  : whatsapp-web.js with session persistence
  - Auth      : JWT-based stateless authentication
  - Storage   : Local filesystem (Multer) — S3 compatible for production
  - Real-time : Socket.IO for WhatsApp QR code delivery to admin UI

4.2 Backend Folder Structure
------------------------------

  server/
  ├── config/
  │   ├── db.js                  # MongoDB connection
  │   ├── env.js                 # Environment variable loader & validator
  │   └── whatsapp.js            # WhatsApp Web JS init & session config
  ├── controllers/
  │   ├── auth.controller.js
  │   ├── admin.controller.js
  │   ├── user.controller.js
  │   └── whatsapp.controller.js
  ├── middlewares/
  │   ├── auth.middleware.js     # JWT verification
  │   ├── role.middleware.js     # Role guard (isAdmin, isUser)
  │   ├── error.middleware.js    # Global error handler
  │   └── upload.middleware.js   # Multer configuration
  ├── models/
  │   ├── Admin.model.js
  │   ├── User.model.js
  │   └── ScannedContact.model.js
  ├── routes/
  │   ├── index.js              # Route aggregator
  │   ├── auth.routes.js
  │   ├── admin.routes.js
  │   ├── user.routes.js
  │   └── whatsapp.routes.js
  ├── services/
  │   ├── whatsapp.service.js   # Message processing, contact sharing logic
  │   ├── token.service.js      # User token generation & validation
  │   └── contact.service.js    # vCard generation
  ├── utils/
  │   ├── response.util.js      # Standardized API response helpers
  │   ├── logger.js             # Winston logger
  │   └── paginate.util.js      # Pagination helper
  ├── validations/
  │   ├── auth.validation.js
  │   ├── admin.validation.js
  │   └── user.validation.js
  ├── sessions/                 # WhatsApp Web JS session data (gitignored)
  ├── uploads/                  # Uploaded files (gitignored)
  │   └── admin/
  ├── app.js                    # Express app setup
  └── server.js                 # Entry point, Socket.IO init

4.3 Frontend Folder Structure
-------------------------------

  client/src/
  ├── api/
  │   ├── apiManager.js         # Axios instance, interceptors, base URL
  │   └── endpoints.js          # All API endpoint constants
  ├── services/
  │   ├── auth.service.js
  │   ├── admin.service.js
  │   ├── user.service.js
  │   └── whatsapp.service.js
  ├── pages/
  │   ├── auth/
  │   │   ├── Login.jsx
  │   │   └── Register.jsx
  │   ├── admin/
  │   │   ├── Dashboard.jsx
  │   │   ├── Profile.jsx
  │   │   ├── WhatsAppConnect.jsx
  │   │   ├── Users.jsx
  │   │   ├── PendingApprovals.jsx
  │   │   └── UserScannedContacts.jsx
  │   └── user/
  │       ├── Dashboard.jsx
  │       ├── Profile.jsx
  │       └── ScannedContacts.jsx
  ├── components/
  │   ├── common/
  │   │   ├── Button.jsx
  │   │   ├── Input.jsx
  │   │   ├── Modal.jsx
  │   │   ├── Table.jsx
  │   │   ├── Pagination.jsx
  │   │   ├── Toggle.jsx
  │   │   └── StatusBadge.jsx
  │   ├── layouts/
  │   │   ├── AdminLayout.jsx
  │   │   └── UserLayout.jsx
  │   └── qr/
  │       └── QRCodeCard.jsx
  ├── context/
  │   ├── AuthContext.jsx
  │   └── SocketContext.jsx
  ├── hooks/
  │   ├── useAuth.js
  │   └── usePagination.js
  ├── utils/
  │   ├── tokenHelper.js        # JWT decode, role checks
  │   └── dateFormatter.js
  ├── routes/
  │   ├── ProtectedRoute.jsx
  │   ├── AdminRoutes.jsx
  │   └── UserRoutes.jsx
  └── App.jsx


================================================================================
05. DATA MODELS
================================================================================

5.1 Admin Model
----------------
  Field                | Details
  ---------------------|--------------------------------------------------
  _id                  | ObjectId (auto)
  name                 | String, required
  email                | String, required, unique, lowercase
  mobile               | String, required, unique — used as WhatsApp number
  password             | String, required, bcrypt hashed
  profilePhoto         | String (file path), optional
  whatsappStatus       | Enum: disconnected | qr_ready | connected | reconnecting
  createdAt/updatedAt  | Timestamps (auto via mongoose)

5.2 User Model
---------------
  Field                    | Details
  -------------------------|--------------------------------------------------
  _id                      | ObjectId (auto)
  name                     | String, required
  mobile                   | String, required, unique
  businessName             | String, required
  password                 | String, required, bcrypt hashed
  userToken                | String, unique, auto-generated UUID on creation
  customMessage            | String — supports {name} variable
  isActive                 | Boolean, default: true — enables/disables entire feature
  isContactSharingEnabled  | Boolean, default: true — enables/disables contact sharing
  status                   | Enum: pending | approved | rejected, default: pending
  createdBy                | Enum: admin | self — tracks how account was created
  isDeleted                | Boolean, default: false — soft delete flag
  createdAt/updatedAt      | Timestamps (auto via mongoose)

5.3 ScannedContact Model
--------------------------
  Field          | Details
  ---------------|--------------------------------------------------
  _id            | ObjectId (auto)
  userId         | ObjectId, ref: User — the QR holder
  scannerName    | String — extracted from WhatsApp contact info
  scannerMobile  | String — scanner's WhatsApp number
  scannedAt      | Date, default: Date.now


================================================================================
06. API DESIGN
================================================================================

6.1 Standard Response Format
------------------------------

  // Success Response
  {
    "success": true,
    "message": "Human-readable message",
    "data": { ... },
    "pagination": {          // only for list endpoints
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }

  // Error Response
  {
    "success": false,
    "message": "Error description",
    "errors": [              // optional: validation errors
      { "field": "mobile", "message": "Mobile is required" }
    ]
  }

6.2 Auth Endpoints
-------------------
  POST  /api/auth/admin/login     Public   Admin login → returns JWT
  POST  /api/auth/user/login      Public   User login → returns JWT
  POST  /api/auth/register        Public   User self-registration

6.3 Admin Endpoints
--------------------
  GET    /api/admin/profile                Admin JWT   Get admin profile
  PUT    /api/admin/profile                Admin JWT   Update name, email, mobile, password
  GET    /api/admin/users                  Admin JWT   Get all users (paginated, filterable)
  POST   /api/admin/users                  Admin JWT   Create a new user
  GET    /api/admin/users/:id              Admin JWT   Get single user details
  PUT    /api/admin/users/:id              Admin JWT   Update user details
  DELETE /api/admin/users/:id              Admin JWT   Soft delete a user
  PUT    /api/admin/users/:id/approve      Admin JWT   Approve pending user
  PUT    /api/admin/users/:id/reject       Admin JWT   Reject pending user
  GET    /api/admin/pending                Admin JWT   Get all pending registrations
  GET    /api/admin/users/:id/scanned      Admin JWT   Get scanned contacts for a user

6.4 User Endpoints
-------------------
  GET   /api/user/profile                  User JWT    Get own profile
  PUT   /api/user/profile                  User JWT    Update name, mobile, business, password
  PUT   /api/user/message                  User JWT    Update custom message
  PUT   /api/user/toggle/active            User JWT    Toggle isActive on/off
  PUT   /api/user/toggle/contact-sharing   User JWT    Toggle isContactSharingEnabled
  GET   /api/user/qr                       User JWT    Get QR code data (URL + token)
  GET   /api/user/scanned                  User JWT    Get own scanned contacts (paginated)

6.5 WhatsApp Endpoints
-----------------------
  POST  /api/whatsapp/connect     Admin JWT   Initialize WhatsApp Web JS session
  POST  /api/whatsapp/disconnect  Admin JWT   Disconnect current session
  GET   /api/whatsapp/status      Admin JWT   Get current connection status


================================================================================
07. FRONTEND API MANAGER & SERVICES PATTERN
================================================================================

7.1 API Manager (api/apiManager.js)
-------------------------------------

  import axios from 'axios';

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor — attach JWT
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor — normalize errors
  api.interceptors.response.use(
    (res) => res.data,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(err.response?.data || err);
    }
  );

  export default api;

7.2 Endpoints Constants (api/endpoints.js)
--------------------------------------------

  export const AUTH_ENDPOINTS = {
    ADMIN_LOGIN: '/auth/admin/login',
    USER_LOGIN:  '/auth/user/login',
    REGISTER:    '/auth/register',
  };

  export const ADMIN_ENDPOINTS = {
    PROFILE:       '/admin/profile',
    USERS:         '/admin/users',
    USER_BY_ID:    (id) => `/admin/users/${id}`,
    APPROVE_USER:  (id) => `/admin/users/${id}/approve`,
    REJECT_USER:   (id) => `/admin/users/${id}/reject`,
    PENDING:       '/admin/pending',
    USER_SCANNED:  (id) => `/admin/users/${id}/scanned`,
  };

  export const USER_ENDPOINTS = {
    PROFILE:         '/user/profile',
    MESSAGE:         '/user/message',
    TOGGLE_ACTIVE:   '/user/toggle/active',
    TOGGLE_CONTACT:  '/user/toggle/contact-sharing',
    QR:              '/user/qr',
    SCANNED:         '/user/scanned',
  };

7.3 Service File Pattern (services/user.service.js)
-----------------------------------------------------

  import api from '../api/apiManager';
  import { USER_ENDPOINTS } from '../api/endpoints';

  export const getUserProfile = () =>
    api.get(USER_ENDPOINTS.PROFILE);

  export const updateUserProfile = (data) =>
    api.put(USER_ENDPOINTS.PROFILE, data);

  export const updateCustomMessage = (message) =>
    api.put(USER_ENDPOINTS.MESSAGE, { message });

  export const toggleActive = () =>
    api.put(USER_ENDPOINTS.TOGGLE_ACTIVE);

  export const toggleContactSharing = () =>
    api.put(USER_ENDPOINTS.TOGGLE_CONTACT);

  export const getUserQR = () =>
    api.get(USER_ENDPOINTS.QR);

  export const getScannedContacts = (params) =>
    api.get(USER_ENDPOINTS.SCANNED, { params });


================================================================================
08. NON-FUNCTIONAL REQUIREMENTS
================================================================================

8.1 Security
-------------
  - All passwords hashed with bcrypt (min 10 rounds)
  - JWT tokens signed with strong secret (min 32 chars)
  - Environment variables never committed to version control
  - MongoDB queries use parameterized inputs (Mongoose prevents injection)
  - CORS configured to whitelist only known frontend origins
  - Rate limiting on auth endpoints (max 10 attempts / 15 min per IP)
  - Helmet.js for HTTP security headers

8.2 Performance
----------------
  - MongoDB indexes on: User.mobile (unique), User.userToken (unique),
    ScannedContact.userId
  - Pagination enforced on all list endpoints (default: 20/page, max: 100)
  - WhatsApp Web JS runs in a background singleton — not per-request
  - Static files served via Express static middleware with caching headers

8.3 Scalability
----------------
  - Stateless JWT authentication allows horizontal scaling of Express servers
  - WhatsApp session is singleton per admin — designed for single admin use
  - Service layer separates business logic from controllers for easy testing
  - Environment-based configuration via .env files

8.4 Code Quality
-----------------
  - ESLint + Prettier enforced on both client and server
  - No Joi validator — use custom validation with express-validator
  - All async route handlers wrapped in try/catch with centralized error middleware
  - Modular imports — no circular dependencies
  - Naming: camelCase for JS, PascalCase for components, kebab-case for files


================================================================================
09. TECHNOLOGY STACK
================================================================================

9.1 Backend Dependencies
--------------------------
  express              Web framework
  mongoose             MongoDB ODM
  bcryptjs             Password hashing
  jsonwebtoken         JWT auth
  whatsapp-web.js      WhatsApp automation
  qrcode               Generate WhatsApp QR session code
  socket.io            Real-time QR delivery to admin UI
  multer               File upload handling
  express-validator    Input validation (no Joi)
  helmet               HTTP security headers
  cors                 CORS configuration
  express-rate-limit   Rate limiting
  dotenv               Environment variable loading
  winston              Structured logging
  uuid                 User token generation

9.2 Frontend Dependencies
---------------------------
  react + vite         UI framework + build tool
  react-router-dom     Client-side routing
  axios                HTTP client
  socket.io-client     Real-time WhatsApp QR display
  qrcode.react         Render user QR code on dashboard
  react-hot-toast      Toast notifications
  tailwindcss          Utility-first CSS styling


================================================================================
10. ENVIRONMENT VARIABLES & CONFIGURATION
================================================================================

10.1 Backend (.env)
--------------------
  PORT                Express server port (default: 5000)
  MONGO_URI           MongoDB connection string
  JWT_SECRET          JWT signing secret (min 32 chars)
  JWT_ADMIN_EXPIRY    Admin token expiry (e.g., 7d)
  JWT_USER_EXPIRY     User token expiry (e.g., 24h)
  CLIENT_URL          Frontend origin for CORS whitelist
  SESSION_PATH        Path to store WhatsApp session data
  UPLOAD_PATH         Path to store uploaded files

10.2 Frontend (.env)
---------------------
  VITE_API_BASE_URL   Backend API base URL (e.g., http://localhost:5000/api)
  VITE_SOCKET_URL     Socket.IO server URL


================================================================================
11. UI PAGES & SCREEN SUMMARY
================================================================================

11.1 Public Pages
------------------
  /login       Shared login page — role detected from JWT, redirect accordingly
  /register    User self-registration form: name, mobile, business, password,
               custom message

11.2 Admin Pages
-----------------
  /admin/dashboard              Overview: total users, pending count, WhatsApp status
  /admin/profile                Admin profile editor: name, email, mobile, password
  /admin/whatsapp               WhatsApp connection manager: QR code display, status
  /admin/users                  All users table with search, filter, actions
  /admin/pending                Pending approvals list with approve/reject buttons
  /admin/users/:id/scanned      Scanned contact history for a specific user

11.3 User Pages
----------------
  /user/dashboard    QR code display, token info, quick toggle cards
  /user/profile      Profile editor: name, mobile, business, password,
                     custom message with {name} variable hint
  /user/scanned      Paginated scanned contacts: scanner name, mobile, date


================================================================================
12. MESSAGE TEMPLATE & VARIABLE SYSTEM
================================================================================

12.1 Supported Variable
-------------------------
  {name}   Replaced at runtime with the scanner's WhatsApp display name

12.2 Example
-------------
  User-configured message:
    "Hi {name}! Thanks for connecting with Acme Corp. We've shared our
    contact — looking forward to working together!"

  After variable resolution (scanner name = 'Raj'):
    "Hi Raj! Thanks for connecting with Acme Corp. We've shared our
    contact — looking forward to working together!"

12.3 QR Code WhatsApp Deep Link Format
----------------------------------------
  https://wa.me/{ADMIN_MOBILE}?text=Please%20share%20the%20contact%20of%20
  {USER_NAME}%20-%20{BUSINESS_NAME}%20{USER_TOKEN}

  The backend token parser extracts USER_TOKEN from the incoming message
  using a split-on-last-word strategy, as the token is always the final
  segment of the pre-filled message.


================================================================================
13. ERROR HANDLING STRATEGY
================================================================================

13.1 Backend HTTP Status Code Mapping
---------------------------------------
  400 Bad Request          Validation errors, malformed input
  401 Unauthorized         Missing or invalid JWT token
  403 Forbidden            Valid token but insufficient role
  404 Not Found            Resource not found
  409 Conflict             Duplicate email/mobile/token
  422 Unprocessable        Business logic failure (e.g., user not approved)
  500 Internal Server Error  Unhandled exceptions, DB errors

13.2 Frontend Error Handling
------------------------------
  - Axios response interceptor normalizes all errors to { message, errors[] }
  - 401 responses automatically clear token and redirect to /login
  - Service functions return data/error pattern — pages handle both states
  - Toast notifications surface user-friendly error messages
  - Form-level validation errors displayed inline under each field


================================================================================
14. DEVELOPMENT MILESTONES
================================================================================

  Phase 1  |  Project Scaffolding
             Folder structure, DB connection, env config, base Express app,
             Vite + React setup

  Phase 2  |  Auth System
             Admin login, user login, registration, JWT middleware, role guards

  Phase 3  |  Admin Panel
             Profile management, user CRUD, approval workflow, pending list

  Phase 4  |  WhatsApp Integration
             whatsapp-web.js setup, QR delivery via Socket.IO, session persistence

  Phase 5  |  User Panel
             QR code page, toggle controls, scanned contacts log,
             custom message editor

  Phase 6  |  Core Bot Logic
             Incoming message handler, token parser, contact sharing,
             message sending, scan logging

  Phase 7  |  QA & Polish
             Error handling audit, mobile responsiveness, pagination,
             search, ESLint pass


================================================================================
END OF DOCUMENT
================================================================================