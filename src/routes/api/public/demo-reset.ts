// TEMPORARY one-shot route to reset the demo account password.
// Delete this file immediately after use.
import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_EMAIL = 'elooptoken.project@elooptoken.com'
const GUARD = 'eloop-demo-reset-2026-06-22'

export const Route = createFileRoute('/api/public/demo-reset')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          guard?: string
          email?: string
          password?: string
        }
        if (body.guard !== GUARD) return new Response('forbidden', { status: 403 })
        if (body.email !== ALLOWED_EMAIL) return new Response('email not allowed', { status: 403 })
        if (!body.password || body.password.length < 12) {
          return new Response('weak password', { status: 400 })
        }
        const url = import.meta.env.VITE_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!url || !key) return new Response('no service key', { status: 500 })
        const admin = createClient(url, key)
        const { data: list, error: lErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
        if (lErr) return Response.json({ error: lErr.message }, { status: 500 })
        const user = list.users.find((u) => u.email === ALLOWED_EMAIL)
        if (!user) return new Response('user not found', { status: 404 })
        const { error: uErr } = await admin.auth.admin.updateUserById(user.id, {
          password: body.password,
          email_confirm: true,
        })
        if (uErr) return Response.json({ error: uErr.message }, { status: 500 })
        return Response.json({ ok: true, user_id: user.id })
      },
    },
  },
})
