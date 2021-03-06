import assert from 'node:assert'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  testDir,
} from './root.config.js'

import type { MkdirOptions, RmrfOptions } from '~/index.js'


const target = `${cloudUrlPrefix}/`
const mkdirOpts: MkdirOptions = {
  bucket,
  target,
}
const rmOpts: RmrfOptions = {
  bucket,
  target,
}

/**
 * @see https://mochajs.org/#root-hook-plugins
 * beforeAll:
 *  - In serial mode(Mocha’s default ), before all tests begin, once only
 *  - In parallel mode, run before all tests begin, for each file
 * beforeEach:
 *  - In both modes, run before each test
 */
export const mochaHooks = async () => {
  // avoid run multi times
  if (! process.env.mochaRootHookFlag) {
    process.env.mochaRootHookFlag = 'true'
  }

  return {
    beforeAll: async () => {
      await client.rmrf(rmOpts)

      const ret = await client.mkdir(mkdirOpts)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
    },

    afterAll: async () => {
      await client.rmrf(rmOpts)
      try {
        await rm(join(testDir, 'tmp'), { recursive: true })
      }
      catch {
        void 0
      }
    },
  }

}

