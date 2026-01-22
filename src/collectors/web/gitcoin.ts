import { chromium } from 'playwright'
import { GrantItem } from '../../types/grant'

export async function collectGitcoinGrants(): Promise<GrantItem[]> {
  const grants: GrantItem[] = []

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--ignore-certificate-errors']
    })
    const page = await browser.newPage({ ignoreHTTPSErrors: true })

    // Gitcoin Grants - mudou para grants.gitcoin.co
    const url = 'https://grants.gitcoin.co/'
    console.log(`[Web] Scraping Gitcoin: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(5000)
    
    const bodyText = await page.evaluate(() => document.body?.textContent?.slice(0, 500) || '')
    console.log(`[Gitcoin Debug] Body preview:`, bodyText.slice(0, 150))
    
    const pageTitle = await page.title()
    console.log(`[Gitcoin Debug] Page title:`, pageTitle)

    const grantsList = await page.evaluate(() => {
      const items: Array<{ 
        title: string; 
        description: string; 
        link: string; 
        amount?: string | undefined;
        deadline?: string | undefined;
      }> = []
      

      const allLinks = Array.from(document.querySelectorAll('a[href]'))
      console.log('[Gitcoin Debug] Total links:', allLinks.length)
      
      const sampleLinks = allLinks.slice(0, 10).map(l => l.getAttribute('href'))
      console.log('[Gitcoin Debug] Sample links:', JSON.stringify(sampleLinks))
      
      const relevantLinks = allLinks.filter(link => {
        const href = link.getAttribute('href') || ''
        const text = link.textContent?.trim() || ''
        return (href.includes('/round/') || 
                href.includes('/grant') ||
                href.includes('/program')) &&
               text.length > 15
      })
      
      console.log('[Gitcoin Debug] Relevant links found:', relevantLinks.length)
      
      for (const link of relevantLinks) {
        try {
          const href = link.getAttribute('href') || ''
          const text = link.textContent?.trim() || ''
          
          if (!href || href === '#' || text.length < 15) continue
          
          const title = text
          let description = text
          
          const parent = link.parentElement
          if (parent) {
            const siblings = parent.querySelectorAll('p, div')
            for (const sibling of Array.from(siblings)) {
              const siblingText = sibling.textContent?.trim() || ''
              if (siblingText.length > 50 && siblingText !== title) {
                description = siblingText
                break
              }
            }
          }

          const fullText = parent?.textContent || text
          const amountMatch = fullText.match(/\$[\d,]+(?:\.[\d]{2})?[KkMm]?|\d+[KkMm]?\s*(?:USD|ETH|USDC)/i)
          const amount = amountMatch ? amountMatch[0].trim() : undefined

          const deadlineMatch = fullText.match(/(?:Ends?|Closes?|Deadline|Until):\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|in\s+\d+\s+days?)/i)
          const deadline = deadlineMatch && deadlineMatch[1] ? deadlineMatch[1].trim() : undefined

          items.push({ title, description, link: href, amount, deadline })
          
          if (items.length >= 20) break
        } catch (err) {
    
        }
      }

      return items
    })

    console.log(`[Web] Found ${grantsList.length} Gitcoin grants`)

    for (const item of grantsList) {
      try {
        const id = `gitcoin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fullUrl = item.link.startsWith('http') 
          ? item.link 
          : `https://explorer.gitcoin.co${item.link}`

        grants.push({
          id,
          source: 'web',
          origin: 'gitcoin-explorer',
          title: item.title,
          description: item.description,
          apply_url: fullUrl,
          info_url: fullUrl,
          author: 'Gitcoin',
          amount: item.amount,
          deadline: item.deadline,
          createdAt: new Date().toISOString()
        })

        console.log(`[Web] ✅ ${item.title.slice(0, 60)}...${item.amount ? ` [${item.amount}]` : ''}`)
      } catch (err) {
        console.error(`[Web] Failed to process Gitcoin grant:`, err)
      }
    }

    await browser.close()
    console.log(`[Web] Gitcoin: ${grants.length} grants collected`)
  } catch (err) {
    console.error('[Web] Gitcoin failed:', err)
  }

  return grants
}
