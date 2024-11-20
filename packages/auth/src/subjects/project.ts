import { z } from 'zod'
import { projectSchema } from '../models/project'

// Tupla - Array de 2 posições
export const projectSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('delete'),
    z.literal('update'),
    z.literal('get'),
  ]),
  z.union([z.literal('Project'), projectSchema]),
])

export type ProjectSubject = z.infer<typeof projectSubject>
