import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Default permissions
const DEFAULT_PERMISSIONS = [
  // Patients
  { code: 'patients:read', name: 'Read Patients', category: 'patients', description: 'View patient information' },
  { code: 'patients:write', name: 'Write Patients', category: 'patients', description: 'Create and edit patient records' },
  { code: 'patients:delete', name: 'Delete Patients', category: 'patients', description: 'Delete patient records' },

  // Medications
  { code: 'medications:read', name: 'Read Medications', category: 'medications', description: 'View medication information' },
  { code: 'medications:write', name: 'Write Medications', category: 'medications', description: 'Prescribe and manage medications' },

  // Appointments
  { code: 'appointments:read', name: 'Read Appointments', category: 'appointments', description: 'View appointment schedules' },
  { code: 'appointments:write', name: 'Write Appointments', category: 'appointments', description: 'Schedule and manage appointments' },

  // Clinical Notes
  { code: 'clinical_notes:read', name: 'Read Clinical Notes', category: 'clinical_notes', description: 'View clinical notes' },
  { code: 'clinical_notes:write', name: 'Write Clinical Notes', category: 'clinical_notes', description: 'Create and edit clinical notes' },

  // Imaging
  { code: 'imaging:read', name: 'Read Imaging', category: 'imaging', description: 'View imaging studies' },
  { code: 'imaging:write', name: 'Write Imaging', category: 'imaging', description: 'Order and manage imaging studies' },

  // Users
  { code: 'users:read', name: 'Read Users', category: 'users', description: 'View user information' },
  { code: 'users:write', name: 'Write Users', category: 'users', description: 'Create and edit users' },
  { code: 'users:delete', name: 'Delete Users', category: 'users', description: 'Delete users' },

  // Settings
  { code: 'settings:read', name: 'Read Settings', category: 'settings', description: 'View system settings' },
  { code: 'settings:write', name: 'Write Settings', category: 'settings', description: 'Modify system settings' },

  // Billing
  { code: 'billing:read', name: 'Read Billing', category: 'billing', description: 'View billing information' },
  { code: 'billing:write', name: 'Write Billing', category: 'billing', description: 'Create and manage invoices' },

  // Roles & Permissions
  { code: 'roles:read', name: 'Read Roles', category: 'roles', description: 'View roles and permissions' },
  { code: 'roles:write', name: 'Write Roles', category: 'roles', description: 'Manage roles and permissions' },
];

