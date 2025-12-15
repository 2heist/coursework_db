import { RentalService } from '../services/RentalService'
import { ask } from '../utils/input'

const rentalService = new RentalService()

export class RentalController {

  async handleMenu() {
    while (true) {
      console.log("\nRENTAL OPERATIONS")
      console.log("1. Rent a Car (Start)")
      console.log("2. Return Car (Finish)")
      console.log("3. Show Active Rentals")
      console.log("4. Back to Main Menu")

      const answer = await ask("Select action (1-4): ")

      switch (answer.trim()) {
        case '1':
          await this.rent()
          break
        case '2':
          await this.return()
          break
        case '3':
          await rentalService.getActiveRentals()
          break
        case '4':
          return
        default:
          console.log("Unknown command.")
      }
    }
  }

  private async rent() {
    console.log("\nNew Rental")
    
    const userIdStr = await ask("Enter User ID: ")
    if (userIdStr === 'cancel') return
    const userId = parseInt(userIdStr)

    const carIdStr = await ask("Enter Car ID: ")
    if (carIdStr === 'cancel') return
    const carId = parseInt(carIdStr)

    if (isNaN(userId) || isNaN(carId)) {
      console.log("[ERROR] Invalid IDs.")
      return
    }

    await rentalService.rentCar(userId, carId)
  }

  private async return() {
    console.log("\nReturn Car")
    
    await rentalService.getActiveRentals()

    const rentIdStr = await ask("Enter Rental ID to finish: ")
    if (rentIdStr === 'cancel') return
    const rentId = parseInt(rentIdStr)

    if (isNaN(rentId)) {
      console.log("[ERROR] Invalid ID.")
      return
    }

    await rentalService.returnCar(rentId)
  }
}