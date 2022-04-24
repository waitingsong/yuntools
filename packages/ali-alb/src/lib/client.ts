/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Alb from '@alicloud/alb20200616'


// for ESM module
// export const _Client = (Alb as any).default as typeof Alb
export const _Client = Alb

