import { signInWithGithub } from '@/http/sign-in-with-github'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')

  if (!code)
    return NextResponse.json(
      {
        message: 'O código OAuth do GitHub não foi encontrado',
      },
      { status: 400 }
    )

  const { token } = await signInWithGithub({ code })

  const requestCookies = await cookies()

  requestCookies.set('auth_token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  })

  const redirectUrl = request.nextUrl.clone()

  redirectUrl.pathname = '/'

  return NextResponse.redirect(redirectUrl)
}
