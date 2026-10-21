USE gym_db;

-- 1. Active members and their plans (hidden members are not shown)
SELECT m.member_id, m.first_name, m.last_name, p.plan_name
FROM members m JOIN membership_plans p ON m.plan_id = p.plan_id
WHERE m.status = 'Active' AND m.is_hidden = 0;

-- 2. Add a new member (join_date is today)
INSERT INTO members (first_name, last_name, email, phone, plan_id, join_date, status)
VALUES ('Rosa', 'Cruz', 'rosa@email.com', '09181230007', 2, CURDATE(), 'Active');

-- 3. Change a member's plan and status
UPDATE members SET status = 'Active', plan_id = 3 WHERE member_id = 3;

-- 4. "Remove" a member = hide the record (nothing is deleted)
UPDATE members SET is_hidden = 1 WHERE email = 'rosa@email.com';
-- ...and unhide it
UPDATE members SET is_hidden = 0 WHERE email = 'rosa@email.com';

-- 5. Disable / enable a user account
UPDATE users SET is_active = 0 WHERE username = 'cashier';
UPDATE users SET is_active = 1 WHERE username = 'cashier';

-- 6. Members who are checked in right now
SELECT CONCAT(m.first_name,' ',m.last_name) AS member_name, a.check_in
FROM attendance a JOIN members m ON a.member_id = m.member_id
WHERE a.check_out IS NULL AND a.is_hidden = 0;

-- 7. Visits per active member
SELECT CONCAT(m.first_name,' ',m.last_name) AS member_name, COUNT(a.attendance_id) AS visits
FROM members m JOIN attendance a ON m.member_id = a.member_id
WHERE m.status = 'Active' AND m.is_hidden = 0 AND a.is_hidden = 0
GROUP BY m.member_id, member_name
ORDER BY visits DESC;

-- 8. Total paid per plan, with the receipt (reference) numbers of GCash / Card payments
SELECT p.plan_name, SUM(pay.amount) AS total_paid
FROM payments pay JOIN membership_plans p ON pay.plan_id = p.plan_id
WHERE pay.is_hidden = 0
GROUP BY p.plan_name ORDER BY total_paid DESC;

SELECT payment_id, method, reference_no FROM payments WHERE method IN ('GCash','Card');

-- 9. Bookings for a class
SELECT c.class_name, CONCAT(m.first_name,' ',m.last_name) AS member_name, e.booking_date, e.status
FROM class_enrollments e
JOIN classes c ON e.class_id = c.class_id
JOIN members m ON e.member_id = m.member_id
WHERE e.is_hidden = 0
ORDER BY e.booking_date;
