import nodemailer from 'nodemailer';
import { EUR_TO_BGN } from '@/lib/price';

function makeTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medovinata.bg';

const DELIVERY_LABELS = {
  bg: { ekont_office: 'Еконт — офис', ekont_door: 'Еконт — до адрес', speedy_office: 'Спийди — офис', speedy_door: 'Спийди — до адрес' },
  en: { ekont_office: 'Econt — office', ekont_door: 'Econt — to address', speedy_office: 'Speedy — office', speedy_door: 'Speedy — to address' },
};

// ── HTML shell ────────────────────────────────────────────────────────────────

function buildHtml(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:#2A1A0E;padding:24px 32px;text-align:center;border-radius:10px 10px 0 0;">
            <img src="${SITE_URL}/logo.png" alt="Медовината" height="52" style="display:block;margin:0 auto;">
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:36px 32px;border-left:1px solid #EBD9B8;border-right:1px solid #EBD9B8;">
            ${bodyHtml}
          </td>
        </tr>

        <tr>
          <td style="background:#F5EDDC;padding:18px 32px;text-align:center;border:1px solid #EBD9B8;border-top:none;border-radius:0 0 10px 10px;">
            <p style="margin:0;font-size:12px;color:#7A6C5C;">Медовината.бг — натурален мед и медовина от България</p>
            <p style="margin:6px 0 0;font-size:11px;">
              <a href="${SITE_URL}" style="color:#D4940C;text-decoration:none;">${SITE_URL.replace('https://', '')}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function divider() {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr><td style="border-top:1px solid #EBD9B8;"></td></tr>
  </table>`;
}

function labelValue(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:4px 0;font-size:13px;color:#7A6C5C;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:4px 0;font-size:13px;color:#2A1A0E;vertical-align:top;">${value}</td>
  </tr>`;
}

// ── Owner notifications ───────────────────────────────────────────────────────

export async function sendOrderNotification({ orderId, customerName, phone, email, deliveryMethod, addressOrOffice, city, notes, totalAmount }) {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_EMAIL) return;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:12px;color:#D4940C;letter-spacing:0.08em;text-transform:uppercase;">Нова поръчка</p>
    <h1 style="margin:0 0 24px;font-size:22px;color:#2A1A0E;">Поръчка #${orderId}</h1>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${labelValue('Клиент', customerName)}
      ${labelValue('Телефон', phone)}
      ${labelValue('Email', email)}
      ${labelValue('Доставка', deliveryMethod)}
      ${labelValue('Адрес', `${addressOrOffice}, ${city}`)}
      ${labelValue('Бележки', notes)}
    </table>
    ${divider()}
    <p style="margin:0;font-size:15px;color:#2A1A0E;">
      Сума: <strong>${Number(totalAmount).toFixed(2)} лв.</strong>
    </p>
    ${divider()}
    <p style="margin:0;">
      <a href="${SITE_URL}/admin/orders/${orderId}" style="display:inline-block;background:#2A1A0E;color:#FAF7F0;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;">
        Виж поръчката в админ панела →
      </a>
    </p>`;

  const text = `Нова поръчка #${orderId}\n\nКлиент: ${customerName}\nТелефон: ${phone}${email ? `\nEmail: ${email}` : ''}\nДоставка: ${deliveryMethod}\nАдрес: ${addressOrOffice}, ${city}${notes ? `\nБележки: ${notes}` : ''}\n\nСума: ${Number(totalAmount).toFixed(2)} лв.`;

  try {
    await makeTransport().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: `Нова поръчка #${orderId} — ${customerName}`,
      text,
      html: buildHtml(bodyHtml),
    });
  } catch (err) {
    console.error('[email] Failed to send order notification:', err?.message ?? err);
  }
}

