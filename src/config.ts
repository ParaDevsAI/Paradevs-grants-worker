import 'dotenv/config'

export const config = {
  env: process.env.NODE_ENV || 'dev',
  cron: process.env.WORKER_CRON || '*/30 * * * *',
  twitterMode: (process.env.TWITTER_MODE || 'mock') as 'mock' | 'real',

  supabase: {
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_KEY!
  },

  openaiKey: process.env.OPENAI_API_KEY,
  discordWebhook: process.env.DISCORD_WEBHOOK
}
