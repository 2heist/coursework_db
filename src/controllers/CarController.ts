import { CarService } from '../services/CarService'
import { ask } from '../utils/input'

const carService = new CarService()

export class CarController {

  async handleMenu() {
    while (true) {
      console.log("\nCAR MANAGEMENT")
      console.log("1. Show Active Cars")
      console.log("2. Add New Car")
      console.log("3. Update Car Details")
      console.log("4. Delete Car (Soft)")
      console.log("5. Trash Bin (Restore)")
      console.log("6. Back to Main Menu")

      const answer = await ask("Select action (1-6): ")

      switch (answer.trim()) {
        case '1':
          await carService.getAllCars()
          break
        case '2':
          await this.create()
          break
        case '3':
          await this.update()
          break
        case '4':
          await this.delete()
          break
        case '5':
          await this.trashBin()
          break
        case '6':
          return
        default:
          console.log("Unknown command.")
      }
    }
  }

  private async create() {
    console.log("\nAdd New Car")
    const brand = await ask("Brand: "); if(brand=='cancel') return;
    const modelName = await ask("Model: "); if(modelName=='cancel') return;
    const year = parseInt(await ask("Year: ")); 
    const pricePerHour = parseFloat(await ask("Price/Hour: "));
    const licensePlate = await ask("Plate: "); if(licensePlate=='cancel') return;
    const city = await ask("City: "); if(city=='cancel') return;
    const address = await ask("Address: "); if(address=='cancel') return;

    if (isNaN(year) || isNaN(pricePerHour)) { console.log("Invalid numbers"); return; }

    await carService.createCar({ brand, modelName, year, pricePerHour, licensePlate, city, address })
  }

  private async update() {
    console.log("\nFull Update Car (Press Enter to skip)")
    const idStr = await ask("Enter Car ID to update: ")
    if (idStr === 'cancel') return
    const id = parseInt(idStr)
    if (isNaN(id)) return

    const brand = await ask("New Brand: ")
    const modelName = await ask("New Model: ")
    const yearStr = await ask("New Year: ")
    const year = yearStr ? parseInt(yearStr) : undefined
    const priceStr = await ask("New Price/Hour: ")
    const price = priceStr ? parseFloat(priceStr) : undefined
    const plate = await ask("New Plate: ")
    const city = await ask("New City: ")
    const address = await ask("New Address: ")
    const status = await ask("New Status (Available/Rented/Maintenance): ")

    await carService.updateCar(id, {
      brand: brand || undefined,
      modelName: modelName || undefined,
      year: year,
      pricePerHour: price,
      licensePlate: plate || undefined,
      city: city || undefined,
      address: address || undefined,
      statusName: status || undefined
    })
  }

  private async delete() {
    console.log("\nDelete Car (Soft)")
    const idStr = await ask("Enter Car ID: ")
    if (idStr === 'cancel') return
    const id = parseInt(idStr)

    const confirm = await ask(`Are you sure you want to delete car ${id}? (yes/no): `)
    if (confirm === 'yes') {
      await carService.deleteCar(id)
    }
  }

  private async trashBin() {
    while (true) {
      console.log("\nTRASH BIN")
      console.log("1. Show Deleted Cars")
      console.log("2. Restore Car")
      console.log("3. Back")

      const answer = await ask("Select action (1-3): ")
      
      switch (answer.trim()) {
        case '1':
          await carService.getDeletedCars()
          break
        
        case '2':
          const idStr = await ask("Enter Car ID to RESTORE: ")
          if (idStr === 'cancel') break
          const id = parseInt(idStr)
          
          if (!isNaN(id)) {
            await carService.restoreCar(id)
          }
          break
          
        case '3':
          return
      }
    }
  }
}