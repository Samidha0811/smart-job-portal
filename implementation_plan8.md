# Recruiter Registration Flow Implementation Plan

This plan outlines the steps to implement a specialized registration flow for recruiters, including detailed company information collection, document uploads for verification, and an admin approval system.

## Proposed Changes

### Database
Update the database to store recruiter-specific details and verification document paths.

#### [NEW] recruiter_details
- `id` (PK)
- `user_id` (FK to users)
- `company_name`, `company_email`, `company_website`, `company_description`, `industry`
- `address_line`, `city`, `state`, `country`, `pincode`
- `full_name`, `contact_number`, `designation`
- `registration_cert_no`, `registration_cert_url`
- `gst_number`, `gst_doc_url`
- `pan_number`, `pan_doc_url`
- `company_size`, `linkedin_profile`, `years_in_business`
- `status` (pending, approved, rejected)
- `created_at`

---

### Frontend
Modify the existing registration page and create a new specialized form for recruiters.

#### [MODIFY] [register.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/register.ejs)
- Update registration logic: if "Recruiter" is selected, redirect to `/recruiter/register-details` after initial account creation.
- Add client-side logic to handle the redirection.

#### [NEW] [recruiter-register-details.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/recruiter-register-details.ejs)
- Multi-section form:
  1. Company Information
  2. Company Address
  3. Personal Info
  4. Verification Documents (File Uploads)
  5. Additional Info

---

### Backend
Implement the APIs to handle the detailed registration and file uploads.

#### [MODIFY] [auth.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/auth.js)
- Update `/register` response to indicate if further steps are needed (for recruiters).

#### [NEW] [recruiter.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/recruiter.js) (or update existing)
- Add POST `/register-details` route.
- Integrate `multer` for handling document uploads.
- Save details to `recruiter_details` table.
- Set user status to `pending`.

---

### Admin Panel
Update the admin interface to manage the new recruiter verification process.

#### [MODIFY] [admin.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/admin.js)
- Add route to fetch pending recruiter requests.
- Add route to fetch specific recruiter details and documents.
- Add routes for [approve](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/public/js/apiService.js#37-45) and [reject](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/public/js/apiService.js#46-54) actions.

#### [NEW] [admin-recruiter-review.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/admin-recruiter-review.ejs)
- Detail view for admin to review all submitted recruiter information and documents.
- Action buttons for Approval and Rejection.

## Verification Plan

### Automated Tests
- N/A (Manual verification via browser tool preferred for UI flow)

### Manual Verification
1. Register as a **Seeker**: Verify they are redirected to login/dashboard as usual.
2. Register as a **Recruiter**:
   - Verify redirection to the Recruiter Details form.
   - Fill all details and upload files.
   - Verify submission success and "Pending" status message.
3. Login as **Admin**:
   - Navigate to the pending recruiters list.
   - Click "View Details" to see the full recruiter profile and uploaded documents.
   - Click "Approve": Verify recruiter status changes to "active" and they can log in.
   - Click "Reject": Verify recruiter status changes to "rejected".
