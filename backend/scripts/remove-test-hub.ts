/**
 * Remove Test Hub Script
 * Removes the test hub (hub-001) if it exists in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for test hub (hub-001)...');

  try {
    const testHub = await prisma.hub.findUnique({
      where: { id: 'hub-001' },
    });

    if (testHub) {
      console.log(`❌ Found test hub: ${testHub.name}`);
      console.log('🗑️  Deleting test hub...');
      
      await prisma.hub.delete({
        where: { id: 'hub-001' },
      });
      
      console.log('✅ Test hub deleted successfully!');
    } else {
      console.log('✅ Test hub does not exist - nothing to remove');
    }
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log('✅ Test hub does not exist - nothing to remove');
    } else {
      console.error('❌ Error removing test hub:', error.message);
      process.exit(1);
    }
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

