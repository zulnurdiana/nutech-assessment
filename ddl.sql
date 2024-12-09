CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    balance DECIMAL(10, 2) DEFAULT 0 
);

CREATE TABLE service (
    id SERIAL PRIMARY KEY,
    service_code VARCHAR(50) NOT NULL UNIQUE, 
    service_name VARCHAR(255) NOT NULL,
    service_icon VARCHAR(255),
    service_tariff NUMBER(10,0)
);

CREATE TABLE banner (
    id SERIAL PRIMARY KEY,
    banner_name VARCHAR(255) NOT NULL, 
    banner_image VARCHAR(255), 
    description VARCHAR(255) 
);

CREATE TABLE transaction (
    id SERIAL PRIMARY KEY, 
    invoice_number VARCHAR(50) NOT NULL UNIQUE, 
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INT REFERENCES service(id), 
    transaction_type VARCHAR(20) NOT NULL, 
    total_amount DECIMAL(10, 2) NOT NULL,
    description TEXT, 
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);
