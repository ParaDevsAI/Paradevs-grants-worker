import { TWITTER_RADAR } from '../sources/twitter'
import { config } from '../config'
import { collectTwitterReal } from './twitter-real'

export interface MockTweet {
  id: string
  author: string
  text: string
  createdAt: string
  source: 'twitter'
  info_url?: string
}

async function collectTweetsMock(): Promise<MockTweet[]> {
  const now = new Date().toISOString()

  return [
    {
      id: 'tweet-ai-promote-001',
      author: 'web3foundation',
      text: 'Web3 Foundation grants program now open! Apply at https://grants.web3.foundation/apply for infrastructure projects. Funding available for decentralized tech builders.',
      createdAt: now,
      source: 'twitter',
      info_url: 'https://twitter.com/web3foundation/status/tweet-ai-promote-001'
    },
    
    {
      id: 'tweet-ai-promote-002',
      author: 'gitcoin',
      text: 'New grants round launching! Submit your application through our portal at gitcoin.co/grants/apply. Open source projects in Web3 and AI welcome. Deadline: March 15.',
      createdAt: now,
      source: 'twitter',
      info_url: 'https://twitter.com/gitcoin/status/tweet-ai-promote-002'
    },
   
    {
      id: 'tweet-ai-promote-003',
      author: 'polygondevs',
      text: 'Polygon Developer Grants Program accepting applications! To apply: 1) Visit polygon.technology/grants 2) Fill the form 3) Submit your proposal. Up to $50k funding available.',
      createdAt: now,
      source: 'twitter',
      info_url: 'https://twitter.com/polygondevs/status/tweet-ai-promote-003'
    },
    
    {
      id: 'tweet-no-promote-001',
      author: 'randomfoundation',
      text: 'Exciting news about our upcoming grants program for developers. More information will be shared soon about funding opportunities.',
      createdAt: now,
      source: 'twitter',
      info_url: 'https://twitter.com/randomfoundation/status/tweet-no-promote-001'
    },
    
    {
      id: 'tweet-ai-promote-004',
      author: 'optimismFND',
      text: 'Optimism Collective Grants Round 5 is live! Apply now at app.optimism.io/retropgf to fund your public goods project. Applications close Feb 28.',
      createdAt: now,
      source: 'twitter',
      info_url: 'https://twitter.com/optimismFND/status/tweet-ai-promote-004'
    }
  ]
}

export async function collectTweets(): Promise<MockTweet[]> {
  console.log(`[Collector] mode: ${config.twitterMode}`)

  if (config.twitterMode === 'real') {
    return await collectTwitterReal()
  }

  return await collectTweetsMock()
}
