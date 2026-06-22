import nodemailer from 'nodemailer';

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

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

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

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL,
    subject: `Нова поръчка #${orderId} — ${customerName}`,
    text: lines.join('\n'),
  });
}
