import { config } from '../config'

export interface GrantNotification {
  protocol: string
  title: string
  confidence: number
  category: string
  source: string
}

export async function notifyDiscord(grant: GrantNotification): Promise<void> {
  if (!config.discordWebhook) {
    console.log('[Discord] webhook not configured, skipping')
    return
  }

  const message = `
🚨 **New Grant Detected**

🧩 **${grant.protocol}**
📂 Category: \`${grant.category}\`
📡 Source: ${grant.source}

📌 ${grant.title}

🔥 Confidence Score: **${grant.confidence}**

📄 _CSV atualizado automaticamente (últimos 60 dias)_
  `.trim()

  const response = await fetch(config.discordWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message })
  })

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`)
  }
}
