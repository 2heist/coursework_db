import { UserService } from '../services/UserService'
import { ask } from '../utils/input'

const userService = new UserService()

export class UserController {
  
  async showAll() {
    await userService.getAllUsers()
  }

  async register() {
    console.log("\nRegister New User (Type 'cancel' to go back)")
    
    const name = await ask("Name: ")
    if (name.toLowerCase() === 'cancel') return 

    const email = await ask("Email: ")
    if (email.toLowerCase() === 'cancel') return

    const phone = await ask("Phone: ")
    if (phone.toLowerCase() === 'cancel') return

    const license = await ask("License number: ")
    if (license.toLowerCase() === 'cancel') return

    if (!name || !email || !phone || !license) {
      console.log("\n[WARNING] All fields are mandatory!")
      return
    }

    await userService.createUser({ name, email, phone, license })
  }

  async update() {
    console.log("\nUpdate User (Type 'cancel' to go back, Enter to skip field)")
    
    const idStr = await ask("Enter User ID to update: ")
    if (idStr.toLowerCase() === 'cancel') return
    
    const id = parseInt(idStr)
    if (isNaN(id)) {
      console.log("[ERROR] Invalid ID format.")
      return
    }

    const newName = await ask("New Name: ")
    if (newName.toLowerCase() === 'cancel') return

    const newEmail = await ask("New Email: ")
    if (newEmail.toLowerCase() === 'cancel') return

    const newPhone = await ask("New Phone: ")
    if (newPhone.toLowerCase() === 'cancel') return

    const newLicense = await ask("New License: ")
    if (newLicense.toLowerCase() === 'cancel') return

    await userService.updateUser(id, {
      name: newName || undefined,
      email: newEmail || undefined,
      phone: newPhone || undefined,
      license: newLicense || undefined
    })
  }

  async delete() {
    console.log("\nDelete User")
    const idStr = await ask("Enter User ID to DELETE: ")
    if (idStr.toLowerCase() === 'cancel') return

    const id = parseInt(idStr)
    if (isNaN(id)) {
      console.log("[ERROR] Invalid ID format.")
      return
    }

    const confirm = await ask(`Are you sure you want to delete user ${id}? (yes/no): `)
    if (confirm.toLowerCase() !== 'yes') {
      console.log("Operation cancelled.")
      return
    }

    await userService.deleteUser(id)
  }
}