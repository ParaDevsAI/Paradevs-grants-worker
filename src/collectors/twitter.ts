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
    },
    {
      id: 'tweet-004',
      author: 'optimismFND',
      text: 'Optimism Collective is launching a new grant program for public goods builders. Apply for funding now!',
      createdAt: now,
      source: 'twitter'
    },
    {
      id: 'tweet-005',
      author: 'aave',
      text: 'Excited to announce a new developer grant initiative. Check out the details!',
      createdAt: now,
      source: 'twitter'
    },
    {
      id: 'tweet-006',
      author: 'ethereum',
      text: 'Ethereum Foundation grants program now accepting applications for Q2 2026. Focus on scaling and security.',
      createdAt: now,
      source: 'twitter'
    }
  ]
}
