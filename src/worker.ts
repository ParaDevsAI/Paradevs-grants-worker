import { collectTweets } from './collectors/twitter'

export async function runWorker() {
  console.log('[Worker] started')

  const tweets = await collectTweets()
  console.log(`[Collector] tweets collected: ${tweets.length}`)

  for (const tweet of tweets) {
    console.log('[Tweet]', tweet.id, '-', tweet.author)
  }

  console.log('[Worker] finished')
}
