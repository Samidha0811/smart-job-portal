# Implementation Plan - Create Resume Feature

This plan outlines the steps to build a real-time resume builder with PDF download functionality using Puppeteer.

## User Review Required

> [!IMPORTANT]
> The PDF generation will use **Puppeteer**, which requires a headless browser. This might increase the initial installation time and memory usage on the server.
> 
> The "Generate with AI" button will be UI-only as requested.

## Proposed Changes

### Dependencies
- Install `puppeteer` via npm.

### Backend (Node.js/Express)

#### [NEW] [resume.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/routes/resume.js)
- `GET /resume-builder`: Renders the `resume-builder.ejs` page.
- `POST /download-resume`: Receives HTML content from the frontend, uses Puppeteer to convert it to a PDF, and sends the file back.

#### [MODIFY] [server.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/server.js)
- Register the new `resume.js` route.

### Frontend (EJS/HTML/CSS/JS)

#### [MODIFY] [index.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/index.ejs)
- Add a "Create Resume" button above the "AI Screening" card in the hero section.

#### [NEW] [resume-builder.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/resume-builder.ejs)
- Main layout: Left column for forms, Right column for live preview.
- Bootstrap-based responsive design.

#### [NEW] [resume-preview.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/partials/resume-preview.ejs)
- A clean, ATS-friendly resume template. Used in the live preview and potentially for PDF rendering.

#### [NEW] [resume.css](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/public/css/resume.css)
- Professional styling for the resume builder and the resume template.
- Print-specific styles for PDF generation.

#### [NEW] [resume.js](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/public/js/resume.js)
- Real-time event listeners for form inputs.
- Dynamic addition/removal of Projects and Skills (tag UI).
- POST request to `/download-resume` to fetch the generated PDF.

## Verification Plan

### Manual Verification
1.  Navigate to `/resume-builder`.
2.  Fill in personal info and education.
3.  Add multiple projects and skills.
4.  Verify that the preview updates in real-time.
5.  Click "Download Resume" and verify the generated PDF layout matches the preview.
6.  Test responsiveness on mobile view (stacking columns).
