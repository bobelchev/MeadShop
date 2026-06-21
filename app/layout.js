import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Мед & Медовина',
  description: 'Магазин за мед и медовина',
}

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
