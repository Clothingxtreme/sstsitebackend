import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import nodemailer from 'nodemailer'

const app = express()
const port = Number(process.env.PORT || 8080)
const host = process.env.HOST || '0.0.0.0'
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://senscrypt.tech,https://www.senscrypt.tech,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(helmet())
app.use(express.json({ limit: '100kb' }))
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Origin is not allowed'))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
}))

app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'senscrypt-backend' })
})

app.post('/api/inquiries', async (request, response) => {
  try {
    const payload = normalizePayload(request.body)
    const validationError = validatePayload(payload)

    if (validationError) {
      response.status(400).json({ error: validationError })
      return
    }

    await sendInquiryEmail(payload)

    response.json({ ok: true })
  } catch (error) {
    console.error('Inquiry submission failed:', error)
    response.status(500).json({ error: 'We could not send your request right now. Please try again shortly.' })
  }
})

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' })
})

app.listen(port, host, () => {
  console.log(`Sen-ScryptTech backend listening on ${host}:${port}`)
})

function normalizePayload(value) {
  if (!value || typeof value !== 'object') {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === 'string' ? item.trim() : '',
    ]),
  )
}

function validatePayload(payload) {
  if (!payload.formType || !['project', 'consultation'].includes(payload.formType)) {
    return 'Choose a valid request type.'
  }

  if (!payload.name) {
    return 'Enter your name.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || '')) {
    return 'Enter a valid email address.'
  }

  if (payload.formType === 'consultation') {
    if (!payload.preferredDate || !payload.preferredTime) {
      return 'Choose a preferred date and time.'
    }

    const selectedDate = new Date(`${payload.preferredDate}T${payload.preferredTime}:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      return 'Choose a date that is not in the past.'
    }
  }

  if (payload.formType === 'project' && !payload.details) {
    return 'Tell us a little about the project.'
  }

  return ''
}

async function sendInquiryEmail(payload) {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_TO || user
  const from = process.env.SMTP_FROM || user
  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  if (!host || !user || !pass || !to || !from) {
    throw new Error('SMTP environment variables are not configured')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    },
  })

  const subject =
    payload.formType === 'consultation'
      ? `New consultation request from ${payload.name}`
      : `New project request from ${payload.name}`

  await transporter.sendMail({
    from,
    to,
    replyTo: payload.email,
    subject,
    text: buildPlainText(payload),
    html: buildHtml(payload),
  })
}

function buildPlainText(payload) {
  return Object.entries(payload)
    .filter(([, value]) => value)
    .map(([key, value]) => `${formatLabel(key)}: ${value}`)
    .join('\n')
}

function buildHtml(payload) {
  const rows = Object.entries(payload)
    .filter(([, value]) => value)
    .map(([key, value]) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 700;">${escapeHtml(formatLabel(key))}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2 style="margin-bottom: 12px;">New Sen-ScryptTech Inquiry</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">${rows}</table>
    </div>
  `
}

function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase())
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
