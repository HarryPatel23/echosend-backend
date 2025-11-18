# EchoSend - Scheduled WhatsApp Message Sender

EchoSend is a full-stack React Native (Expo) mobile app for scheduling WhatsApp messages (text + media) using the **official WhatsApp Business Cloud API**. Messages are sent from your Business phone number.

## Features
- Secure registration/login (JWT)
- Dashboard: List of pending schedules
- Create schedule: recipient, message (caption), date/time, recurring (Once/Daily/Weekly/Weekdays), attach file (image/video/document/audio)
- Backend cron checks every minute and sends due messages
- Media files stored in Supabase Storage (public URLs)
- Recurring logic handles weekdays (skips Sat/Sun)

## Prerequisites
- Node.js ≥18
- Expo CLI (`npm i -g expo-cli`)
- Supabase account (free tier)
- Meta Business account with WhatsApp Business API enabled
- ngrok (for local testing) or deploy backend to Render/Railway

## Setup Supabase
1. Create a free project at https://supabase.com
2. Copy:
   - Project URL
   - `service_role` key (Settings → API)
   - PostgreSQL connection string (Settings → Database → Connection string → URI)
3. Create a storage bucket named **media** → Make it **public**
4. Run the SQL below (Database → SQL editor → New query):

```sql
-- init.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  recipient VARCHAR(20) NOT NULL,
  message TEXT,
  send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  recurring VARCHAR(20) CHECK (recurring IN ('once', 'daily', 'weekly', 'weekdays')) NOT NULL DEFAULT 'once',
  media_url TEXT,
  media_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_due ON schedules (send_at, status);
```

## WhatsApp Business API

Follow https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
Get:
- Phone Number ID
- Permanent Access Token (permissions: whatsapp_business_messaging, whatsapp_business_management)

**Important:** Recipients must have opted-in or messaged you in the last 24h for free-form messages. Otherwise you need approved templates.

## Backend Setup

```bash
mkdir echosend-backend && cd echosend-backend
npm init -y
npm i express cors dotenv pg bcryptjs jsonwebtoken node-cron axios multer @supabase/supabase-js uuid
```

Create the files below.

### .env
```
DATABASE_URL=postgres://postgres.yourproject:[YOUR-PASSWORD]@db.yourproject.supabase.co:5432/postgres
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=supersecretchangeme123456789
PHONE_NUMBER_ID=123456789012345
WHATSAPP_TOKEN=EAAG...your-permanent-token
PORT=5000
```

Run locally:
```bash
node index.js
```
For mobile testing: `ngrok http 5000` → use ngrok URL in frontend api.js
Deploy free: Render.com → New Web Service → connect GitHub repo → add env vars → free tier (spins down after 15min inactivity, cron still works).

## Frontend Setup (Expo)

```bash
expo init EchoSend --template blank
cd EchoSend
npm i @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
npm i @react-native-community/datetimepicker expo-document-picker axios @react-native-async-storage/async-storage @react-native-picker/picker
```

Replace/add files below.
Edit `services/api.js` → replace YOUR_BACKEND_URL with localhost IP (e.g. http://192.168.1.50:5000) or ngrok URL.

Run:
```bash
expo start
```

## Production Notes
- Backend must run 24/7 (Render free works, wakes on cron)
- Media URLs are public
- Timezone: send_at stored in UTC, displayed in device local time
- No edit/delete media after upload (for simplicity)
- Add validation/production hardening as needed

---

All files are complete, well-commented, and ready to copy-paste.
Test thoroughly, especially WhatsApp permissions and timezones. Enjoy scheduling! 🚀
