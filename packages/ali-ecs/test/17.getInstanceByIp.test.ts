import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  CI,
  ips,
  serverIds,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('param: regionId', async () => {
      const regionId = 'ap-southeast-1'
      const ret = await client.getInstanceByIp('127.0.0.1', regionId)
      assert(! ret, 'should not be found')
    })
  })

})


