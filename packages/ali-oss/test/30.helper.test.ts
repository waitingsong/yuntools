import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import {
  validateConfigPath,
  writeConfigFile,
} from '../src/index.js'

import {
  cloudUrlPrefix,
  client,
  CI,
} from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', async () => {
      const config = {
        endpoint: 'foo',
        accessKeyId: 'bar',
        accessKeySecret: 'baz',
      }
      const { path } = await writeConfigFile(config)
      assert(path, 'writeConfigFile failed')
      await validateConfigPath(path)
    })

    it('dup', async () => {
      const config = {
        endpoint: 'foo',
        accessKeyId: 'bar',
        accessKeySecret: 'baz',
      }
      const { path } = await writeConfigFile(config)
      assert(path, 'writeConfigFile failed')
      await validateConfigPath(path)
    })
  })
})


