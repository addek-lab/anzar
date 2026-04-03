import { getTranslations, getLocale } from 'next-intl/server'

export default async function PendingPage() {
  const t = await getTranslations('provider')
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-sm text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 rounded-full mx-auto flex items-center justify-center">
          <span className="text-4xl">⏳</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('onboarding.pendingTitle')}</h1>
          <p className="text-gray-500 mt-3">{t('onboarding.pendingHint')}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-start space-y-2">
          {[
            isRTL ? '✅ تم استلام ملفك' : '✅ Dossier reçu',
            isRTL ? '🔍 مراجعة الوثائق (24-48 ساعة)' : '🔍 Vérification des documents (24-48h)',
            isRTL ? '📱 تأكيد عبر SMS' : '📱 Confirmation par SMS',
          ].map(step => (
            <p key={step} className="text-sm text-gray-700">{step}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
