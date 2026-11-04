import { cpSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const directory = mkdtempSync(join(tmpdir(), 'tia-bete-output-'))
const port = 4322
const databasePath = join(directory, 'glucose.sqlite')
cpSync('.output', join(directory, '.output'), { recursive: true })
const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: directory,
  env: { ...process.env, NITRO_HOST: '127.0.0.1', PORT: String(port), TIA_BETE_DB_PATH: databasePath },
  stdio: 'ignore'
})

const stop = () => server.kill('SIGKILL')
try {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/glucose/readings`)
      if (!response.ok) throw new Error(`API respondeu ${response.status}`)
      process.exitCode = 0
      break
    } catch {
      if (attempt === 29) throw new Error('API compilada não iniciou com migration empacotada.')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
} finally {
  stop()
  rmSync(directory, { recursive: true, force: true })
}
