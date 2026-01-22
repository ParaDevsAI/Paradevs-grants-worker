import { chromium } from 'playwright'
import { GrantItem } from '../../types/grant'

export async function collectArbitrumGrants(): Promise<GrantItem[]> {
  const grants: GrantItem[] = []

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--ignore-certificate-errors']
    })
    const page = await browser.newPage({ ignoreHTTPSErrors: true })

    const url = 'https://arbitrum.foundation/grants'
    console.log(`[Web] Scraping Arbitrum: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(5000)
    
    const bodyText = await page.evaluate(() => document.body?.textContent?.slice(0, 500) || '')
    console.log(`[Arbitrum Debug] Body preview:`, bodyText.slice(0, 150))
    
    const pageTitle = await page.title()
    console.log(`[Arbitrum Debug] Page title:`, pageTitle)

    const grantsList = await page.evaluate(() => {
      const items: Array<{ 
        title: string; 
        description: string; 
        link: string; 
        amount?: string | undefined;
        deadline?: string | undefined;
      }> = []
      
      const allLinks = Array.from(document.querySelectorAll('a[href]'))
      
      for (const link of allLinks) {
        try {
          const href = link.getAttribute('href') || ''
          const text = link.textContent?.trim() || ''
          
          if (!href || href === '#' || href.length < 3) continue
          if (href.includes('twitter.com') || href.includes('discord') || href.includes('github.com')) continue
          if (href.includes('mailto:') || href.includes('tel:')) continue
          if (text.length < 15 || text.length > 200) continue
          
          const lowerHref = href.toLowerCase()
          const lowerText = text.toLowerCase()
          const isRelevant = lowerHref.includes('grant') ||
                            lowerHref.includes('program') ||
                            lowerHref.includes('proposal') ||
                            lowerText.includes('grant') ||
                            lowerText.includes('program')
          
          if (!isRelevant) continue
          
          const title = text
          
          let description = text
          const parent = link.parentElement
          if (parent) {
            const textContent = parent.textContent?.trim() || ''
            if (textContent.length > text.length + 50) {
              description = textContent.slice(0, 300)
            }
          }
          
          const parentText = parent?.textContent || text
          const amountMatch = parentText.match(/\$[\d,]+(?:\.[\d]{2})?[KkMm]?|\d+[KkMm]?\s*(?:USD|ARB|USDC|ETH)/i)
          const amount = amountMatch ? amountMatch[0].trim() : undefined
          
          const deadlineMatch = parentText.match(/(?:Deadline|Due|Closes?|Ends?|Until|Apply by):\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|in\s+\d+\s+days?)/i)
          const deadline = deadlineMatch && deadlineMatch[1] ? deadlineMatch[1].trim() : undefined
          
          items.push({ title, description, link: href, amount, deadline })
          
          if (items.length >= 20) break
        } catch (err) {
            
        }
      }
      
      return items
    })

    console.log(`[Web] Found ${grantsList.length} Arbitrum grants`)

    for (const item of grantsList) {
      try {
        const id = `arbitrum-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fullUrl = item.link.startsWith('http') 
          ? item.link 
          : `https://arbitrum.foundation${item.link}`

        grants.push({
          id,
          source: 'web',
          origin: 'arbitrum-foundation',
          title: item.title,
          description: item.description,
          apply_url: fullUrl,
          info_url: fullUrl,
          author: 'Arbitrum Foundation',
          amount: item.amount,
          deadline: item.deadline,
          createdAt: new Date().toISOString()
        })

        console.log(`[Web] ✅ ${item.title.slice(0, 60)}...${item.amount ? ` [${item.amount}]` : ''}`)
      } catch (err) {
        console.error(`[Web] Failed to process Arbitrum grant:`, err)
      }
    }

    await browser.close()
    console.log(`[Web] Arbitrum: ${grants.length} grants collected`)
  } catch (err) {
    console.error('[Web] Arbitrum failed:', err)
  }

  return grants
}
