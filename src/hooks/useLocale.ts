'use client'

import { useLocale as useNextIntlLocale } from 'next-intl'

export function useLocale() {
  const locale = useNextIntlLocale()
  const isRTL = locale === 'ar'

  return { locale, isRTL }
}
