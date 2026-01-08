import { TWITTER_RADAR } from '../sources/twitter'

export interface MockTweet {
  id: string
  author: string
  text: string
  createdAt: string
  source: 'twitter'
}

export async function collectTweets(): Promise<MockTweet[]> {
  const now = new Date().toISOString()

  return [
    {
      id: 'tweet-001',
      author: 'arbitrum',
      text: 'Arbitrum Grants Program is now open for developers building infrastructure tools. Apply now slicing ecosystem support.',
      createdAt: now,
      source: 'twitter'
    },
    {
      id: 'tweet-002',
      author: 'gitcoin',
      text: 'New round of research grants available for Web3 and AI open source builders. Funding available for impactful projects.',
      createdAt: now,
      source: 'twitter'
    },
    {
      id: 'tweet-003',
      author: 'randomdev',
      text: 'Just shipped a side project using solidity. Feeling proud!',
      createdAt: now,
      source: 'twitter'
    }
  ]
}
