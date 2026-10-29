const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// -----------------------------------------------------------------------------
// State Management
// -----------------------------------------------------------------------------
let whatsappState = {
  status: 'INITIALIZING', // INITIALIZING | QR_READY | AUTHENTICATING | CONNECTED | DISCONNECTED | ERROR
  qrRaw: null,
  qrDataUrl: null,
  clientInfo: null,
  lastError: null,
};

// -----------------------------------------------------------------------------
// Helper: Normalize Phone Number to International Format
// -----------------------------------------------------------------------------
function normalizePhoneNumber(rawNumber) {
  if (!rawNumber) return null;
  // Remove all non-digits
  let cleaned = rawNumber.toString().replace(/\D/g, '');

  // Handle Pakistan local formats (e.g., 03001234567 -> 923001234567)
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('0092')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }

  return cleaned;
}

// -----------------------------------------------------------------------------
// Initialize WhatsApp Web Client (whatsapp-web.js)
// -----------------------------------------------------------------------------
console.log('----------------------------------------------------');
console.log('  School App: WhatsApp & Android SMS Gateway Server ');
console.log('----------------------------------------------------');

const whatsappClient = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(__dirname, '.wwebjs_auth'),
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
});

// Event: QR Code Received for Scanning
whatsappClient.on('qr', async (qr) => {
  whatsappState.status = 'QR_READY';
  whatsappState.qrRaw = qr;
  whatsappState.lastError = null;

  try {
    // Generate base64 Data URL for web dashboard UI
    whatsappState.qrDataUrl = await QRCode.toDataURL(qr);
  } catch (err) {
    console.error('Error generating QR Data URL:', err);
  }

  console.log('\n[WhatsApp] Scan the QR Code below to link your WhatsApp:');
  qrcodeTerminal.generate(qr, { small: true });
});

// Event: Authenticating
whatsappClient.on('authenticating', () => {
  whatsappState.status = 'AUTHENTICATING';
  console.log('[WhatsApp] Authenticating session...');
});

// Event: Authenticated
whatsappClient.on('authenticated', () => {
  whatsappState.status = 'AUTHENTICATING';
  whatsappState.qrRaw = null;
  whatsappState.qrDataUrl = null;
  console.log('[WhatsApp] Authentication successful! Session saved to .wwebjs_auth.');
});

// Event: Client Ready
whatsappClient.on('ready', () => {
  whatsappState.status = 'CONNECTED';
  whatsappState.qrRaw = null;
  whatsappState.qrDataUrl = null;
  whatsappState.clientInfo = {
    pushname: whatsappClient.info?.pushname || 'School Admin',
    number: whatsappClient.info?.wid?.user || '',
    platform: whatsappClient.info?.platform || 'web',
  };
  console.log(`[WhatsApp] Ready! Logged in as: ${whatsappState.clientInfo.pushname} (${whatsappState.clientInfo.number})`);
});

// Event: Auth Failure
whatsappClient.on('auth_failure', (msg) => {
  whatsappState.status = 'ERROR';
  whatsappState.lastError = msg;
  console.error('[WhatsApp] Authentication failure:', msg);
});

// Event: Disconnected
whatsappClient.on('disconnected', (reason) => {
  whatsappState.status = 'DISCONNECTED';
  whatsappState.clientInfo = null;
  console.log('[WhatsApp] Disconnected. Reason:', reason);
  // Reinitialize client
  setTimeout(() => {
    try {
      whatsappClient.initialize();
    } catch (e) {
      console.error('Failed to re-initialize client:', e);
    }
  }, 5000);
});

// Start initialization
try {
  whatsappClient.initialize();
} catch (err) {
  console.error('[WhatsApp] Initialization error:', err);
  whatsappState.status = 'ERROR';
  whatsappState.lastError = err.message;
}

// -----------------------------------------------------------------------------
// REST API Endpoints
// -----------------------------------------------------------------------------

// 1. Health & Connection Status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    whatsapp: {
      status: whatsappState.status,
      connected: whatsappState.status === 'CONNECTED',
      clientInfo: whatsappState.clientInfo,
      hasQr: Boolean(whatsappState.qrDataUrl),
      lastError: whatsappState.lastError,
    },
    smsGateway: {
      configured: Boolean(process.env.ANDROID_SMS_GATEWAY_URL || process.env.TEXTBEE_API_KEY),
      provider: process.env.TEXTBEE_API_KEY ? 'TextBee API' : 'Android HTTP SMS Gateway',
    },
  });
});

// 2. Get QR Code for Web Frontend UI
app.get('/api/qr', (req, res) => {
  res.json({
    status: whatsappState.status,
    qrDataUrl: whatsappState.qrDataUrl,
    rawQr: whatsappState.qrRaw,
    connected: whatsappState.status === 'CONNECTED',
  });
});

