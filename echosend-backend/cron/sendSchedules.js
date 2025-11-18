const cron = require('node-cron');
const db = require('../db');
const axios = require('axios');

const WHATSAPP_URL = process.env.PHONE_NUMBER_ID
  ? `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`
  : null;

const getNextSendAt = (current, type) => {
  if (type === 'once') return null;
  const next = new Date(current);
  if (type === 'daily') {
    next.setDate(next.getDate() + 1);
  } else if (type === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (type === 'weekdays') {
    do {
      next.setDate(next.getDate() + 1);
    } while (next.getDay() === 0 || next.getDay() === 6);
  }
  return next;
};

const sendWhatsAppMessage = async (schedule) => {
  // If credentials are not set, simulate send so you can test locally.
  if (!process.env.WHATSAPP_TOKEN || !process.env.PHONE_NUMBER_ID) {
    console.log(`Simulating WhatsApp send for schedule id=${schedule.id} (no credentials set)`);
    return true;
  }

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const payload = {
    messaging_product: 'whatsapp',
    to: schedule.recipient,
  };

  if (schedule.media_url) {
    payload.type = schedule.media_type;
    payload[schedule.media_type] = { link: schedule.media_url };
    if (schedule.message) payload[schedule.media_type].caption = schedule.message;
  } else {
    payload.type = 'text';
    payload.text = { body: schedule.message || '' };
  }

  try {
    await axios.post(WHATSAPP_URL, payload, { headers });
    return true;
  } catch (err) {
    console.error('WhatsApp send error:', err.response?.data || err.message);
    return false;
  }
};

const processDueSchedules = async () => {
  try {
    const now = new Date();
    const { rows } = await db.query(
      `SELECT * FROM schedules 
       WHERE send_at <= $1 AND status = 'pending' `,
      [now]
    );

    for (const schedule of rows) {
      const success = await sendWhatsAppMessage(schedule);

      if (success) {
        const nextDate = getNextSendAt(schedule.send_at, schedule.recurring);
        if (nextDate) {
          await db.query(
            `INSERT INTO schedules 
            (user_id, recipient, message, send_at, recurring, media_url, media_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              schedule.user_id,
              schedule.recipient,
              schedule.message,
              nextDate,
              schedule.recurring,
              schedule.media_url,
              schedule.media_type,
            ]
          );
        }
        await db.query(`UPDATE schedules SET status = 'sent' WHERE id = $1`, [schedule.id]);
      } else {
        await db.query(`UPDATE schedules SET status = 'failed' WHERE id = $1`, [schedule.id]);
      }
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
};

const startCron = () => {
  cron.schedule('* * * * *', processDueSchedules);
  console.log('WhatsApp scheduler cron started (every minute)');
};

module.exports = { startCron, processDueSchedules };
