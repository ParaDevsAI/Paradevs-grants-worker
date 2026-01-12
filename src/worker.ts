import fs from 'fs'
import { collectAllGrants } from './collectors'
import { filterRelevantGrants } from './filters/relevance'
import { GrantRepository } from './repositories/grants'
import { grantsToCSV } from './utils/csv'
import { notifyDiscord } from './notifiers/discord'

export async function runWorker() {
  console.log('[Worker] started')

  const allGrants = await collectAllGrants()
  const relevant = filterRelevantGrants(allGrants)

  for (const grant of relevant) {
    const exists = await GrantRepository.exists(grant.id)

    if (exists) {
      console.log(`[Skip] duplicate ${grant.id}`)
      continue
    }

    await GrantRepository.save(grant)
    console.log(`[Saved] ${grant.author} | score=${grant.score} | ${grant.source}`)

    if (grant.score >= 15) {
      await notifyDiscord({
        protocol: grant.author,
        title: grant.text,
        confidence: grant.score,
        category: grant.category,
        source: grant.source
      })
      console.log(`[Discord] sent ${grant.author}`)
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
