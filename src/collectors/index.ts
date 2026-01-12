import { config } from '../config'
import { collectTweets, MockTweet } from './twitter'
import { collectWebGrants } from './web'
import { GrantItem } from '../types/grant'

function twitterToGrantItem(tweet: MockTweet): GrantItem {
  return {
    id: tweet.id,
    source: 'twitter',
    origin: tweet.author,
    title: tweet.text.slice(0, 120),
    description: tweet.text,
    author: tweet.author,
    createdAt: tweet.createdAt
  }
}

export async function collectAllGrants(): Promise<GrantItem[]> {
  console.log(`[Collector] mode: ${config.twitterMode}`)

  const allGrants: GrantItem[] = []

  const tweets = await collectTweets()
  const twitterGrants = tweets.map(twitterToGrantItem)
  allGrants.push(...twitterGrants)

  if (config.twitterMode === 'real') {
    const webGrants = await collectWebGrants()
    allGrants.push(...webGrants)
  }

  console.log(
    `[Collector] total: ${allGrants.length} (${twitterGrants.length} twitter, ${allGrants.length - twitterGrants.length} web)`
  )

  return allGrants
}
