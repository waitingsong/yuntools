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
    it('ips', async () => {
      let idx = 0
      for (const ip of ips) {
        const ret = await client.getInstanceIdByIp(ip)
        assert(ret, `${idx} should be found`)

        const serverId = serverIds[idx]
        assert(serverId)
        assert(ret === serverId)
        idx += 1
      }
    })

    it('fake', async () => {
      const ret = await client.getInstanceIdByIp('1.2.3.4')
      assert(! ret, 'should not be found')
    })
  })

})


