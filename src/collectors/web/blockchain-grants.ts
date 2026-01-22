import { chromium } from 'playwright'
import { GrantItem } from '../../types/grant'

export async function collectBlockchainGrants(): Promise<GrantItem[]> {
  const grants: GrantItem[] = []

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--ignore-certificate-errors']
    })
    const page = await browser.newPage({ ignoreHTTPSErrors: true })

    const url = 'https://blockchaingrants.org/'
    console.log(`[Web] Scraping homepage: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(3000) 

    const grantsList = await page.evaluate(() => {
      const items: Array<{ 
        title: string; 
        description: string; 
        link: string; 
        team?: string | undefined; 
        category?: string | undefined;
        amount?: string | undefined;
        deadline?: string | undefined;
      }> = []
      
      const allLinks = Array.from(document.querySelectorAll('a[href^="/"]'))
        .filter(a => {
          const href = a.getAttribute('href') || ''
          const segments = href.split('/').filter(s => s.length > 0)
          return segments.length >= 2 && !href.includes('#')
        })

      for (const linkEl of allLinks.slice(0, 50)) { 
        try {
          const link = linkEl.getAttribute('href') || ''
          
          const titleEl = linkEl.querySelector('h2')
          const title = (titleEl?.textContent || '').trim()
          if (!title || title.length < 15) continue 
          
          const titleLower = title.toLowerCase()
          if (titleLower.match(/^(bitcoin|blockchain|ethereum|nft|defi|web3|crypto)?\s*grants?$/i)) continue
          if (titleLower.includes('sales and marketing')) continue
          if (titleLower.includes('community building')) continue
          if (titleLower.match(/^product\s*grants?$/i)) continue
          
          const descEls = linkEl.querySelectorAll('p')
          let description = ''
          for (const p of Array.from(descEls)) {
            const text = (p.textContent || '').trim()
            if (text.length > 30 && !text.includes('©')) {
              description = text
              break
            }
          }
          if (!description || description.length < 30) continue

          const textContent = linkEl.textContent || ''
          const teamMatch = textContent.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Team/i)
          const team = teamMatch && teamMatch[1] ? teamMatch[1].trim() : undefined

          const amountMatch = textContent.match(/\$\$?[\d,]+[KkMm]?(?:\s*-\s*\$[\d,]+[KkMm]?)?|\$[\d,]+(?:,\d{3})*(?:\.\d{2})?[KkMm]?|Up to \$[\d,]+[KkMm]?|Upto \$[\d,]+[KkMm]?/i)
          const amount = amountMatch ? amountMatch[0].replace(/\$\$/g, '$').trim() : undefined

          const deadlineMatch = textContent.match(/(?:Deadline|Due|Closes?|Ends?|Until):\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i) ||
                                textContent.match(/(?:Apply by|Submit by):\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i)
          const deadline = deadlineMatch && deadlineMatch[1] ? deadlineMatch[1].trim() : undefined

          items.push({ title, description, link, team, amount, deadline })
        } catch (err) {

        }
      }

      return items
    })

    console.log(`[Web] Found ${grantsList.length} grants`)

    for (const item of grantsList) {
      try {
        const id = `blockchain-grants-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fullUrl = `https://blockchaingrants.org${item.link}`

        let enrichedDesc = item.description
        if (item.team) {
          enrichedDesc += ` | Team: ${item.team}`
        }

        const author = item.team || item.title.split(/[\s-]/)[0]?.trim() || 'BlockchainGrants'

        grants.push({
          id,
          source: 'web',
          origin: 'blockchain-grants-org',
          title: item.title,
          description: enrichedDesc,
          apply_url: fullUrl,
          info_url: fullUrl,
          author,
          amount: item.amount,
          deadline: item.deadline,
          createdAt: new Date().toISOString()
        })

        console.log(`[Web] ✅ ${item.title.slice(0, 60)}...${item.amount ? ` [${item.amount}]` : ''}`)
      } catch (err) {
        console.error(`[Web] Failed to process grant:`, err)
      }
    }

    await browser.close()
    console.log(`[Web] BlockchainGrants.org: ${grants.length} grants collected`)
  } catch (err) {
    console.error('[Web] BlockchainGrants.org failed:', err)
  }

  return grants
}


