import { AuroraBackground, OrbitaLogo } from '@/shared/components/aurora-background'
import { ThemeController } from '@/shared/components/theme-controller'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <ThemeController />
      <AuroraBackground />
      <div className="mb-8 flex animate-rise items-center gap-3">
        <OrbitaLogo size={44} />
        <span className="font-display text-2xl font-bold">Orbita</span>
      </div>
      <div className="glass-strong w-full max-w-md animate-rise rounded-4xl p-6 sm:p-10">{children}</div>
    </div>
  )
}
