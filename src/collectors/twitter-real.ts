import { chromium } from 'playwright'
import { MockTweet } from './twitter'

const ACCOUNTS = [
  'ethereum',
  'arbitrum',
  'optimismFND',
  'gitcoin',
  'aave',
  'stellarorg'
]

const GRANT_KEYWORDS = [
  'grant',
  'grants',
  'funding',
  'apply',
  'applications open',
  'call for proposals',
  'community fund',
  'program',
  'round',
  'open now',
  'builders program',
  'developer program'
]

function isGrantTweet(text: string): boolean {
  const lower = text.toLowerCase()
  return GRANT_KEYWORDS.some((k) => lower.includes(k))
}

export async function collectTwitterReal(): Promise<MockTweet[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const tweets: MockTweet[] = []

  for (const account of ACCOUNTS) {
    try {
      const url = `https://twitter.com/${account}`
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      })

      await page.waitForTimeout(2000)

      await page.waitForSelector('article', { timeout: 10000 })

      const items = await page.$$eval('article', (articles) =>
        articles.slice(0, 10).map((article) => {
          const text = article.innerText || ''

          const link = article.querySelector('a[href*="/status/"]')
          const id = link?.getAttribute('href')?.split('/status/')[1] || ''

          return { text, id }
        })
      )

      let collected = 0
      for (const item of items) {
        if (!item.text || !item.id) continue
        if (!isGrantTweet(item.text)) continue

        const tweetUrl = `https://twitter.com/${account}/status/${item.id}`

        tweets.push({
          id: `twitter-${account}-${item.id}`,
          text: item.text,
          author: account,
          createdAt: new Date().toISOString(),
          source: 'twitter',
          info_url: tweetUrl  
        })
        collected++
      }

      console.log(
        `[Twitter] @${account}: ${collected} grant tweets (${items.length} total)`
      )
    } catch (err) {
      console.error(`[Twitter] failed for @${account}:`, err)
    }
  }

  await browser.close()
  console.log(`[Twitter] Total grant tweets collected: ${tweets.length}`)
  return tweets
}
