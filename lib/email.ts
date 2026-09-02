import { BRAND } from '@/lib/constants'

type Mail = { to: string; subject: string; html: string }

/**
 * Envoi d'email via Resend. Sans RESEND_API_KEY, log en console (repli dev)
 * — le reste de l'appli fonctionne, seuls les emails ne partent pas.
 */
export async function sendEmail({ to, subject, html }: Mail) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || `${BRAND} <onboarding@resend.dev>`

  if (!key) {
    console.log(`[email:noop] -> ${to} | ${subject}`)
    return { ok: true, delivered: false }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    })
    return { ok: res.ok, delivered: res.ok }
  } catch {
    return { ok: false, delivered: false }
  }
}

export function layout(title: string, body: string, cta?: { href: string; label: string }) {
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#35291e">
    <p style="font-size:22px;font-weight:800;color:#af4930;margin:0 0 20px">${BRAND}<span style="color:#af4930">.</span></p>
    <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
    <div style="font-size:14px;line-height:1.6;color:#5b5044">${body}</div>
    ${
      cta
        ? `<p style="margin:24px 0"><a href="${cta.href}" style="background:#af4930;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;font-size:14px">${cta.label}</a></p>`
        : ''
    }
    <p style="font-size:12px;color:#9a8f82;margin-top:28px">${BRAND} · Les bonnes adresses près de chez toi</p>
  </div>`
}

export const appUrl = () =>
  process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100'
