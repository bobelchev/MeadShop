import './globals.css';

export const metadata = {
  title: 'Мед & Медовина',
  description: 'Онлайн магазин за мед и медовина',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
