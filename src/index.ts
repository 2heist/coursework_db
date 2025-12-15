import * as dotenv from 'dotenv'
dotenv.config()

import { UserService } from './services/UserService'
import { PrismaClient } from './generated/prisma/client'

const prisma = new PrismaClient()
const userService = new UserService()

async function main() {
  console.log("Starting CarSharing Application...")

  await userService.getAllUsers()

  console.log("\nTest 1: Creating Valid User...")
  await userService.createUser({
    name: "Василь Вірастюк",
    email: "v.virastyuk@example.com",
    phone: "+380998887766",
    license: "STRONG001"
  })

  console.log("\nTest 2: Creating Duplicate User...")
  await userService.createUser({
    name: "Василь Клон",
    email: "v.virastyuk@example.com",
    phone: "+380990000000",
    license: "FAKE123"
  })

  console.log("\nFinal User List:")
  await userService.getAllUsers()
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })