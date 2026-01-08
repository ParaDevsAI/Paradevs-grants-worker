export type GrantCategory =
  | 'ecosystem'
  | 'dev-tools'
  | 'infrastructure'
  | 'defi'
  | 'nft'
  | 'dao'
  | 'ai'
  | 'research'
  | 'unknown'

export interface TwitterSource {
  account: string
  category: GrantCategory
  weight: number 
}

export interface TwitterKeyword {
  term: string
  category: GrantCategory
  weight: number 
}

export const TWITTER_ACCOUNTS: TwitterSource[] = [
  { account: 'arbitrum', category: 'ecosystem', weight: 5 },
  { account: 'ethereum', category: 'ecosystem', weight: 5 },
  { account: 'solana', category: 'ecosystem', weight: 5 },
  { account: 'nearprotocol', category: 'ecosystem', weight: 4 },
  { account: 'optimismFND', category: 'ecosystem', weight: 5 },

  { account: 'aave', category: 'defi', weight: 4 },
  { account: 'uniswap', category: 'defi', weight: 4 },

  { account: 'filecoin', category: 'infrastructure', weight: 4 },
  { account: 'chainlink', category: 'infrastructure', weight: 4 },

  { account: 'gitcoin', category: 'research', weight: 5 },
  { account: 'web3foundation', category: 'research', weight: 4 }
]

export const TWITTER_KEYWORDS: TwitterKeyword[] = [
  { term: 'grant', category: 'ecosystem', weight: 5 },
  { term: 'grants program', category: 'ecosystem', weight: 5 },
  { term: 'open grants', category: 'ecosystem', weight: 4 },

  { term: 'developer grant', category: 'dev-tools', weight: 4 },
  { term: 'builders program', category: 'dev-tools', weight: 4 },

  { term: 'funding', category: 'research', weight: 3 },
  { term: 'funded by', category: 'research', weight: 3 },

  { term: 'ecosystem support', category: 'ecosystem', weight: 3 },
  { term: 'apply for grants', category: 'ecosystem', weight: 5 },

  { term: 'AI grant', category: 'ai', weight: 4 },
  { term: 'research grant', category: 'research', weight: 4 }
]

export const TWITTER_RADAR = {
  accounts: TWITTER_ACCOUNTS,
  keywords: TWITTER_KEYWORDS
}
