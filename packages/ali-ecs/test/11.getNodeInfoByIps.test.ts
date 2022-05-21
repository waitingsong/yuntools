import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { EcsInfoKey, EcsNodeInfo } from '../src/index.js'

import {
  client,
  CI,
  ips,
  serverIds,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', async () => {
      const ret = await client.getNodeInfoByIps(ips)
      assertFunc(ret)
    })

    it('multiple', async () => {
      for (let i = 0; i < 5; i += 1) {
        const ret = await client.getNodeInfoByIps(ips)
        assertFunc(ret)
      }
    })
  })

})

function assertFunc(input: Map<string, EcsNodeInfo>) {
  assert(input)
  assert(input.size > 0)

  if (! CI) {
    for (const kk of input.keys()) {
      console.info(kk)
    }
  }

  assert(
    input.size === ips.length,
    `result size: ${input.size}, ips length: ${ips.length}}`,
  )

  let idx = 0
  ips.forEach((ip) => {
    const server = input.get(ip)
    assert(server, 'server should exist')
    assert(server.instanceId, 'server.instanceId should exist')

    Object.values(EcsInfoKey).forEach((key) => {
      assert(typeof server[key] !== 'undefined', `server.${key} should exist`)
    })

    const expectServerId = serverIds[idx]
    assert(expectServerId, 'expectServerId should exist')
    assert(server.instanceId === expectServerId, 'server.instanceId should equal to expectServerId')
    idx += 1
  })
}

