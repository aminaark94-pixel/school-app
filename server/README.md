# 📱 School App: Free WhatsApp & Android SMS Gateway

Ye standalone microservice aapke **School App** ke liye free WhatsApp notifications aur Android SIM SMS bhejne ka kaam karti hai baghair kisi costly third-party API subscription (jaise Twilio ya Infobip) ke.

---

## 🏗️ Architecture & Features

1. **WhatsApp Gateway (`whatsapp-web.js`)**:
   - Admin apne mobile se QR code scan karta hai (Terminal me ya React School Dashboard me).
   - Session `.wwebjs_auth/` folder me permanent save rehti hai (dobara scan nahi karna padta).
   - Express REST API `POST /api/send-whatsapp` handle karta hai.

2. **Android SMS Gateway (TextBee / Local Android App)**:
   - Aapka Android mobile phone (with unlimited SMS SIM package) SMS gateway ban jata hai.
   - **TextBee (Recommended Free)**: Mobile par TextBee app install karein, API key lein aur real SIM se direct SMS dispatch karein.
   - **Local Android Gateway (SMSGate / CapCom)**: Local Wi-Fi par chalne wali Android app ko HTTP request bhejta hai.

3. **Anti-Ban Queue & Protection**:
   - Bulk notifications bhejte waqt har message ke darmiyan **5 se 10 second ka randomized delay** rakha gaya hai taake WhatsApp account ban na ho.
   - Real-time Progress Bar, Sent/Failed Counters, Live Delivery Logs, aur **Retry Failed Messages** option.

---

## 📂 Folder Structure

```
school-app/
├── server/                           # Notification Gateway Microservice
│   ├── .wwebjs_auth/                # Permanent WhatsApp Session Storage (Auto-generated)
│   ├── .env.example                 # Environment Variables template
│   ├── package.json                 # Node.js dependencies
│   ├── README.md                    # Setup & installation guide
│   └── server.js                    # Express + whatsapp-web.js + Android SMS logic
│
├── src/
│   ├── components/
│   │   ├── communication/
│   │   │   ├── CommunicationModule.tsx    # Notices, Chat & Broadcast Tabs
│   │   │   └── NotificationDispatcher.tsx # Full WhatsApp & SMS Dispatcher UI
│   │   └── ...
│   └── lib/
│       └── demoDataGenerator.ts     # Parent phone numbers & student roster
```

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Install Gateway Server Dependencies
Terminal khol kar `server` directory me jayein:

```bash
cd "server"
npm install
```

### Step 2: Configure Environment Variables
`.env.example` file ko copy kar ke `.env` banayein:

```bash
cp .env.example .env
```

Agar aap TextBee use kar rahe hain:
1. Android phone par TextBee app install karein: [https://textbee.dev](https://textbee.dev)
2. Dashboard se apni `TEXTBEE_API_KEY` aur `TEXTBEE_DEVICE_ID` copy karein aur `.env` me paste karein:
   ```env
   PORT=5001
   TEXTBEE_API_KEY=tb_your_key_here
   TEXTBEE_DEVICE_ID=your_device_id_here
   ```

### Step 3: Run the Gateway Server
```bash
npm start
```

Terminal me QR code nazar aayega. Apne WhatsApp mobile app se **Linked Devices > Link a Device** par ja kar QR scan karein.
Ek baar link ho gaya toh connection status `CONNECTED` ho jayega aur session `.wwebjs_auth` me save ho jayega!

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Payload Example |
|---|---|---|---|
| `GET` | `/api/status` | Check WhatsApp & SMS Gateway connection status | None |
| `GET` | `/api/qr` | Get live QR code Data URL for browser display | None |
| `POST` | `/api/send-whatsapp` | Send instant WhatsApp message to Pakistani/intl number | `{"number": "03001234567", "message": "Fee reminder"}` |
| `POST` | `/api/send-sms` | Relay SMS via Android phone gateway | `{"number": "03001234567", "message": "School alert"}` |
| `POST` | `/api/disconnect-whatsapp` | Unlink session and request new QR code | None |
