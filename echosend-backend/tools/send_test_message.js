// send_test_message.js
// Usage: node tools/send_test_message.js <recipient_e164> "message text"
// Example: node tools/send_test_message.js 919879201676 "Hello"
const axios = require('axios');
require('dotenv').config();

const [,, recipientArg, ...messageParts] = process.argv;
if (!recipientArg || messageParts.length === 0) {
  console.error('Usage: node tools/send_test_message.js <recipient_e164> "message text"');
  process.exit(2);
}

const recipient = recipientArg;
const message = messageParts.join(' ');

const phoneNumberId = process.env.PHONE_NUMBER_ID;
const token = process.env.WHATSAPP_TOKEN;

if (!phoneNumberId || !token) {
  console.error('Missing PHONE_NUMBER_ID or WHATSAPP_TOKEN in environment');
  process.exit(2);
}

const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

async function send() {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'text',
      text: { body: message }
    };

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('Send success. API response:');
    console.log(res.data);
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('API error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Request failed:', err.message);
    }
    process.exit(1);
  }
}

send();
