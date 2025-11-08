import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPatients() {
  try {
    const patientCount = await prisma.patient.count();
    console.log(`\n📊 Database Status:`);
    console.log(`   Total Patients: ${patientCount}`);
    
    if (patientCount > 0) {
      const patients = await prisma.patient.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
      console.log(`\n   Sample Patients:`);
      patients.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (${p.email || 'no email'}) - Created: ${p.createdAt.toLocaleDateString()}`);
      });
    } else {
      console.log(`\n   ⚠️  No patients found in database.`);
      console.log(`   💡 Patients need to be created through the UI or seed script.`);
    }

    // Check users
    const userCount = await prisma.user.count();
    console.log(`\n   Total Users: ${userCount}`);
    
    // Check API connectivity
    console.log(`\n🌐 API Status:`);
    console.log(`   Backend URL: http://localhost:3000/api`);
    console.log(`   Patients Endpoint: http://localhost:3000/api/v1/patients`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatients();

