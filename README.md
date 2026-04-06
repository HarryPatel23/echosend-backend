# EchoSend - Scheduled WhatsApp Message Sender

EchoSend is a full-stack React Native (Expo) mobile app for scheduling WhatsApp messages (text + media) using the **official WhatsApp Business Cloud API**. Messages are sent from your Business phone number.

## Features
- Secure registration/login (JWT)
- Dashboard: List of pending schedules
- Create schedule: recipient, message (caption), date/time, recurring (Once/Daily/Weekly/Weekdays), attach file (image/video/document/audio)
- Backend cron checks every minute and sends due messages
- Media files stored in Supabase Storage (public URLs)
- Recurring logic handles weekdays (skips Sat/Sun)


