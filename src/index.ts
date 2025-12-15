import * as dotenv from 'dotenv'
dotenv.config()

import * as readline from 'readline'
import { UserService } from './services/UserService'
import { PrismaClient } from './generated/prisma/client'

const prisma = new PrismaClient()
const userService = new UserService()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const ask = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log("\n--- CarSharing CLI v1.1 ---")
  console.log("1. Show all users")
  console.log("2. Create new user")
  console.log("3. Exit")

  while (true) {
    const answer = await ask("\nSelect action (1-3): ")

    switch (answer.trim()) {
      case '1':
        await userService.getAllUsers()
        break

      case '2':
        console.log("\n--- Register New User (Type 'cancel' to go back) ---")
        
        const name = await ask("Name: ")
        if (name.toLowerCase() === 'cancel') break 

        const email = await ask("Email: ")
        if (email.toLowerCase() === 'cancel') break

        const phone = await ask("Phone: ")
        if (phone.toLowerCase() === 'cancel') break

        const license = await ask("License number: ")
        if (license.toLowerCase() === 'cancel') break

        if (!name || !email || !phone || !license) {
          console.log("\n[WARNING] All fields (Name, Email, Phone, License) are mandatory!")
          console.log("User creation aborted. Please try again.")
          break
        }

        await userService.createUser({
          name,
          email,
          phone,
          license
        })
        break

      case '3':
        console.log("Exiting...")
        rl.close()
        await prisma.$disconnect()
        return

      default:
        console.log("Unknown command, please try again.")
    }
  }
}

main().catch(console.error)