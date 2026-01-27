-- ddl_reset.sql
-- Drop & recreate tables

DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS user_types CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE departments (
        department_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        department_name VARCHAR(120) NOT NULL,
        description TEXT,
        status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User types table
CREATE TABLE user_types (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Roles table
CREATE TABLE roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        role_name VARCHAR(100) NOT NULL UNIQUE,
        permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Accounts table
CREATE TABLE accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        fullname VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
        user_type_id UUID REFERENCES user_types(id) ON DELETE SET NULL,
        role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed default user types
INSERT INTO user_types (type_name, description) VALUES
    ('Employee','Regular employee'),
    ('Manager','Department manager'),
    ('HR','Human Resources'),
    ('Admin','System administrator'),
    ('Client','External client');

-- Seed default roles with correct JSONB permissions
INSERT INTO roles (role_name, permissions) VALUES
    ('SUPER_ADMIN', '[
            "accounts:create","accounts:read","accounts:update","accounts:disable",
            "accounts:delete","departments:create","departments:get","departments:get:id",
            "departments:update","departments:delete","departments:patch:status",
            "roles:create","roles:read","roles:update","roles:delete","user_types:create",
            "user_types:read","user_types:update","user_types:delete"
    ]'::jsonb),
    ('ADMIN', '[
            "accounts:create","accounts:read","accounts:update","accounts:disable","accounts:delete",
            "departments:create","departments:get","departments:update", "departments:get:id"
    ]'::jsonb),
    ('MANAGER', '[
            "accounts:create:own-dept","accounts:read:own-dept","accounts:update:own-dept",
            "accounts:delete:own-dept","accounts:disable:own-dept","departments:get", "departments:get:id"
    ]'::jsonb),
    ('HR', '[
            "accounts:read","accounts:update","departments:get", "departments:get:id"
    ]'::jsonb),
    ('EMPLOYEE', '[
            "accounts:read_own", "departments:get", "departments:get:id"
    ]'::jsonb),
    ('CLIENT', '[
            "client:access","accounts:read_own", "departments:get", "departments:get:id"
    ]'::jsonb);

-- Seed default department
INSERT INTO departments (department_name, description, status) VALUES
    ('General', 'Default department', 'active');
