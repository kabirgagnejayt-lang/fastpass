'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/components/theme-provider'
import { FirebaseClientProvider } from '@/firebase/client-provider'
import { Toaster } from '@/components/ui/toaster'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSdkPage = pathname.startsWith('/sdk')

  if (isSdkPage) {
    // For SDK pages, render children without any providers or extra markup.
    return <>{children}</>
  }

  // For all other pages, use the full layout with theme and firebase providers.
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <FirebaseClientProvider>
        {children}
      </FirebaseClientProvider>
      <Toaster />
    </ThemeProvider>
  )
}
