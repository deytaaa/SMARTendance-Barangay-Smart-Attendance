const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('\nNo need to seed. Use the existing admin account to create more admins through the web dashboard.');
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create the first admin
    const admin = await prisma.user.create({
      data: {
        employeeId: 'ADMIN001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@smartendance.com',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Administration',
        isActive: true,
      }
    });

    console.log('✅ First admin account created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:        admin@smartendance.com');
    console.log('🔑 Password:     admin123');
    console.log('🆔 Employee ID:  ADMIN001');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!\n');
    console.log('You can now:');
    console.log('1. Log in to the web dashboard');
    console.log('2. Create additional admin accounts through the Register page');
    console.log('3. Start enrolling employees\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAdmin();
