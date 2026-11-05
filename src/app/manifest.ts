import type { MetadataRoute } from 'next'

/** Datos para instalar Orbita en el celular o la compu como una app más */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orbita — Tu negocio, en órbita',
    short_name: 'Orbita',
    description: 'Clientes, turnos, caja y cuotas de tu negocio en un solo lugar.',
    lang: 'es',
    start_url: '/inicio',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4f5fb',
    theme_color: '#7c5cff',
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Agenda', url: '/agenda', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Clientes', url: '/clientes', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Caja', url: '/caja', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
