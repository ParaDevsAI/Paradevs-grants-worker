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
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })

    await page.waitForTimeout(2000)

    const items = await page.$$eval('a', (links) =>
      links
        .filter((link) => {
          const text = link.textContent?.toLowerCase() || ''
          const href = link.getAttribute('href') || ''
          return (
            text.includes('grant') ||
            text.includes('funding') ||
            text.includes('program') ||
            href.includes('grant')
          )
        })
        .slice(0, 10)
        .map((link) => {
    
          const rawTitle = link.textContent?.trim() || ''
          const title = rawTitle.replace(/\s+/g, ' ').slice(0, 200)
          
          const href = link.getAttribute('href') || ''
        
          const parent = link.closest('div, article, section, li')
          let description = ''
          
          if (parent) {
            const siblings = Array.from(parent.querySelectorAll('p, span, div'))
            const texts = siblings
              .map(el => el.textContent?.trim())
              .filter(t => t && t.length > 20 && t.length < 300)
            
            description = texts[0] || parent.textContent?.trim() || ''
          }
          
          if (!description || description === title) {
            description = `${title} - Visit page for details`
          }
          
          return { 
            title, 
            href, 
            description: description.replace(/\s+/g, ' ').slice(0, 500) 
          }
        })
    )

    for (const item of items) {
      if (!item.title || item.title.trim().length < 10) {
        console.log('[Web] Skipping grant with invalid title:', item.title)
        continue
      }
      
      if (!item.description || item.description.trim().length < 20) {
        console.log('[Web] Skipping grant with invalid description')
        continue
      }

      const id = `blockchain-grants-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const fullUrl = item.href.startsWith('http')
        ? item.href
        : `https://blockchaingrants.org${item.href}`

      grants.push({
        id,
        source: 'web',
        origin: 'blockchain-grants-org',
        title: item.title.trim().slice(0, 200),
        description: item.description.trim().slice(0, 500),
        url: fullUrl,  
        apply_url: fullUrl,  
        author: 'blockchain-grants-org',
        createdAt: new Date().toISOString()
      })
    }

    await browser.close()
    console.log(`[Web] BlockchainGrants.org: ${grants.length} grants collected`)
  } catch (err) {
    console.error('[Web] BlockchainGrants.org failed:', err)
  }

  return grants
}
