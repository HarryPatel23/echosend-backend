// Small verification script to check the provided WhatsApp access token is valid
// It calls the Graph API /me endpoint with the token and prints a short result.
const axios = require('axios');
require('dotenv').config();

const token = process.env.WHATSAPP_TOKEN;
if (!token) {
  console.error('No WHATSAPP_TOKEN found in environment');
  process.exit(2);
}

async function verify() {
  try {
    const res = await axios.get('https://graph.facebook.com/v20.0/me', {
      params: { access_token: token },
      timeout: 10000,
    });
    console.log('Token appears valid. Graph API /me response:');
    console.log({ id: res.data.id, name: res.data.name });
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('Graph API returned an error:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    process.exit(1);
  }
}

verify();
