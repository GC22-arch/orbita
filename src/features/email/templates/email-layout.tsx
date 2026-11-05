import type { CSSProperties, ReactNode } from 'react'
import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'

interface EmailLayoutProps {
  preview: string
  children: ReactNode
  footer: string
}

/** Marco común de los emails de Orbita: claro, con el degradé de la marca */
export function EmailLayout({ preview, children, footer }: EmailLayoutProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brandBar} />
          <Section style={card}>
            <Text style={brand}>◐ Orbita</Text>
            {children}
          </Section>
          <Hr style={divider} />
          <Text style={footerText}>{footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={buttonWrap}>
      <Link href={href} style={button}>
        {children}
      </Link>
    </Section>
  )
}

export const heading: CSSProperties = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: '1.3',
  margin: '8px 0 12px',
}

export const paragraph: CSSProperties = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

export const small: CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '16px 0 0',
}

const main: CSSProperties = {
  backgroundColor: '#f4f5fb',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '32px 12px',
}

const container: CSSProperties = { maxWidth: '520px', margin: '0 auto' }

const brandBar: CSSProperties = {
  height: '6px',
  borderRadius: '6px 6px 0 0',
  background: 'linear-gradient(90deg, #7c5cff, #38bdf8)',
  backgroundColor: '#7c5cff',
}

const card: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '0 0 20px 20px',
  padding: '28px 32px 32px',
  boxShadow: '0 12px 40px rgba(76, 64, 160, 0.10)',
}

const brand: CSSProperties = {
  color: '#7c5cff',
  fontSize: '15px',
  fontWeight: 700,
  letterSpacing: '0.02em',
  margin: '0 0 8px',
}

const buttonWrap: CSSProperties = { textAlign: 'center', margin: '28px 0 8px' }

const button: CSSProperties = {
  backgroundColor: '#7c5cff',
  background: 'linear-gradient(90deg, #7c5cff, #38bdf8)',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '14px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 700,
  display: 'inline-block',
}

const divider: CSSProperties = { borderColor: 'transparent', margin: '8px 0' }

const footerText: CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center',
  margin: 0,
}
