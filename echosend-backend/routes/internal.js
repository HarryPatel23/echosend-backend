const express = require('express');
const router = express.Router();
require('dotenv').config();

const { processDueSchedules } = require('../cron/sendSchedules');

// Protected internal endpoint for cron triggers
router.post('/trigger-cron', async (req, res) => {
  const authHeader = req.headers.authorization || req.headers['x-cron-secret'];
  const expected = process.env.CRON_SECRET;

  // Support either 'Authorization: Bearer <secret>' or header x-cron-secret: <secret>
  let provided;
  if (!authHeader) provided = null;
  else if (authHeader.startsWith('Bearer ')) provided = authHeader.split(' ')[1];
  else provided = authHeader;

  if (!expected || !provided || provided !== expected) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    await processDueSchedules();
    return res.json({ msg: 'Cron processed' });
  } catch (err) {
    console.error('Internal cron trigger error:', err);
    return res.status(500).json({ msg: 'Internal error' });
  }
});

module.exports = router;
