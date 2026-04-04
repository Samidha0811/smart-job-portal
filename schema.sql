-- Create Database
CREATE DATABASE IF NOT EXISTS smart_job_portal;
USE smart_job_portal;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('seeker', 'recruiter', 'admin') DEFAULT 'seeker',
    status ENUM('guest', 'pending', 'approved', 'active', 'rejected') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table (For additional details)
CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bio TEXT,
    company_name VARCHAR(255),
    website VARCHAR(255),
    resume_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(50) UNIQUE,
    recruiter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT,
    location VARCHAR(255),
    experience_required INT DEFAULT 0,
    salary VARCHAR(100),
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    seeker_id INT NOT NULL,
    resume_path VARCHAR(255),
    match_score INT DEFAULT 0,
    status ENUM('pending', 'shortlisted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert initial Admin (Manually for now - change email/pass as needed)
-- Note: Replace 'admin123' with a hashed password later in the app's setup
-- INSERT INTO users (fullname, email, password, role, status) 
-- VALUES ('Super Admin', 'admin@jobportal.com', '$2b$10$YourHashedPasswordHere', 'admin', 'active');
