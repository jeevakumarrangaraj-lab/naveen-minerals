import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '64kb' }));

/**
 * Inspects optional NOTIFICATION_WEBHOOK_URL safely without exposing secret values or query tokens.
 * When missing or empty, webhook notifications are gracefully disabled while Firestore storage remains active.
 */
function getWebhookConfigStatus(): {
  configured: boolean;
  validUrl: string | null;
  statusMessage: string;
} {
  const raw =
    typeof process.env.NOTIFICATION_WEBHOOK_URL === 'string'
      ? process.env.NOTIFICATION_WEBHOOK_URL.trim()
      : '';

  if (!raw) {
    return {
      configured: false,
      validUrl: null,
      statusMessage:
        'Webhook notifications are disabled (optional). All quote requests and contact enquiries are saved directly to Firestore.'
    };
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      console.warn(
        '[Notification Config] Optional webhook URL has an unsupported protocol; skipping webhook delivery.'
      );
      return {
        configured: false,
        validUrl: null,
        statusMessage:
          'Configured webhook URL has an unsupported protocol (only https:// or http:// is supported). Submissions continue saving to Firestore.'
      };
    }
    return {
      configured: true,
      validUrl: raw,
      statusMessage: `Active webhook endpoint configured (${parsed.protocol}//${parsed.host}/...).`
    };
  } catch {
    console.warn(
      '[Notification Config] Optional webhook URL is malformed; skipping webhook delivery.'
    );
    return {
      configured: false,
      validUrl: null,
      statusMessage:
        'Configured webhook URL is not a valid URL. Submissions continue saving to Firestore without external webhook dispatch.'
    };
  }
}

/**
 * Dispatches an optional notification payload only when a valid webhook URL is configured.
 * If missing or empty, returns immediately as a no-op without throwing or failing form submissions.
 */
async function dispatchOptionalWebhook(payload: Record<string, unknown>): Promise<{
  configured: boolean;
  sent: boolean;
}> {
  const status = getWebhookConfigStatus();
  if (!status.configured || !status.validUrl) {
    return { configured: false, sent: false };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(status.validUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      console.warn(
        `[Notification Delivery] Optional webhook endpoint returned HTTP ${resp.status}. Enquiry was saved to Firestore.`
      );
      return { configured: true, sent: false };
    }
    return { configured: true, sent: true };
  } catch (err) {
    const reason = err instanceof Error ? err.name : 'UnknownError';
    console.warn(
      `[Notification Delivery] Optional webhook request failed (${reason}). Enquiry was saved to Firestore.`
    );
    return { configured: true, sent: false };
  }
}

/**
 * Endpoint for the Admin Dashboard to check the current optional notification status
 * without requiring any environment variable or exposing secrets.
 */
app.get('/api/admin/notification-status', (_req: Request, res: Response) => {
  const status = getWebhookConfigStatus();
  res.status(200).json({
    ok: true,
    configured: status.configured,
    optional: true,
    statusMessage: status.statusMessage
  });
});

