import { Client, GatewayIntentBits, REST, Routes, AttachmentBuilder } from 'discord.js'
import { config as loadEnv } from 'dotenv'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { GrantRepository } from '../repositories/grants'
import { grantsToCSV } from '../utils/csv'

loadEnv()

// Create HTTP server for Render
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    bot: client.user?.tag || 'connecting...',
    uptime: process.uptime()
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`[HTTP] Server listening on port ${PORT}`)
})

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

const commands = [
  {
    name: 'csv',
    description: 'Download the latest grants CSV (last 60 days)'
  }
]

const rest = new REST({ version: '10' }).setToken(
  process.env.DISCORD_BOT_TOKEN!
)

async function registerCommands() {
  try {
    console.log('[Bot] Registering slash commands...')
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commands }
    )
    console.log('[Bot] ✅ Slash commands registered')
  } catch (error) {
    console.error('[Bot] ❌ Failed to register commands:', error)
    process.exit(1)
  }
}

client.once('ready', () => {
  console.log(`[Bot] ✅ Logged in as ${client.user?.tag}`)
  console.log('[Bot] Ready to receive /csv commands')
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === 'csv') {
    try {
      await interaction.deferReply()

      console.log('[Bot] Fetching grants from Supabase...')
      const grants = await GrantRepository.findLast60Days()

      if (grants.length === 0) {
        await interaction.editReply({
          content: '❌ No grants found in the last 60 days.'
        })
        return
      }

      console.log(`[Bot] Found ${grants.length} grants, generating CSV...`)
      const csv = grantsToCSV(grants)
      const buffer = Buffer.from(csv, 'utf-8')

      const file = new AttachmentBuilder(buffer, {
        name: 'grants_last_60_days.csv'
      })

      await interaction.editReply({
        content: `📄 **Latest Grants CSV** (last 60 days)\n\n✅ ${grants.length} grants found\n\nUse this for prospecting, research, or batch submissions.`,
        files: [file]
      })
      
      console.log(`[Bot] CSV sent to ${interaction.user.tag} (${grants.length} grants)`)
    } catch (error) {
      console.error('[Bot] Error generating CSV:', error)
      await interaction.editReply({
        content: '❌ Failed to generate CSV. Try again later.'
      })
    }
  }
})

;(async () => {
  await registerCommands()
  await client.login(process.env.DISCORD_BOT_TOKEN)
})()
