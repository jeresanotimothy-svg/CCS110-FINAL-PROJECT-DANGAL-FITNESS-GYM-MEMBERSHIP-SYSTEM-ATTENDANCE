// Manage page settings
//   roles: who opens the page | canAdd / canEdit / canHide: who sees the buttons
//   statuses: status dropdown | sort: Sort menu | rule: input rule (validators.js)
const ADMIN = ['Admin'];
const MODULES = {
  members: {
    icon: 'bi-people-fill', title: 'Members', pk: 'member_id', roles: 'all', canAdd: 'all', canEdit: ADMIN, canHide: ADMIN,
    filter: ['Active', 'Expired', 'Suspended'], filterLabel: 'All statuses',
    statuses: ['Active', 'Expired', 'Suspended'], note: 'The join date is set to today automatically.',
    sort: { default: ['id', 'desc'],
            options: [['name', 'First name', 'text'], ['lastname', 'Last name', 'text'], ['email', 'Email', 'text'], ['plan', 'Plan', 'text'],
                       ['status', 'Status', 'text'], ['joined', 'Date joined', 'date'], ['id', 'Newest added', 'date']] },
    columns: [['member_id', 'ID'], ['first_name', 'First Name'], ['last_name', 'Last Name'],
              ['email', 'Email'], ['plan_name', 'Plan'], ['join_date', 'Joined'],
              ['status', 'Status', 'status']],
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true, rule: 'name', hint: 'Letters only.' },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true, rule: 'name', hint: 'Letters only.' },
      { name: 'email', label: 'Email', type: 'email', required: true, rule: 'email', hint: 'Example: name@email.com' },
      { name: 'phone', label: 'Mobile Number', type: 'tel', required: true, rule: 'phone', hint: 'Example: 09171234567' },
      { name: 'plan_id', label: 'Membership Plan', type: 'select', required: true, from: 'plans', value: 'plan_id', text: ['plan_name'] },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'Expired', 'Suspended'] }
    ]
  },
  attendance: {
    icon: 'bi-calendar-check-fill', title: 'Attendance', pk: 'attendance_id', roles: 'all', canHide: ADMIN, board: true,
    sort: { default: ['checkin', 'desc'],
            options: [['member', 'Member name', 'text'], ['checkin', 'Check-in time', 'date'], ['checkout', 'Check-out time', 'date']] },
    columns: [['attendance_id', 'ID'], ['member_name', 'Member'], ['check_in', 'Check-In'], ['check_out', 'Check-Out', 'checkout']],
    fields: []
  },
  payments: {
    icon: 'bi-cash-coin', title: 'Payments', pk: 'payment_id', roles: 'all', canAdd: 'all', canEdit: ADMIN, canHide: ADMIN,
    filter: ['Cash', 'GCash', 'Card'], filterLabel: 'All methods',
    note: 'The payment date is set to today automatically. GCash and Card payments need a reference number (the receipt).',
    columns: [['payment_id', 'ID'], ['member_name', 'Member'], ['plan_name', 'Plan'], ['amount', 'Amount', 'money'],
              ['payment_date', 'Date'], ['method', 'Method'], ['reference_no', 'Reference No.', 'dash']],
    fields: [
      { name: 'member_id', label: 'Member', type: 'select', required: true, from: 'members', value: 'member_id', text: ['first_name', 'last_name'] },
      { name: 'plan_id', label: 'Plan', type: 'select', required: true, from: 'plans', value: 'plan_id', text: ['plan_name'] },
      { name: 'amount', label: 'Amount (₱)', type: 'number', required: true, readonly: true,
        fillFrom: { field: 'plan_id', source: 'plans', key: 'price' }, hint: 'Filled in automatically from the plan.' },
      { name: 'method', label: 'Payment Method', type: 'select', required: true, options: ['Cash', 'GCash', 'Card'] },
      { name: 'reference_no', label: 'Reference Number', type: 'text', rule: 'reference',
        showWhen: { field: 'method', values: ['GCash', 'Card'] }, requiredWhenShown: true,
        hint: 'Receipt number from GCash or the card terminal (letters and numbers only).' }
    ]
  },
  plans: {
    icon: 'bi-card-checklist', title: 'Membership Plans', pk: 'plan_id', roles: ADMIN, canAdd: ADMIN, canEdit: ADMIN, canHide: ADMIN,
    columns: [['plan_id', 'ID'], ['plan_name', 'Plan Name'], ['duration_days', 'Duration (days)'], ['price', 'Price', 'money']],
    fields: [
      { name: 'plan_name', label: 'Plan Name', type: 'text', required: true, rule: 'title', hint: 'Letters and numbers only.' },
      { name: 'duration_days', label: 'Duration (days)', type: 'number', required: true, rule: 'duration', min: 1, max: 3650, hint: 'Whole number, 1 to 3650.' },
      { name: 'price', label: 'Price (₱)', type: 'number', required: true, rule: 'price', min: 1, max: 100000, hint: 'Up to 2 decimal places.' }
    ]
  },
  trainers: {
    icon: 'bi-person-badge-fill', title: 'Trainers', pk: 'trainer_id', roles: ADMIN, canAdd: ADMIN, canEdit: ADMIN, canHide: ADMIN,
    columns: [['trainer_id', 'ID'], ['first_name', 'First Name'], ['last_name', 'Last Name'],
              ['specialty', 'Specialty'], ['phone', 'Phone']],
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true, rule: 'name', hint: 'Letters only.' },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true, rule: 'name', hint: 'Letters only.' },
      { name: 'specialty', label: 'Specialty', type: 'text', required: true, rule: 'title', hint: 'Example: Yoga, Boxing, CrossFit.' },
      { name: 'phone', label: 'Mobile Number', type: 'tel', required: true, rule: 'phone', hint: 'Example: 09171234567' }
    ]
  },
  classes: {
    icon: 'bi-calendar-event-fill', title: 'Classes', pk: 'class_id', roles: ADMIN, canAdd: ADMIN, canEdit: ADMIN, canHide: ADMIN,
    columns: [['class_id', 'ID'], ['class_name', 'Class'], ['trainer_name', 'Trainer'],
              ['schedule', 'Schedule'], ['capacity', 'Capacity']],
    fields: [
      { name: 'class_name', label: 'Class Name', type: 'text', required: true, rule: 'title', hint: 'Letters and numbers only.' },
      { name: 'trainer_id', label: 'Trainer', type: 'select', required: true, from: 'trainers', value: 'trainer_id', text: ['first_name', 'last_name'] },
      { name: 'schedule', label: 'Schedule', type: 'text', required: true, rule: 'schedule', hint: 'Example: Mon/Wed/Fri 6:00 AM' },
      { name: 'capacity', label: 'Capacity', type: 'number', required: true, rule: 'capacity', min: 1, max: 100, hint: 'Whole number, 1 to 100.' }
    ]
  },
  enrollments: {
    icon: 'bi-journal-check', title: 'Class Bookings', pk: 'enrollment_id', roles: 'all', canAdd: 'all', canHide: ADMIN,
    filter: ['Booked', 'Cancelled'], filterLabel: 'All bookings',
    statuses: ['Booked', 'Cancelled'],
    note: 'Choose the class day you want to book (today up to 30 days ahead). A booking cannot be edited: cancel it and book again.',
    columns: [['enrollment_id', 'ID'], ['class_name', 'Class'], ['schedule', 'Schedule'], ['member_name', 'Member'],
              ['booking_date', 'Class Date'], ['enrolled_date', 'Booked On'], ['status', 'Status', 'status']],
    fields: [
      { name: 'class_id', label: 'Class', type: 'select', required: true, from: 'classes', value: 'class_id', text: ['class_name', 'schedule'], joiner: ' - ' },
      { name: 'member_id', label: 'Member', type: 'select', required: true, from: 'members', value: 'member_id',
        text: ['first_name', 'last_name'], onlyStatus: 'Active' },
      { name: 'booking_date', label: 'Class Date', type: 'date', required: true, rule: 'bookingDate', dateRange: true,
        hint: 'Must be a day the class runs.' }
    ]
  },
  users: {
    icon: 'bi-shield-lock-fill', title: 'User Accounts', pk: 'user_id', roles: ADMIN, canAdd: ADMIN, users: true,
    filter: ['Enabled', 'Disabled'], filterLabel: 'All accounts',
    note: 'Accounts are never deleted. Disable an account to stop that person from logging in.',
    resetField: { name: 'password', label: 'New Password', type: 'password', required: true, rule: 'password', hint: '6 to 50 characters, no spaces.' },
    columns: [['user_id', 'ID'], ['username', 'Username'], ['role', 'Role', 'role'], ['is_active', 'Account', 'active']],
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true, rule: 'username', hint: '3 to 20 letters, numbers or underscores.' },
      { name: 'password', label: 'Password', type: 'password', required: true, rule: 'password', hint: '6 to 50 characters, no spaces.' },
      { name: 'role', label: 'Role', type: 'select', required: true, options: ['Admin', 'Staff'] }
    ]
  }
};
