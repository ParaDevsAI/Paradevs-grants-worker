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
          const title = link.textContent?.trim() || ''
          const href = link.getAttribute('href') || ''
          const parent = link.closest('div, article, section')
          const description = parent?.textContent?.trim() || ''

          return { title, href, description }
        })
    )

    for (const item of items) {
      if (!item.title || item.title.length < 10) continue

      const id = `blockchain-grants-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const fullUrl = item.href.startsWith('http')
        ? item.href
        : `https://blockchaingrants.org${item.href}`

      grants.push({
        id,
        source: 'web',
        origin: 'blockchain-grants-org',
        title: item.title.slice(0, 200),
        description: item.description.slice(0, 500) || item.title,
        url: fullUrl,
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
