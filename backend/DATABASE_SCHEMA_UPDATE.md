# Database Schema Update - Lab Results & Documents

## ✅ Completed Changes

### 1. New Enums Added

#### `LabStatus` Enum
- `ordered` - Lab test has been ordered
- `in_progress` - Test is currently being processed
- `completed` - Test results are available
- `cancelled` - Test order was cancelled
- `pending_review` - Results need physician review

#### `DocumentType` Enum
- `medical_record` - General medical records
- `lab_report` - Laboratory test reports
- `imaging_report` - Imaging study reports
- `prescription` - Prescription documents
- `insurance_form` - Insurance-related forms
- `consent_form` - Patient consent forms
- `discharge_summary` - Hospital discharge summaries
- `referral_letter` - Referral letters
- `other` - Other document types

### 2. New Models Added

#### `LabResult` Model
Manages laboratory test orders and results with the following fields:

**Core Fields:**
- `testName` - Name of the test (e.g., "Complete Blood Count")
- `testCode` - Optional test code (e.g., "CBC")
- `category` - Test category (e.g., "Blood Work", "Urine", "Microbiology")
- `orderedDate` - When the test was ordered
- `collectedDate` - When the sample was collected
- `resultDate` - When results became available
- `status` - Current status (LabStatus enum)
- `results` - JSON field for flexible test result data (values, units, etc.)
- `referenceRanges` - JSON field for normal ranges
- `interpretation` - Clinical interpretation text
- `notes` - Additional notes
- `labName` - Name of the laboratory
- `labLocation` - Location of the laboratory

**Relations:**
- `patient` - The patient this test is for
- `orderingPhysician` - User who ordered the test
- `reviewedBy` - User who reviewed the results (optional)

**Indexes:**
- Patient ID
- Test name
- Ordered date
- Status
- Ordering physician ID

#### `Document` Model
Manages document storage and metadata:

**Core Fields:**
- `documentType` - Type of document (DocumentType enum)
- `title` - Document title
- `fileName` - Original file name
- `fileUrl` - URL/path to the stored file
- `fileSize` - File size in bytes
- `mimeType` - MIME type of the file
- `description` - Document description
- `uploadedAt` - When the document was uploaded
- `tags` - Array of tags for categorization/search
- `isConfidential` - Confidentiality flag
- `metadata` - JSON field for additional metadata

**Relations:**
- `patient` - Optional patient association (for general documents)
- `uploadedBy` - User who uploaded the document

**Indexes:**
- Patient ID
- Document type
- Upload date
- Uploaded by user ID
- Tags

### 3. Updated Relations

#### User Model
Added new relations:
- `orderedLabResults` - Lab results ordered by this user
- `reviewedLabResults` - Lab results reviewed by this user
- `uploadedDocuments` - Documents uploaded by this user

#### Patient Model
Added new relations:
- `labResults` - All lab results for this patient
- `documents` - All documents associated with this patient

### 4. Prisma Client Generated
✅ Prisma Client has been generated with the new models and enums.

## 📋 Next Steps

### 1. Set Up Database (if not already done)

You need a PostgreSQL database. Choose one option:

#### Option A: Use Docker Compose
```bash
cd backend
docker-compose up -d postgres
```

This will start PostgreSQL on port 5432 with:
- Database: `physician_dashboard_2035`
- User: `postgres`
- Password: `postgres`

#### Option B: Local PostgreSQL
Create a database manually:
```bash
createdb physician_dashboard_2035
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physician_dashboard_2035"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### 3. Run Migration

Once DATABASE_URL is configured, run:

```bash
cd backend
npx prisma migrate dev --name add_lab_results_and_documents
```

This will:
- Create the migration SQL file
- Apply the migration to your database
- Create the new tables (`lab_results` and `documents`)
- Update the Prisma Client (if needed)

### 4. Verify Migration

You can verify the migration worked by:

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

Or check the database directly:
```bash
psql -d physician_dashboard_2035 -c "\dt"
```

You should see:
- `lab_results` table
- `documents` table

## 📝 Usage Examples

### Creating a Lab Result

```typescript
const labResult = await prisma.labResult.create({
  data: {
    patientId: "patient-uuid",
    testName: "Complete Blood Count",
    testCode: "CBC",
    category: "Blood Work",
    orderedDate: new Date(),
    status: "ordered",
    orderingPhysicianId: "physician-uuid",
    results: {
      hemoglobin: { value: 14.5, unit: "g/dL" },
      hematocrit: { value: 42, unit: "%" }
    },
    referenceRanges: {
      hemoglobin: { min: 12.0, max: 16.0, unit: "g/dL" },
      hematocrit: { min: 36, max: 46, unit: "%" }
    }
  }
});
```

### Creating a Document

```typescript
const document = await prisma.document.create({
  data: {
    patientId: "patient-uuid",
    documentType: "lab_report",
    title: "Blood Test Results - January 2025",
    fileName: "blood-test-2025-01.pdf",
    fileUrl: "/uploads/documents/blood-test-2025-01.pdf",
    fileSize: 245678,
    mimeType: "application/pdf",
    description: "Complete blood count results",
    uploadedById: "user-uuid",
    tags: ["lab", "blood-work", "2025"],
    isConfidential: false
  }
});
```

### Querying Lab Results

```typescript
// Get all lab results for a patient
const labResults = await prisma.labResult.findMany({
  where: { patientId: "patient-uuid" },
  include: {
    orderingPhysician: true,
    reviewedBy: true
  },
  orderBy: { orderedDate: 'desc' }
});

// Get pending lab results
const pendingLabs = await prisma.labResult.findMany({
  where: { status: "pending_review" },
  include: { patient: true }
});
```

### Querying Documents

```typescript
// Get all documents for a patient
const documents = await prisma.document.findMany({
  where: { patientId: "patient-uuid" },
  include: { uploadedBy: true },
  orderBy: { uploadedAt: 'desc' }
});

// Search documents by type
const labReports = await prisma.document.findMany({
  where: { 
    documentType: "lab_report",
    patientId: "patient-uuid"
  }
});
```

## 🔄 Schema Summary

Your database now supports:

✅ **Users** - Authentication and user management  
✅ **Patients** - Patient records with comprehensive data  
✅ **Medications & Prescriptions** - Medication management with prescribing physician  
✅ **Lab Results** - Complete lab test ordering and results tracking  
✅ **Imaging Studies** - Imaging study management  
✅ **Documents** - Document storage and management  
✅ **Appointments** - Appointment scheduling  
✅ **Clinical Notes** - Clinical documentation  
✅ **Care Team** - Care team assignments  

All models are properly indexed and have appropriate foreign key relationships with cascade delete rules where appropriate.

