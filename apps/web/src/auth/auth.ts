import { cookies } from 'next/headers'

export async function isAuthenticated() {
  const requestCookies = await cookies()

  return !!requestCookies.get('auth_token')?.value
}
