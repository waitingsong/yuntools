import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  CI,
  ips,
  groupId,
} from './root.config.js'

import { UpdateServerWeightOptions } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', async () => {
      const servers = await client.getGroupServerByPublicIps(groupId, ips)
      assert(
        servers.size === ips.length,
        `servers.size !== ips.length, servers.size: ${servers.size}, ips.length: ${ips.length}`,
      )
      CI || console.log({ servers })

      for await (const ip of ips) {
        const server = servers.get(ip)
        assert(server, 'server should be defined')

        const currentWeight = server.weight
        assert(typeof currentWeight === 'number', `currentWeight should be number, ip: ${ip}`)

        const newWeight = 60
        const opts: UpdateServerWeightOptions = {
          serverGroupId: groupId,
          ip,
          weight: newWeight,
        }
        const updateWeightRet = await client.updateServerWeightByPublicIp(opts)
        assert(updateWeightRet, 'updateWeightRet should be defined')

        const server2 = await client.getGroupServerByPublicIp(groupId, ip)
        assert(server2, 'server2 should be defined')
        assert(typeof server2.weight === 'number', 'server2.weight should be defined')
        assert(
          server2.weight === newWeight,
          `server2.weight !== newWeight, ip: ${ip}, server2.weight: ${server2.weight}, newWeight: ${newWeight}`,
        )

        const newWeight2 = server2.weight + 10
        const opts2: UpdateServerWeightOptions = {
          serverGroupId: groupId,
          ecsId: server2.serverId,
          weight: newWeight2,
        }
        await client.updateServerWeightByPublicIp(opts2)

        const server3 = await client.getGroupServerByPublicIp(groupId, ip)
        assert(server3, 'server3 should be defined')
        assert(typeof server3.weight === 'number', 'server3.weight should be defined')
        assert(
          server3.weight === newWeight2,
          `server3.weight !== newWeight, ip: ${ip}, server3.weight: ${server3.weight}, newWeight: ${newWeight2}`,
        )
      }
    })

    it('weight', async () => {
      const [ip] = ips
      assert(ip, 'ip should be defined')
      let servers = await client.getGroupServerByPublicIps(groupId, [ip])
      assert(
        servers.size === 1,
        `servers.size !== ips.length, servers.size: ${servers.size}, ips.length: ${ips.length}`,
      )
      CI || console.log({ servers })

      let server = servers.get(ip)
      assert(server, 'server should be defined')

      const currentWeight = server.weight
      assert(typeof currentWeight === 'number', `currentWeight should be number, ip: ${ip}`)

      let newWeight = -1
      let opts: UpdateServerWeightOptions = {
        serverGroupId: groupId,
        currentWeight,
        weight: newWeight,
        ip,
      }
      await client.updateServerWeightByPublicIp(opts)

      servers = await client.getGroupServerByPublicIps(groupId, [ip])
      server = servers.get(ip)
      assert(server, 'server should be defined')
      assert(typeof server.weight === 'number', 'server.weight should be defined')
      assert(
        server.weight === 0,
        `server.weight !== newWeight, ip: ${ip}, server.weight: ${server.weight}, newWeight: ${newWeight}`,
      )

      newWeight = 999
      opts = {
        serverGroupId: groupId,
        weight: newWeight,
        ip,
      }
      await client.updateServerWeightByPublicIp(opts)

      servers = await client.getGroupServerByPublicIps(groupId, [ip])
      server = servers.get(ip)
      assert(server, 'server should be defined')
      assert(typeof server.weight === 'number', 'server.weight should be defined')
      assert(
        server.weight === 100,
        `server.weight !== newWeight, ip: ${ip}, server.weight: ${server.weight}, newWeight: ${newWeight}`,
      )

      await client.updateServerWeightByPublicIp(opts)

      servers = await client.getGroupServerByPublicIps(groupId, [ip])
      server = servers.get(ip)
      assert(server, 'server should be defined')
      assert(typeof server.weight === 'number', 'server.weight should be defined')
      assert(
        server.weight === 100,
        `server.weight !== newWeight, ip: ${ip}, server.weight: ${server.weight}, newWeight: ${newWeight}`,
      )
    })
  })

})

