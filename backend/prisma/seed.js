const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Barangay
  const barangay = await prisma.barangay.create({
    data: {
      name: 'Barangay San Miguel',
      location: 'City of San Jose',
      contact: '09123456789',
      description: 'Main barangay office',
    },
  });

  console.log('✅ Created barangay:', barangay.name);

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Health Services',
        description: 'Barangay health unit',
        barangayId: barangay.id,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Administrative',
        description: 'Admin and office staff',
        barangayId: barangay.id,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Security',
        description: 'Barangay security personnel',
        barangayId: barangay.id,
      },
    }),
  ]);

  console.log('✅ Created', departments.length, 'departments');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@smartendance.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      contactNumber: '09123456789',
      address: 'Barangay Hall',
      role: 'ADMIN',
      barangayId: barangay.id,
      departmentId: departments[1].id, // Administrative
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create Staff Users
  const staff = await prisma.user.create({
    data: {
      email: 'staff@smartendance.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Santos',
      contactNumber: '09987654321',
      address: 'Zone 1, Barangay San Miguel',
      role: 'STAFF',
      barangayId: barangay.id,
      departmentId: departments[0].id, // Health Services
    },
  });

  console.log('✅ Created staff user:', staff.email);

  // Create Sample Officials
  const official = await prisma.user.create({
    data: {
      email: 'official@smartendance.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      contactNumber: '09111111111',
      address: 'Zone 2, Barangay San Miguel',
      role: 'OFFICIAL',
      barangayId: barangay.id,
      departmentId: departments[1].id, // Administrative
    },
  });

  console.log('✅ Created official user:', official.email);

  // Create Sample Volunteer
  const volunteer = await prisma.user.create({
    data: {
      email: 'volunteer@smartendance.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Garcia',
      contactNumber: '09222222222',
      address: 'Zone 3, Barangay San Miguel',
      role: 'VOLUNTEER',
      barangayId: barangay.id,
      departmentId: departments[2].id, // Security
    },
  });

  console.log('✅ Created volunteer user:', volunteer.email);

  // Create IoT Device
  const device = await prisma.device.create({
    data: {
      deviceId: 'rpi_001',
      name: 'Barangay Hall Main Entrance',
      location: 'Main entrance, ground floor',
      secretKey: 'device-secret-key-change-this',
      barangayId: barangay.id,
    },
  });

  console.log('✅ Created IoT device:', device.name);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Default Login Credentials:');
  console.log('   Admin: admin@smartendance.com / admin123');
  console.log('   Staff: staff@smartendance.com / admin123');
  console.log('   Official: official@smartendance.com / admin123');
  console.log('   Volunteer: volunteer@smartendance.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
