-- ResolveIT Database Schema
-- Online Complaint and Grievance Management System

-- Create Database
CREATE DATABASE IF NOT EXISTS resolveit_db;
USE resolveit_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role ENUM('USER', 'ADMIN', 'SUPER_ADMIN') DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('NEW', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED') DEFAULT 'NEW',
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_email VARCHAR(100),
    assigned_to BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

-- Complaint Timeline Table
CREATE TABLE IF NOT EXISTS complaint_timeline (
    timeline_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    updated_by BIGINT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_timestamp (timestamp)
);

-- Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    attachment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    INDEX idx_complaint_id (complaint_id)
);

-- Escalations Table
CREATE TABLE IF NOT EXISTS escalations (
    escalation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    escalated_from BIGINT NULL,
    escalated_to BIGINT NULL,
    escalation_reason TEXT,
    escalation_level INT DEFAULT 1,
    is_resolved BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (escalated_from) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (escalated_to) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_is_resolved (is_resolved)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    complaint_id BIGINT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type ENUM('STATUS_UPDATE', 'ESCALATION', 'ASSIGNMENT', 'RESOLUTION', 'COMMENT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Categories Table (Predefined complaint categories)
CREATE TABLE IF NOT EXISTS categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Categories
INSERT INTO categories (category_name, description) VALUES
('Infrastructure', 'Issues related to buildings, facilities, and infrastructure'),
('Academic', 'Academic-related complaints and grievances'),
('Administrative', 'Administrative process and service issues'),
('Harassment', 'Harassment and discrimination complaints'),
('IT Services', 'Information technology and system issues'),
('Hostel', 'Hostel and accommodation related issues'),
('Library', 'Library services and resources'),
('Canteen', 'Food and canteen services'),
('Transport', 'Transportation and vehicle services'),
('Other', 'Other miscellaneous complaints');

-- Insert Default Admin User (password: admin123)
-- Note: In production, use properly hashed passwords
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@resolveit.com', '$2a$10$xQVDKZ9YxJYxKZxKZxKZxO', 'System Administrator', 'SUPER_ADMIN');

-- Create Views for Analytics

-- Complaint Statistics View
CREATE OR REPLACE VIEW complaint_statistics AS
SELECT 
    category,
    status,
    priority,
    COUNT(*) as count,
    AVG(TIMESTAMPDIFF(HOUR, created_at, COALESCE(resolved_at, NOW()))) as avg_resolution_hours
FROM complaints
GROUP BY category, status, priority;

-- Monthly Complaint Trends View
CREATE OR REPLACE VIEW monthly_complaint_trends AS
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month,
    category,
    COUNT(*) as complaint_count,
    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_count
FROM complaints
GROUP BY DATE_FORMAT(created_at, '%Y-%m'), category
ORDER BY month DESC;

-- User Complaint Summary View
CREATE OR REPLACE VIEW user_complaint_summary AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(c.complaint_id) as total_complaints,
    SUM(CASE WHEN c.status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_complaints,
    SUM(CASE WHEN c.status = 'NEW' THEN 1 ELSE 0 END) as pending_complaints
FROM users u
LEFT JOIN complaints c ON u.user_id = c.user_id
WHERE u.role = 'USER'
GROUP BY u.user_id, u.username, u.email;
