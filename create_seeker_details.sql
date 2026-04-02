CREATE TABLE IF NOT EXISTS seeker_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone_number VARCHAR(20),
    bio TEXT,
    education TEXT,
    experience_years INT,
    skills TEXT,
    resume_data LONGBLOB,
    resume_mimetype VARCHAR(100),
    resume_filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