// 3. Send Single WhatsApp Message
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: number and message are required.',
      });
    }

    if (whatsappState.status !== 'CONNECTED') {
      return res.status(503).json({
        success: false,
        error: `WhatsApp client is not ready. Current status: ${whatsappState.status}. Please scan QR code first.`,
      });
    }

    const cleanedNumber = normalizePhoneNumber(number);
    if (!cleanedNumber || cleanedNumber.length < 10) {
      return res.status(400).json({
        success: false,
        error: `Invalid phone number format: "${number}". Please provide a valid phone number.`,
      });
    }

    const chatId = `${cleanedNumber}@c.us`;

    // Check if number is registered on WhatsApp (optional check)
    try {
      const isRegistered = await whatsappClient.isRegisteredUser(chatId);
      if (!isRegistered) {
        return res.status(404).json({
          success: false,
          error: `Phone number ${cleanedNumber} is not registered on WhatsApp.`,
        });
      }
    } catch {
      // Proceed even if registration check times out
    }

    const sentMessage = await whatsappClient.sendMessage(chatId, message);

    return res.json({
      success: true,
      channel: 'whatsapp',
      messageId: sentMessage.id?._serialized || sentMessage.id?.id,
      to: cleanedNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[WhatsApp Send Error]:', error);
    return res.status(500).json({
      success: false,
      channel: 'whatsapp',
      error: error.message || 'Failed to send WhatsApp message.',
    });
  }
});

// 4. Send Single SMS via Android Phone Gateway (TextBee or Android HTTP Gateway)
app.post('/api/send-sms', async (req, res) => {
  try {
    const { number, message, gatewayUrl, apiKey, deviceId } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: number and message are required.',
      });
    }

    const cleanedNumber = normalizePhoneNumber(number);
    const targetGatewayUrl = gatewayUrl || process.env.ANDROID_SMS_GATEWAY_URL;
    const targetApiKey = apiKey || process.env.TEXTBEE_API_KEY;
    const targetDeviceId = deviceId || process.env.TEXTBEE_DEVICE_ID;

    // Mode A: TextBee Gateway API (Cloud + Android App relay)
    if (targetApiKey && targetDeviceId) {
      const response = await axios.post(
        `https://api.textbee.dev/api/v1/gateway/devices/${targetDeviceId}/sendSMS`,
        {
          recipients: [cleanedNumber.startsWith('92') ? `+${cleanedNumber}` : cleanedNumber],
          message: message,
        },
        {
          headers: {
            'x-api-key': targetApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return res.json({
        success: true,
        channel: 'sms',
        provider: 'TextBee',
        to: cleanedNumber,
        response: response.data,
      });
    }

    // Mode B: Local Android HTTP SMS Gateway (App running HTTP server on phone e.g. SMSGate)
    if (targetGatewayUrl) {
      const response = await axios.post(
        `${targetGatewayUrl.replace(/\/$/, '')}/send`,
        {
          to: cleanedNumber,
          message: message,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      return res.json({
        success: true,
        channel: 'sms',
        provider: 'Android Local Gateway',
        to: cleanedNumber,
        response: response.data,
      });
    }

    // Mode C: Simulated Android Gateway (when running in standalone dev mode)
    console.log(`[SMS Gateway Simulated] Sent to ${cleanedNumber}: "${message.substring(0, 50)}..."`);
    return res.json({
      success: true,
      channel: 'sms',
      provider: 'Simulation (Configure ANDROID_SMS_GATEWAY_URL or TEXTBEE_API_KEY for real SIM delivery)',
      to: cleanedNumber,
      simulated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[SMS Send Error]:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      channel: 'sms',
      error: error.response?.data?.message || error.message || 'Failed to dispatch SMS through Android Gateway.',
    });
  }
});

// 5. Disconnect / Logout WhatsApp Session
app.post('/api/disconnect-whatsapp', async (req, res) => {
  try {
    if (whatsappClient) {
      await whatsappClient.logout();
    }
    whatsappState.status = 'DISCONNECTED';
    whatsappState.clientInfo = null;
    whatsappState.qrDataUrl = null;
    whatsappState.qrRaw = null;

    setTimeout(() => {
      whatsappClient.initialize();
    }, 2000);

    return res.json({ success: true, message: 'Logged out. Initializing new QR code.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n🚀 Notification Gateway API running on: http://localhost:${PORT}`);
  console.log(`- Health Check:    GET  http://localhost:${PORT}/api/status`);
  console.log(`- Scan QR Code:    GET  http://localhost:${PORT}/api/qr`);
  console.log(`- Send WhatsApp:   POST http://localhost:${PORT}/api/send-whatsapp`);
  console.log(`- Send Android SMS:POST http://localhost:${PORT}/api/send-sms\n`);
});