// Default roles with their permissions
const DEFAULT_ROLES = [
  {
    code: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    color: 'red',
    isSystem: true,
    permissions: [
      'patients:read', 'patients:write', 'patients:delete',
      'medications:read', 'medications:write',
      'appointments:read', 'appointments:write',
      'clinical_notes:read', 'clinical_notes:write',
      'imaging:read', 'imaging:write',
      'users:read', 'users:write', 'users:delete',
      'settings:read', 'settings:write',
      'billing:read', 'billing:write',
      'roles:read', 'roles:write',
    ],
  },
  {
    code: 'physician',
    name: 'Physician',
    description: 'Full clinical access',
    color: 'blue',
    isSystem: true,
    permissions: [
      'patients:read', 'patients:write',
      'medications:read', 'medications:write',
      'appointments:read', 'appointments:write',
      'clinical_notes:read', 'clinical_notes:write',
      'imaging:read', 'imaging:write',
    ],
  },
  {
    code: 'nurse',
    name: 'Nurse',
    description: 'Clinical support staff',
    color: 'green',
    isSystem: true,
    permissions: [
      'patients:read',
      'medications:read',
      'appointments:read', 'appointments:write',
      'clinical_notes:read', 'clinical_notes:write',
    ],
  },
  {
    code: 'nurse_practitioner',
    name: 'Nurse Practitioner',
    description: 'Advanced practice nurse',
    color: 'purple',
    isSystem: true,
    permissions: [
      'patients:read', 'patients:write',
      'medications:read', 'medications:write',
      'appointments:read', 'appointments:write',
      'clinical_notes:read', 'clinical_notes:write',
    ],
  },
  {
    code: 'physician_assistant',
    name: 'Physician Assistant',
    description: 'Licensed medical provider',
    color: 'indigo',
    isSystem: true,
    permissions: [
      'patients:read', 'patients:write',
      'medications:read', 'medications:write',
      'appointments:read', 'appointments:write',
      'clinical_notes:read', 'clinical_notes:write',
    ],
  },
  {
    code: 'medical_assistant',
    name: 'Medical Assistant',
    description: 'Clinical support',
    color: 'teal',
    isSystem: true,
    permissions: [
      'patients:read',
      'appointments:read', 'appointments:write',
    ],
  },
  {
    code: 'receptionist',
    name: 'Receptionist',
    description: 'Front desk staff',
    color: 'yellow',
    isSystem: true,
    permissions: [
      'patients:read',
      'appointments:read', 'appointments:write',
    ],
  },
  {
    code: 'billing',
    name: 'Billing Specialist',
    description: 'Billing and payment management',
    color: 'orange',
    isSystem: true,
    permissions: [
      'patients:read',
      'billing:read', 'billing:write',
    ],
  },
  {
    code: 'pharmacist',
    name: 'Pharmacist',
    description: 'Medication management',
    color: 'cyan',
    isSystem: true,
    permissions: [
      'patients:read',
      'medications:read', 'medications:write',
    ],
  },
  {
    code: 'lab_technician',
    name: 'Lab Technician',
    description: 'Laboratory staff',
    color: 'violet',
    isSystem: true,
    permissions: [
      'patients:read',
    ],
  },
  {
    code: 'radiologist',
    name: 'Radiologist',
    description: 'Medical imaging specialist',
    color: 'pink',
    isSystem: true,
    permissions: [
      'patients:read',
      'imaging:read', 'imaging:write',
    ],
  },
  {
    code: 'therapist',
    name: 'Therapist',
    description: 'Therapy and counseling',
    color: 'emerald',
    isSystem: true,
    permissions: [
      'patients:read',
      'clinical_notes:read', 'clinical_notes:write',
    ],
  },
  {
    code: 'social_worker',
    name: 'Social Worker',
    description: 'Social services and support',
    color: 'amber',
    isSystem: true,
    permissions: [
      'patients:read',
      'clinical_notes:read', 'clinical_notes:write',
    ],
  },
  {
    code: 'care_coordinator',
    name: 'Care Coordinator',
    description: 'Care coordination and management',
    color: 'sky',
    isSystem: true,
    permissions: [
      'patients:read',
      'appointments:read',
    ],
  },
  {
    code: 'read_only',
    name: 'Read Only',
    description: 'View-only access',
    color: 'gray',
    isSystem: true,
    permissions: [
      'patients:read',
      'medications:read',
      'appointments:read',
      'clinical_notes:read',
      'imaging:read',
      'billing:read',
      'users:read',
      'settings:read',
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Permissions
  console.log('📝 Seeding permissions...');
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        description: perm.description,
        category: perm.category,
      },
      create: perm,
    });
  }
  console.log(`✅ Created/updated ${DEFAULT_PERMISSIONS.length} permissions`);

  // Seed Roles
  console.log('👥 Seeding roles...');
  for (const roleData of DEFAULT_ROLES) {
    const { permissions, ...roleInfo } = roleData;

    const role = await prisma.role.upsert({
      where: { code: roleData.code },
      update: {
        name: roleInfo.name,
        description: roleInfo.description,
        color: roleInfo.color,
        isSystem: roleInfo.isSystem,
      },
      create: {
        ...roleInfo,
        rolePermissions: {
          create: permissions.map((permCode) => ({
            permission: {
              connect: { code: permCode },
            },
          })),
        },
      },
    });

    // If role exists, update permissions
    if (role) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      // Create new permissions
      const permissionIds = await Promise.all(
        permissions.map(async (permCode) => {
          const perm = await prisma.permission.findUnique({
            where: { code: permCode },
          });
          return perm!.id;
        })
      );

      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
      });
    }
  }
  console.log(`✅ Created/updated ${DEFAULT_ROLES.length} roles`);

  // Seed Hubs (always seed, doesn't require users)
  console.log('🏥 Seeding hubs...');
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
  }
  console.log(`✅ Created/updated ${defaultHubs.length} hubs`);

  // Note: Users should be created through the registration API endpoint
  // This seed script only creates sample data (patients, medications, etc.)
  // No test users are created - users must register through the sign-up form

  console.log('ℹ️  Skipping user creation - users must register through the sign-up form');

  // Check if any users exist - if not, skip sample data creation
  // (Sample data requires users to be created by registered users)
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    console.log('ℹ️  No users found. Sample data will be created once users register.');
    console.log('🎉 Seeding completed (hubs created, waiting for users to register)');
    return;
  }

  // Get the first user (or admin) to use as creator for sample data
  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!firstUser) {
    console.log('ℹ️  No users found. Sample data will be created once users register.');
    return;
  }

  // Create sample patient (optional - only if users exist)
  const patient = await prisma.patient.upsert({
    where: { id: 'pt-001' },
    update: {},
    create: {
      id: 'pt-001',
      name: 'Ava Mensah',
      dateOfBirth: new Date('1972-06-15'),
      gender: 'F',
      bloodPressure: '138/86',
      condition: 'T2D',
      riskScore: 62,
      address: '123 Oak Street, Springfield, IL 62701',
      email: 'ava.mensah@email.com',
      phone: '(217) 555-0123',
      allergies: ['Penicillin', 'Sulfa drugs'],
      emergencyContact: {
        name: 'James Mensah',
        relationship: 'Spouse',
        phone: '(217) 555-0124',
      },
      insurance: {
        provider: 'BlueCross BlueShield',
        policyNumber: 'BCBS-789456123',
        groupNumber: 'GRP-12345',
      },
      familyHistory: [
        'Type 2 Diabetes (mother, maternal grandmother)',
        'Hypertension (father)',
        'Coronary artery disease (paternal grandfather)',
      ],
      createdById: firstUser.id,
    },
  });

  console.log('✅ Created sample patient:', patient);

  // Create sample medication
  const medication = await prisma.medication.create({
    data: {
      patientId: patient.id,
      name: 'Metformin 1000mg BID',
      status: 'Active',
      startedDate: new Date('2025-09-13'),
      instructions: 'Take with meals',
      prescribedById: firstUser.id,
    },
  });

  console.log('✅ Created sample medication:', medication);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

