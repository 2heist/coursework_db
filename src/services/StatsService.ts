import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient()

export class StatsService {

  async getTopGrossingCars() {
    console.log(`[INFO] Generating revenue report...`)

    const groupedRentals = await prisma.rental.groupBy({
      by: ['car_id'],
      _sum: {
        total_cost: true
      },
      orderBy: {
        _sum: {
          total_cost: 'desc' 
        }
      },
      take: 5, 
      where: {
        status: 'Finished'
      }
    })

    if (groupedRentals.length === 0) {
      console.log("[INFO] No data available for report.")
      return
    }

    console.log("\nTOP 5 PROFITABLE CARS")
    
    for (const item of groupedRentals) {
      const car = await prisma.car.findUnique({
        where: { car_id: item.car_id },
        include: { model: true }
      })

      if (car) {
        const totalEarned = item._sum.total_cost || 0
        const carName = `${car.model.brand} ${car.model.model_name}`
        console.log(` - ${carName} (${car.license_plate}) | Revenue: $${totalEarned}`)
      }
    }
  }

  async getTopActiveUsers() {
    console.log(`[INFO] Analyzing user activity...`)

    const topUsers = await prisma.rental.groupBy({
      by: ['user_id'],
      _count: {
        rent_id: true
      },
      orderBy: {
        _count: {
          rent_id: 'desc'
        }
      },
      take: 3
    })

    if (topUsers.length === 0) {
      console.log("[INFO] No data available.")
      return
    }

    console.log("\nTOP 3 ACTIVE CLIENTS")

    for (const item of topUsers) {
      const user = await prisma.user.findUnique({
        where: { user_id: item.user_id }
      })

      if (user) {
        const count = item._count.rent_id
        console.log(` - ${user.name} (${user.email}) | Rentals: ${count}`)
      }
    }
  }

  async getGeneralStats() {
    const totalUsers = await prisma.user.count()
    const totalCars = await prisma.car.count({ where: { deleted_at: null } })
    const totalRentals = await prisma.rental.count()
    
    const income = await prisma.rental.aggregate({
      _sum: { total_cost: true }
    })

    console.log("\nGENERAL DASHBOARD")
    console.log(` Total Users:   ${totalUsers}`)
    console.log(` Active Cars:   ${totalCars}`)
    console.log(` Total Rentals: ${totalRentals}`)
    console.log(` TOTAL REVENUE: $${income._sum.total_cost || 0}`)
  }
}