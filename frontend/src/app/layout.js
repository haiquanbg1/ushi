import './globals.css'
import Providers from './providers'
import { ToastProvider } from '@/components/utils/ToaskProvider'

export const metadata = {
  title: 'Restaurant Management System',
  description: 'A comprehensive restaurant management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider>
          <Providers>
            {children}
          </Providers>
        </ToastProvider>
      </body>
    </html>
  )
}