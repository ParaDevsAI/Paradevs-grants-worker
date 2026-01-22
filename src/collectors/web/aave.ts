import { chromium } from 'playwright'
import { GrantItem } from '../../types/grant'

export async function collectAaveGrants(): Promise<GrantItem[]> {
  const grants: GrantItem[] = []

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--ignore-certificate-errors']
    })
    const page = await browser.newPage({ ignoreHTTPSErrors: true })

    const url = 'https://aavegrants.org/'
    console.log(`[Web] Scraping Aave: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(5000)
    
    const bodyText = await page.evaluate(() => document.body?.textContent?.slice(0, 500) || '')
    console.log(`[Aave Debug] Body preview:`, bodyText.slice(0, 150))
    
    const pageTitle = await page.title()
    console.log(`[Aave Debug] Page title:`, pageTitle)

    const grantsList = await page.evaluate(() => {
      const items: Array<{ 
        title: string; 
        description: string; 
        link: string; 
        amount?: string | undefined;
        deadline?: string | undefined;
      }> = []
      
      const allLinks = Array.from(document.querySelectorAll('a[href]'))
      console.log(`[Aave] Total links found: ${allLinks.length}`)
      
      for (const link of allLinks) {
        try {
          const href = link.getAttribute('href') || ''
          const text = link.textContent?.trim() || ''
          
          if (!href || href === '#' || href.length < 3) continue
          if (href.includes('twitter.com') || href.includes('discord') || href.includes('github.com') || href.includes('medium.com')) continue
          if (href.includes('mailto:') || href.includes('tel:')) continue
          
          const isRelevant = href.startsWith('/') || 
                            href.includes('grant') || 
                            href.includes('proposal') ||
                            href.includes('funding') ||
                            href.includes('apply') ||
                            href.includes('program')
          
          if (!isRelevant) continue
          if (text.length < 15 || text.length > 150) continue
          
          const title = text
          
          let description = title
          const parent = link.parentElement
          if (parent) {
            const siblings = parent.querySelectorAll('p, div, span')
            for (const sibling of Array.from(siblings)) {
              const siblingText = sibling.textContent?.trim() || ''
              if (siblingText.length > 50 && siblingText !== title) {
                description = siblingText
                break
              }
            }
          }
          
          const fullText = parent?.textContent || text
          const amountMatch = fullText.match(/\$[\d,]+(?:\.[\d]{2})?[KkMm]?|\d+[KkMm]?\s*(?:USD|USDC|AAVE|GHO)/i)
          const amount = amountMatch ? amountMatch[0].trim() : undefined
          
          const deadlineMatch = fullText.match(/(?:Ends?|Closes?|Deadline|Apply by|Due):\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|in\s+\d+\s+days?)/i)
          const deadline = deadlineMatch && deadlineMatch[1] ? deadlineMatch[1].trim() : undefined
          
          items.push({ title, description, link: href, amount, deadline })
          
          if (items.length >= 20) break 
        } catch (err) {
            
        }
      }
      
      console.log(`[Aave] Found ${items.length} potential grants`)
      return items
    })

    console.log(`[Web] Found ${grantsList.length} Aave grants`)

    for (const item of grantsList) {
      try {
        const id = `aave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fullUrl = item.link.startsWith('http') 
          ? item.link 
          : `https://aavegrants.org${item.link}`

        grants.push({
          id,
          source: 'web',
          origin: 'aave-grants',
          title: item.title,
          description: item.description,
          apply_url: fullUrl,
          info_url: fullUrl,
          author: 'Aave Grants DAO',
          amount: item.amount,
          deadline: item.deadline,
          createdAt: new Date().toISOString()
        })

        console.log(`[Web] ✅ ${item.title.slice(0, 60)}...${item.amount ? ` [${item.amount}]` : ''}`)
      } catch (err) {
        console.error(`[Web] Failed to process Aave grant:`, err)
      }
    }

    await browser.close()
    console.log(`[Web] Aave: ${grants.length} grants collected`)
  } catch (err) {
    console.error('[Web] Aave failed:', err)
  }

  return grants
}

