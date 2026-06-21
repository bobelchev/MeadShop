import './globals.css';

export const metadata = {
  title: 'Мед & Медовина',
  description: 'Онлайн магазин за мед и медовина',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <head>
        {/*
          Google Fonts — Playfair Display (display serif) + Inter (body sans)
          Two separate font families, variable-weight where available.
          preconnect cuts DNS + TLS overhead before the stylesheet fetch.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
