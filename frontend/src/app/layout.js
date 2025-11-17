import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'Restaurant Management System',
  description: 'A comprehensive restaurant management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}