import { GoogleGenerativeAI } from '@google/generative-ai'
import { GrantAIProvider, AIGrantAnalysis } from './provider'

export class GeminiProvider implements GrantAIProvider {
  private ai: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.ai = new GoogleGenerativeAI(apiKey)
  }

  async analyze(input: {
    title: string
    description: string
    pageText: string
  }): Promise<AIGrantAnalysis | null> {
    const model = this.ai.getGenerativeModel({
      model: 'gemini-2.5-flash', 
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json'
      }
    })

    const prompt = `
You are analyzing a blockchain grant opportunity.

Your task:
1. Determine if there is a CLEAR way to apply
2. If there is a direct application URL explicitly mentioned in the text, extract it EXACTLY
3. If there is no explicit URL, return apply_url as null
4. Provide brief instructions on how to apply
5. Categorize the grant (dev-tools, research, ai, public-goods, infrastructure, unknown)
6. Provide a brief summary

CRITICAL RULES:
- Do NOT invent links
- Do NOT guess URLs
- Only extract URLs that are EXPLICITLY mentioned in the text
- If no URL is present, apply_url MUST be null

Return ONLY JSON:

{
  "has_direct_apply": boolean,
  "apply_url": string | null,
  "apply_instructions": string | null,
  "confidence": number,
  "category": string | null,
  "summary": string | null
}

TITLE:
${input.title}

DESCRIPTION:
${input.description}

PAGE CONTENT:
${input.pageText.slice(0, 6000)}
`

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const parsed = JSON.parse(text) as AIGrantAnalysis

      // Validação básica
      if (typeof parsed.has_direct_apply !== 'boolean') {
        console.log('[Gemini] Invalid response: has_direct_apply not boolean')
        return null
      }

      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        console.log('[Gemini] Invalid response: confidence out of range')
        return null
      }

      // Validar que apply_url é string válida ou null
      if (parsed.apply_url !== null && typeof parsed.apply_url !== 'string') {
        console.log('[Gemini] Invalid response: apply_url must be string or null')
        return null
      }

      console.log(`[Gemini] Analysis complete: apply=${parsed.has_direct_apply}, url=${parsed.apply_url ? 'YES' : 'NO'}, confidence=${parsed.confidence}`)
      return parsed
    } catch (err) {
      console.error('[Gemini] Analysis failed:', err)
      return null
    }
  }
}
