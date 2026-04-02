-- Migration script to add 'guest' to the status ENUM
ALTER TABLE users MODIFY COLUMN status ENUM('guest', 'pending', 'approved', 'active', 'rejected') DEFAULT 'active';