export async function sendWholesaleNotification({ inquiryId, companyName, contactName, phone, email, message }) {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_EMAIL) return;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:12px;color:#6B2A5C;letter-spacing:0.08em;text-transform:uppercase;">Нова B2B заявка</p>
    <h1 style="margin:0 0 24px;font-size:22px;color:#2A1A0E;">Заявка #${inquiryId} — ${companyName}</h1>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${labelValue('Фирма', companyName)}
      ${labelValue('Контакт', contactName)}
      ${labelValue('Телефон', phone)}
      ${labelValue('Email', email)}
    </table>
    ${divider()}
    <p style="margin:0 0 8px;font-size:13px;color:#7A6C5C;">Заявени продукти</p>
    <p style="margin:0;font-size:14px;color:#2A1A0E;">${message}</p>
    ${divider()}
    <p style="margin:0;">
      <a href="${SITE_URL}/admin/wholesale" style="display:inline-block;background:#2A1A0E;color:#FAF7F0;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;">
        Виж заявката в админ панела →
      </a>
    </p>`;

  const text = `Нова B2B заявка #${inquiryId}\n\nФирма: ${companyName}\nКонтакт: ${contactName}\nТелефон: ${phone}${email ? `\nEmail: ${email}` : ''}\n\nПродукти: ${message}`;

  try {
    await makeTransport().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: `Нова B2B заявка #${inquiryId} — ${companyName}`,
      text,
      html: buildHtml(bodyHtml),
    });
  } catch (err) {
    console.error('[email] Failed to send wholesale notification:', err?.message ?? err);
  }
}

// ── Customer confirmations ────────────────────────────────────────────────────

export async function sendOrderConfirmation({ orderId, customerName, email, deliveryMethod, addressOrOffice, city, notes, items, totalAmount, locale = 'bg' }) {
  if (!process.env.SMTP_HOST || !email) return;

  const isBg = locale !== 'en';
  const totalBgn = Number(totalAmount).toFixed(2);
  const totalEur = (Number(totalAmount) / EUR_TO_BGN).toFixed(2);
  const deliveryLabel = DELIVERY_LABELS[isBg ? 'bg' : 'en'][deliveryMethod] ?? deliveryMethod;

  const itemRows = items.map(({ name, qty, unitPrice }) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#2A1A0E;border-bottom:1px solid #F5EDDC;">${name}</td>
      <td style="padding:8px 0;font-size:13px;color:#7A6C5C;text-align:center;border-bottom:1px solid #F5EDDC;">×${qty}</td>
      <td style="padding:8px 0;font-size:13px;color:#2A1A0E;text-align:right;border-bottom:1px solid #F5EDDC;">${(unitPrice * qty).toFixed(2)} ${isBg ? 'лв.' : 'BGN'}</td>
    </tr>`).join('');

  const bodyHtml = isBg ? `
    <p style="margin:0 0 4px;font-size:12px;color:#D4940C;letter-spacing:0.08em;text-transform:uppercase;">Потвърждение на поръчка</p>
    <h1 style="margin:0 0 8px;font-size:22px;color:#2A1A0E;">Благодарим, ${customerName}!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#7A6C5C;">Получихме поръчката Ви. Ще се свържем с Вас за потвърждение.</p>

    <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#2A1A0E;">Поръчка #${orderId}</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemRows}
      <tr>
        <td colspan="2" style="padding:12px 0 4px;font-size:13px;color:#7A6C5C;">Общо</td>
        <td style="padding:12px 0 4px;font-size:15px;font-weight:bold;color:#2A1A0E;text-align:right;">${totalBgn} лв.</td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td style="font-size:12px;color:#7A6C5C;text-align:right;">${totalEur} EUR</td>
      </tr>
    </table>

    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0">
      ${labelValue('Начин на доставка', deliveryLabel)}
      ${labelValue('Адрес', `${addressOrOffice}, ${city}`)}
      ${labelValue('Плащане', 'Наложен платеж')}
      ${labelValue('Бележки', notes)}
    </table>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#7A6C5C;">При въпроси се свържете с нас на <a href="mailto:${process.env.NOTIFY_EMAIL}" style="color:#D4940C;">${process.env.NOTIFY_EMAIL}</a></p>
  ` : `
    <p style="margin:0 0 4px;font-size:12px;color:#D4940C;letter-spacing:0.08em;text-transform:uppercase;">Order confirmation</p>
    <h1 style="margin:0 0 8px;font-size:22px;color:#2A1A0E;">Thank you, ${customerName}!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#7A6C5C;">We have received your order and will contact you to confirm.</p>

    <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#2A1A0E;">Order #${orderId}</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemRows}
      <tr>
        <td colspan="2" style="padding:12px 0 4px;font-size:13px;color:#7A6C5C;">Total</td>
        <td style="padding:12px 0 4px;font-size:15px;font-weight:bold;color:#2A1A0E;text-align:right;">${totalEur} EUR</td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td style="font-size:12px;color:#7A6C5C;text-align:right;">${totalBgn} BGN</td>
      </tr>
    </table>

    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0">
      ${labelValue('Delivery', deliveryLabel)}
      ${labelValue('Address', `${addressOrOffice}, ${city}`)}
      ${labelValue('Payment', 'Cash on delivery')}
      ${labelValue('Notes', notes)}
    </table>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#7A6C5C;">Questions? Contact us at <a href="mailto:${process.env.NOTIFY_EMAIL}" style="color:#D4940C;">${process.env.NOTIFY_EMAIL}</a></p>
  `;

  const textItems = items.map(({ name, qty, unitPrice }) => `  - ${name} × ${qty} — ${(unitPrice * qty).toFixed(2)} ${isBg ? 'лв.' : 'BGN'}`).join('\n');
  const text = isBg
    ? `Благодарим, ${customerName}!\n\nПоръчка #${orderId}\n\n${textItems}\n\nСума: ${totalBgn} лв. (${totalEur} EUR)\nДоставка: ${deliveryLabel} — наложен платеж\nАдрес: ${addressOrOffice}, ${city}${notes ? `\nБележки: ${notes}` : ''}`
    : `Thank you, ${customerName}!\n\nOrder #${orderId}\n\n${textItems}\n\nTotal: ${totalEur} EUR (${totalBgn} BGN)\nDelivery: ${deliveryLabel} — cash on delivery\nAddress: ${addressOrOffice}, ${city}${notes ? `\nNotes: ${notes}` : ''}`;

  const subject = isBg ? `Поръчка #${orderId} получена — Медовината` : `Order #${orderId} received — Medovinata`;

  try {
    await makeTransport().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: email,
      subject,
      text,
      html: buildHtml(bodyHtml),
    });
  } catch (err) {
    console.error('[email] Failed to send order confirmation:', err?.message ?? err);
  }
}

