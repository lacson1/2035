#!/bin/bash

# Phase 2: Further cleanup of redundant files
# Consolidate assessments, reports, and duplicate guides

echo "🧹 Phase 2: Further cleanup..."

# Consolidate assessment files (keep SENIOR_ENGINEER_ASSESSMENT.md as reference)
echo "🗑️  Removing duplicate assessment files..."
rm -f SENIOR_DEVELOPER_ASSESSMENT.md
rm -f DASHBOARD_ASSESSMENT.md
rm -f APPLICATION_FLOW_ASSESSMENT.md
rm -f SIDEBAR_ORGANIZATION_REVIEW.md
rm -f INDUSTRY_BEST_PRACTICES_ANALYSIS.md

# Consolidate improvement files (keep FORM_IMPROVEMENTS.md, BUILD_MONITORING.md)
echo "🗑️  Removing duplicate improvement files..."
rm -f ACCESSIBILITY_IMPROVEMENTS.md
rm -f AESTHETIC_CONSISTENCY_IMPROVEMENTS.md
rm -f CLINICIAN_IMPROVEMENTS.md
rm -f CLINICIAN_IMPROVEMENTS_SUMMARY.md
rm -f FRONTEND_AESTHETICS_COMPLETE.md
rm -f FRONTEND_AESTHETICS_IMPROVEMENTS.md
rm -f UI_UX_IMPROVEMENTS.md
rm -f UI_UX_IMPROVEMENTS_IMPLEMENTED.md
rm -f COLOR_UPDATE_SUMMARY.md
rm -f COLOR_PALETTE_RECOMMENDATIONS.md
rm -f TYPOGRAPHY_COLOR_CONSISTENCY.md
rm -f README_IMPROVEMENTS.md

# Consolidate troubleshooting files (keep docs/TROUBLESHOOTING.md)
echo "🗑️  Removing duplicate troubleshooting files..."
rm -f TROUBLESHOOTING_AUTH_ERRORS.md
rm -f TROUBLESHOOTING_BROWSER_ERRORS.md
rm -f TROUBLESHOOTING_FETCH_ERRORS.md
rm -f DEBUG_GUIDE.md
rm -f DEBUG_LOGIN.md
rm -f QUICK_DEBUG_COMMANDS.md

# Consolidate status/report files
echo "🗑️  Removing duplicate status/report files..."
rm -f FRONTEND_BACKEND_CONNECTION_STATUS.md
rm -f FRONTEND_BACKEND_INTEGRATION.md
rm -f MISSING_COMPONENTS_ANALYSIS.md
rm -f MISSING_INTEGRATIONS_REPORT.md
rm -f PRODUCTION_GAPS_SUMMARY.md
rm -f PRODUCTION_IMPLEMENTATION_SUMMARY.md
rm -f PRODUCTION_ACTION_PLAN.md
rm -f WORKFLOW_TEST_REPORT.md
rm -f WORKFLOW_VERIFICATION_REPORT.md
rm -f MOCK_DATA_REMOVAL_SUMMARY.md
rm -f PATIENT_DIRECTORY_CLEANUP.md
rm -f HUB_INTEGRATION_COMPLETE.md

# Consolidate guide files (keep main ones)
echo "🗑️  Removing duplicate guide files..."
rm -f QUICK_START_BILLING.md
rm -f QUICK_START_NEW_FEATURES.md
rm -f QUICK_CLINICAL_WINS.md
rm -f IMPLEMENTATION_GUIDE.md
rm -f PHASE1_PHASE2_IMPLEMENTATION.md
rm -f PHASE2_SUMMARY.md
rm -f ROADMAP_TO_10.md
rm -f FULL_STACK_ROADMAP.md

# Consolidate monitoring/setup files
echo "🗑️  Removing duplicate monitoring files..."
rm -f PERFORMANCE_MONITORING_SETUP.md
rm -f UPTIME_MONITORING_SETUP.md
rm -f WHERE_TO_SEE_SCAN_RESULTS.md

# Remove duplicate/outdated reference files
echo "🗑️  Removing duplicate reference files..."
rm -f ENV_VARIABLES_REFERENCE.md
rm -f INTEGRATIONS_NEEDED.md
rm -f INTEGRATION_CHECKLIST.md
rm -f SEED_HUBS_INSTRUCTIONS.md
rm -f TELEMEDICINE_TEST.md
rm -f VERIFICATION.md
rm -f DAILY_SCHEDULE_FLOW_ASSESSMENT.md

# Keep these important files:
# - QUICK_START.md (main quick start)
# - README_FULL_STACK.md (full stack overview)
# - API_ENDPOINTS.md (API docs)
# - FORM_IMPROVEMENTS.md (feature docs)
# - BUILD_MONITORING.md (feature docs)
# - ERROR_HANDLING.md (feature docs)
# - TESTING.md (testing guide)
# - SECURITY_AUDIT.md (security reference)
# - DESIGN_SYSTEM.md (design reference)
# - ACCESSIBILITY.md (accessibility reference)
# - PERFORMANCE.md (performance reference)
# - MOBILE_RESPONSIVENESS.md (mobile reference)
# - IMAGING_GUIDE.md (feature guide)
# - PRINT_MULTIPLE_ORDERS_GUIDE.md (feature guide)
# - PRODUCTION_READINESS_CHECKLIST.md (checklist)
# - SENIOR_ENGINEER_ASSESSMENT.md (assessment reference)

echo "✅ Phase 2 cleanup complete!"
echo ""
echo "📚 Remaining important docs:"
echo "   - Core: README.md, QUICK_START.md, README_FULL_STACK.md"
echo "   - Features: FORM_IMPROVEMENTS.md, BUILD_MONITORING.md, etc."
echo "   - Reference: API_ENDPOINTS.md, SECURITY_AUDIT.md, DESIGN_SYSTEM.md"
echo "   - Consolidated: docs/DEPLOYMENT.md, docs/TROUBLESHOOTING.md, docs/BACKEND.md"

