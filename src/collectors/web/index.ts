import { collectGitcoinGrants } from './gitcoin'
import { collectBlockchainGrants } from './blockchain-grants'
import { collectArbitrumGrants } from './arbitrum'
import { GrantItem } from '../../types/grant'

export async function collectWebGrants(): Promise<GrantItem[]> {
  const [blockchainGrants, gitcoinGrants, arbitrumGrants] = await Promise.all([
    collectBlockchainGrants(),
    collectGitcoinGrants(),
    collectArbitrumGrants()
  ])
  
  return [...blockchainGrants, ...gitcoinGrants, ...arbitrumGrants]
}
