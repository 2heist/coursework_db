import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from './generated/prisma/client'
import { UserController } from './controllers/UserController'
import { CarController } from './controllers/CarController'
import { RentalController } from './controllers/RentalController'
import { StatsController } from './controllers/StatsController'   
import { ask, rl } from './utils/input'

const prisma = new PrismaClient()
const userController = new UserController()
const carController = new CarController()
const rentalController = new RentalController()
const statsController = new StatsController()   

async function main() {
  console.log("\n=== CarSharing System v5.0 (Final) ===")

  while (true) {
    console.log("\n--- MAIN MENU ---")
    console.log("1. Manage Users (Clients)")
    console.log("2. Manage Cars (Fleet)")
    console.log("3. Manage Rentals (Operations)")
    console.log("4. Analytics & Reports")   
    console.log("5. Exit")

    const answer = await ask("Select module (1-5): ")

    switch (answer.trim()) {
      case '1':
        await userController.handleMenu()
        break
      case '2':
        await carController.handleMenu()
        break
      case '3':
        await rentalController.handleMenu()
        break
      case '4':
        await statsController.handleMenu()
        break
      case '5':
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