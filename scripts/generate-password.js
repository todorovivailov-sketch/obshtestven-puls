// Пусни с: node scripts/generate-password.js
// Въведи желаната парола и копирай хеша в .env

import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question('Въведи желаната admin парола: ', async (password) => {
  const hash = await bcrypt.hash(password, 12)
  console.log('\n✅ Копирай този ред в .env файла:\n')
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)
  console.log('\nАко деплойваш в Netlify, добави го като Environment Variable.')
  rl.close()
})
