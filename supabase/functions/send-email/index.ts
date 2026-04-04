// Supabase Edge Function — send-email
// Handles transactional emails via Resend API.
//
// Supported event types:
//   new_offer            — notify customer that a provider submitted an offer
//   new_message          — notify recipient of a new chat message
//   verification_approved — notify provider that their profile was verified
//
// Trigger via:
//   POST /functions/v1/send-email
//   Authorization: Bearer <SUPABASE_ANON_KEY>
//   Content-Type: application/json
//   Body: { "event": "new_offer", "payload": { ... } }
//
// Or schedule via DB webhook on relevant table inserts/updates.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = 'Anzar <noreply@anzar.ma>'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// ── Types ───────────────────────────────────────────────────────────────────

type EventType = 'new_offer' | 'new_message' | 'verification_approved'

interface EmailJob {
  event: EventType
  payload: Record<string, unknown>
}

interface EmailPayload {
  to: string
  subject: string
  html: string
}

// ── Email builders ──────────────────────────────────────────────────────────

function buildNewOfferEmail(payload: Record<string, unknown>): EmailPayload {
  const customerEmail = String(payload.customer_email ?? '')
  const artisanName = String(payload.artisan_name ?? 'Un artisan')
  const categoryName = String(payload.category_name ?? 'votre demande')
  const requestId = String(payload.request_id ?? '')

  return {
    to: customerEmail,
    subject: `${artisanName} a répondu à votre demande — Anzar`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <img src="https://anzar.ma/logo.png" alt="Anzar" style="height:48px;margin-bottom:24px" />
        <h2 style="color:#1A6B4A;margin-bottom:8px">Nouvelle offre reçue !</h2>
        <p style="color:#555;line-height:1.6">
          <strong>${artisanName}</strong> a répondu à votre demande
          pour <strong>${categoryName}</strong>.
        </p>
        <a href="https://anzar.ma/app/requests/${requestId}"
           style="display:inline-block;margin-top:20px;background:#1A6B4A;color:white;font-weight:600;padding:12px 24px;border-radius:12px;text-decoration:none">
          Voir l'offre →
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee" />
        <p style="color:#aaa;font-size:12px">Anzar · La plateforme des artisans de confiance à Casablanca</p>
      </div>
    `,
  }
}

function buildNewMessageEmail(payload: Record<string, unknown>): EmailPayload {
  const recipientEmail = String(payload.recipient_email ?? '')
  const senderName = String(payload.sender_name ?? 'Quelqu\'un')
  const conversationId = String(payload.conversation_id ?? '')
  const isProvider = Boolean(payload.is_provider)
  const dashPath = isProvider ? '/pro/messages' : '/app/messages'

  return {
    to: recipientEmail,
    subject: `Nouveau message de ${senderName} — Anzar`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <img src="https://anzar.ma/logo.png" alt="Anzar" style="height:48px;margin-bottom:24px" />
        <h2 style="color:#1A6B4A;margin-bottom:8px">Nouveau message !</h2>
        <p style="color:#555;line-height:1.6">
          Vous avez reçu un nouveau message de <strong>${senderName}</strong>.
        </p>
        <a href="https://anzar.ma${dashPath}/${conversationId}"
           style="display:inline-block;margin-top:20px;background:#1A6B4A;color:white;font-weight:600;padding:12px 24px;border-radius:12px;text-decoration:none">
          Répondre →
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee" />
        <p style="color:#aaa;font-size:12px">Anzar · La plateforme des artisans de confiance à Casablanca</p>
      </div>
    `,
  }
}

function buildVerificationApprovedEmail(payload: Record<string, unknown>): EmailPayload {
  const providerEmail = String(payload.provider_email ?? '')
  const providerName = String(payload.provider_name ?? 'Artisan')

  return {
    to: providerEmail,
    subject: 'Votre profil Anzar est vérifié ✅',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <img src="https://anzar.ma/logo.png" alt="Anzar" style="height:48px;margin-bottom:24px" />
        <h2 style="color:#1A6B4A;margin-bottom:8px">Félicitations, ${providerName} !</h2>
        <p style="color:#555;line-height:1.6">
          Votre profil artisan a été <strong>vérifié et validé</strong> par l'équipe Anzar.
          Vous pouvez maintenant recevoir des demandes de clients.
        </p>
        <a href="https://anzar.ma/pro"
           style="display:inline-block;margin-top:20px;background:#E8A838;color:white;font-weight:600;padding:12px 24px;border-radius:12px;text-decoration:none">
          Accéder à mon tableau de bord →
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee" />
        <p style="color:#aaa;font-size:12px">Anzar · La plateforme des artisans de confiance à Casablanca</p>
      </div>
    `,
  }
}

// ── Send via Resend ─────────────────────────────────────────────────────────

async function sendEmail(email: EmailPayload): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('[send-email] RESEND_API_KEY not configured — skipping send')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email.to],
      subject: email.subject,
      html: email.html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
}

// ── Main handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let job: EmailJob
  try {
    job = await req.json() as EmailJob
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!job.event || !job.payload) {
    return new Response(JSON.stringify({ error: 'Missing event or payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let emailPayload: EmailPayload

  try {
    switch (job.event) {
      case 'new_offer':
        emailPayload = buildNewOfferEmail(job.payload)
        break
      case 'new_message':
        emailPayload = buildNewMessageEmail(job.payload)
        break
      case 'verification_approved':
        emailPayload = buildVerificationApprovedEmail(job.payload)
        break
      default:
        return new Response(JSON.stringify({ error: `Unknown event: ${job.event}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!emailPayload.to) {
      return new Response(JSON.stringify({ error: 'No recipient email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await sendEmail(emailPayload)

    // Optionally log to email_jobs table for audit trail
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      await supabase.from('email_jobs').insert({
        event: job.event,
        recipient: emailPayload.to,
        subject: emailPayload.subject,
        sent_at: new Date().toISOString(),
        payload: job.payload,
      }).then(() => {}) // ignore insert errors — audit logging is non-critical
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[send-email] Error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
