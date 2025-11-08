/**
 * Seed Hubs Script
 * Creates default hubs in the database
 * Run this after migrations: npx ts-node scripts/seed-hubs.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultHubs = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular care, including heart disease management, cardiac procedures, and cardiovascular monitoring.',
    color: 'red',
    specialties: ['cardiology', 'cardiac', 'cardiac_surgery'],
  },
  {
    id: 'oncology',
    name: 'Oncology',
    description: 'Cancer care and treatment, including chemotherapy, radiation therapy, and cancer screening programs.',
    color: 'purple',
    specialties: ['oncology', 'cancer'],
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Medical care for infants, children, and adolescents, including well-child visits and pediatric specialty care.',
    color: 'blue',
    specialties: ['pediatrics', 'pediatric'],
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Musculoskeletal care, including joint replacement, sports medicine, and fracture management.',
    color: 'green',
    specialties: ['orthopedics', 'orthopedic'],
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Brain and nervous system care, including stroke management, epilepsy treatment, and neurological disorders.',
    color: 'indigo',
    specialties: ['neurology', 'neurological'],
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    description: 'Mental health care, including therapy, medication management, and psychiatric evaluation.',
    color: 'pink',
    specialties: ['psychiatry', 'psychiatric'],
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    description: 'Skin care and treatment, including dermatological conditions, skin cancer screening, and cosmetic procedures.',
    color: 'orange',
    specialties: ['dermatology', 'dermatological'],
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    description: 'Hormone and metabolic care, including diabetes management, thyroid disorders, and hormone therapy.',
    color: 'cyan',
    specialties: ['endocrinology', 'endocrinology_diabetes'],
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology',
    description: 'Digestive system care, including gastrointestinal disorders, endoscopy, and liver disease management.',
    color: 'yellow',
    specialties: ['gastroenterology', 'gi', 'gastro'],
  },
  {
    id: 'emergency',
    name: 'Emergency Medicine',
    description: 'Acute care and emergency response, including trauma care, urgent medical conditions, and emergency procedures.',
    color: 'red',
    specialties: ['emergency', 'emergency_medicine'],
  },
  {
    id: 'general_surgery',
    name: 'General Surgery',
    description: 'Surgical care and procedures, including general surgery, minimally invasive surgery, and surgical consultations.',
    color: 'teal',
    specialties: ['general_surgery', 'surgery', 'surgical'],
  },
];

async function main() {
  console.log('🏥 Seeding hubs...');

  try {
    for (const hubData of defaultHubs) {
      await prisma.hub.upsert({
        where: { id: hubData.id },
        update: {
          name: hubData.name,
          description: hubData.description,
          color: hubData.color,
          specialties: hubData.specialties,
          isActive: true,
        },
        create: {
          id: hubData.id,
          name: hubData.name,
          description: hubData.description,
          color: hubData.color,
          specialties: hubData.specialties,
          isActive: true,
        },
      });
      console.log(`✅ Created/updated hub: ${hubData.name}`);
    }
    console.log(`\n🎉 Successfully created/updated ${defaultHubs.length} hubs!`);
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.error('\n❌ Error: Database tables do not exist.');
      console.error('Please run migrations first:');
      console.error('  cd backend');
      console.error('  npx prisma migrate dev');
      console.error('\nThen run this script again.');
    } else {
      console.error('❌ Error seeding hubs:', error);
    }
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

