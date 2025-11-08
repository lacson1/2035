#!/usr/bin/env node

/**
 * Create test data for API testing
 * - Creates test invoice with ID inv-001
 */

const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🔧 Creating test data...\n');

  try {
    // 1. Get or create a patient
    let patient = await prisma.patient.findFirst({
      where: { id: 'pt-001' }
    });

    if (!patient) {
      console.log('Creating test patient pt-001...');
      patient = await prisma.patient.create({
        data: {
          id: 'pt-001',
          name: 'Test Patient',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'Male',
          email: 'test@example.com',
          phone: '555-0100'
        }
      });
      console.log('✅ Patient created\n');
    } else {
      console.log('✅ Patient pt-001 already exists\n');
    }

    // 2. Get or create a user (for invoice creator)
    let user = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      console.log('❌ No users found. Please run seed script first.');
      return;
    }

    // 3. Create test invoice inv-001
    let invoice = await prisma.invoice.findUnique({
      where: { id: 'inv-001' }
    });

    if (!invoice) {
      console.log('Creating test invoice inv-001...');
      invoice = await prisma.invoice.create({
        data: {
          id: 'inv-001',
          patientId: patient.id,
          invoiceNumber: 'INV-001',
          status: 'draft',
          currency: 'USD',
          subtotal: new Decimal('100.00'),
          taxAmount: new Decimal('10.00'),
          discountAmount: new Decimal('0.00'),
          totalAmount: new Decimal('110.00'),
          paidAmount: new Decimal('0.00'),
          balanceAmount: new Decimal('110.00'),
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdById: user.id,
          items: {
            create: {
              description: 'Test Service',
              quantity: new Decimal('1'),
              unitPrice: new Decimal('100.00'),
              taxRate: new Decimal('10.00'),
              discount: new Decimal('0.00'),
              totalAmount: new Decimal('110.00'),
              category: 'consultation'
            }
          }
        }
      });
      console.log('✅ Invoice inv-001 created\n');
    } else {
      console.log('✅ Invoice inv-001 already exists\n');
    }


    console.log('✅ All test data created successfully!');
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    if (error.code === 'P2002') {
      console.log('   (Some data may already exist, which is fine)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();

