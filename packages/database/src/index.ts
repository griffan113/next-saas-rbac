import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '../../.env' })

export * from '@prisma/client'

export const prisma = new PrismaClient({
  log: ['query'],
})
