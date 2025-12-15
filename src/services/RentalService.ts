import { PrismaClient, Rental, Prisma } from '../generated/prisma/client'

const prisma = new PrismaClient()

export class RentalService {

  async rentCar(userId: number, carId: number): Promise<Rental | null> {
    console.log(`[INFO] Processing rental request: User ${userId} -> Car ${carId}...`)

    try {
      const user = await prisma.user.findUnique({ where: { user_id: userId } })
      if (!user) {
        console.error(`[ERROR] User ${userId} not found.`)
        return null
      }

      const availableStatus = await prisma.carStatus.findUnique({ where: { status_name: 'Available' } })
      if (!availableStatus) {
        console.error("[ERROR] Status 'Available' not defined in DB.")
        return null
      }

      const car = await prisma.car.findFirst({
        where: { 
          car_id: carId, 
          status_id: availableStatus.status_id, 
          deleted_at: null 
        }
      })

      if (!car) {
        console.error(`[ERROR] Car ${carId} is not available (or does not exist).`)
        return null
      }

      let rentedStatus = await prisma.carStatus.findUnique({ where: { status_name: 'Rented' } })
      if (!rentedStatus) {

        rentedStatus = await prisma.carStatus.create({ data: { status_name: 'Rented' } })
      }

      const result = await prisma.$transaction(async (tx) => {
        
        const newRental = await tx.rental.create({
          data: {
            user_id: userId,
            car_id: carId,
            start_time: new Date(),
            status: 'Active'
          }
        })

        await tx.car.update({
          where: { car_id: carId },
          data: { status_id: rentedStatus!.status_id }
        })

        return newRental
      })

      console.log(`[SUCCESS] Rental started. Rental ID: ${result.rent_id}`)
      return result

    } catch (error) {
      console.error("[CRITICAL ERROR] Rental transaction failed:", error)
      return null
    }
  }

  async returnCar(rentId: number): Promise<Rental | null> {
    console.log(`[INFO] Processing return for Rental ID: ${rentId}...`)

    try {
      
      const rental = await prisma.rental.findUnique({
        where: { rent_id: rentId },
        include: { car: true } 
      })

      if (!rental || rental.status !== 'Active') {
        console.error(`[ERROR] Active rental ${rentId} not found.`)
        return null
      }

      const endTime = new Date()
      const startTime = new Date(rental.start_time)
      
    
      const diffMs = endTime.getTime() - startTime.getTime()
      const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)))
     
      const pricePerHour = Number(rental.car.price_per_hour)
      const totalCost = new Prisma.Decimal(diffHours * pricePerHour)

      console.log(`[CALC] Duration: ${diffHours}h | Rate: $${pricePerHour}/h | Total: $${totalCost}`)

      const availableStatus = await prisma.carStatus.findUnique({ where: { status_name: 'Available' } })

      const result = await prisma.$transaction(async (tx) => {
        
        const updatedRental = await tx.rental.update({
          where: { rent_id: rentId },
          data: {
            end_time: endTime,
            total_cost: totalCost,
            status: 'Finished'
          }
        })

        await tx.car.update({
          where: { car_id: rental.car_id },
          data: { status_id: availableStatus!.status_id }
        })

        return updatedRental
      })

      console.log(`[SUCCESS] Car returned. Total cost saved.`)
      return result

    } catch (error) {
      console.error("[CRITICAL ERROR] Return transaction failed:", error)
      return null
    }
  }

  async getActiveRentals() {
    const rentals = await prisma.rental.findMany({
      where: { status: 'Active' },
      include: {
        user: true,
        car: { include: { model: true, location: true } }
      }
    })

    console.log(`[INFO] Active rentals: ${rentals.length}`)
    rentals.forEach(r => {
      console.log(` - RentID: ${r.rent_id} | User: ${r.user.name} | Car: ${r.car.model.brand} ${r.car.model.model_name} | Started: ${r.start_time.toLocaleString()}`)
    })
  }
}