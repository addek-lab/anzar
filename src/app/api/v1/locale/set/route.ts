import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang')
  const validLang = lang === 'ar' ? 'ar' : 'fr'

  const referer = req.headers.get('referer') || '/'
  const response = NextResponse.redirect(referer)

  response.cookies.set('locale', validLang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  return response
}
