// send_test_template.js
// Usage: node tools/send_test_template.js <recipient_e164> <template_name> [language_code]
// Example: node tools/send_test_template.js 919879201676 hello_world en_US
const axios = require('axios');
require('dotenv').config();

const [,, recipient, templateName, languageCode = 'en_US'] = process.argv;
if (!recipient || !templateName) {
  console.error('Usage: node tools/send_test_template.js <recipient_e164> <template_name> [language_code]');
  process.exit(2);
}

const phoneNumberId = process.env.PHONE_NUMBER_ID;
const token = process.env.WHATSAPP_TOKEN;

if (!phoneNumberId || !token) {
  console.error('Missing PHONE_NUMBER_ID or WHATSAPP_TOKEN in environment');
  process.exit(2);
}

const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

async function sendTemplate() {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode }
      }
    };

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('Template send success. API response:');
    console.log(JSON.stringify(res.data, null, 2));
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

sendTemplate();
