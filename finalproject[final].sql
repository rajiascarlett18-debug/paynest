DROP DATABASE IF EXISTS paynest_db;
CREATE DATABASE paynest_db;
USE paynest_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  trn VARCHAR(9) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bills (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,

  status ENUM('UNPAID', 'PAID') DEFAULT 'UNPAID',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_bills_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users 
ADD COLUMN role ENUM('USER','ADMIN') DEFAULT 'USER';

UPDATE users 
SET role = 'ADMIN'
WHERE email = 'rajiascarlett18@gmail.com';

INSERT INTO bills (user_id, name, amount, due_date, status)
VALUES
(2, 'JPS Electricity', 8500.00, '2027-02-10', 'UNPAID'),
(2, 'NWC Water', 3200.00, '2027-02-15', 'UNPAID'),
(2, 'Sagicor Loan', 12000.00, '2027-02-25', 'UNPAID'),
(2, 'Digicel Internet', 4800.00, '2027-02-20', 'UNPAID');

INSERT INTO bills (user_id, name, amount, due_date, status)
VALUES
(1, 'JPS Electricity', 8500.00, '2026-04-10', 'UNPAID');