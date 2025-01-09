import { PrismaClient } from '@prisma/client'

export * from '../prisma/zod'

export * from '@prisma/client'

export const prisma = new PrismaClient({
  log: ['query'],
})
