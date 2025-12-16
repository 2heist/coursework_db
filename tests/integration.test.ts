import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '../src/generated/prisma/client'
import { UserService } from '../src/services/UserService'
import { CarService } from '../src/services/CarService'
import { RentalService } from '../src/services/RentalService'
import { StatsService } from '../src/services/StatsService'

const prisma = new PrismaClient()
const userService = new UserService()
const carService = new CarService()
const rentalService = new RentalService()
const statsService = new StatsService()

// Helper to wipe the DB. 
// Deleting in reverse order to handle foreign key constraints.
async function clearDatabase() {
  // 1. Delete dependent data first (Child tables)
  await prisma.payment.deleteMany()
  await prisma.rental.deleteMany()

  // Fix for Foreign Key Constraints: Review & MaintenanceLog -> Car
  // We wrap them in try-catch to safely handle unused/ghost tables
  try {
    // @ts-ignore
    await prisma.review.deleteMany()
  } catch (e) { /* ignore */ }

  try {
    // @ts-ignore
    await prisma.maintenanceLog.deleteMany()
  } catch (e) { /* ignore */ }

  // 2. Delete main entities (Parent tables)
  await prisma.car.deleteMany()
  await prisma.carModel.deleteMany()
  await prisma.carLocation.deleteMany()
  await prisma.carStatus.deleteMany()
  await prisma.user.deleteMany()
}

describe('CarSharing Full Integration Suite', () => {

  // Connect and clean up before starting
  beforeAll(async () => {
    await prisma.$connect()
    await clearDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  // Shared state between tests
  let userId: number
  let carId: number
  let rentId: number

  // --- 1. Basic Setup ---
  test('1. Should create a new User and Car', async () => {
    // Create a user
    const user = await userService.createUser({
      name: 'Integration Tester',
      email: 'tester@example.com',
      phone: '000-000-000',
      license: 'TEST-LIC-101'
    })
    expect(user).toBeDefined()
    userId = user!.user_id

    // Create a car
    const car = await carService.createCar({
      brand: 'Toyota',
      modelName: 'Camry',
      year: 2022,
      pricePerHour: 100.0,
      licensePlate: 'INTEGRATION',
      city: 'Kyiv',
      address: 'Test Hub'
    })
    expect(car).toBeDefined()
    expect(car?.status_id).toBeDefined()
    carId = car!.car_id
  })

  // --- 2. Search Logic ---
  test('2. Smart Search and Pagination', async () => {
    // Try searching by partial brand name
    const result = await carService.searchCars('Toyo', 1, 10)
    
    expect(result.totalCount).toBeGreaterThanOrEqual(1)
    expect(result.cars[0].license_plate).toBe('INTEGRATION')
    expect(result.totalPages).toBeGreaterThanOrEqual(1)
  })

  // --- 3. Transactions ---
  test('3. Rent a car (Transaction check)', async () => {
    const rental = await rentalService.rentCar(userId, carId)
    
    expect(rental).toBeDefined()
    expect(rental?.status).toBe('Active')
    rentId = rental!.rent_id

    // Verify DB update: car status must be 'Rented' now
    const carInDb = await prisma.car.findUnique({ 
      where: { car_id: carId }, 
      include: { status: true } 
    })
    expect(carInDb?.status.status_name).toBe('Rented')
  })

  // --- 4. Validation/Errors ---
  test('4. Should block renting an already rented car', async () => {
    const failRental = await rentalService.rentCar(userId, carId)
    // Expecting null because it's occupied
    expect(failRental).toBeNull()
  })

  // --- 5. Complex Flow (Return + Pay) ---
  test('5. Return car and process payment', async () => {
    // Tiny delay to simulate rental duration
    await new Promise(r => setTimeout(r, 50))

    const result = await rentalService.returnCar(rentId, 'Cash')
    
    expect(result?.status).toBe('Finished')
    expect(Number(result?.total_cost)).toBeGreaterThan(0)

    // Check if payment record was created
    const payment = await prisma.payment.findFirst({ where: { rent_id: rentId } })
    expect(payment).toBeDefined()
    expect(payment?.amount).toEqual(result?.total_cost)
  })

  // --- 6. Stats/Analytics ---
  test('6. Analytics queries should run without errors', async () => {
    // Just ensuring these heavy queries don't crash
    await expect(statsService.getTopGrossingCars()).resolves.not.toThrow()
    await expect(statsService.getTopActiveUsers()).resolves.not.toThrow()
  })

  // --- 7. Soft Delete ---
  test('7. Soft Delete logic', async () => {
    // Mark as deleted
    const deleteResult = await carService.deleteCar(carId)
    expect(deleteResult).toBe(true)

    // It should still exist in DB 
    const rawCar = await prisma.car.findUnique({ where: { car_id: carId } })
    expect(rawCar?.deleted_at).not.toBeNull()

    // But search shouldn't find it anymore
    const searchResult = await carService.searchCars('INTEGRATION')
    expect(searchResult.totalCount).toBe(0)
  })
})