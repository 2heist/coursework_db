import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from './generated/prisma/client'
import { UserController } from './controllers/UserController'
import { ask, rl } from './utils/input'

const prisma = new PrismaClient()
const userController = new UserController()

async function main() {
  console.log("\nCarSharing CLI")

  while (true) {
    console.log("\n1. Show all users")
    console.log("2. Create new user")
    console.log("3. Update user info")
    console.log("4. Exit")

    const answer = await ask("Select action (1-4): ")

    switch (answer.trim()) {
      case '1':
        await userController.showAll()
        break
      case '2':
        await userController.register()
        break
      case '3':
        await userController.update()
        break
      case '4':
        console.log("Exiting...")
        rl.close()
        await prisma.$disconnect()
        return
      default:
        console.log("Unknown command.")
    }
  }
}

main().catch(console.error)