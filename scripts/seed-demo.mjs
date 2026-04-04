/**
 * Demo seed script — creates 20 customers + 20 providers with realistic Moroccan data
 * Run: /opt/homebrew/bin/node scripts/seed-demo.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qwleibaumkargbqiyuyc.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bGVpYmF1bWthcmdicWl5dXljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc4NzU1OCwiZXhwIjoyMDkwMzYzNTU4fQ.naDJu5Dh-jzrGpXXpuGrGFzb-rosGFGQaB-284Xu8E0'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Reference data ────────────────────────────────────────────────────────────
const CITY_ID = '10000000-0000-0000-0000-000000000001' // Casablanca

const CATEGORIES = {
  electricien: '00000000-0000-0000-0000-000000000001',
  plombier:    '00000000-0000-0000-0000-000000000002',
  peinture:    '00000000-0000-0000-0000-000000000003',
  clim:        '00000000-0000-0000-0000-000000000004',
  carreleur:   '00000000-0000-0000-0000-000000000005',
  bricoleur:   '00000000-0000-0000-0000-000000000006',
}

const NEIGHBORHOODS = [
  'a72110a3-9117-4786-951c-0c13051f1d0b', // Maarif
  '9c4671e2-6faf-4fa6-bac9-7126ac54195e', // Ain Diab
  '53bbc786-76a2-4642-b7b7-6f62c9478d29', // Anfa
  '4fafea9a-10ff-4444-bcce-d6a3b9617488', // Bourgogne
  '95936b79-3b5e-4721-b87b-af01a05dc3e6', // CIL
  '710c06ab-1f3c-48bd-b736-32a50ff8abd1', // Derb Sultan
  'ce1e5f3f-0151-48e8-92c0-2788dbdb5349', // El Fida
  'cc2cdaf1-a48e-4ac1-a625-7d9c274800bb', // Gauthier
  'b1239f7e-2a53-40d0-b85e-70c75845e761', // Hay Hassani
  '084d0f46-69d0-4570-80c8-bf97ea826f8e', // Hay Mohammadi
  'd2aa7f24-8baa-4951-86fd-d1d8db4c697c', // Oulfa
  '0a981168-d63f-4844-88b5-a0b862a407fd', // Sidi Belyout
  '94ff7c03-68b7-45d3-a75f-875855d79079', // Sidi Maarouf
  '96420e95-17c9-44ec-9c57-aff3a221053d', // Ain Chock
  '8544b79a-2e2d-45fa-a522-676919f50e57', // Ain Sebaa
]

// ── Fake data ─────────────────────────────────────────────────────────────────
const CUSTOMER_DATA = [
  { name: 'Karim Benali',       phone: '+212612000001', desc: 'Prise électrique grillée dans le salon, odeur de brûlé. À réparer rapidement.', cat: 'electricien', urgency: 'urgent',   budget: '300-500 MAD' },
  { name: 'Salma Idrissi',      phone: '+212612000002', desc: 'Fuite sous l\'évier de la cuisine depuis 2 jours, dégâts sur le meuble.', cat: 'plombier',    urgency: 'urgent',   budget: '400 MAD' },
  { name: 'Omar Tazi',          phone: '+212612000003', desc: 'Peinture du salon 30m², couleur beige, murs déjà préparés.', cat: 'peinture',    urgency: 'soon',     budget: '1500-2000 MAD' },
  { name: 'Nadia Fassi',        phone: '+212612000004', desc: 'Clim split 12000 BTU à installer dans la chambre, unité déjà achetée.', cat: 'clim',        urgency: 'soon',     budget: '600 MAD pose' },
  { name: 'Youssef Alami',      phone: '+212612000005', desc: 'Carrelage salle de bain 8m² à remplacer, matériaux fournis.', cat: 'carreleur',   urgency: 'flexible', budget: 'Flexible' },
  { name: 'Zineb Chraibi',      phone: '+212612000006', desc: 'Tableau électrique à mettre aux normes, disjoncteurs à changer.', cat: 'electricien', urgency: 'soon',     budget: '800-1200 MAD' },
  { name: 'Hamid Kettani',      phone: '+212612000007', desc: 'Robinetterie salle de bain à remplacer intégralement (baignoire + lavabo).', cat: 'plombier',    urgency: 'flexible', budget: '700 MAD hors pièces' },
  { name: 'Laila Berrada',      phone: '+212612000008', desc: 'Peinture façade villa, surface environ 120m², échafaudage nécessaire.', cat: 'peinture',    urgency: 'flexible', budget: '8000-10000 MAD' },
  { name: 'Mehdi Bennani',      phone: '+212612000009', desc: 'Nettoyage et recharge de 3 climatiseurs pour l\'été.', cat: 'clim',        urgency: 'urgent',   budget: '150 MAD/unité' },
  { name: 'Houda Mansouri',     phone: '+212612000010', desc: 'Pose carrelage terrasse 25m², matériaux à fournir aussi.', cat: 'carreleur',   urgency: 'soon',     budget: 'Devis souhaité' },
  { name: 'Rachid Benjelloun',  phone: '+212612000011', desc: 'Installation VMC salle de bain + cuisine, appartement neuf.', cat: 'bricoleur',   urgency: 'soon',     budget: '500 MAD' },
  { name: 'Fatima Ouali',       phone: '+212612000012', desc: 'Interrupteurs et prises à changer dans tout l\'appartement (F4).', cat: 'electricien', urgency: 'flexible', budget: '400-600 MAD' },
  { name: 'Amine Soussi',       phone: '+212612000013', desc: 'WC bouché, vidange à faire, plombier urgent merci.', cat: 'plombier',    urgency: 'urgent',   budget: '200 MAD' },
  { name: 'Khadija Lamrani',    phone: '+212612000014', desc: 'Peinture 2 chambres enfants, thème dessin animé, créativité bienvenue.', cat: 'peinture',    urgency: 'flexible', budget: '2000 MAD' },
  { name: 'Saad El Kouri',      phone: '+212612000015', desc: 'Climatiseur cassé, unité extérieure ne démarre plus, diagnostic souhaité.', cat: 'clim',        urgency: 'urgent',   budget: 'Selon diagnostic' },
  { name: 'Amina Hakimi',       phone: '+212612000016', desc: 'Carrelage cuisine décollé sur 4m², joints à refaire.', cat: 'carreleur',   urgency: 'soon',     budget: '300-500 MAD' },
  { name: 'Tariq Mouline',      phone: '+212612000017', desc: 'Montage meubles IKEA chambre + bibliothèque + bureau.', cat: 'bricoleur',   urgency: 'soon',     budget: '300 MAD' },
  { name: 'Souad Benkirane',    phone: '+212612000018', desc: 'Fuite toiture terrasse, infiltration dans le plafond du salon.', cat: 'plombier',    urgency: 'urgent',   budget: 'Urgent, budget ouvert' },
  { name: 'Khalid Ziani',       phone: '+212612000019', desc: 'Câblage réseau informatique bureau 5 postes + switch à installer.', cat: 'electricien', urgency: 'flexible', budget: '1500 MAD' },
  { name: 'Meryem El Fassi',    phone: '+212612000020', desc: 'Pose papier peint salon + couloir, environ 40m², papier fourni.', cat: 'peinture',    urgency: 'flexible', budget: '600 MAD pose' },
]

const PROVIDER_DATA = [
  { name: 'Hassan Chakir',     phone: '+212661000001', trade: 'electricien', exp: 12, bio: 'Électricien diplômé avec 12 ans d\'expérience à Casablanca. Spécialisé en installation et dépannage résidentiel. Disponible 7j/7 pour les urgences. Travail soigné et rapide.', rating: 4.9, reviews: 47, jobs: 89, slug: 'hassan-chakir' },
  { name: 'Brahim Lahlou',     phone: '+212661000002', trade: 'plombier',    exp: 8,  bio: 'Plombier certifié, intervention rapide dans tout Casablanca. Fuite, débouchage, remplacement robinetterie. Devis gratuit sur place. Expérience en neuf et rénovation.', rating: 4.7, reviews: 31, jobs: 62, slug: 'brahim-lahlou' },
  { name: 'Mustapha Raji',     phone: '+212661000003', trade: 'peinture',    exp: 15, bio: 'Peintre décorateur avec 15 ans de métier. Intérieur, extérieur, enduit, ravalement. Conseils couleurs inclus. Mes clients me recommandent pour la finition impeccable.', rating: 4.8, reviews: 53, jobs: 104, slug: 'mustapha-raji' },
  { name: 'Aziz Bensouda',     phone: '+212661000004', trade: 'clim',        exp: 6,  bio: 'Technicien frigoriste agréé. Pose, entretien, dépannage toutes marques de climatisation. Gainable, split, cassette. Certifié manipulation fluides frigorigènes.', rating: 4.6, reviews: 28, jobs: 55, slug: 'aziz-bensouda' },
  { name: 'Yassine Ouadghiri', phone: '+212661000005', trade: 'carreleur',   exp: 10, bio: 'Carreleur professionnel, pose en diagonale, opus, grand format. Faïence, grès cérame, marbre. Travail propre avec protection des zones non travaillées.', rating: 4.9, reviews: 39, jobs: 78, slug: 'yassine-ouadghiri' },
  { name: 'Driss Tahiri',      phone: '+212661000006', trade: 'bricoleur',   exp: 5,  bio: 'Homme à tout faire polyvalent. Montage meubles, fixations, petites réparations, jardinage. Rapide, ponctuel et soigneux. Idéal pour tous les petits travaux du quotidien.', rating: 4.5, reviews: 22, jobs: 41, slug: 'driss-tahiri' },
  { name: 'Khalid Bouazza',    phone: '+212661000007', trade: 'electricien', exp: 9,  bio: 'Électricien bâtiment et tertiaire. Tableaux électriques, domotique, éclairage LED, bornes de recharge VE. Intervention propre avec remise en état après travaux.', rating: 4.8, reviews: 35, jobs: 67, slug: 'khalid-bouazza' },
  { name: 'Said Karimi',       phone: '+212661000008', trade: 'plombier',    exp: 11, bio: 'Expert plomberie et sanitaire depuis 11 ans. Rénovation complète de salles de bain, douches à l\'italienne, receveurs extra-plats. Conseil et fourniture de matériaux possible.', rating: 4.7, reviews: 44, jobs: 86, slug: 'said-karimi' },
  { name: 'Noureddine Skalli', phone: '+212661000009', trade: 'peinture',    exp: 20, bio: '20 ans de peinture à Casablanca. Façades, terrasses, parkings. Spécialiste en peinture anticorrosion et revêtements techniques. Devis détaillé sous 24h.', rating: 5.0, reviews: 61, jobs: 123, slug: 'noureddine-skalli' },
  { name: 'Amine Chraibi',     phone: '+212661000010', trade: 'clim',        exp: 4,  bio: 'Jeune technicien sérieux, formé aux dernières technologies. Pompe à chaleur, climatisation réversible, VMC. Prix compétitifs et garantie pièces + main d\'oeuvre.', rating: 4.4, reviews: 15, jobs: 29, slug: 'amine-chraibi' },
  { name: 'Mohamed Fassi',     phone: '+212661000011', trade: 'carreleur',   exp: 14, bio: 'Maître carreleur depuis 14 ans. Réalisation de salles de bain complètes clé en main. Fourniture et pose. Référence sur Maarif et Bourgogne.', rating: 4.9, reviews: 58, jobs: 112, slug: 'mohamed-fassi' },
  { name: 'Rachid Filali',     phone: '+212661000012', trade: 'bricoleur',   exp: 7,  bio: 'Bricoleur expérimenté, déménagements et montages de meubles. Fixations murales, TV, miroirs, stores. Disponible week-ends. Véhiculé avec outillage complet.', rating: 4.6, reviews: 26, jobs: 50, slug: 'rachid-filali' },
  { name: 'Hamza Idrissi',     phone: '+212661000013', trade: 'electricien', exp: 3,  bio: 'Électricien diplômé 2021, passionné par la domotique et l\'éclairage d\'ambiance. Smart Home, Zigbee, Philips Hue. Pour les clients qui veulent moderniser leur habitat.', rating: 4.5, reviews: 12, jobs: 23, slug: 'hamza-idrissi' },
  { name: 'Othmane Guessous',  phone: '+212661000014', trade: 'plombier',    exp: 16, bio: 'Plombier chauffagiste avec 16 ans d\'expérience. Chauffe-eaux solaires, ballons thermodynamiques, chaudières gaz. Partenaire de confiance pour les promoteurs immobiliers.', rating: 4.8, reviews: 49, jobs: 97, slug: 'othmane-guessous' },
  { name: 'Adil Benomar',      phone: '+212661000015', trade: 'peinture',    exp: 8,  bio: 'Peintre en bâtiment et décorateur d\'intérieur. Béton ciré, tadelakt, stucco veneziano. Pour les clients qui veulent quelque chose d\'unique et sophistiqué.', rating: 4.7, reviews: 33, jobs: 64, slug: 'adil-benomar' },
  { name: 'Karim Squalli',     phone: '+212661000016', trade: 'clim',        exp: 12, bio: 'Froid et climatisation depuis 12 ans. Chambres froides, groupes d\'eau glacée, VRV. Client particulier ou professionnel, même exigence de qualité.', rating: 4.9, reviews: 41, jobs: 80, slug: 'karim-squalli' },
  { name: 'Jawad Benali',      phone: '+212661000017', trade: 'carreleur',   exp: 5,  bio: 'Spécialiste zellige marocain et carreaux de ciment. Hammams, riads, terrasses. Artisan formé à Fès, installé à Casablanca. Travail artisanal haut de gamme.', rating: 4.8, reviews: 21, jobs: 38, slug: 'jawad-benali' },
  { name: 'Soufiane Tazi',     phone: '+212661000018', trade: 'bricoleur',   exp: 9,  bio: 'Rénovation et second oeuvre tous corps d\'état. Faux-plafonds BA13, cloisons, menuiserie basique. Équipe de 2 personnes pour les chantiers plus importants.', rating: 4.6, reviews: 30, jobs: 57, slug: 'soufiane-tazi' },
  { name: 'Reda Benjelloun',   phone: '+212661000019', trade: 'electricien', exp: 18, bio: 'Chef d\'équipe électricité bâtiment. Courants forts et faibles, fibre optique, vidéosurveillance, alarme intrusion. Chantiers résidentiels et commerciaux à Casablanca.', rating: 5.0, reviews: 72, jobs: 144, slug: 'reda-benjelloun' },
  { name: 'Tarek El Amrani',   phone: '+212661000020', trade: 'plombier',    exp: 7,  bio: 'Plombier spécialisé en détection de fuite non-destructive. Caméra endoscopique, détecteur acoustique. Fini les casses de carrelage inutiles ! Intervention propre garantie.', rating: 4.7, reviews: 24, jobs: 46, slug: 'tarek-el-amrani' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pickN(arr, n) { return [...arr].sort(() => 0.5 - Math.random()).slice(0, n) }

async function createAuthUser(email, password) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw new Error(`Auth user creation failed for ${email}: ${error.message}`)
  return data.user
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting demo seed...\n')

  // ── 1. Create 20 Customers ────────────────────────────────────────────────
  console.log('👤 Creating 20 customers...')
  const customerIds = []
  for (const c of CUSTOMER_DATA) {
    try {
      const email = `${c.phone.replace('+', '')}@demo.anzar.ma`
      const user = await createAuthUser(email, 'Demo1234!')

      // Update app_metadata role
      await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { role: 'customer' },
      })

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: user.id,
        phone: c.phone,
        full_name: c.name,
        user_type: 'customer',
        updated_at: new Date().toISOString(),
      })

      // Upsert customer_profile
      await supabase.from('customer_profiles').upsert({ profile_id: user.id })

      customerIds.push({ userId: user.id, data: c })
      process.stdout.write(`  ✓ ${c.name}\n`)
    } catch (e) {
      console.error(`  ✗ ${c.name}: ${e.message}`)
    }
  }

  // ── 2. Create service requests for each customer ──────────────────────────
  console.log('\n📋 Creating service requests...')
  const requestIds = []
  for (const { userId, data: c } of customerIds) {
    const catId = CATEGORIES[c.cat]
    const nbId = pick(NEIGHBORHOODS)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (c.urgency === 'flexible' ? 60 : 30))

    const { data: req, error } = await supabase.from('service_requests').insert({
      customer_id: userId,
      category_id: catId,
      city_id: CITY_ID,
      neighborhood_id: nbId,
      description: c.desc,
      budget_text: c.budget,
      urgency: c.urgency,
      status: 'open',
      expires_at: expiresAt.toISOString(),
    }).select().single()

    if (error) {
      console.error(`  ✗ Request for ${c.name}: ${error.message}`)
    } else {
      requestIds.push(req.id)
      process.stdout.write(`  ✓ "${c.desc.slice(0, 50)}..."\n`)
    }
  }

  // ── 3. Create 20 Providers ────────────────────────────────────────────────
  console.log('\n🔨 Creating 20 providers...')
  const providerProfileIds = []
  for (const p of PROVIDER_DATA) {
    try {
      const email = `${p.phone.replace('+', '')}@demo.anzar.ma`
      const user = await createAuthUser(email, 'Demo1234!')

      // Update app_metadata role
      await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { role: 'provider' },
      })

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: user.id,
        phone: p.phone,
        full_name: p.name,
        user_type: 'provider',
        updated_at: new Date().toISOString(),
      })

      // Upsert provider_profile — verified, with real stats
      const tradeId = CATEGORIES[p.trade]
      const nbIds = pickN(NEIGHBORHOODS, 3)

      const { data: pp, error: ppErr } = await supabase.from('provider_profiles').upsert({
        profile_id: user.id,
        slug: p.slug,
        bio_fr: p.bio,
        bio_ar: p.bio, // same for demo purposes
        city_id: CITY_ID,
        neighborhood_ids: nbIds,
        trade_ids: [tradeId],
        years_experience: p.exp,
        status: 'verified',
        avg_rating: p.rating,
        review_count: p.reviews,
        jobs_completed: p.jobs,
        response_rate: 0.85 + Math.random() * 0.15,
        updated_at: new Date().toISOString(),
      }).select().single()

      if (ppErr) throw new Error(ppErr.message)
      providerProfileIds.push({ ppId: pp.id, userId: user.id, data: p })
      process.stdout.write(`  ✓ ${p.name} (${p.trade}, ${p.exp}y exp)\n`)
    } catch (e) {
      console.error(`  ✗ ${p.name}: ${e.message}`)
    }
  }

  // ── 4. Create matches (link requests to providers) ────────────────────────
  console.log('\n🎯 Creating matches between requests and providers...')
  let matchCount = 0
  for (let i = 0; i < Math.min(requestIds.length, customerIds.length); i++) {
    const requestId = requestIds[i]
    const catId = CATEGORIES[customerIds[i].data.cat]

    // Find providers in the same trade
    const matchingProviders = providerProfileIds.filter(pp =>
      pp.data.trade === customerIds[i].data.cat
    ).slice(0, 3)

    if (matchingProviders.length === 0) continue

    for (const pp of matchingProviders) {
      const { error } = await supabase.from('matches').insert({
        request_id: requestId,
        provider_id: pp.ppId,
        score: pp.data.rating * 20 + Math.random() * 10,
        status: 'notified',
        notified_at: new Date().toISOString(),
      })
      if (!error) matchCount++
    }

    // Update request status to matched
    await supabase.from('service_requests').update({ status: 'matched' }).eq('id', requestId)
  }
  console.log(`  ✓ ${matchCount} matches created`)

  // ── 5. Create some completed jobs + reviews ───────────────────────────────
  console.log('\n⭐ Creating completed jobs and reviews...')
  const REVIEW_COMMENTS = [
    { fr: 'Excellent travail, très professionnel et ponctuel. Je recommande vivement !', rating: 5 },
    { fr: 'Bon travail dans l\'ensemble, quelques petits retards mais résultat propre.', rating: 4 },
    { fr: 'Super artisan, a résolu mon problème en moins d\'une heure. Tarif correct.', rating: 5 },
    { fr: 'Très satisfait, travail soigné et communication excellente tout au long.', rating: 5 },
    { fr: 'Correct, le travail est fait mais j\'aurais apprécié plus de précision.', rating: 3 },
    { fr: 'Parfait ! Intervention rapide, résultat impeccable. À rappeler sans hésiter.', rating: 5 },
    { fr: 'Artisan sérieux, devis respecté, délai tenu. Très bonne expérience.', rating: 4 },
    { fr: 'Problème résolu efficacement. Prix légèrement élevé mais qualité au rendez-vous.', rating: 4 },
  ]

  let jobCount = 0
  // Create completed jobs for the first 10 requests (simulate completed work)
  for (let i = 0; i < Math.min(10, requestIds.length, providerProfileIds.length); i++) {
    const custId = customerIds[i]?.userId
    const pp = providerProfileIds[i % providerProfileIds.length]
    if (!custId || !pp) continue

    // Create a fake offer
    const { data: conv } = await supabase.from('conversations').insert({
      request_id: requestIds[i],
      customer_id: custId,
      provider_id: pp.ppId,
      match_id: null,
    }).select().single()

    if (!conv) continue

    const { data: offer } = await supabase.from('offers').insert({
      conversation_id: conv.id,
      provider_id: pp.ppId,
      price_mad: 300 + Math.floor(Math.random() * 1200),
      description: 'Devis pour votre demande, intervention soignée garantie.',
      estimated_duration: '2-4 heures',
      status: 'accepted',
    }).select().single()

    if (!offer) continue

    // Create job
    const completedAt = new Date()
    completedAt.setDate(completedAt.getDate() - Math.floor(Math.random() * 30))
    const { data: job } = await supabase.from('jobs').insert({
      request_id: requestIds[i],
      offer_id: offer.id,
      customer_id: custId,
      provider_id: pp.ppId,
      status: 'completed',
      started_at: completedAt.toISOString(),
      completed_at: completedAt.toISOString(),
    }).select().single()

    if (!job) continue
    jobCount++

    // Create review
    const rev = REVIEW_COMMENTS[i % REVIEW_COMMENTS.length]
    await supabase.from('reviews').insert({
      job_id: job.id,
      reviewer_id: custId,
      reviewed_id: pp.userId,
      rating: rev.rating,
      comment: rev.fr,
      status: 'approved',
    })
  }
  console.log(`  ✓ ${jobCount} completed jobs + reviews`)

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n✅ Demo seed complete!')
  console.log(`   👤 ${customerIds.length} customers`)
  console.log(`   🔨 ${providerProfileIds.length} verified providers`)
  console.log(`   📋 ${requestIds.length} service requests`)
  console.log(`   🎯 ${matchCount} matches`)
  console.log(`   ⭐ ${jobCount} completed jobs with reviews`)
  console.log('\n🔑 Login with any demo account:')
  console.log('   Email: 212612000001@demo.anzar.ma  (customer)')
  console.log('   Email: 212661000001@demo.anzar.ma  (provider)')
  console.log('   Password: Demo1234!')
}

main().catch(e => { console.error('\n💥 Fatal error:', e.message); process.exit(1) })
