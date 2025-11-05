# API Endpoints Specification

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.yourdomain.com/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### POST /auth/login
Login and receive access/refresh tokens.

**Request:**
```json
{
  "email": "sarah.johnson@hospital2035.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-002",
      "username": "sarah.johnson",
      "email": "sarah.johnson@hospital2035.com",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "role": "physician",
      "specialty": "Internal Medicine"
    }
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing email or password

---

### POST /auth/refresh
Refresh access token using refresh token.

**Request:** (Refresh token in HTTP-only cookie)
```json
{}
```

**Response:** `200 OK`
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired refresh token

---

### POST /auth/logout
Logout and invalidate refresh token.

**Request:** (Refresh token in HTTP-only cookie)

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "id": "user-002",
    "username": "sarah.johnson",
    "email": "sarah.johnson@hospital2035.com",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "role": "physician",
    "specialty": "Internal Medicine",
    "department": "Internal Medicine",
    "phone": "(555) 123-4567",
    "avatar": null,
    "isActive": true,
    "lastLogin": "2025-01-15T09:15:00Z"
  }
}
```

---

## Patients Endpoints

### GET /patients
Get list of patients with filtering, pagination, and sorting.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string) - Search by name, email, or phone
- `risk` (string) - Filter by risk level: "low", "medium", "high"
- `condition` (string) - Filter by condition
- `sortBy` (string) - Sort field: "name", "risk", "recent"
- `sortOrder` (string) - "asc" or "desc" (default: "asc")

**Example:** `GET /patients?page=1&limit=20&search=ava&risk=high&sortBy=risk&sortOrder=desc`

**Response:** `200 OK`
```json
{
  "data": {
    "patients": [
      {
        "id": "pt-001",
        "name": "Ava Mensah",
        "age": 52,
        "gender": "F",
        "bp": "138/86",
        "condition": "T2D",
        "risk": 62,
        "address": "123 Oak Street, Springfield, IL 62701",
        "email": "ava.mensah@email.com",
        "dob": "1972-06-15",
        "phone": "(217) 555-0123"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### GET /patients/:id
Get single patient by ID.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "pt-001",
    "name": "Ava Mensah",
    "age": 52,
    "gender": "F",
    "bp": "138/86",
    "condition": "T2D",
    "risk": 62,
    "address": "123 Oak Street, Springfield, IL 62701",
    "email": "ava.mensah@email.com",
    "dob": "1972-06-15",
    "phone": "(217) 555-0123",
    "allergies": ["Penicillin", "Sulfa drugs"],
    "emergencyContact": {
      "name": "James Mensah",
      "relationship": "Spouse",
      "phone": "(217) 555-0124"
    },
    "insurance": {
      "provider": "BlueCross BlueShield",
      "policyNumber": "BCBS-789456123",
      "groupNumber": "GRP-12345"
    },
    "medications": [...],
    "appointments": [...],
    "clinicalNotes": [...],
    "imagingStudies": [...],
    "timeline": [...]
  }
}
```

**Errors:**
- `404 Not Found` - Patient not found
- `403 Forbidden` - Insufficient permissions

---

### POST /patients
Create a new patient.

**Request:**
```json
{
  "name": "John Doe",
  "dateOfBirth": "1980-01-15",
  "gender": "M",
  "bloodPressure": "120/80",
  "condition": "Hypertension",
  "riskScore": 35,
  "email": "john.doe@email.com",
  "phone": "(555) 123-4567"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "pt-999",
    "name": "John Doe",
    ...
  },
  "message": "Patient created successfully"
}
```

**Errors:**
- `400 Bad Request` - Validation errors
- `403 Forbidden` - Insufficient permissions

---

### PUT /patients/:id
Update a patient (full update).

**Request:** Same as POST /patients

**Response:** `200 OK`
```json
{
  "data": { ... },
  "message": "Patient updated successfully"
}
```

---

### PATCH /patients/:id
Partially update a patient.

**Request:**
```json
{
  "riskScore": 65,
  "condition": "T2D with complications"
}
```

**Response:** `200 OK`
```json
{
  "data": { ... },
  "message": "Patient updated successfully"
}
```

---

### DELETE /patients/:id
Delete a patient.

**Response:** `200 OK`
```json
{
  "message": "Patient deleted successfully"
}
```

**Errors:**
- `404 Not Found` - Patient not found
- `403 Forbidden` - Insufficient permissions

---

### GET /patients/search
Search patients by query string.

**Query Parameters:**
- `q` (string, required) - Search query

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "pt-001",
      "name": "Ava Mensah",
      ...
    }
  ]
}
```

---

## Patient Medications

### GET /patients/:id/medications
Get all medications for a patient.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "med-001",
      "name": "Metformin 1000mg BID",
      "status": "Active",
      "started": "2025-09-13",
      "instructions": "Take with meals"
    }
  ]
}
```

---

### POST /patients/:id/medications
Add medication to a patient.

**Request:**
```json
{
  "name": "Lisinopril 10mg QD",
  "status": "Active",
  "started": "2025-09-16",
  "instructions": "Take once daily"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "med-002",
    ...
  }
}
```

