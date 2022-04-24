/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Ecs from '@alicloud/ecs20140526'


// for ESM module
// export const _Client = (Ecs as any).default as typeof Ecs
export const _Client = Ecs

