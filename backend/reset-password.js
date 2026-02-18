const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔄 Creating admin user...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // First, get or create barangay
    let barangay = await prisma.barangay.findFirst({
      where: { name: 'Barangay Maharlika' }
    });

    if (!barangay) {
      barangay = await prisma.barangay.create({
        data: {
          name: 'Barangay Maharlika',
          location: '123 Main Street, City',
          contact: '123-456-7890',
        },
      });
      console.log('✅ Barangay created');
    }

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@smartendance.com' }
    });

    if (existingAdmin) {
      // Update password
      await prisma.user.update({
        where: { email: 'admin@smartendance.com' },
        data: { password: hashedPassword },
      });
      console.log('✅ Admin password updated');
    } else {
      // Create new admin
      await prisma.user.create({
        data: {
          email: 'admin@smartendance.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          contactNumber: '09123456789',
          role: 'ADMIN',
          barangayId: barangay.id,
        },
      });
      console.log('✅ Admin user created');
    }

    console.log('📧 Email: admin@smartendance.com');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
