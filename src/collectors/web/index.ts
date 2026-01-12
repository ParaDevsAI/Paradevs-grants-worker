import { collectGitcoinGrants } from './gitcoin'
import { collectBlockchainGrants } from './blockchain-grants'
import { GrantItem } from '../../types/grant'

export async function collectWebGrants(): Promise<GrantItem[]> {
  const blockchainGrants = await collectBlockchainGrants()
  return [...blockchainGrants]
}
