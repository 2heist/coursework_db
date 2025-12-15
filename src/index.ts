import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from './generated/prisma/client'
import { UserController } from './controllers/UserController'
import { CarController } from './controllers/CarController'
import { ask, rl } from './utils/input'

const prisma = new PrismaClient()
const userController = new UserController()
const carController = new CarController()

async function main() {
  console.log("\nCarSharing")

  while (true) {
    console.log("\nMAIN MENU")
    console.log("1. Manage Users (Clients)")
    console.log("2. Manage Cars (Fleet)")
    console.log("3. Exit")

    const answer = await ask("Select module (1-3): ")

    switch (answer.trim()) {
      case '1':
        await userController.handleMenu()
        break
        
      case '2':
        await carController.handleMenu()
        break
        
      case '3':
        console.log("Shutting down...")
        rl.close()
        await prisma.$disconnect()
        return
        
      default:
        console.log("Invalid option.")
    }
  }
}

main().catch(console.error)