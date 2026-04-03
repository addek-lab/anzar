import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'fr'
  const validLocale = ['fr', 'ar'].includes(locale) ? locale : 'fr'

  return {
    locale: validLocale,
    messages: (await import(`./public/locales/${validLocale}/common.json`)).default,
  }
})
