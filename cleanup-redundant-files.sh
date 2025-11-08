#!/bin/bash

# Cleanup script to remove redundant documentation files
# Run with: bash cleanup-redundant-files.sh

echo "🧹 Cleaning up redundant files..."

# Create docs directory if it doesn't exist
mkdir -p docs

# Move consolidated docs to docs folder
echo "📁 Moving consolidated docs..."
mv DEPLOYMENT_CHECKLIST.md docs/ 2>/dev/null || true

# Delete redundant deployment files (keeping docs/DEPLOYMENT.md)
echo "🗑️  Removing redundant deployment files..."
rm -f RENDER_DEPLOYMENT_FIX.md
rm -f VERCEL_DEPLOYMENT_FIX.md
rm -f README_DEPLOYMENT.md
rm -f FINAL_DEPLOYMENT_STEPS.md
rm -f DEPLOYMENT_STATUS.md
rm -f AUTO_DEPLOY_SETUP.md
rm -f DEPLOY_NOW.md
rm -f RENDER_AUTO_REDEPLOY.md
rm -f AUTO_REDEPLOY_RENDER.md
rm -f RENDER_REDEPLOY_INSTRUCTIONS.md
rm -f FIX_RENDER_DEPLOYMENT.md
rm -f BACKEND_DEPLOY_STEPS.md
rm -f RENDER_DEPLOYMENT_GUIDE.md
rm -f DEPLOY_BACKEND_CLOUD.md
rm -f VERCEL_DEPLOYMENT.md
rm -f DEPLOY_VERCEL_NOW.md
rm -f FORCE_DEPLOY_NOW.md
rm -f FINAL_RENDER_FIX.md

# Delete redundant fix/troubleshooting files (keeping docs/TROUBLESHOOTING.md)
echo "🗑️  Removing redundant fix files..."
rm -f URGENT_FIX.md
rm -f BACKEND_FIXED.md
rm -f QUICK_FIX_VERCEL.md
rm -f FIX_VERCEL_CORS.md
rm -f CONSOLE_ERRORS_COMPLETE_FIX.md
rm -f CONSOLE_ERRORS_FIXED.md
rm -f QUICK_FIX_AUTH.md
rm -f FIXES_APPLIED.md
rm -f FIX_HUBS_500_ERROR.md
rm -f FIX_NO_HUBS.md
rm -f FIX_VERCEL_502_ERROR.md
rm -f FIX_VERCEL_502.md
rm -f FIX_RENDER_ROOT_DIRECTORY.md
rm -f FIX_RENDER_DATABASE_URL.md
rm -f FIX_BACKEND_CONNECTION.md
rm -f FIX_RAILWAY_ROOT_DIRECTORY.md
rm -f RAILWAY_ROOT_DIRECTORY_FIX.md
rm -f RAILWAY_NO_ROOT_DIRECTORY_FIX.md
rm -f RAILWAY_FIND_ROOT_DIRECTORY.md

# Delete redundant status/summary files
echo "🗑️  Removing redundant status files..."
rm -f FINAL_STATUS.md
rm -f IMPLEMENTATION_COMPLETE.md
rm -f IMPLEMENTATION_COMPLETE_SUMMARY.md
rm -f COMPLETION_SUMMARY.md
rm -f COMPLETE_SUMMARY.md
rm -f PROJECT_COMPLETE.md
rm -f FINAL_IMPLEMENTATION_SUMMARY.md
rm -f FINAL_IMPLEMENTATION_REPORT.md
rm -f IMPLEMENTATION_SUMMARY.md
rm -f IMPLEMENTATION_PROGRESS.md
rm -f IMPLEMENTATION_STATUS.md

# Delete redundant backend start guides (keeping docs/BACKEND.md)
echo "🗑️  Removing redundant backend guides..."
rm -f START_BACKEND.md
rm -f START_BACKEND_NOW.md
rm -f START_BACKEND_LOCAL.md
rm -f BACKEND_START_GUIDE.md
rm -f BACKEND_RUNNING_NOW.md
rm -f BACKEND_RUNNING_CHECK.md
rm -f RUN_APP.md
rm -f RUN_THIS_NOW.md
rm -f LAUNCH_APP.md
rm -f BACKEND_READY.md
rm -f BACKEND_COMPLETE.md
rm -f BACKEND_IMPLEMENTATION_STATUS.md
rm -f BACKEND_PLAN.md
rm -f BACKEND_QUICKSTART.md

