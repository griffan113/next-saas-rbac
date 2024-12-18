import { z } from 'zod'

export const userSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('delete'),
    z.literal('update'),
    z.literal('get'),
    z.literal('invite'),
  ]),
  z.literal('User'),
])

export type UserSubject = z.infer<typeof userSubject>
