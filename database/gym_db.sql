DROP DATABASE IF EXISTS gym_db;
CREATE DATABASE gym_db;
USE gym_db;

-- Nothing is deleted: is_hidden = 1 hides a record, is_active = 0 disables a user

CREATE TABLE users (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,           -- scrypt hash
  role       ENUM('Admin','Staff') NOT NULL DEFAULT 'Staff',
  is_active  TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE membership_plans (
  plan_id        INT AUTO_INCREMENT PRIMARY KEY,
  plan_name      VARCHAR(50) NOT NULL,
  duration_days  INT NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  is_hidden      TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE trainers (
  trainer_id  INT AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(50) NOT NULL,
  last_name   VARCHAR(50) NOT NULL,
  specialty   VARCHAR(80),
  phone       VARCHAR(20),
  is_hidden   TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE members (
  member_id   INT AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(50) NOT NULL,
  last_name   VARCHAR(50) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  phone       VARCHAR(20),
  plan_id     INT,
  join_date   DATE NOT NULL,
  status      ENUM('Active','Expired','Suspended') NOT NULL DEFAULT 'Active',
  is_hidden   TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES membership_plans(plan_id)
);

CREATE TABLE classes (
  class_id    INT AUTO_INCREMENT PRIMARY KEY,
  class_name  VARCHAR(80) NOT NULL,
  trainer_id  INT NOT NULL,
  schedule    VARCHAR(80) NOT NULL,
  capacity    INT NOT NULL,
  is_hidden   TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);

CREATE TABLE payments (
  payment_id    INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL,
  plan_id       INT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  payment_date  DATE NOT NULL,
  method        ENUM('Cash','GCash','Card') NOT NULL,
  reference_no  VARCHAR(20) NULL UNIQUE,   -- receipt (GCash / Card)
  is_hidden     TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (member_id) REFERENCES members(member_id),
  FOREIGN KEY (plan_id)   REFERENCES membership_plans(plan_id)
);

CREATE TABLE attendance (
  attendance_id  INT AUTO_INCREMENT PRIMARY KEY,
  member_id      INT NOT NULL,
  check_in       DATETIME NOT NULL,
  check_out      DATETIME NULL,
  is_hidden      TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- Class bookings (junction table)
CREATE TABLE class_enrollments (
  enrollment_id  INT AUTO_INCREMENT PRIMARY KEY,
  class_id       INT NOT NULL,
  member_id      INT NOT NULL,
  booking_date   DATE NOT NULL,                       -- class day
  enrolled_date  DATE NOT NULL,                       -- booked on
  status         ENUM('Booked','Cancelled') NOT NULL DEFAULT 'Booked',
  is_hidden      TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE (class_id, member_id, booking_date),
  FOREIGN KEY (class_id)  REFERENCES classes(class_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

INSERT INTO users (username, password, role) VALUES
('admin', 'scrypt$68fec9538394015e188dac3fdc185a66$5d77724b7b59ea36a43ce5039f11cdf6485cad99519bddf482a27a7cf1820668562cdf02d47104207414cb38cbc8985b61759e8871497fb784c95a0ae4602a61', 'Admin'),
('staff', 'scrypt$79201aeff8d47802eb9bc13a425826a4$46fe03f9a4c0d09801bc101e5d62137548e73165a7ab54b7809575c1ee8a62df771d6e2e30eced4e7114412a1aec418a79d3900078af786e8e8d53550178e65a', 'Staff'),
('frontdesk', 'scrypt$35e2a0cd2b2034675772b69ad7e459db$c3cd747f868917b91ee15fd04bcfe2662159e8350196e88a6673f46022aef95ff0ab7f0948a88fd77816ebdb3185d9184d9e81638164d4fa333b47d22d514834', 'Staff'),
('cashier', 'scrypt$52b74a80fd4dcb93a89178b03b4da850$f42c5e59624988f7d909fe6139819b47204f72d901b7790cda8f4dd84af4f368365355a30c73a9aeaf92582dbec02f8c166444b4ee0b2be5af78ab6b2c008f09', 'Staff'),
('manager', 'scrypt$df7e66bb5c8f4866980f0f7b726cfca3$28bff45f313d82c71cfd7acfed46cf3ec763aeb0f71d745c3111198595ac35a7c4be4c0b2865a1fd479a77f82967cba70be12bc3335b24ba9072cd02237edf6c', 'Admin');

INSERT INTO membership_plans (plan_name, duration_days, price) VALUES
('Daily Pass', 1, 100.00),
('Monthly', 30, 1200.00),
('Quarterly', 90, 3200.00),
('Semi-Annual', 180, 6000.00),
('Annual', 365, 10500.00);

INSERT INTO trainers (first_name, last_name, specialty, phone) VALUES
('Marco', 'Dela Cruz', 'Weight Training', '09171110001'),
('Angela', 'Reyes', 'Yoga', '09171110002'),
('Joshua', 'Santos', 'Boxing', '09171110003'),
('Camille', 'Garcia', 'Zumba', '09171110004'),
('Rico', 'Mendoza', 'CrossFit', '09171110005');

INSERT INTO members (first_name, last_name, email, phone, plan_id, join_date, status) VALUES
('Juan', 'Dela Pena', 'juan@email.com', '09181230001', 2, '2026-09-01', 'Active'),
('Maria', 'Lopez', 'maria@email.com', '09181230002', 3, '2026-08-15', 'Active'),
('Pedro', 'Ramos', 'pedro@email.com', '09181230003', 2, '2026-07-10', 'Expired'),
('Ana', 'Villanueva', 'ana@email.com', '09181230004', 5, '2026-01-05', 'Active'),
('Carlo', 'Bautista', 'carlo@email.com', '09181230005', 4, '2026-06-20', 'Active'),
('Liza', 'Aquino', 'liza@email.com', '09181230006', 1, '2026-10-05', 'Suspended');

INSERT INTO classes (class_name, trainer_id, schedule, capacity) VALUES
('Morning Yoga', 2, 'Mon/Wed/Fri 6:00 AM', 15),
('Boxing Basics', 3, 'Tue/Thu 5:00 PM', 12),
('Zumba Party', 4, 'Sat 9:00 AM', 25),
('CrossFit WOD', 5, 'Mon-Fri 7:00 AM', 10),
('Strength 101', 1, 'Tue/Thu 6:00 PM', 20);

INSERT INTO payments (member_id, plan_id, amount, payment_date, method, reference_no) VALUES
(1, 2, 1200.00, '2026-09-01', 'Cash', NULL),
(2, 3, 3200.00, '2026-08-15', 'GCash', '4829173650284'),
(3, 2, 1200.00, '2026-07-10', 'Cash', NULL),
(4, 5, 10500.00, '2026-01-05', 'Card', 'AP7731905'),
(5, 4, 6000.00, '2026-06-20', 'GCash', '3917462850193'),
(6, 1, 100.00, '2026-10-05', 'Cash', NULL);

-- Sample attendance
INSERT INTO attendance (member_id, check_in, check_out) VALUES
(1, '2026-10-05 06:10:00', '2026-10-05 07:30:00'),
(1, '2026-10-07 06:05:00', '2026-10-07 07:20:00'),
(2, '2026-10-06 17:00:00', '2026-10-06 18:30:00'),
(4, '2026-10-06 07:00:00', '2026-10-06 08:15:00'),
(4, '2026-10-08 07:10:00', '2026-10-08 08:00:00'),
(5, '2026-10-08 18:00:00', '2026-10-08 19:10:00'),
(1, '2026-10-09 06:00:00', '2026-10-09 07:15:00'),
(2, '2026-10-09 17:15:00', '2026-10-09 18:20:00');

-- Sample bookings
INSERT INTO class_enrollments (class_id, member_id, booking_date, enrolled_date, status) VALUES
(1, 1, '2026-10-19', '2026-09-02', 'Booked'),
(1, 2, '2026-10-21', '2026-08-16', 'Booked'),
(2, 1, '2026-10-20', '2026-09-03', 'Booked'),
(3, 4, '2026-10-24', '2026-01-10', 'Booked'),
(4, 5, '2026-10-19', '2026-06-22', 'Booked'),
(5, 2, '2026-10-20', '2026-08-20', 'Booked'),
(2, 5, '2026-10-22', '2026-06-25', 'Booked');
