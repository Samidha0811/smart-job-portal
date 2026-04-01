# [Goal Description]
Enable job seekers to browse and apply for jobs, and allow recruiters to manage applications and update their status.

## User Review Required
- **Resume Upload**: For now, we will handle `resume_path` as a simple string (mocking the upload or using a URL) unless the user wants a full file upload system now.
- **Application Statuses**: Using the existing enum: `pending`, `shortlisted`, `rejected`.

## Proposed Changes

### [Backend API]

#### [NEW] [seeker.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/seeker.js)
- `GET /api/seeker/jobs`: Fetch all jobs marked as 'open'.
- `POST /api/seeker/apply/:jobId`: Allow a 'seeker' role user to apply.
- `GET /api/seeker/my-applications`: Retrieve applications for the current user.

#### [MODIFY] [recruiter.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/recruiter.js)
- `PATCH /api/recruiter/applications/:applicationId/status`: Allow status updates.
- `GET /api/recruiter/applications`: Fetch all applications across all jobs posted by the recruiter.

#### [MODIFY] [server.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/server.js)
- Import and use `seekerRoutes`.

### [Frontend Views]

#### [MODIFY] [jobs.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/jobs.ejs)
- Dynamic job listing using `apiService.getJobs()`.
- "Apply" button integration.

#### [NEW] [seeker-dashboard.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/seeker-dashboard.ejs)
- Seeker summary: Profile and Jobs Applied.

#### [MODIFY] [recruiter-dashboard.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/recruiter-dashboard.ejs)
- Add "Manage Applicants" tab/section.

### [Core JS]

#### [MODIFY] [apiService.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/public/js/apiService.js)
- `getJobs()`, `applyToJob()`, `getMyApplications()`, `updateApplicationStatus()`.

## Verification Plan

### Automated Tests
- None planned for this phase.

### Manual Verification
1. Register as **Seeker**.
2. Visit `/jobs`.
3. Apply for a job posted by **Recruiter**.
4. Log in as **Recruiter**, view applicants.
5. Update status to **Shortlisted**.
6. Log in back as **Seeker**, verify status update in dashboard.
