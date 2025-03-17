const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo', 10);

  const user = await prisma.user.upsert({
    where: { username: 'dino' },
    update: {},
    create: {
      username: 'dino',
      password: hashedPassword,
      email: 'dino@example.com',
    },
  });

  console.log('Default user created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });