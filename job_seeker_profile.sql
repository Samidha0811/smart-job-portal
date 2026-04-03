-- Job Seeker Profile Normalized Schema

USE smart_job_portal;

-- 1. Main Job Seeker Profile Table
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    current_job_title VARCHAR(255),
    current_company VARCHAR(255),
    total_experience_years INT DEFAULT 0,
    total_experience_months INT DEFAULT 0,
    industry VARCHAR(100),
    functional_area VARCHAR(100),
    resume_path VARCHAR(255),
    profile_summary TEXT,
    preferred_location VARCHAR(255),
    expected_salary VARCHAR(100),
    job_type ENUM('Full-time', 'Remote', 'Internship', 'Contract') DEFAULT 'Full-time',
    desired_role VARCHAR(100),
    preferred_industry VARCHAR(100),
    shift_preference ENUM('Day', 'Night', 'Flexible') DEFAULT 'Flexible',
    actively_looking BOOLEAN DEFAULT TRUE,
    profile_visibility ENUM('Public', 'Private') DEFAULT 'Public',
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Education Table
CREATE TABLE IF NOT EXISTS seeker_education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    degree VARCHAR(255) NOT NULL,
    college VARCHAR(255) NOT NULL,
    graduation_year INT,
    specialization VARCHAR(255),
    FOREIGN KEY (profile_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE
);

-- 3. Work Experience Table
CREATE TABLE IF NOT EXISTS seeker_experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    responsibilities TEXT,
    FOREIGN KEY (profile_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE
);

-- 4. Skills Table
CREATE TABLE IF NOT EXISTS seeker_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('Beginner', 'Intermediate', 'Expert') DEFAULT 'Intermediate',
    FOREIGN KEY (profile_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE
);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS seeker_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies_used VARCHAR(255),
    FOREIGN KEY (profile_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE
);

-- 6. Languages Table
CREATE TABLE IF NOT EXISTS seeker_languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    language VARCHAR(100) NOT NULL,
    proficiency ENUM('Basic', 'Conversational', 'Fluent', 'Native') DEFAULT 'Conversational',
    FOREIGN KEY (profile_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE
);

-- 7. Certifications Table
CREATE TABLE IF NOT EXISTS seeker_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    certification_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    FOREIGN KEY (profile_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE
);
