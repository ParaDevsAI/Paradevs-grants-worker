import cron from 'node-cron'
import { runWorker } from './worker'
import { config } from './config'

console.log('[App] Worker initialized')

runWorker().catch(err => console.error('[Worker Error]', err))

cron.schedule(config.cron, async () => {
  try {
    await runWorker()
  } catch (err) {
    console.error('[Worker Error]', err)
  }
})
