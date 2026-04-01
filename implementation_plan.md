# Smart Job Portal Implementation Plan

This project is a web-based platform for job seekers and recruiters with automated resume screening features.

## Project Flow & Architecture

### 1. User Roles
- **Job Seeker**: Register, login, upload resumes, apply for jobs.
- **Recruiter**: Register, login, post jobs, view applicants (auto-screened results).

### 2. Tech Stack
- **Frontend**: HTML5, CSS (Bootstrap 5), JavaScript (DOM Manipulation).
- **Backend**: Node.js (Express framework), EJS (Server-side rendering).
- **Database**: MySQL (using `mysql2` driver).
- **Tools**: Multer (File uploads), Bcrypt (Password hashing).

### 3. Data Flow
1. **User Input**: Forms on the frontend.
2. **Validation**: JS (Client) -> Express (Server).
3. **Storage**: MySQL Database.
4. **Screening**: Comparison of Job Keywords vs. Resume Content.

## Proposed Changes

### [Component] Project Structure
Organizing the codebase for scalability.

- [NEW] `server.js` (Entry point)
- [NEW] `views/` (EJS templates: home.ejs, login.ejs, register.ejs, jobs.ejs)
- [NEW] `public/` (Static assets: styles.css, script.js, images)
- [NEW] `routes/` (Express routes: auth.js, jobs.js, applications.js)
- [NEW] `config/` (Database configuration)
- [NEW] `uploads/` (Storage for resumes)

### [Component] Database Schema
- **users**: `id, username, email, password, role (seeker/recruiter)`
- **jobs**: `id, recruiter_id, title, description, keywords, salary`
- **applications**: `id, job_id, seeker_id, resume_path, match_score`

## Level-based Roadmap

### Level 1: Foundation (Beginner)
1. Initialize Express and set EJS as engine.
2. Create basic forms for registration.
3. Simple server-side logging of form data.

### Level 2: Styling & Interaction (Intermediate)
1. Add Bootstrap for professional UI.
2. Implement password strength validation in JS.
3. Use Fetch API for dynamic job list updates.

### Level 3: Database & Auth (Advanced)
1. Connect to MySQL.
2. Store users and jobs.
3. Implement Login/Logout functionality.

### Level 4: Intelligence (Expert)
1. File upload for Resumes.
2. **Keyword Screening Algorithm**: Simple text matching logic between resume content and job keywords.
3. Dashboard for recruiters to see ranked candidates.

## Verification Plan
1. **Manual Testing**: Walk through registration and job posting.
2. **Feature Validation**: Verify file uploads reach the `uploads/` folder.
3. **Auth Check**: Attempt to access recruiter pages as a seeker.
