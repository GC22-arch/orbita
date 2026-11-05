import Link from 'next/link'

export default function RevisaTuEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-20 w-20 animate-float place-items-center rounded-full bg-gradient-accent text-4xl shadow-glow">📬</div>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Revisa tu email</h1>
      <p className="mt-3 text-muted">Te enviamos un enlace para confirmar tu cuenta. Tócalo y entras directo a Orbita.</p>
      <p className="mt-2 text-sm text-muted">¿No llega? Mira en la carpeta de spam o promociones.</p>
      <Link href="/login" className="mt-8 inline-block font-semibold text-accent hover:underline">Volver a iniciar sesión</Link>
    </div>
  )
}
