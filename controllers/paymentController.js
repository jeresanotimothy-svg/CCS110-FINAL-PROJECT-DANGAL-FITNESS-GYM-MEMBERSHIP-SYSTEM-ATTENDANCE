const createCrudController = require('./crudController');
const db = require('../config/db');

module.exports = createCrudController({
  table: 'payments', pk: 'payment_id',
  fields: ['member_id', 'plan_id', 'amount', 'method', 'reference_no'],
  required: ['member_id', 'plan_id', 'amount', 'method'],
  rules: { reference_no: 'reference' },
  labels: { reference_no: 'Reference number' },
  autoToday: ['payment_date'],
  dupMessage: 'That reference number was already used for another payment.',
  list: `SELECT pay.*, CONCAT(m.first_name,' ',m.last_name) AS member_name, p.plan_name
         FROM payments pay
         JOIN members m ON pay.member_id = m.member_id
         JOIN membership_plans p ON pay.plan_id = p.plan_id`,
  search: ['m.first_name', 'm.last_name', 'p.plan_name', 'pay.method', 'pay.reference_no'],
  order: 'pay.payment_id DESC',
  filter: 'pay.method',
  hiddenCol: 'pay.is_hidden',
  validate: async d => {
    if (!['Cash', 'GCash', 'Card'].includes(d.method)) return 'Choose a payment method.';

    // GCash / Card need a reference number
    if (d.method === 'Cash' && d.reference_no) return 'Cash payments do not have a reference number.';
    if (d.method !== 'Cash' && !d.reference_no) return `A reference number is required for ${d.method} payments.`;

    const [members] = await db.query('SELECT member_id FROM members WHERE member_id = ? AND is_hidden = 0', [d.member_id]);
    if (members.length === 0) return 'Please choose a valid member.';

    // Amount = plan price
    const [plans] = await db.query('SELECT price FROM membership_plans WHERE plan_id = ? AND is_hidden = 0', [d.plan_id]);
    if (plans.length === 0) return 'Please choose a valid plan.';
    if (Number(d.amount) !== Number(plans[0].price))
      return 'Amount must match the plan price (₱' + Number(plans[0].price).toLocaleString() + ').';
    return null;
  }
});
