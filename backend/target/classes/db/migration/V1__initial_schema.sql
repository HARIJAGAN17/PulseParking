-- 1. Roles table
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);

INSERT INTO roles (id, description) VALUES
    ('ROLE_EMPLOYEE', 'Standard employee with view-only parking access'),
    ('ROLE_VALET', 'Valet operator who assigns and releases vehicles'),
    ('ROLE_ADMIN', 'System administrator with full configuration and approval privileges');

-- 2. Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    plate_raw VARCHAR(30),
    plate_normalized VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_user_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DISABLED'))
);

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_plate_norm ON users(plate_normalized);

-- 3. User Roles join table
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Buildings table
CREATE TABLE buildings (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_buildings_code UNIQUE (code)
);

-- 5. Parking Areas (Floors / Levels) table
CREATE TABLE parking_areas (
    id UUID PRIMARY KEY,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    level_code VARCHAR(20) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_building_level UNIQUE (building_id, level_code)
);

CREATE INDEX idx_parking_areas_bld ON parking_areas(building_id, display_order);

-- 6. Parking Spaces table
CREATE TABLE parking_spaces (
    id UUID PRIMARY KEY,
    parking_area_id UUID NOT NULL REFERENCES parking_areas(id) ON DELETE RESTRICT,
    space_label VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_area_space_label UNIQUE (parking_area_id, space_label),
    CONSTRAINT chk_space_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'OUT_OF_SERVICE'))
);

CREATE INDEX idx_parking_spaces_area ON parking_spaces(parking_area_id, status);

-- 7. Parking Assignments table
CREATE TABLE parking_assignments (
    id UUID PRIMARY KEY,
    space_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE RESTRICT,
    employee_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    valet_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    plate_raw VARCHAR(30) NOT NULL,
    plate_normalized VARCHAR(30) NOT NULL,
    is_guest BOOLEAN NOT NULL DEFAULT FALSE,
    guest_note VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    origin VARCHAR(20) NOT NULL DEFAULT 'VALET',
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT chk_assignment_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_assignment_origin CHECK (origin IN ('VALET', 'SIMULATION'))
);

-- Indexes for Concurrency & Integrity Lookups
CREATE INDEX idx_act_assign_space ON parking_assignments (space_id, status);
CREATE INDEX idx_act_assign_plate ON parking_assignments (plate_normalized, status);
CREATE INDEX idx_act_assign_emp ON parking_assignments (employee_id, status);

CREATE INDEX idx_assign_space ON parking_assignments(space_id, status);
CREATE INDEX idx_assign_emp ON parking_assignments(employee_id, status);
CREATE INDEX idx_assign_time ON parking_assignments(assigned_at);

-- 8. Occupancy Events table
CREATE TABLE occupancy_events (
    id UUID PRIMARY KEY,
    space_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE RESTRICT,
    assignment_id UUID REFERENCES parking_assignments(id) ON DELETE SET NULL,
    previous_status VARCHAR(30) NOT NULL,
    new_status VARCHAR(30) NOT NULL,
    origin VARCHAR(20) NOT NULL DEFAULT 'VALET',
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT chk_occ_origin CHECK (origin IN ('VALET', 'SIMULATION', 'SYSTEM'))
);

CREATE INDEX idx_occ_space_time ON occupancy_events(space_id, recorded_at);
CREATE INDEX idx_occ_origin_time ON occupancy_events(origin, recorded_at);

-- 9. Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id, created_at);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at);

