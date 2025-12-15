import { StatsService } from '../services/StatsService'
import { ask } from '../utils/input'

const statsService = new StatsService()

export class StatsController {

  async handleMenu() {
    while (true) {
      console.log("\nANALYTICS & REPORTS")
      console.log("1. General Dashboard (Totals)")
      console.log("2. Top Profitable Cars")
      console.log("3. Top Active Clients")
      console.log("4. Back to Main Menu")

      const answer = await ask("Select report (1-4): ")

      switch (answer.trim()) {
        case '1':
          await statsService.getGeneralStats()
          break
        case '2':
          await statsService.getTopGrossingCars()
          break
        case '3':
          await statsService.getTopActiveUsers()
          break
        case '4':
          return
        default:
          console.log("Unknown command.")
      }
    }
  }
}