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
      const [ip] = ips
      assert(ip)
      const server = await client.getGroupServerByPublicIp(groupId, ip)
      assert(server, 'should be servers')
      CI || console.log({ server })
      assert(server.serverId, 'server.serverId should be defined')
      assert(server.serverType, 'server.serverType should be defined')
      assert(server.serverIp, 'server.serverIp should be defined')
      assert(server.status, 'server.serverStatus should be defined')
      assert(server.weight, 'server.weight should be defined')
    })

    it('fake ip', async () => {
      const server = await client.getGroupServerByPublicIp(groupId, '127.0.0.2')
      assert(! server, 'should be undefined')
    })
  })

})

