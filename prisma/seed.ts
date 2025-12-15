import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding database...')

  await prisma.payment.deleteMany()
  await prisma.review.deleteMany()
  await prisma.maintenanceLog.deleteMany()
  await prisma.rental.deleteMany()
  await prisma.car.deleteMany()
  await prisma.carModel.deleteMany()
  await prisma.carStatus.deleteMany()
  await prisma.carLocation.deleteMany()
  await prisma.user.deleteMany()

  console.log('Old data cleared (if any).')



  const statusAvailable = await prisma.carStatus.create({ data: { status_name: 'Available' } })
  const statusRented = await prisma.carStatus.create({ data: { status_name: 'Rented' } })
  const statusMaintenance = await prisma.carStatus.create({ data: { status_name: 'Maintenance' } })

  const locKyivCenter = await prisma.carLocation.create({ data: { city: 'Київ', address: 'Майдан Незалежності, 2' } })
  const locKyivStation = await prisma.carLocation.create({ data: { city: 'Київ', address: 'пл. Вокзальна, 1' } })
  const locKyivPodil = await prisma.carLocation.create({ data: { city: 'Київ', address: 'вул. Сагайдачного, 10' } })
  const locLvivRynok = await prisma.carLocation.create({ data: { city: 'Львів', address: 'пл. Ринок, 1' } })
  const locLvivStation = await prisma.carLocation.create({ data: { city: 'Львів', address: 'пл. Двірцева, 1' } })

  const modelToyota = await prisma.carModel.create({ data: { brand: 'Toyota', model_name: 'Camry' } })
  const modelBMW = await prisma.carModel.create({ data: { brand: 'BMW', model_name: 'X5' } })
  const modelRenault = await prisma.carModel.create({ data: { brand: 'Renault', model_name: 'Logan' } })
  const modelHyundai = await prisma.carModel.create({ data: { brand: 'Hyundai', model_name: 'Sonata' } })
  const modelTesla = await prisma.carModel.create({ data: { brand: 'Tesla', model_name: 'Model 3' } })

  const usersData = [
    { name: 'Олександр Коваленко', email: 'o.kovalenko@example.com', phone: '+380501112233', lic: 'BXT100001' },
    { name: 'Ірина Шевченко', email: 'i.shevchenko@example.com', phone: '+380672223344', lic: 'BXT100002' },
    { name: 'Андрій Мельник', email: 'a.melnyk@example.com', phone: '+380633334455', lic: 'BXT100003' },
    { name: 'Катерина Бойко', email: 'k.boyko@example.com', phone: '+380994445566', lic: 'BXT100004' },
    { name: 'Дмитро Бондар', email: 'd.bondar@example.com', phone: '+380935556677', lic: 'BXT100005' },
    { name: 'Олена Ткаченко', email: 'o.tkachenko@example.com', phone: '+380976667788', lic: 'BXT100006' },
    { name: 'Сергій Кравчук', email: 's.kravchuk@example.com', phone: '+380507778899', lic: 'BXT100007' },
  ]

  const users = []
  for (const u of usersData) {
    const createdUser = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        phone_number: u.phone,
        driver_license_number: u.lic
      }
    })
    users.push(createdUser)
  }

  const carsConfig = [
    { plate: 'AA1111KA', year: 2022, price: 15.00, model: modelRenault, loc: locKyivCenter, status: statusAvailable },
    { plate: 'AA2222KA', year: 2023, price: 25.00, model: modelToyota, loc: locKyivStation, status: statusRented },
    { plate: 'AA3333KA', year: 2021, price: 40.00, model: modelBMW, loc: locKyivPodil, status: statusAvailable },
    { plate: 'AA4444KA', year: 2023, price: 12.00, model: modelRenault, loc: locKyivCenter, status: statusMaintenance },
    { plate: 'AA5555KA', year: 2024, price: 50.00, model: modelTesla, loc: locKyivPodil, status: statusAvailable },
    { plate: 'BC1111HA', year: 2020, price: 14.00, model: modelRenault, loc: locLvivRynok, status: statusAvailable },
    { plate: 'BC2222HA', year: 2022, price: 20.00, model: modelHyundai, loc: locLvivStation, status: statusRented },
    { plate: 'BC3333HA', year: 2023, price: 22.00, model: modelHyundai, loc: locLvivRynok, status: statusAvailable },
    { plate: 'BC4444HA', year: 2019, price: 35.00, model: modelBMW, loc: locLvivStation, status: statusAvailable },
    { plate: 'BC5555HA', year: 2024, price: 26.00, model: modelToyota, loc: locLvivRynok, status: statusAvailable },
  ]

  const cars = []
  for (const c of carsConfig) {
    const createdCar = await prisma.car.create({
      data: {
        license_plate: c.plate,
        year: c.year,
        price_per_hour: c.price,
        model_id: c.model.model_id,
        location_id: c.loc.location_id,
        status_id: c.status.status_id
      }
    })
    cars.push(createdCar)
  }

  await prisma.maintenanceLog.create({
    data: {
      description: 'Заміна мастила та діагностика гальм',
      cost: 1500.00,
      car_id: cars[3].car_id
    }
  })

 
  const rentCompleted1 = await prisma.rental.create({
    data: {
      start_time: new Date('2023-11-01T10:00:00Z'),
      end_time: new Date('2023-11-01T15:00:00Z'),
      total_cost: 75.00,
      status: 'Completed',
      user_id: users[0].user_id,
      car_id: cars[0].car_id
    }
  })
  
  await prisma.payment.create({
    data: {
      amount: 75.00,
      payment_method: 'Credit Card',
      status: 'Success',
      rent_id: rentCompleted1.rent_id
    }
  })

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Чисте авто, економне, рекомендую.',
      user_id: users[0].user_id,
      car_id: cars[0].car_id
    }
  })

  const rentCompleted2 = await prisma.rental.create({
    data: {
      start_time: new Date('2023-11-05T12:00:00Z'),
      end_time: new Date('2023-11-05T14:00:00Z'),
      total_cost: 100.00,
      status: 'Completed',
      user_id: users[1].user_id,
      car_id: cars[4].car_id
    }
  })

  await prisma.payment.create({
    data: {
      amount: 100.00,
      payment_method: 'Apple Pay',
      status: 'Success',
      rent_id: rentCompleted2.rent_id
    }
  })

  await prisma.rental.create({
    data: {
      start_time: new Date(),
      status: 'Active',
      user_id: users[2].user_id, 
      car_id: cars[1].car_id 
    }
  })

  await prisma.rental.create({
    data: {
      start_time: new Date(),
      status: 'Active',
      user_id: users[3].user_id, 
      car_id: cars[6].car_id 
    }
  })

  await prisma.rental.create({
    data: {
      start_time: new Date('2023-11-10T09:00:00Z'),
      end_time: new Date('2023-11-10T09:15:00Z'),
      status: 'Canceled',
      user_id: users[4].user_id, 
      car_id: cars[2].car_id 
    }
  })

  console.log('Database seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })