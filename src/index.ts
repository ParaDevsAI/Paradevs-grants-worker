import { runWorker } from './worker'

async function main() {
  console.log('[App] Worker initialized')
  await runWorker()
  console.log('[App] Worker completed successfully')
  process.exit(0)
}

main().catch(err => {
  console.error('[App] Fatal error', err)
  process.exit(1)
})
