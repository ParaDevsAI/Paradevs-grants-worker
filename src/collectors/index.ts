import { config } from '../config'
import { collectTweets, MockTweet } from './twitter'
import { collectWebGrants } from './web'
import { GrantItem } from '../types/grant'

function twitterToGrantItem(tweet: MockTweet): GrantItem {
  const text = tweet.text.trim()
  
  if (!text || text.length < 10) {
    throw new Error(`Invalid tweet text: ${tweet.id}`)
  }
  
  return {
    id: tweet.id,
    source: 'twitter',
    origin: tweet.author,
    title: text.slice(0, 120),
    description: text,
    author: tweet.author,
    createdAt: tweet.createdAt,
    info_url: tweet.info_url  
  }
}

export async function collectAllGrants(): Promise<GrantItem[]> {
  console.log(`[Collector] mode: ${config.twitterMode}`)

  const allGrants: GrantItem[] = []

  const tweets = await collectTweets()
  
  const twitterGrants = tweets
    .map(tweet => {
      try {
        return twitterToGrantItem(tweet)
      } catch (err) {
        console.log(`[Collector] Skipping invalid tweet: ${tweet.id}`)
        return null
      }
    })
    .filter((g): g is GrantItem => g !== null)
  
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
