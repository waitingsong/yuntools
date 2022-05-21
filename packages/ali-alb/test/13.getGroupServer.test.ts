import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  CI,
  ips,
  groupId,
  ecsClient,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', async () => {
      for await (const ip of ips) {
        const id = await ecsClient.getInstanceIdByIp(ip)
        assert(id, `id should be defined, ip: ${ip}`)

        const server = await client.getGroupServer(groupId, id)
        assert(server, `server should be defined, ip: ${ip}`)

        const server2 = await client.getGroupServerByPublicIp(groupId, ip)
        assert(server2, `server2 should be defined, ip: ${ip}`)
        assert.deepEqual(server, server2, `server should be equal, ip: ${ip}`)
      }
    })
  })

})

