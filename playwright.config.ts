import { rmSync } from 'node:fs'
import { join } from 'node:path'

import { defineConfig } from '@playwright/test'

const databasePath = join(process.cwd(), 'test-results', 'glucose-e2e.sqlite')
rmSync(databasePath, { force: true })

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4321',
    viewport: { width: 390, height: 844 }
  },
  webServer: {
    command: 'npm run dev -- --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
    env: {
      ...process.env,
      NITRO_HOST: '127.0.0.1',
      TIA_BETE_DB_PATH: databasePath
    }
  }
})
