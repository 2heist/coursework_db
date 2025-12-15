import { PrismaClient, Car, Prisma } from '../generated/prisma/client'

const prisma = new PrismaClient()

interface CreateCarDTO {
  brand: string
  modelName: string
  year: number
  pricePerHour: number
  licensePlate: string
  city: string
  address: string
}

interface UpdateCarDTO {
  brand?: string
  modelName?: string
  year?: number
  pricePerHour?: number
  licensePlate?: string
  city?: string
  address?: string
  statusName?: string
}

export class CarService {
  
  async createCar(data: CreateCarDTO): Promise<Car | null> {
    console.log(`[INFO] Adding car: ${data.brand} ${data.modelName}...`)

    const existingCar = await prisma.car.findFirst({
      where: { license_plate: data.licensePlate }
    })

    if (existingCar) {
      console.error(`[ERROR] Car with plate ${data.licensePlate} already exists (might be deleted).`)
      return null
    }

    try {
      let modelRecord = await prisma.carModel.findFirst({
        where: { brand: data.brand, model_name: data.modelName }
      })

      if (!modelRecord) {
        modelRecord = await prisma.carModel.create({
          data: { brand: data.brand, model_name: data.modelName }
        })
      }

      let locationRecord = await prisma.carLocation.findFirst({
        where: { city: data.city, address: data.address }
      })

      if (!locationRecord) {
        locationRecord = await prisma.carLocation.create({
          data: { city: data.city, address: data.address }
        })
      }

      let statusRecord = await prisma.carStatus.findUnique({
        where: { status_name: 'Available' }
      })

      if (!statusRecord) {
        statusRecord = await prisma.carStatus.create({
          data: { status_name: 'Available' }
        })
      }

      const newCar = await prisma.car.create({
        data: {
          license_plate: data.licensePlate,
          year: data.year,
          price_per_hour: new Prisma.Decimal(data.pricePerHour),
          model_id: modelRecord.model_id,
          location_id: locationRecord.location_id,
          status_id: statusRecord.status_id
        }
      })
      
      console.log(`[SUCCESS] Car added. ID: ${newCar.car_id}`)
      return newCar

    } catch (error) {
      console.error("[CRITICAL ERROR] Database issue:", error)
      return null
    }
  }

  async getAllCars() {
    const cars = await prisma.car.findMany({
      where: { deleted_at: null },
      orderBy: { car_id: 'asc' },
      include: { model: true, status: true, location: true }
    })
    console.log(`[INFO] Total active cars: ${cars.length}`)
    
    this.printCarList(cars)
  }

  async getDeletedCars() {
    const cars = await prisma.car.findMany({
      where: { NOT: { deleted_at: null } },
      orderBy: { car_id: 'asc' },
      include: { model: true, status: true, location: true }
    })
    console.log(`[INFO] Total deleted cars: ${cars.length}`)
    
    this.printCarList(cars)
  }

  private printCarList(cars: any[]) {
    cars.forEach(c => {
      const fullModel = `${c.model.brand} ${c.model.model_name}`
      const loc = `${c.location.city}, ${c.location.address}`
      const status = c.status.status_name
      
      console.log(` - ID: ${c.car_id} | ${fullModel} (${c.year}) | Plate: ${c.license_plate} | $${c.price_per_hour}/hr | Loc: ${loc} | [${status}]`)
    })
  }

  async updateCar(carId: number, data: UpdateCarDTO): Promise<Car | null> {
    console.log(`[INFO] Updating car ID: ${carId}...`)

    try {
      const car = await prisma.car.findUnique({ 
        where: { car_id: carId },
        include: { status: true }
      })
      
      if (!car) {
        console.error(`[ERROR] Car not found.`)
        return null
      }

      const updateData: any = {}

      if (data.statusName) {
        const currentStatus = car.status.status_name
        const newStatus = data.statusName

        if (newStatus === 'Rented') {
          console.error(`[WARNING] Operation Blocked: Cannot manually set status to 'Rented'. Please use the 'Rent a Car' menu.`)
          return null
        }

        if (currentStatus === 'Rented') {
          console.error(`[WARNING] Operation Blocked: This car is currently Rented by a user. Please finish the rental first.`)
          return null
        }
 
        const statusRecord = await prisma.carStatus.findUnique({
          where: { status_name: newStatus }
        })

        if (statusRecord) {
          updateData.status_id = statusRecord.status_id
        } else {
          console.log(`[WARN] Status '${newStatus}' not found.`)
        }
      }

      if (data.year) updateData.year = data.year
      if (data.pricePerHour) updateData.price_per_hour = new Prisma.Decimal(data.pricePerHour)
      if (data.licensePlate) updateData.license_plate = data.licensePlate

  
      if (data.brand || data.modelName) {
         const currentModel = await prisma.carModel.findUnique({ where: { model_id: car.model_id } })
         const targetBrand = data.brand || currentModel?.brand
         const targetModelName = data.modelName || currentModel?.model_name
         if (targetBrand && targetModelName) {
            let modelRecord = await prisma.carModel.findFirst({ where: { brand: targetBrand, model_name: targetModelName } })
            if (!modelRecord) modelRecord = await prisma.carModel.create({ data: { brand: targetBrand, model_name: targetModelName } })
            updateData.model_id = modelRecord.model_id
         }
      }

      if (data.city || data.address) {
         const currentLocation = await prisma.carLocation.findUnique({ where: { location_id: car.location_id } })
         const targetCity = data.city || currentLocation?.city
         const targetAddress = data.address || currentLocation?.address
         if (targetCity && targetAddress) {
            let locRecord = await prisma.carLocation.findFirst({ where: { city: targetCity, address: targetAddress } })
            if (!locRecord) locRecord = await prisma.carLocation.create({ data: { city: targetCity, address: targetAddress } })
            updateData.location_id = locRecord.location_id
         }
      }

      const updatedCar = await prisma.car.update({
        where: { car_id: carId },
        data: updateData
      })

      console.log(`[SUCCESS] Car ${carId} updated.`)
      return updatedCar

    } catch (error) {
      console.error("[CRITICAL ERROR] Update failed:", error)
      return null
    }
  }

  async deleteCar(carId: number): Promise<boolean> {
    console.log(`[INFO] Soft-deleting car ID: ${carId}...`)
    try {
      const car = await prisma.car.findUnique({ where: { car_id: carId } })
      if (!car) return false

      await prisma.car.update({
        where: { car_id: carId },
        data: { deleted_at: new Date() }
      })
      
      console.log(`[SUCCESS] Car ${carId} marked as deleted.`)
      return true

    } catch (error) {
      console.error("[ERROR] Soft delete failed:", error)
      return false
    }
  }

  async restoreCar(carId: number): Promise<boolean> {
    console.log(`[INFO] Restoring car ID: ${carId}...`)
    try {
      const car = await prisma.car.findUnique({ where: { car_id: carId } })
      if (!car) {
         console.error(`[ERROR] Car not found.`)
         return false
      }

      await prisma.car.update({
        where: { car_id: carId },
        data: { deleted_at: null }
      })
      
      console.log(`[SUCCESS] Car ${carId} restored.`)
      return true
    } catch (error) {
      console.error("[ERROR] Restore failed:", error)
      return false
    }
  }
}