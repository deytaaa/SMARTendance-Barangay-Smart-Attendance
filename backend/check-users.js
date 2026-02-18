const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    console.log('Total users in database:', users.length);
    console.log('\nUser list:');
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Name: ${u.firstName} ${u.lastName}, Email: ${u.email}, Role: ${u.role}, Active: ${u.isActive}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
