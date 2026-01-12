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

    const url = 'https://grants.gitcoin.co/'
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })

    await page.waitForTimeout(2000)

    const items = await page.$$eval('a[href*="/round/"]', (links) =>
      links.slice(0, 5).map((link) => {
        const title =
          link.querySelector('h3')?.textContent ||
          link.querySelector('h2')?.textContent ||
          link.textContent ||
          ''
        const href = link.getAttribute('href') || ''

        return { title: title.trim(), href }
      })
    )

    for (const item of items) {
      if (!item.title || !item.href) continue

      const id = `gitcoin-${item.href.split('/').pop()}`
      const fullUrl = item.href.startsWith('http')
        ? item.href
        : `https://grants.gitcoin.co${item.href}`

      grants.push({
        id,
        source: 'web',
        origin: 'gitcoin',
        title: item.title,
        description: item.title,
        url: fullUrl,
        author: 'gitcoin',
        createdAt: new Date().toISOString()
      })
    }

    await browser.close()
    console.log(`[Web] Gitcoin: ${grants.length} grants collected`)
  } catch (err) {
    console.error('[Web] Gitcoin failed:', err)
  }

  return grants
}
