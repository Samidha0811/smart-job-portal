# Joblifies - Smart Job Portal 

**Joblifies** is a premium, AI-powered job portal designed to bridge the gap between talented job seekers and verified recruiters. Built with a focus on efficiency and modern aesthetics, it leverages the **AI API** to provide smart resume matching, ATS scoring, and personalized career mentoring.

---

## Key Features

### For Job Seekers
- **AI-Powered Keyword Screening**: Automatically matches your resume keywords with job requirements to provide a "Match Score."
- **ATS Resume Score Checker**: Upload your resume to get a professional ATS compatibility score and improvement tips.
- **Resume Builder**: A no-login, real-time resume builder with professional templates and PDF export functionality.
- **AI Career Mentor Chatbot**: A dedicated AI assistant to help with career advice, skill suggestions, and profile optimization.
- **Personalized Interview Prep**: Get AI-generated technical and HR interview questions tailored to the specific jobs you've applied for.
- **Application Tracking**: Real-time status updates (Pending, Shortlisted, Processing, Hold, Rejected) directly on your dashboard.

### For Recruiters
- **Post & Manage Jobs**: Easily create job listings with detailed requirements and keywords.
- **Applicant Screening**: Review applicants with at-a-glance skill matching and full profile views.
- **Verification Portal**: Professional profile verification to ensure a safe and trustworthy environment for candidates.
- **Applicant Status Management**: Streamlined workflow to shortlist or reject candidates with one click.

###  For Admins
- **Recruiter Verification**: Review and approve/reject recruiter registration requests to maintain platform integrity.
- **System Overview**: Monitor active recruiters, job seekers, and job applications across the platform.

---

## Technology Stack

- **Frontend**: EJS (Embedded JavaScript Templates), Vanilla CSS, Bootstrap 5, FontAwesome 6.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (using `mysql2`).
- **Artificial Intelligence**: Google Gemini API (`@google/generative-ai`).
- **File Handling**: Multer (for resume and document uploads).
- **PDF Generation**: Puppeteer (for resume exports) and PDF-Parse (for ATS checking).
- **Communication**: Nodemailer (for automated email notifications).
- **Authentication**: JWT (JSON Web Tokens), Bcrypt (password hashing), Cookie-Parser.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MySQL](https://www.mysql.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Samidha0811/smart-job-portal.git
cd smart-job-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
1. Create a MySQL database named `smart_job_portal`.
2. Import the database schema (refer to `config/db.js` for table structures or look for a `.sql` file in the repository).

### 4. Environment Configuration
Create a `.env` file in the root directory and add the following variables:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=smart_job_portal
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

### 5. Start the Application
Run in development mode (using nodemon):
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

---

## Project Structure

```text
├── config/             # Database & global configurations
├── controllers/        # Business logic for all routes
├── middleware/         # Auth & validation middleware
├── models/             # Database models & queries
├── public/             # Static assets (CSS, JS, Uploads, Images)
├── routes/             # Express API & Page routes
├── utils/              # Helper utilities (AI scoring, validation)
├── views/              # EJS templates (UI)
├── server.js           # Main application entry point
└── .env                # Environment variables (private)
```

---

## Contributing
Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.



---

*Built by Samidha Lahane .
