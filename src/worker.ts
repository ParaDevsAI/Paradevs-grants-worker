import fs from 'fs'
import { collectTweets } from './collectors/twitter'
import { filterRelevantTweets } from './filters/relevance'
import { GrantRepository } from './repositories/grants'
import { grantsToCSV } from './utils/csv'
import { notifyDiscord } from './notifiers/discord'

export async function runWorker() {
  console.log('[Worker] started')

  const tweets = await collectTweets()
  const relevant = filterRelevantTweets(tweets)

  for (const grant of relevant) {
    const exists = await GrantRepository.exists(grant.tweetId)

    if (exists) {
      console.log(`[Skip] duplicate ${grant.tweetId}`)
      continue
    }

    await GrantRepository.save(grant)
    console.log(`[Saved] ${grant.author} | score=${grant.score}`)

    if (grant.score >= 15) {
      await notifyDiscord({
        protocol: grant.author,
        title: grant.text,
        confidence: grant.score,
        category: grant.category,
        source: 'twitter'
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
