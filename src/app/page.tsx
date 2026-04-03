import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Wrench,
  Zap,
  Droplets,
  Paintbrush,
  Wind,
  Hammer,
  Shield,
  Star,
  CheckCircle,
  Phone,
  ChevronRight,
} from 'lucide-react'

export default async function LandingPage() {
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const t = {
    nav: {
      login: isRTL ? 'تسجيل الدخول' : 'Connexion',
      langToggleLabel: isRTL ? 'FR' : 'AR',
      langToggleHref: isRTL
        ? '/api/v1/locale/set?lang=fr'
        : '/api/v1/locale/set?lang=ar',
    },
    hero: {
      headline: isRTL
        ? 'اعثر على الحرفي المناسب في دقائق'
        : "Trouvez l\u2019artisan qu\u2019il vous faut, en quelques minutes",
      sub: isRTL
        ? 'كهربائيون، سباكون، دهانون والمزيد — موثقون، مقيّمون، متاحون في الدار البيضاء'
        : 'Électriciens, plombiers, peintres et plus — vérifiés, notés, disponibles à Casablanca',
      cta1: isRTL ? 'نشر طلب' : 'Publier une demande',
      cta2: isRTL ? 'انضم كحرفي' : 'Devenir artisan',
    },
    stats: isRTL
      ? [
          { number: '500+', label: 'حرفي موثق' },
          { number: '2 000+', label: 'طلب منجز' },
          { number: '4.8★', label: 'متوسط التقييم' },
        ]
      : [
          { number: '500+', label: 'Artisans vérifiés' },
          { number: '2 000+', label: 'Demandes traitées' },
          { number: '4.8★', label: 'Note moyenne' },
        ],
    how: {
      title: isRTL ? 'كيف يعمل؟' : 'Comment ça marche ?',
      steps: isRTL
        ? [
            {
              icon: '📋',
              title: 'صف احتياجك',
              desc: 'في أقل من 60 ثانية، صف مشكلتك وموقعك',
            },
            {
              icon: '🎯',
              title: 'استقبل العروض',
              desc: 'يتواصل معك حتى 3 حرفيين موثقين بأسعارهم',
            },
            {
              icon: '✅',
              title: 'اختر وادفع',
              desc: 'قارن، اختر، وقيّم حرفيك',
            },
          ]
        : [
            {
              icon: '📋',
              title: 'Décrivez votre besoin',
              desc: "En moins de 60 secondes, décrivez votre problème et votre localisation",
            },
            {
              icon: '🎯',
              title: 'Recevez des offres',
              desc: "Jusqu\u2019à 3 artisans vérifiés vous contactent avec leurs prix",
            },
            {
              icon: '✅',
              title: 'Choisissez et payez',
              desc: 'Comparez, choisissez, et évaluez votre artisan',
            },
          ],
    },
    categories: {
      title: isRTL ? 'كل احتياجاتك، في مكان واحد' : 'Tous vos besoins, un seul endroit',
    },
    trust: {
      title: isRTL ? 'أمانك، أولويتنا' : 'Votre sécurité, notre priorité',
      points: isRTL
        ? [
            { title: 'حرفيون موثقون', desc: 'بطاقة الهوية والتحقق اليدوي' },
            { title: 'تقييمات حقيقية', desc: 'تُقيَّم بعد كل عمل' },
            { title: 'صفر بريد مزعج', desc: 'حد أقصى 3 حرفيين لكل طلب' },
            { title: 'دعم متاح', desc: 'فريق مقيم في المغرب' },
          ]
        : [
            { title: 'Artisans vérifiés', desc: 'CIN + vérification manuelle' },
            { title: 'Avis authentiques', desc: 'Évalués après chaque travail' },
            { title: 'Zéro spam', desc: 'Max 3 artisans par demande' },
            { title: 'Support disponible', desc: 'Équipe basée au Maroc' },
          ],
    },
    testimonials: [
      {
        name: 'Mohamed B.',
        city: isRTL ? 'الدار البيضاء' : 'Casablanca',
        rating: 5,
        comment: isRTL
          ? 'وجدت كهربائياً ممتازاً في 30 دقيقة. خدمة لا تشوبها شائبة!'
          : "J'ai trouvé un excellent électricien en 30 minutes. Service impeccable !",
        initial: 'M',
      },
      {
        name: 'Fatima Z.',
        city: isRTL ? 'الرباط' : 'Rabat',
        rating: 5,
        comment: isRTL
          ? 'عملي جداً، الحرفيون محترفون ومنضبطون في المواعيد.'
          : 'Très pratique, les artisans sont professionnels et ponctuels.',
        initial: 'F',
      },
      {
        name: 'Youssef A.',
        city: isRTL ? 'الدار البيضاء' : 'Casablanca',
        rating: 5,
        comment: isRTL
          ? 'تطبيق بسيط وفعّال. أنصح به!'
          : 'Application simple et efficace. Je recommande !',
        initial: 'Y',
      },
    ],
    providerCta: {
      badge: isRTL ? 'للحرفيين' : 'Pour les artisans',
      title: isRTL ? 'أنت حرفي؟ انضم إلى أنظار' : 'Vous êtes artisan ? Rejoignez Anzar',
      sub: isRTL
        ? 'تلقَّ مهام مؤهلة مباشرة على هاتفك'
        : 'Recevez des missions qualifiées directement sur votre téléphone',
      cta: isRTL ? 'إنشاء ملفي مجاناً' : 'Créer mon profil gratuit',
    },
    footer: {
      tagline: isRTL
        ? 'أنظار · منصة الحرفيين الموثوقين'
        : 'Anzar · La plateforme des artisans de confiance',
      links: isRTL
        ? [
            { label: 'كيف يعمل؟', href: '#how' },
            { label: 'الحرفيون', href: '#categories' },
            { label: 'اتصل بنا', href: 'mailto:contact@anzar.ma' },
          ]
        : [
            { label: 'Comment ça marche', href: '#how' },
            { label: 'Artisans', href: '#categories' },
            { label: 'Contact', href: 'mailto:contact@anzar.ma' },
          ],
      copy: isRTL
        ? '© 2025 أنظار. جميع الحقوق محفوظة.'
        : '© 2025 Anzar. Tous droits réservés.',
      langLabel: isRTL ? '🇫🇷 Français' : '🇲🇦 العربية',
    },
  }

  const categories = [
    { Icon: Zap, label: isRTL ? 'كهربائي' : 'Électricien', iconCls: 'text-yellow-500', bgCls: 'bg-yellow-50' },
    { Icon: Droplets, label: isRTL ? 'سباك' : 'Plombier', iconCls: 'text-blue-500', bgCls: 'bg-blue-50' },
    { Icon: Paintbrush, label: isRTL ? 'دهان' : 'Peinture', iconCls: 'text-pink-500', bgCls: 'bg-pink-50' },
    { Icon: Wind, label: isRTL ? 'تكييف' : 'Climatisation', iconCls: 'text-cyan-500', bgCls: 'bg-cyan-50' },
    { Icon: Wrench, label: isRTL ? 'بلاط' : 'Carreleur', iconCls: 'text-orange-500', bgCls: 'bg-orange-50' },
    { Icon: Hammer, label: isRTL ? 'صانع' : 'Bricoleur', iconCls: 'text-green-600', bgCls: 'bg-green-50' },
  ]

  const trustIconComponents = [CheckCircle, Star, Shield, Phone]
  const trustIconStyles = [
    'text-emerald-600 bg-emerald-50',
    'text-amber-500 bg-amber-50',
    'text-blue-600 bg-blue-50',
    'text-violet-600 bg-violet-50',
  ]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F7F7F5] text-gray-900">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EBEBEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo.png" alt="Anzar" width={140} height={50} className="h-10 w-auto object-contain" priority />
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={t.nav.langToggleHref}
              className="text-sm font-semibold text-gray-600 hover:text-[#1A6B4A] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-[#EBEBEB]"
            >
              {t.nav.langToggleLabel}
            </Link>
            <Link
              href="/auth"
              className="bg-[#1A6B4A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#155c3e] transition-colors shadow-sm"
            >
              {t.nav.login}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A6B4A] via-[#1A6B4A] to-[#155c3e]">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -left-16 w-64 h-64 rounded-full bg-white/[0.03]" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-white/[0.04]" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-0">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E8A838] animate-pulse" />
            <span className="text-white/90 text-sm font-medium">
              {isRTL ? 'متاح الآن في الدار البيضاء' : 'Disponible à Casablanca'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl mb-5 text-balance">
            {t.hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mb-10 leading-relaxed">
            {t.hero.sub}
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-3 mb-16 ${isRTL ? 'sm:justify-end' : ''}`}>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 bg-[#E8A838] hover:bg-[#d4952e] text-white font-semibold px-7 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-[#E8A838]/30 hover:-translate-y-0.5 text-base"
            >
              {t.hero.cta1}
              <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-4 rounded-2xl transition-all duration-200 text-base"
            >
              {t.hero.cta2}
            </Link>
          </div>

          {/* Stats bar */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-t-3xl px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/15 rtl:sm:divide-x-reverse">
              {t.stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center py-2 sm:py-0 sm:px-8 w-full sm:w-auto">
                  <span className="text-2xl font-bold text-white">{stat.number}</span>
                  <span className="text-white/65 text-sm mt-0.5 text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-sm font-semibold text-[#1A6B4A] bg-[#1A6B4A]/8 px-4 py-1.5 rounded-full mb-4">
              {isRTL ? 'بسيط وسريع' : 'Simple & rapide'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.how.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {t.how.steps.map((step, i) => (
              <div
                key={i}
                className="relative bg-[#F7F7F5] rounded-2xl p-7 border border-[#EBEBEB] hover:border-[#1A6B4A]/40 hover:shadow-lg transition-all duration-200 group"
              >
                {/* Step number bubble */}
                <div className="absolute -top-4 start-6 w-8 h-8 bg-[#1A6B4A] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <div className="text-4xl mb-4 mt-2">{step.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section id="categories" className="py-20 bg-[#F7F7F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-sm font-semibold text-[#1A6B4A] bg-[#1A6B4A]/8 px-4 py-1.5 rounded-full mb-4">
              {isRTL ? 'الخدمات' : 'Services'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.categories.title}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ Icon, label, iconCls, bgCls }, i) => (
              <Link
                key={i}
                href="/auth"
                className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-[#EBEBEB] hover:border-[#1A6B4A] hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 ${bgCls} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className={`w-6 h-6 ${iconCls}`} strokeWidth={1.75} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1A6B4A] transition-colors text-center">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-sm font-semibold text-[#1A6B4A] bg-[#1A6B4A]/8 px-4 py-1.5 rounded-full mb-4">
              {isRTL ? 'الثقة والأمان' : 'Confiance & sécurité'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.trust.title}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.trust.points.map((point, i) => {
              const TrustIcon = trustIconComponents[i]
              return (
                <div
                  key={i}
                  className="flex flex-col gap-3 p-6 bg-[#F7F7F5] rounded-2xl border border-[#EBEBEB] hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${trustIconStyles[i]}`}
                  >
                    <TrustIcon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{point.title}</h4>
                    <p className="text-sm text-gray-500">{point.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#F7F7F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-sm font-semibold text-[#1A6B4A] bg-[#1A6B4A]/8 px-4 py-1.5 rounded-full mb-4">
              {isRTL ? 'آراء المستخدمين' : 'Témoignages'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {isRTL ? 'ماذا يقول مستخدمونا' : 'Ce que disent nos utilisateurs'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[#EBEBEB] hover:shadow-lg transition-shadow duration-200 flex flex-col gap-4"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-[#E8A838] fill-[#E8A838]" />
                  ))}
                </div>
                {/* Comment */}
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A6B4A] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {testimonial.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVIDER CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-[#1A6B4A] to-[#155c3e] relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -top-8 left-1/4 w-32 h-32 rounded-full bg-white/[0.04]" />
          <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-[#E8A838]/10" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-[#E8A838]/20 border border-[#E8A838]/30 text-[#E8A838] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            {t.providerCta.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.providerCta.title}
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed">
            {t.providerCta.sub}
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-white text-[#1A6B4A] font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-xl hover:-translate-y-0.5 text-base"
          >
            {t.providerCta.cta}
            <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 flex-wrap">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src="/logo.png" alt="Anzar" width={120} height={40} className="h-8 w-auto object-contain brightness-0 invert" />
              </div>
              <p className="text-sm text-gray-500 max-w-xs">{t.footer.tagline}</p>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {t.footer.links.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Lang toggle */}
            <Link
              href={t.nav.langToggleHref}
              className="text-sm font-medium text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 transition-all"
            >
              {t.footer.langLabel}
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800 text-xs text-gray-600 text-center">
            {t.footer.copy}
          </div>
        </div>
      </footer>
    </div>
  )
}
