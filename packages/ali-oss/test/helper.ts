import assert from 'node:assert'

import type {
  OssClient,
  PathExistsOptions,
} from '~/index'


export async function assertFileExists(
  client: OssClient,
  bucket: string,
  cloudFile: string,
): Promise<void> {

  const opts: PathExistsOptions = {
    bucket,
    target: cloudFile,
  }
  const exists = await client.pathExists(opts)
  assert(exists === true)
}

