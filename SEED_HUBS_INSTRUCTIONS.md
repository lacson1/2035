# How to Seed Hubs in Database

## Problem
You're seeing "No hubs found" because the database doesn't have any hubs yet.

## Solution

### Option 1: Run the Hub Seed Script (Recommended)

```bash
cd backend
npm run seed:hubs
```

This will create all 10 default hubs:
- Cardiology
- Oncology
- Pediatrics
- Orthopedics
- Neurology
- Psychiatry
- Dermatology
- Endocrinology
- Gastroenterology
- Emergency Medicine

### Option 2: Run Full Seed (if database is set up)

If your database is fully migrated and seeded:

```bash
cd backend
npm run prisma:seed
```

This will seed permissions, roles, AND hubs.

### Option 3: Create Hubs via API (if you're an admin)

If you're logged in as an admin, you can create hubs through the API:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this JavaScript to create all hubs:

```javascript
const hubs = [
  { name: 'Cardiology', description: 'Heart and cardiovascular care', color: 'red', specialties: ['cardiology'] },
  { name: 'Oncology', description: 'Cancer care and treatment', color: 'purple', specialties: ['oncology'] },
  { name: 'Pediatrics', description: 'Medical care for children', color: 'blue', specialties: ['pediatrics'] },
  { name: 'Orthopedics', description: 'Musculoskeletal care', color: 'green', specialties: ['orthopedics'] },
  { name: 'Neurology', description: 'Brain and nervous system care', color: 'indigo', specialties: ['neurology'] },
  { name: 'Psychiatry', description: 'Mental health care', color: 'pink', specialties: ['psychiatry'] },
  { name: 'Dermatology', description: 'Skin care and treatment', color: 'orange', specialties: ['dermatology'] },
  { name: 'Endocrinology', description: 'Hormone and metabolic care', color: 'cyan', specialties: ['endocrinology'] },
  { name: 'Gastroenterology', description: 'Digestive system care', color: 'yellow', specialties: ['gastroenterology'] },
  { name: 'Emergency Medicine', description: 'Acute care and emergency response', color: 'red', specialties: ['emergency'] },
];

const token = localStorage.getItem('authToken');
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

for (const hub of hubs) {
  try {
    const response = await fetch(`${baseUrl}/v1/hubs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(hub),
    });
    const data = await response.json();
    console.log(`✅ Created: ${hub.name}`, data);
  } catch (error) {
    console.error(`❌ Failed to create ${hub.name}:`, error);
  }
}
```

## Verify Hubs Were Created

After seeding, refresh the Hubs page in the app. You should see all 10 hubs displayed.

## Troubleshooting

### "Database tables do not exist"
Run migrations first:
```bash
cd backend
npx prisma migrate dev
```

### "Unauthorized" when using API
Make sure you're logged in as an admin user.

### Still seeing "No hubs found"
1. Check browser console for errors
2. Verify backend is running
3. Check that API endpoint `/api/v1/hubs` returns data
4. Try refreshing the page

