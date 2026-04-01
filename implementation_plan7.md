# Fix Back Button After Logout Issue

The user reports that after logging out, clicking the browser's back button allows them to see the dashboard (or a cached version of it). We need to prevent browser caching for protected routes and ensure the logout process is robust.

## Proposed Changes

### Cache-Control Headers
We will add a middleware to set `Cache-Control: no-cache, no-store, must-revalidate` for all protected routes. This ensures that the browser always checks with the server when the user navigate back.

#### [MODIFY] [server.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/server.js)
- Add a global or conditional middleware to set cache headers.

### Logout Logic
Refine the logout route to ensure it clear the `token` cookie and redirects to the login page.

#### [MODIFY] [routes/auth.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/auth.js)
- Ensure `res.clearCookie('token')` is handled correctly.

### Route Protection Middleware
Verify that [middleware/auth.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/middleware/auth.js) is correctly applied to all dashboard/protected routes.

#### [MODIFY] [middleware/auth.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/middleware/auth.js)
- Optionally add `Cache-Control` headers directly in the auth middleware to target protected routes specifically.

## Verification Plan

### Manual Verification
1. Login as Admin.
2. Navigate to the Admin Dashboard.
3. Logout via the "Logout" button.
4. Click the browser's "Back" button.
5. Verify that the user is redirected to the login page and NOT shown the dashboard.
