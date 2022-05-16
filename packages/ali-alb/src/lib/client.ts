/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Alb from '@alicloud/alb20200616'


export const _Client = typeof module === 'object'
  ? Alb
  : (Alb as any).default as typeof Alb

