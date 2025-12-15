import { PrismaClient, User } from '../generated/prisma/client'

const prisma = new PrismaClient()

interface CreateUserDTO {
  name: string
  email: string
  phone: string
  license: string
}

interface UpdateUserDTO {
  name?: string
  email?: string
  phone?: string
  license?: string
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

  async updateUser(userId: number, data: UpdateUserDTO): Promise<User | null> {
    console.log(`[INFO] Updating user ID: ${userId}...`)

    try {
      const user = await prisma.user.findUnique({ where: { user_id: userId } })
      
      if (!user) {
        console.error(`[ERROR] User with ID ${userId} not found.`)
        return null
      }

      const updatedUser = await prisma.user.update({
        where: { user_id: userId },
        data: {
          name: data.name || undefined,
          email: data.email || undefined,
          phone_number: data.phone || undefined,
          driver_license_number: data.license || undefined
        }
      })

      console.log(`[SUCCESS] User ${userId} updated.`)
      return updatedUser

    } catch (error) {
      console.error("[CRITICAL ERROR] Update failed:", error)
      return null
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    console.log(`[INFO] Deleting user ID: ${userId}...`)
    try {
      const user = await prisma.user.findUnique({ where: { user_id: userId } })
      if (!user) {
        console.error(`[ERROR] User with ID ${userId} not found.`)
        return false
      }

      await prisma.user.delete({ where: { user_id: userId } })
      console.log(`[SUCCESS] User ${userId} deleted.`)
      return true

    } catch (error) {
      console.error("[CRITICAL ERROR] Delete failed:", error)
      return false
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