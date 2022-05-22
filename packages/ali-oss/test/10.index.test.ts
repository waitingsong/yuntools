import assert from 'node:assert/strict'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import {
  OssClient,
  validateConfigPath,
  writeConfigFile,
} from '../src/index.js'

import {
  cloudUrlPrefix,
  config,
  configPath,
  CI,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('init with config file', async () => {
      assert(config, 'config is required')

      const configPathRandom = join(homedir(), '.ossutilconfig-' + Math.random().toString())
      const { path } = await writeConfigFile(config, configPath)
      assert(path === configPath, 'writeConfigFile failed')

      const client = new OssClient(configPath)

      const dir = `${cloudUrlPrefix}/${Math.random().toString()}`
      const ret = await client.mkdir(dir)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)

      await client.rm(dir)
      await client.destroy()
      try {
        await validateConfigPath(path)
      }
      catch {
        return
      }
      assert(false, 'validateConfigPath should fail')
    })

    it('init with default config file', async () => {
      assert(config, 'config is required')
      const { path } = await writeConfigFile(config, configPath)
      assert(path === configPath, 'writeConfigFile failed')

      const client = new OssClient(void 0)

      const dir = `${cloudUrlPrefix}/${Math.random().toString()}`
      const ret = await client.mkdir(dir)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await client.rm(dir)
    })

  })

})


