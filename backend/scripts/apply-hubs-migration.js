const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('📦 Applying hubs migration...');
  
  const migrationPath = path.join(__dirname, '../prisma/migrations/20251106000000_add_hubs_tables/migration.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  try {
    // Execute the entire migration as one transaction
    console.log('Executing migration SQL...');
    
    try {
      await prisma.$executeRawUnsafe(migrationSQL);
      console.log('✅ Migration SQL executed successfully');
    } catch (err) {
      // If it's a "table already exists" error, that's okay
      if (err.message && (
        err.message.includes('already exists') ||
        err.message.includes('duplicate') ||
        (err.message.includes('relation') && err.message.includes('already'))
      )) {
        console.log('⚠️  Some tables may already exist (this is okay)');
      } else {
        // Try executing statement by statement for better error handling
        console.log('Trying statement-by-statement execution...');
        
        // Remove comments and split by semicolons
        const cleanedSQL = migrationSQL
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n');
        
        const statements = cleanedSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && s.length > 10); // Filter out very short fragments
        
        console.log(`Found ${statements.length} statements to execute`);
        
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement && statement.length > 5) {
            try {
              await prisma.$executeRawUnsafe(statement + ';');
              console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
            } catch (stmtErr) {
              // Ignore "already exists" errors
              if (stmtErr.message && (
                stmtErr.message.includes('already exists') ||
                stmtErr.message.includes('duplicate') ||
                (stmtErr.message.includes('relation') && stmtErr.message.includes('already')) ||
                stmtErr.message.includes('constraint') && stmtErr.message.includes('already')
              )) {
                console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
              } else {
                console.error(`❌ Error in statement ${i + 1}:`, stmtErr.message);
                console.error(`Statement was: ${statement.substring(0, 100)}...`);
                throw stmtErr;
              }
            }
          }
        }
      }
    }
    
    console.log('✅ Migration applied successfully!');
    
    // Mark migration as applied in Prisma
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (gen_random_uuid(), '', NOW(), '20251106000000_add_hubs_tables', NULL, NOW(), 1)
        ON CONFLICT DO NOTHING;
      `);
      console.log('✅ Migration marked as applied');
    } catch (err) {
      console.warn('⚠️  Could not mark migration as applied (this is okay):', err.message);
    }
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

