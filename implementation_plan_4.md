# Implementation Plan: JWT Authentication and Security

Implement secure, token-based authentication using JSON Web Tokens (JWT) and HttpOnly cookies to protect recruiter and admin routes.

## Proposed Changes

### Configuration & Setup

- Install `jsonwebtoken` and `cookie-parser`.
- Add `JWT_SECRET=your_super_secret_key_here` to [.env](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/.env).

### Backend Implementation

#### [NEW] [auth.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/middleware/auth.js)
Create a middleware to verify JWT from cookies.
- Check for `token` cookie.
- Verify token with `JWT_SECRET`.
- Attach `user` to `req` object if valid.
- Redirect to `/login` if invalid or missing, with an error message.

#### [MODIFY] [auth.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/auth.js)
Update login and logout logic.
- **Login**: On success, generate a JWT (payload: {id, role}) and set it as an `HttpOnly` cookie.
- **Logout**: Clear the `token` cookie.
- **Registration**: Keep as is.

#### [MODIFY] [admin.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/admin.js) & [recruiter.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/recruiter.js)
- Import `auth` middleware.
- Apply middleware to all routes (Except any explicitly public ones).
- For [admin.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/admin.js), also verify `req.user.role === 'admin'`.
- For [recruiter.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/recruiter.js), also verify `req.user.role === 'recruiter'`.

#### [MODIFY] [server.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/server.js)
- Import and use `cookie-parser`.

---

### Frontend Updates

- The transition to cookies means the frontend doesn't need to manually attach tokens to headers.
- Update [apiService.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/public/js/apiService.js) to handle 401/403 responses by redirecting to `/login`.
- Remove manual `userId` passing in query parameters.

---

## Verification Plan

### Automated Tests
- Test login API to verify `Set-Cookie` header is present.
- Test protected routes without a cookie to verify 401/redirect.
- Test protected routes with a valid cookie.

### Manual Verification
1. Login as Admin and try to access `/recruiter/dashboard` (should be blocked if role is strictly checked).
2. Login as Recruiter and try to access `/admin` (should be blocked).
3. Try to access `/recruiter/dashboard` directly in an incognito window without logging in (should redirect to `/login`).
