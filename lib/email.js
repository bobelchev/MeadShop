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

const DELIVERY_LABELS = {
  bg: { ekont_office: 'Еконт — офис', ekont_door: 'Еконт — до адрес', speedy_office: 'Спийди — офис', speedy_door: 'Спийди — до адрес' },
  en: { ekont_office: 'Econt — office', ekont_door: 'Econt — to address', speedy_office: 'Speedy — office', speedy_door: 'Speedy — to address' },
};

export async function sendOrderNotification({
  orderId,
  customerName,
  phone,
  email,
  deliveryMethod,
  addressOrOffice,
  city,
  notes,
  totalAmount,
}) {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_EMAIL) return;

  const transport = makeTransport();

  const lines = [
    `Нова поръчка #${orderId}`,
    ``,
    `Клиент: ${customerName}`,
    `Телефон: ${phone}`,
    email ? `Email: ${email}` : null,
    `Доставка: ${deliveryMethod}`,
    `Адрес: ${addressOrOffice}, ${city}`,
    notes ? `Бележки: ${notes}` : null,
    ``,
    `Сума: ${Number(totalAmount).toFixed(2)} лв.`,
  ].filter((l) => l !== null);

  try {
    await transport.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: `Нова поръчка #${orderId} — ${customerName}`,
      text: lines.join('\n'),
    });
  } catch (err) {
    console.error('[email] Failed to send order notification:', err?.message ?? err);
  }
}

export async function sendWholesaleNotification({ inquiryId, companyName, contactName, phone, email, message }) {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_EMAIL) return;

  const transport = makeTransport();

  const lines = [
    `Нова B2B заявка #${inquiryId}`,
    ``,
    `Фирма: ${companyName}`,
    `Контакт: ${contactName}`,
    `Телефон: ${phone}`,
    email ? `Email: ${email}` : null,
    ``,
    `Продукти: ${message}`,
  ].filter((l) => l !== null);

  try {
    await transport.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: `Нова B2B заявка #${inquiryId} — ${companyName}`,
      text: lines.join('\n'),
    });
  } catch (err) {
    console.error('[email] Failed to send wholesale notification:', err?.message ?? err);
  }
}

export async function sendOrderConfirmation({ orderId, customerName, email, deliveryMethod, addressOrOffice, city, notes, items, totalAmount, locale = 'bg' }) {
  if (!process.env.SMTP_HOST || !email) return;

  const isBg = locale !== 'en';
  const totalBgn = Number(totalAmount).toFixed(2);
  const totalEur = (Number(totalAmount) / EUR_TO_BGN).toFixed(2);
  const deliveryLabel = (DELIVERY_LABELS[isBg ? 'bg' : 'en'][deliveryMethod]) ?? deliveryMethod;

  const itemLines = items.map(({ name, qty, unitPrice }) =>
    `  - ${name} × ${qty} — ${(unitPrice * qty).toFixed(2)} ${isBg ? 'лв.' : 'BGN'}`
  );

  const lines = isBg ? [
    `Здравейте, ${customerName},`,
    ``,
    `Благодарим за поръчката Ви! Получихме я и ще се свържем с Вас за потвърждение.`,
    ``,
    `Поръчка #${orderId}`,
    ``,
    ...itemLines,
    ``,
    `Сума: ${totalBgn} лв. (${totalEur} EUR)`,
    `Доставка: ${deliveryLabel} — наложен платеж`,
    `Адрес: ${addressOrOffice}, ${city}`,
    notes ? `Бележки: ${notes}` : null,
  ] : [
    `Hello ${customerName},`,
    ``,
    `Thank you for your order! We have received it and will contact you to confirm.`,
    ``,
    `Order #${orderId}`,
    ``,
    ...itemLines,
    ``,
    `Total: ${totalEur} EUR (${totalBgn} BGN)`,
    `Delivery: ${deliveryLabel} — cash on delivery`,
    `Address: ${addressOrOffice}, ${city}`,
    notes ? `Notes: ${notes}` : null,
  ];

  const subject = isBg
    ? `Поръчка #${orderId} получена — Honey & Mead Shop`
    : `Order #${orderId} received — Honey & Mead Shop`;

  try {
    await makeTransport().sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      text: lines.filter((l) => l !== null).join('\n'),
    });
  } catch (err) {
    console.error('[email] Failed to send order confirmation:', err?.message ?? err);
  }
}

export async function sendWholesaleConfirmation({ companyName, contactName, email, message, locale = 'bg' }) {
  if (!process.env.SMTP_HOST || !email) return;

  const isBg = locale !== 'en';

  const lines = isBg ? [
    `Здравейте, ${contactName},`,
    ``,
    `Благодарим за интереса към нашите продукти! Получихме Вашата заявка и ще се свържем с Вас в най-кратък срок.`,
    ``,
    `Заявени продукти: ${message}`,
  ] : [
    `Hello ${contactName},`,
    ``,
    `Thank you for your interest in our products! We have received your wholesale inquiry and will get back to you shortly.`,
    ``,
    `Requested products: ${message}`,
  ];

  const subject = isBg
    ? `Заявката Ви е получена — Honey & Mead Shop`
    : `Your inquiry has been received — Honey & Mead Shop`;

  try {
    await makeTransport().sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      text: lines.join('\n'),
    });
  } catch (err) {
    console.error('[email] Failed to send wholesale confirmation:', err?.message ?? err);
  }
}
