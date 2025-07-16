-- backend/database.sql

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                             );

-- Add a function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update the updated_at column for users table
CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
                     FOR EACH ROW
                     EXECUTE FUNCTION update_updated_at_column();


-- Create the products table
CREATE TABLE IF NOT EXISTS products (
                                        id SERIAL PRIMARY KEY,
                                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- e.g., 'Electronics', 'Home Appliance', 'Tool'
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    warranty_expiry_date DATE,
    model_number VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE, -- Unique if applicable, otherwise remove UNIQUE
    location_in_house VARCHAR(100), -- e.g., 'Kitchen', 'Living Room', 'Garage'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                                                                                          );

-- Add triggers to update the updated_at column for products table
CREATE OR REPLACE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
                  FOR EACH ROW
                  EXECUTE FUNCTION update_updated_at_column();