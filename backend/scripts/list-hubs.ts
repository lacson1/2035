/**
 * List Hubs Script
 * Lists all hubs in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const hubs = await prisma.hub.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`\n📋 Current hubs in database (${hubs.length} total):\n`);
    hubs.forEach((hub) => {
      const status = hub.isActive ? '✅' : '❌';
      console.log(`  ${status} ${hub.name} (${hub.id})`);
    });
    console.log('');

    // Check for General Surgery
    const generalSurgery = hubs.find((h) => h.id === 'general_surgery');
    if (generalSurgery) {
      console.log('✅ General Surgery hub is present');
    } else {
      console.log('❌ General Surgery hub is missing');
    }

    // Check for test hub
    const testHub = hubs.find((h) => h.id === 'hub-001');
    if (testHub) {
      console.log('⚠️  Test hub (hub-001) still exists');
    } else {
      console.log('✅ Test hub (hub-001) has been removed');
    }
  } catch (error: any) {
    console.error('❌ Error listing hubs:', error.message);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

