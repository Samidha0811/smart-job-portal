# Implementation Plan: Recruiter Workflow and Dashboard

Implement a complete workflow for recruiters, including company profile creation, admin-enforced job posting restrictions, and a specialized recruiter dashboard.

## Proposed Changes

### Backend Implementation

#### [NEW] [recruiter.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/recruiter.js)
Handles recruiter-specific operations.
- `POST /api/recruiter/profile`: Create/Update company profile.
- `POST /api/recruiter/post-job`: Create new job posting (check status == 'approved').
- `GET /recruiter/applicants`: View applicants for the recruiter's jobs.

#### [MODIFY] [auth.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/auth.js)
- Update login redirect: If user is a recruiter, redirect to `/recruiter/dashboard` instead of showing a simple message.

#### [MODIFY] [pages.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/pages.js)
Add recruiter-specific view routes.
- `GET /recruiter/dashboard`: Render the main dashboard.
- `GET /recruiter/create-profile`: Render profile creation page.
- `GET /recruiter/post-job`: Render job posting form.

#### [MODIFY] [server.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/server.js)
- Import and use `recruiterRoutes`.

---

### Frontend Views

#### [NEW] [create-profile.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/create-profile.ejs)
- Form to collect company name, bio, and website.

#### [NEW] [recruiter-dashboard.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/recruiter-dashboard.ejs)
- Displays current status (PENDING/APPROVED).
- Shows "Post Job" button (disabled if PENDING).
- Lists current job postings and total applicants.

#### [NEW] [post-job.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/post-job.ejs)
- Form to post a new job.

---

## Verification Plan

### Automated Tests
- Run integration tests to ensure profile creation works.
- Verify job posting fails if the user status is 'pending'.

### Manual Verification
1. Register a new Recruiter.
2. Log in and be redirected to the dashboard.
3. Create a Company Profile.
4. Verify "Post Job" is disabled while status is 'PENDING'.
5. Approve the recruiter from the Admin Dashboard.
6. Verify "Post Job" becomes available.
7. Post a job and verify it appears in the job list.
