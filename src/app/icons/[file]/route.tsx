import { ImageResponse } from 'next/og'

// Íconos de la app instalable: /icons/icon-192.png, /icons/icon-512.png, /icons/apple-icon.png
const SIZES: Record<string, number> = {
  'icon-192.png': 192,
  'icon-512.png': 512,
  'apple-icon.png': 180,
}

export function generateStaticParams() {
  return Object.keys(SIZES).map((file) => ({ file }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const size = SIZES[file]
  if (!size) return new Response('No encontrado', { status: 404 })

  // Fondo a sangre y logo dentro de la zona segura (80%), para que sirva también como ícono "maskable"
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c5cff 0%, #38bdf8 100%)',
        }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="9" fill="#ffffff" />
          <ellipse
            cx="20"
            cy="20"
            rx="17"
            ry="7"
            stroke="#ffffff"
            strokeWidth="2.2"
            transform="rotate(-28 20 20)"
            opacity="0.9"
          />
          <circle cx="34.5" cy="12.5" r="2.6" fill="#ffffff" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  )
}