// Simple in-memory IP rate limiter for spam protection on public enquiry forms
interface RateBucket {
  count: number;
  resetAt: number;
}
const ipRateLimits = new Map<string, RateBucket>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 12;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = ipRateLimits.get(ip);
  if (!bucket || now > bucket.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  bucket.count += 1;
  return true;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{8,25}$/;

function generateUniqueQuoteReference(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear().toString();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `NM-Q-${yyyy}${mm}${dd}-${randomPart}`;
}

/**
 * Trusted server-side quote validation & reference generation endpoint.
 * Validates all required fields, enforces rate limits & honeypot spam checks,
 * generates a cryptographic quote reference (NM-Q-YYYYMMDD-XXXXXX), and triggers
 * optional notification webhook if configured. Never fails if webhook is unconfigured or unreachable.
 */
app.post('/api/quotes/prepare', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({
      error: 'Too many submissions from this connection. Please wait a few minutes and try again.'
    });
    return;
  }

  const {
    customerName = '',
    companyName = '',
    phone = '',
    email = '',
    productSlug = '',
    productName = '',
    quantity = '',
    quantityUnit = '',
    deliveryLocation = '',
    message = '',
    privacyConsent = false,
    honeypot = ''
  } = req.body || {};

  // Spam honeypot check
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    res.status(400).json({ error: 'Spam check failed.' });
    return;
  }

  const cleanName = String(customerName).trim();
  const cleanCompany = String(companyName).trim();
  const cleanPhone = String(phone).trim();
  const cleanEmail = String(email).trim();
  const cleanSlug = String(productSlug).trim();
  const cleanProductName = String(productName).trim();
  const cleanQuantity = String(quantity).trim();
  const cleanUnit = String(quantityUnit).trim();
  const cleanLocation = String(deliveryLocation).trim();
  const cleanMessage = String(message).trim();

  if (cleanName.length < 2 || cleanName.length > 100) {
    res.status(400).json({ error: 'Please provide a valid customer name (2–100 characters).' });
    return;
  }
  if (cleanCompany.length > 120) {
    res.status(400).json({ error: 'Company name must not exceed 120 characters.' });
    return;
  }
  if (!PHONE_REGEX.test(cleanPhone)) {
    res.status(400).json({ error: 'Please provide a valid contact phone number.' });
    return;
  }
  if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 120) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }
  if (!cleanSlug || cleanSlug.length > 80 || !/^[a-z0-9\-]+$/.test(cleanSlug)) {
    res.status(400).json({ error: 'Please select a valid mineral product from the catalogue.' });
    return;
  }
  if (cleanProductName.length < 2 || cleanProductName.length > 100) {
    res.status(400).json({ error: 'Invalid product name.' });
    return;
  }
  // Prevent industrial tonne unit on traditional decorative Kolam Powder
  if (cleanSlug === 'kolam-powder' && cleanUnit.toLowerCase().includes('tonne')) {
    res.status(400).json({ error: 'Kolam Powder is supplied in packets, kg, or bags rather than industrial tonnes.' });
    return;
  }
  if (!cleanQuantity || cleanQuantity.length > 40 || Number.isNaN(Number(cleanQuantity)) || Number(cleanQuantity) <= 0) {
    res.status(400).json({ error: 'Please enter a valid positive numeric quantity.' });
    return;
  }
  if (!cleanUnit || cleanUnit.length > 30) {
    res.status(400).json({ error: 'Please select a valid quantity unit.' });
    return;
  }
  if (cleanLocation.length < 2 || cleanLocation.length > 200) {
    res.status(400).json({ error: 'Please provide a valid delivery location (2–200 characters).' });
    return;
  }
  if (cleanMessage.length > 1500) {
    res.status(400).json({ error: 'Requirements message must not exceed 1500 characters.' });
    return;
  }
  if (privacyConsent !== true) {
    res.status(400).json({ error: 'Please accept the privacy consent to submit your quotation request.' });
    return;
  }

  const quoteReference = generateUniqueQuoteReference();
  const docId = `quote_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // Optional external notification webhook if configured by owner
  const webhookResult = await dispatchOptionalWebhook({
    type: 'NEW_QUOTE_REQUEST',
    quoteReference,
    productName: cleanProductName,
    quantity: `${cleanQuantity} ${cleanUnit}`,
    deliveryLocation: cleanLocation,
    submittedAt: new Date().toISOString()
  });

  res.status(200).json({
    ok: true,
    docId,
    quoteReference,
    notificationConfigured: webhookResult.configured,
    notificationSent: webhookResult.sent,
    sanitizedPayload: {
      quoteReference,
      customerName: cleanName,
      companyName: cleanCompany,
      phone: cleanPhone,
      email: cleanEmail,
      productSlug: cleanSlug,
      productName: cleanProductName,
      quantity: cleanQuantity,
      quantityUnit: cleanUnit,
      deliveryLocation: cleanLocation,
      message: cleanMessage,
      privacyConsent: true,
      status: 'New',
      internalNotes: ''
    }
  });
});

/**
 * Trusted server-side contact form validation & rate-limiting endpoint.
 * Also dispatches an optional webhook notification if NOTIFICATION_WEBHOOK_URL is configured.
 */
app.post('/api/contact/prepare', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({
      error: 'Too many submissions from this connection. Please wait a few minutes and try again.'
    });
    return;
  }

  const {
    fullName = '',
    phone = '',
    email = '',
    subject = '',
    message = '',
    privacyConsent = false,
    honeypot = ''
  } = req.body || {};

  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    res.status(400).json({ error: 'Spam check failed.' });
    return;
  }

  const cleanName = String(fullName).trim();
  const cleanPhone = String(phone).trim();
  const cleanEmail = String(email).trim();
  const cleanSubject = String(subject).trim();
  const cleanMessage = String(message).trim();

  if (cleanName.length < 2 || cleanName.length > 100) {
    res.status(400).json({ error: 'Please enter your full name (2–100 characters).' });
    return;
  }
  if (!PHONE_REGEX.test(cleanPhone)) {
    res.status(400).json({ error: 'Please provide a valid phone number.' });
    return;
  }
  if (cleanEmail.length > 0 && (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 120)) {
    res.status(400).json({ error: 'Please provide a valid email address or leave it blank.' });
    return;
  }
  if (cleanSubject.length < 2 || cleanSubject.length > 140) {
    res.status(400).json({ error: 'Please select or enter an enquiry subject.' });
    return;
  }
  if (cleanMessage.length < 5 || cleanMessage.length > 1500) {
    res.status(400).json({ error: 'Please enter a message between 5 and 1500 characters.' });
    return;
  }
  if (privacyConsent !== true) {
    res.status(400).json({ error: 'Please confirm privacy consent before submitting.' });
    return;
  }

  const docId = `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // Optional external notification webhook if configured by owner
  const webhookResult = await dispatchOptionalWebhook({
    type: 'NEW_CONTACT_ENQUIRY',
    subject: cleanSubject,
    submittedAt: new Date().toISOString()
  });

  res.status(200).json({
    ok: true,
    docId,
    notificationConfigured: webhookResult.configured,
    notificationSent: webhookResult.sent,
    sanitizedPayload: {
      fullName: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      privacyConsent: true,
      status: 'New',
      internalNotes: ''
    }
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Application build not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Naveen Minerals server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
