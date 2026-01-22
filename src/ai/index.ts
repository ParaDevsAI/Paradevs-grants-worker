import { GeminiProvider } from './geminiProvider'
import { GrantAIProvider } from './provider'

let providerInstance: GrantAIProvider | null = null

export function getAIProvider(): GrantAIProvider | null {
  if (!process.env.GEMINI_API_KEY) {
    console.log('[AI] No API key configured, AI disabled')
    return null
  }

  if (!providerInstance) {
    providerInstance = new GeminiProvider(process.env.GEMINI_API_KEY)
    console.log('[AI] Gemini provider initialized')
  }

  return providerInstance
}

export type { AIGrantAnalysis } from './provider'
