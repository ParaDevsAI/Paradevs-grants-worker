import fs from 'fs'
import { collectAllGrants } from './collectors'
import { filterRelevantGrants } from './filters/relevance'
import { GrantRepository } from './repositories/grants'
import { grantsToCSV } from './utils/csv'
import { notifyDiscord } from './notifiers/discord'
import { getAIProvider } from './ai'

export async function runWorker() {
  console.log('[Worker] started')

  const allGrants = await collectAllGrants()
  const relevant = filterRelevantGrants(allGrants)
  
  const aiProvider = getAIProvider()

  for (const grant of relevant) {
    let exists = await GrantRepository.exists(grant.id)
    
    if (!exists && grant.source === 'web' && (grant.apply_url || grant.info_url)) {
      const urlToCheck = grant.apply_url || grant.info_url || ''
      exists = await GrantRepository.existsByUrl(urlToCheck)
      
      if (exists) {
        console.log(`[Skip] duplicate URL ${urlToCheck.slice(0, 60)}...`)
        continue
      }
    }

    if (exists) {
      console.log(`[Skip] duplicate ${grant.id}`)
      continue
    }

    if (grant.ai_analyzed) {
      console.log(`[AI] Skipping already analyzed grant: ${grant.id}`)
      await GrantRepository.save(grant)
      continue
    }

    let aiPromoted = false
    if (grant.status === 'discoverable' && !grant.ai_analyzed && aiProvider) {
      console.log(`[AI] Analyzing DISCOVERABLE grant: ${grant.id}`)
      
      const aiResult = await aiProvider.analyze({
        title: grant.text.slice(0, 200), 
        description: grant.text,
        pageText: '' 
      })

      grant.ai_analyzed = true
      grant.ai_model = 'gemini-2.5-flash'
      grant.ai_analyzed_at = new Date()

      if (aiResult) {
        grant.ai_apply = aiResult.has_direct_apply
        grant.ai_confidence = aiResult.confidence
        grant.ai_summary = aiResult.summary || undefined
        grant.ai_category = aiResult.category || undefined

        if (aiResult.has_direct_apply && aiResult.apply_url && aiResult.confidence >= 0.7 && !grant.apply_url) {
          console.log(`[AI] Promoting to ACTIONABLE: url=${aiResult.apply_url}, confidence=${aiResult.confidence}`)
          grant.apply_url = aiResult.apply_url 
          grant.apply_instructions = aiResult.apply_instructions || undefined 
          grant.status = 'actionable'
          grant.score += 4 
          aiPromoted = true
        } else {
          console.log(`[AI] Keeping DISCOVERABLE: apply=${aiResult.has_direct_apply}, has_url=${!!aiResult.apply_url}, confidence=${aiResult.confidence}`)
          if (aiResult.apply_instructions) {
            grant.apply_instructions = aiResult.apply_instructions
          }
        }
      } else {
        console.log(`[AI] Analysis failed for ${grant.id}`)
      }
    }

    await GrantRepository.save(grant)
    console.log(`[Saved] ${grant.author} | score=${grant.score} | ${grant.source} | status=${grant.status}`)

    if (grant.score >= 15) {
      await notifyDiscord({
        protocol: grant.author,
        title: grant.text,
        confidence: grant.score,
        category: grant.category,
        source: grant.source,
        status: grant.status,
        aiPromoted,
        apply_url: grant.apply_url,
        info_url: grant.info_url,
        apply_instructions: grant.apply_instructions
      })
      console.log(`[Discord] sent ${grant.author} (status: ${grant.status})`)
    } else {
      console.log(`[Discord] skipped ${grant.author} (score below threshold)`)
    }
  }

  const grants = await GrantRepository.findLast60Days()
  const csv = grantsToCSV(grants)

  fs.writeFileSync('grants_last_60_days.csv', csv)
  console.log('[CSV] generated')

  console.log('[Worker] finished')
}
