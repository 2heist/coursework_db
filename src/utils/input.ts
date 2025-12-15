import * as readline from 'readline'

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export const ask = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve))
}