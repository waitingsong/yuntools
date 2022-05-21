import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  CI,
  ips,
  groupId,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', async () => {
      const ret = await client.getGroup(groupId)
      assert(ret, 'ret should be defined')
      assert(ret.serverGroupId === groupId, 'ret.serverGroupId should be defined')
      assert(ret.resourceGroupId, 'ret.resourceGroupId should be defined')
      assert(ret.serverGroupStatus, 'ret.serverGroupStatus should be defined')
    })
  })

})

