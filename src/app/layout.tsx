import type { Metadata, Viewport } from 'next'
import { SETTINGS_STORAGE_KEY } from '@/shared/constants/storage'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orbita — Tu negocio, en órbita',
  description: 'El CRM simple y adaptable para clínicas, talleres, clubes, gimnasios y centros de estética.',
  applicationName: 'Orbita',
  // iPhone: al "Agregar a inicio" abre a pantalla completa, con su ícono y nombre
  appleWebApp: { capable: true, title: 'Orbita', statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-icon.png' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5fb' },
    { media: '(prefers-color-scheme: dark)', color: '#070914' },
  ],
}

// Las fuentes se cargan desde el navegador: si no hay conexión, se usa la del sistema sin bloquear nada
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap'

// Aplica tema y color antes de pintar para que no haya parpadeo
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem('${SETTINGS_STORAGE_KEY}')||'{}').state||{};var t=s.theme||'light';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');r.dataset.accent=s.accent||'violeta';}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-accent="violeta" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body>{children}</body>
    </html>
  )
}