# Delete redundant setup guides
echo "🗑️  Removing redundant setup guides..."
rm -f LOCAL_VS_VERCEL_SETUP.md
rm -f VERCEL_ENV_SETUP.md
rm -f ENVIRONMENT_SETUP.md
rm -f VERCEL_QUICK_START.md

# Delete redundant improvement/summary files
echo "🗑️  Removing redundant improvement files..."
rm -f IMPROVEMENT_SUGGESTIONS.md
rm -f IMPROVEMENTS_APPLIED.md
rm -f IMPROVEMENTS_IMPLEMENTED.md
rm -f IMPROVEMENTS_SUMMARY.md
rm -f IMPROVEMENTS_TO_10.md
rm -f FINAL_IMPROVEMENTS_COMPLETE.md
rm -f ADDITIONAL_IMPROVEMENTS.md

# Delete redundant API documentation (keep API_ENDPOINTS.md)
echo "🗑️  Removing redundant API docs..."
rm -f API_AUDIT.md
rm -f API_COMPLETE_CHECK.md
rm -f API_STATUS.md
rm -f API_VERIFICATION_REPORT.md

# Delete redundant testing files (keep TESTING.md)
echo "🗑️  Removing redundant testing files..."
rm -f TESTING_SUMMARY.md
rm -f TESTING_PROGRESS.md
rm -f TESTING_EXECUTION_REPORT.md
rm -f FINAL_TESTING_SUMMARY.md
rm -f COMPREHENSIVE_TESTING_PLAN.md

# Delete redundant security files (keep SECURITY_AUDIT.md)
echo "🗑️  Removing redundant security files..."
rm -f SECURITY_FIXES_IMPLEMENTED.md
rm -f SECURITY_FIXES.md

# Delete redundant railway files (not using Railway)
echo "🗑️  Removing Railway-specific files..."
rm -f RAILWAY_VS_RENDER_COMPARISON.md
rm -f NEXT_STEPS_RAILWAY.md
rm -f TROUBLESHOOT_RAILWAY_DEPLOYMENT.md

# Delete backend redundant files
echo "🗑️  Removing backend redundant files..."
rm -f backend/DEPLOY_NOW.md
rm -f backend/DEPLOY_DOCKER_BACKEND.md
rm -f backend/DOCKER_DEPLOYMENT_QUICKSTART.md
rm -f backend/QUICK_START_DOCKER.md
rm -f backend/RAILWAY_DEPLOYMENT.md
rm -f backend/RAILWAY_QUICKSTART.md
rm -f backend/RAILWAY_FIX.md
rm -f backend/URGENT_FIX_RAILWAY.md
rm -f backend/RENDER_DEPLOYMENT.md
rm -f backend/RENDER_ENV_SETUP.md
rm -f backend/RENDER_QUICK_START.md
rm -f backend/FIX_PORT_CONFLICT.md
rm -f backend/START_BACKEND.md

# Keep but consolidate backend docs
echo "📝 Consolidating backend docs..."
# These will be referenced in docs/BACKEND.md

# Delete mock HTML test files (if not needed)
echo "🗑️  Removing mock HTML test files..."
rm -f mock-example-1-dashboard.html
rm -f mock-example-2-form-modal.html
rm -f mock-imaging-1-studies-list.html
rm -f mock-imaging-2-viewer-report.html
rm -f mock-lab-results-1-table.html
rm -f mock-lab-results-2-detailed.html
rm -f mock-role-administrator.html
rm -f mock-role-medical-assistant.html
rm -f mock-role-nurse.html
rm -f mock-role-physician.html
rm -f test-login.html
rm -f test-prescription-print.html
rm -f test-print.html
rm -f typography-color-showcase.html
rm -f clinical-staff-login.html
rm -f login-physician.html

# Delete other redundant files
echo "🗑️  Removing other redundant files..."
rm -f DIGITALOCEAN_PRICING.md
rm -f LONG_TERM_COST_ANALYSIS.md
rm -f RESTART_SERVICES.md
rm -f SET_ROOT_DIRECTORY_CLI.md
rm -f CHECK_TEST_USERS.md
rm -f LOGIN_CREDENTIALS.md

echo "✅ Cleanup complete!"
echo ""
echo "📚 Consolidated documentation is now in docs/ folder:"
echo "   - docs/DEPLOYMENT.md"
echo "   - docs/TROUBLESHOOTING.md"
echo "   - docs/BACKEND.md"
echo ""
echo "📖 Update README.md to reference these new docs."

