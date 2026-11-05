import { redirect } from 'next/navigation'

// El proxy ya exige sesión; el inicio decide si falta crear el negocio
export default function Home() {
  redirect('/inicio')
}
