-- Sample Agency Accounts
-- Use these credentials to login as agency

INSERT INTO agencies (name, type, email, password, phone, address, status) 
VALUES 
  ('Police Station 1', 'police', 'police@test.com', 'password123', '555-0100', 'City Center', 'active'),
  ('Ambulance Service 1', 'ambulance', 'ambulance@test.com', 'password123', '555-0200', 'Medical District', 'active'),
  ('Fire Department 1', 'fire', 'fire@test.com', 'password123', '555-0300', 'Fire Station Road', 'active')
ON CONFLICT DO NOTHING;
