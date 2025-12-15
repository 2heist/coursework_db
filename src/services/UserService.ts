import { PrismaClient, User } from '../generated/prisma/client'

const prisma = new PrismaClient()

interface CreateUserDTO {
  name: string
  email: string
  phone: string
  license: string
}

export class UserService {
  
  async createUser(data: CreateUserDTO): Promise<User | null> {
    console.log(`[INFO] Creating user: ${data.name}...`)

    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingEmail) {
      console.error(`[ERROR] User with email ${data.email} already exists.`)
      return null
    }

    const existingLicense = await prisma.user.findUnique({
      where: { driver_license_number: data.license }
    })

    if (existingLicense) {
      console.error(`[ERROR] License ${data.license} already registered.`)
      return null
    }

    try {
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone_number: data.phone,
          driver_license_number: data.license
        }
      })
      console.log(`[SUCCESS] User created. ID: ${newUser.user_id}`)
      return newUser

    } catch (error) {
      console.error("[CRITICAL ERROR] Database issue:", error)
      return null
    }
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      orderBy: { user_id: 'asc' }
    })
    console.log(`[INFO] Total users found: ${users.length}`)
    
    users.forEach(u => {
      console.log(` - ID: ${u.user_id} | Name: ${u.name} | Phone: ${u.phone_number} | Email: ${u.email} | License: ${u.driver_license_number}`)
    })
  }
}