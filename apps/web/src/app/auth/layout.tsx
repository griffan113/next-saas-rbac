import { isAuthenticated } from '@/auth/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (await isAuthenticated()) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center flex-col px-4 ">
      <div className="w-full max-w-xs">{children}</div>
    </div>
  )
}
