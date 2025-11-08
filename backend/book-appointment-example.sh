#!/bin/bash

# Example script to book an appointment and view patient details

BASE_URL="http://localhost:3000"
EMAIL="sarah.johnson@hospital2035.com"
PASSWORD="password123"
PATIENT_ID="pt-001"

echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | \
  jq -r '.data.tokens.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Get provider ID
PROVIDER_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/auth/me" | jq -r '.data.id')
echo "👤 Provider ID: $PROVIDER_ID"
echo ""

# Book appointment
echo "📅 Booking appointment..."
APPOINTMENT_DATE=$(date -u -v+7d '+%Y-%m-%dT10:00:00Z' 2>/dev/null || date -u -d '+7 days' '+%Y-%m-%dT10:00:00Z' 2>/dev/null || echo "2025-11-15T10:00:00Z")

APPOINTMENT=$(curl -s -X POST "$BASE_URL/api/v1/patients/$PATIENT_ID/appointments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$APPOINTMENT_DATE\",
    \"time\": \"10:00 AM\",
    \"type\": \"consultation\",
    \"providerId\": \"$PROVIDER_ID\",
    \"status\": \"scheduled\",
    \"notes\": \"Follow-up appointment\",
    \"consultationType\": \"follow_up\",
    \"specialty\": \"Internal Medicine\",
    \"duration\": 30,
    \"location\": \"Main Clinic - Room 205\",
    \"reason\": \"Follow-up consultation\"
  }")

APPOINTMENT_ID=$(echo "$APPOINTMENT" | jq -r '.data.id')
if [ "$APPOINTMENT_ID" != "null" ] && [ -n "$APPOINTMENT_ID" ]; then
  echo "✅ Appointment booked successfully!"
  echo "$APPOINTMENT" | jq '.data | {id, date, time, type, status, reason, location, provider: .provider.firstName + " " + .provider.lastName}'
else
  echo "❌ Failed to book appointment"
  echo "$APPOINTMENT" | jq '.'
  exit 1
fi

echo ""
echo "=========================================="
echo ""

# View patient details
echo "👤 Viewing patient details..."
PATIENT=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/patients/$PATIENT_ID")

echo "$PATIENT" | jq '.data | {
  name,
  age: ((now - (.dateOfBirth | fromdateiso8601)) / 31536000 | floor),
  gender,
  condition,
  riskScore,
  email,
  phone,
  allergies,
  medications_count: (.medications | length),
  appointments_count: (.appointments | length),
  clinical_notes_count: (.clinicalNotes | length),
  lab_results_count: (.labResults | length),
  imaging_studies_count: (.imagingStudies | length)
}'

echo ""
echo "✅ Done!"