export async function sendWholesaleConfirmation({ companyName, contactName, email, message, locale = 'bg' }) {
  if (!process.env.SMTP_HOST || !email) return;

  const isBg = locale !== 'en';

  const bodyHtml = isBg ? `
    <p style="margin:0 0 4px;font-size:12px;color:#6B2A5C;letter-spacing:0.08em;text-transform:uppercase;">Заявката е получена</p>
    <h1 style="margin:0 0 8px;font-size:22px;color:#2A1A0E;">Благодарим, ${contactName}!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#7A6C5C;">Получихме Вашата B2B заявка от <strong>${companyName}</strong> и ще се свържем с Вас в най-кратък срок.</p>
    ${divider()}
    <p style="margin:0 0 8px;font-size:13px;color:#7A6C5C;">Заявени продукти</p>
    <p style="margin:0;font-size:14px;color:#2A1A0E;">${message}</p>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#7A6C5C;">При въпроси се свържете с нас на <a href="mailto:${process.env.NOTIFY_EMAIL}" style="color:#D4940C;">${process.env.NOTIFY_EMAIL}</a></p>
  ` : `
    <p style="margin:0 0 4px;font-size:12px;color:#6B2A5C;letter-spacing:0.08em;text-transform:uppercase;">Inquiry received</p>
    <h1 style="margin:0 0 8px;font-size:22px;color:#2A1A0E;">Thank you, ${contactName}!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#7A6C5C;">We have received your wholesale inquiry from <strong>${companyName}</strong> and will get back to you shortly.</p>
    ${divider()}
    <p style="margin:0 0 8px;font-size:13px;color:#7A6C5C;">Requested products</p>
    <p style="margin:0;font-size:14px;color:#2A1A0E;">${message}</p>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#7A6C5C;">Questions? Contact us at <a href="mailto:${process.env.NOTIFY_EMAIL}" style="color:#D4940C;">${process.env.NOTIFY_EMAIL}</a></p>
  `;

  const text = isBg
    ? `Благодарим, ${contactName}!\n\nПолучихме Вашата заявка от ${companyName} и ще се свържем с Вас в най-кратък срок.\n\nЗаявени продукти: ${message}`
    : `Thank you, ${contactName}!\n\nWe have received your inquiry from ${companyName} and will get back to you shortly.\n\nRequested products: ${message}`;

  const subject = isBg ? `Заявката Ви е получена — Медовината` : `Your inquiry has been received — Medovinata`;

  try {
    await makeTransport().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: email,
      subject,
      text,
      html: buildHtml(bodyHtml),
    });
  } catch (err) {
    console.error('[email] Failed to send wholesale confirmation:', err?.message ?? err);
  }
}
