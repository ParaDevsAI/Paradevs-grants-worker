import { config } from '../config'
import { GrantStatus } from '../filters/relevance'

export interface GrantNotification {
  protocol: string
  title: string
  confidence: number
  category: string
  source: string
  status: GrantStatus
  aiPromoted?: boolean 
  
  apply_url?: string | undefined
  info_url?: string | undefined
  apply_instructions?: string | undefined
}

export async function notifyDiscord(grant: GrantNotification): Promise<void> {
  if (!config.discordWebhook) {
    console.log('[Discord] webhook not configured, skipping')
    return
  }
  let statusEmoji = ''
  let statusText = ''
  
  if (grant.status === 'actionable') {
    statusEmoji = '🟢'
    statusText = grant.aiPromoted ? 'ACTIONABLE (via AI)' : 'ACTIONABLE GRANT'
  } else if (grant.status === 'discoverable') {
    statusEmoji = '🟡'
    statusText = 'DISCOVERABLE GRANT'
  } else {
    statusEmoji = '🔴'
    statusText = 'WEAK GRANT'
  }

  let actionSection = ''
  
  if (grant.status === 'actionable') {
    if (grant.apply_url) {
      actionSection = `👉 **Apply here:**\n🔗 ${grant.apply_url}`
    } else if (grant.apply_instructions) {
      actionSection = `📝 **How to apply:**\n${grant.apply_instructions}`
    }
  } else if (grant.status === 'discoverable') {
    if (grant.info_url) {
      actionSection = `ℹ️ **Grant page:**\n🔗 ${grant.info_url}\n\n📝 **How to apply:**\nVisit the page and look for the official application link.`
    } else if (grant.apply_instructions) {
      actionSection = `📝 **How to apply:**\n${grant.apply_instructions}`
    }
  } else {
    // 🔴 WEAK: link genérico, expectativa baixa
    actionSection = `ℹ️ **Mentioned in:**\n🔗 ${grant.info_url || 'No link available'}`
  }

  const message = `
🚨 **New Grant Detected**

${statusEmoji} **${statusText}**
🔥 Score: **${grant.confidence}**

🧩 **${grant.protocol}**
📂 Category: \`${grant.category}\`
📡 Source: ${grant.source}

📌 ${grant.title}

${actionSection}

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
