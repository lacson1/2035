/**
 * Auto-seed hubs utility
 * Automatically creates default hubs if they don't exist
 */

import prisma from '../config/database';
import { logger } from './logger';

const DEFAULT_HUBS = [
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

/**
 * Seed hubs if they don't exist
 * This runs automatically on backend startup
 */
export async function seedHubsIfNeeded(): Promise<void> {
    try {
        // Check if any hubs exist
        const hubCount = await prisma.hub.count();

        if (hubCount > 0) {
            logger.debug(`Hubs already exist (${hubCount}), skipping auto-seed`);
            return;
        }

        logger.info('🏥 No hubs found, auto-seeding default hubs...');

        // Create all default hubs
        for (const hubData of DEFAULT_HUBS) {
            try {
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
            } catch (error) {
                // If table doesn't exist yet, that's okay - migrations will create it
                if (error instanceof Error && error.message.includes('does not exist')) {
                    logger.debug('Hub table does not exist yet, will be created by migrations');
                    return;
                }
                throw error;
            }
        }

        logger.info(`✅ Auto-seeded ${DEFAULT_HUBS.length} hubs`);
    } catch (error: any) {
        // Don't throw - this is a non-critical operation
        // If database isn't ready or tables don't exist, that's fine
        if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
            logger.debug('Hub table does not exist yet, skipping auto-seed (will be created by migrations)');
            return;
        }
        logger.warn('Failed to auto-seed hubs (non-critical):', error.message);
    }
}

