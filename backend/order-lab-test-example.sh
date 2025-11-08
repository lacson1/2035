#!/bin/bash

# Example script to order a blood test and view results

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

# Order blood test
echo "🩸 Ordering Complete Blood Count (CBC) test..."
TODAY=$(date -u '+%Y-%m-%dT00:00:00Z')
COLLECTED=$(date -u '+%Y-%m-%dT08:00:00Z')
RESULT_DATE=$(date -u '+%Y-%m-%dT14:00:00Z')

LAB_RESULT=$(curl -s -X POST "$BASE_URL/api/v1/patients/$PATIENT_ID/lab-results" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"testName\": \"Complete Blood Count (CBC)\",
    \"testCode\": \"CBC\",
    \"category\": \"Blood Work\",
    \"orderedDate\": \"$TODAY\",
    \"collectedDate\": \"$COLLECTED\",
    \"resultDate\": \"$RESULT_DATE\",
    \"status\": \"completed\",
    \"results\": {
      \"whiteBloodCellCount\": {\"value\": 7.2, \"unit\": \"10^3/μL\", \"referenceRange\": \"4.0-11.0\"},
      \"redBloodCellCount\": {\"value\": 4.8, \"unit\": \"10^6/μL\", \"referenceRange\": \"4.5-5.5\"},
      \"hemoglobin\": {\"value\": 14.2, \"unit\": \"g/dL\", \"referenceRange\": \"12.0-16.0\"},
      \"hematocrit\": {\"value\": 42.5, \"unit\": \"%\", \"referenceRange\": \"36-46\"},
      \"plateletCount\": {\"value\": 250, \"unit\": \"10^3/μL\", \"referenceRange\": \"150-450\"}
    },
    \"referenceRanges\": {
      \"whiteBloodCellCount\": \"4.0-11.0 10^3/μL\",
      \"redBloodCellCount\": \"4.5-5.5 10^6/μL\",
      \"hemoglobin\": \"12.0-16.0 g/dL\",
      \"hematocrit\": \"36-46%\",
      \"plateletCount\": \"150-450 10^3/μL\"
    },
    \"interpretation\": \"All values within normal limits. No abnormalities detected.\",
    \"notes\": \"Routine CBC ordered as part of diabetes management follow-up.\",
    \"orderingPhysicianId\": \"$PROVIDER_ID\",
    \"labName\": \"Hospital Central Lab\",
    \"labLocation\": \"Main Building, 2nd Floor\"
  }")

LAB_ID=$(echo "$LAB_RESULT" | jq -r '.data.id')
if [ "$LAB_ID" != "null" ] && [ -n "$LAB_ID" ]; then
  echo "✅ Lab test ordered successfully!"
  echo "$LAB_RESULT" | jq '.data | {id, testName, testCode, status, orderedDate, resultDate}'
else
  echo "❌ Failed to order lab test"
  echo "$LAB_RESULT" | jq '.'
  exit 1
fi

echo ""
echo "=========================================="
echo ""

# View all lab results
echo "📊 Viewing all lab results for patient..."
LAB_RESULTS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/patients/$PATIENT_ID/lab-results")

echo "$LAB_RESULTS" | jq '.data[] | {
  testName,
  testCode,
  status,
  orderedDate,
  resultDate,
  interpretation
}'

echo ""
echo "=========================================="
echo ""

# View detailed result
echo "🔍 Viewing detailed lab result..."
DETAILED=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/patients/$PATIENT_ID/lab-results/$LAB_ID")

echo "$DETAILED" | jq '.data | {
  testName,
  status,
  results,
  interpretation,
  orderingPhysician: (.orderingPhysician.firstName + " " + .orderingPhysician.lastName)
}'

echo ""
echo "✅ Done!"

