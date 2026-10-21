// Class bookings
const createCrudController = require('./crudController');
const db = require('../config/db');
const Validators = require('../public/js/validators');

module.exports = createCrudController({
  table: 'class_enrollments', pk: 'enrollment_id',
  fields: ['class_id', 'member_id', 'booking_date'],
  required: ['class_id', 'member_id', 'booking_date'],
  labels: { booking_date: 'Booking date' },
  rules: { booking_date: 'bookingDate' },  // today to 30 days ahead
  autoToday: ['enrolled_date'],
  statuses: ['Booked', 'Cancelled'],
  noEdit: true,  // cancel and rebook instead
  dupMessage: 'This member already booked this class on that date.',
  list: `SELECT e.*, c.class_name, c.schedule, CONCAT(m.first_name,' ',m.last_name) AS member_name
         FROM class_enrollments e
         JOIN classes c ON e.class_id = c.class_id
         JOIN members m ON e.member_id = m.member_id`,
  search: ['c.class_name', 'm.first_name', 'm.last_name'],
  order: 'e.booking_date DESC, e.enrollment_id DESC',
  filter: 'e.status',
  hiddenCol: 'e.is_hidden',
  validate: async d => {
    const [members] = await db.query('SELECT status FROM members WHERE member_id = ? AND is_hidden = 0', [d.member_id]);
    if (members.length === 0) return 'Please choose a valid member.';
    if (members[0].status !== 'Active') return 'Only members with an Active membership can book a class.';

    const [classes] = await db.query('SELECT schedule, capacity FROM classes WHERE class_id = ? AND is_hidden = 0', [d.class_id]);
    if (classes.length === 0) return 'Please choose a valid class.';

    // Class runs on that day
    const days = Validators.scheduleDays(classes[0].schedule);
    const weekday = Validators.weekdayOf(String(d.booking_date));
    if (days.length && !days.includes(weekday)) {
      const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return 'This class only runs on ' + days.map(i => names[i]).join(', ') + '. Pick one of those days.';
    }

    // Class has room
    const [[count]] = await db.query(
      `SELECT COUNT(*) AS booked FROM class_enrollments
       WHERE class_id = ? AND booking_date = ? AND status = 'Booked' AND is_hidden = 0`,
      [d.class_id, d.booking_date]);
    if (count.booked >= classes[0].capacity) return 'This class is already full on that date.';
    return null;
  }
});
