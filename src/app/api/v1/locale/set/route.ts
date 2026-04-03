import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang')
  const validLang = lang === 'ar' ? 'ar' : 'fr'

  // Strip any previous ?lang= param from referer, then redirect
  const referer = req.headers.get('referer') || '/'
  const redirectUrl = new URL(referer)
  redirectUrl.searchParams.delete('lang')

  const response = NextResponse.redirect(redirectUrl.toString(), { status: 302 })

  response.cookies.set('locale', validLang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  // Tell Next.js not to serve a stale cached version
  response.headers.set('Cache-Control', 'no-store')

  return response
}