---

### PUT /patients/:id/medications/:medId
Update a medication.

**Request:** Same as POST

**Response:** `200 OK`

---

### DELETE /patients/:id/medications/:medId
Delete a medication.

**Response:** `200 OK`

---

## Patient Appointments

### GET /patients/:id/appointments
Get all appointments for a patient.

**Query Parameters:**
- `status` (string) - Filter by status
- `from` (date) - Start date filter
- `to` (date) - End date filter

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "apt-001",
      "date": "2025-01-15",
      "time": "10:00",
      "type": "Follow-up",
      "provider": "Dr. Johnson",
      "status": "scheduled"
    }
  ]
}
```

---

### POST /patients/:id/appointments
Create an appointment.

**Request:**
```json
{
  "date": "2025-01-20",
  "time": "14:00",
  "type": "Consultation",
  "providerId": "user-002",
  "duration": 30,
  "location": "in-person",
  "reason": "Follow-up visit"
}
```

**Response:** `201 Created`

---

### PUT /patients/:id/appointments/:aptId
Update an appointment.

**Response:** `200 OK`

---

### DELETE /patients/:id/appointments/:aptId
Cancel/delete an appointment.

**Response:** `200 OK`

---

## Clinical Notes

### GET /patients/:id/notes
Get all clinical notes for a patient.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "note-001",
      "date": "2025-01-08",
      "author": "Dr. Johnson",
      "title": "Follow-up Visit",
      "content": "...",
      "type": "follow-up"
    }
  ]
}
```

---

### POST /patients/:id/notes
Create a clinical note.

**Request:**
```json
{
  "title": "Follow-up Visit",
  "content": "Patient reports improved glucose control...",
  "date": "2025-01-08",
  "type": "follow-up",
  "consultationType": "general",
  "specialty": "Internal Medicine"
}
```

**Response:** `201 Created`

---

### PUT /patients/:id/notes/:noteId
Update a clinical note.

**Response:** `200 OK`

---

### DELETE /patients/:id/notes/:noteId
Delete a clinical note.

**Response:** `200 OK`

---

## Imaging Studies

### GET /patients/:id/imaging
Get all imaging studies for a patient.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "img-001",
      "date": "2025-01-05",
      "type": "Chest X-Ray",
      "modality": "X-Ray",
      "bodyPart": "Chest",
      "findings": "No acute cardiopulmonary abnormalities...",
      "status": "completed",
      "reportUrl": "https://..."
    }
  ]
}
```

---

### POST /patients/:id/imaging
Create an imaging study record.

**Request:**
```json
{
  "type": "Chest X-Ray",
  "modality": "X-Ray",
  "bodyPart": "Chest",
  "date": "2025-01-05",
  "findings": "...",
  "status": "completed"
}
```

**Response:** `201 Created`

---

## Timeline Events

### GET /patients/:id/timeline
Get timeline events for a patient.

**Query Parameters:**
- `from` (date)
- `to` (date)
- `type` (string) - Filter by event type

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "tl-001",
      "date": "2025-01-15",
      "type": "appointment",
      "title": "Follow-up - Dr. Johnson",
      "description": "Scheduled for 10:00 AM",
      "icon": "calendar"
    }
  ]
}
```

---

## Care Team

### GET /patients/:id/care-team
Get care team members for a patient.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "ct-001",
      "userId": "user-002",
      "name": "Dr. Sarah Johnson",
      "role": "Primary Care Physician",
      "specialty": "Internal Medicine",
      "email": "sarah.johnson@hospital.com",
      "phone": "(555) 123-4567",
      "assignedDate": "2024-01-01",
      "notes": "Primary coordinator"
    }
  ]
}
```

---

### POST /patients/:id/care-team
Add a care team member.

**Request:**
```json
{
  "userId": "user-003",
  "role": "Endocrinologist",
  "notes": "Managing diabetes care"
}
```

**Response:** `201 Created`

---

### DELETE /patients/:id/care-team/:memberId
Remove a care team member.

**Response:** `200 OK`

---

## Users Endpoints

### GET /users
Get list of users (admin only).

**Query Parameters:**
- `page`, `limit`
- `role` - Filter by role
- `search` - Search by name or email

**Response:** `200 OK`

---

### GET /users/:id
Get user by ID.

**Response:** `200 OK`

---

### POST /users
Create a new user (admin only).

**Request:**
```json
{
  "username": "new.user",
  "email": "new.user@hospital.com",
  "password": "securePassword123",
  "firstName": "New",
  "lastName": "User",
  "role": "nurse",
  "department": "Nursing"
}
```

**Response:** `201 Created`

---

### PUT /users/:id
Update a user (admin only).

**Response:** `200 OK`

---

### DELETE /users/:id
Delete/deactivate a user (admin only).

**Response:** `200 OK`

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error message",
  "status": 400,
  "errors": {
    "field": ["Error message for this field"]
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Common Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- **Authentication endpoints:** 5 requests per minute per IP
- **General API:** 100 requests per minute per user
- **Search endpoints:** 30 requests per minute per user

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

