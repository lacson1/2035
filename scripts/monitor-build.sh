#!/bin/bash

# Build Monitoring Script
# Monitors the application build process and provides detailed reports

set -e

FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$FRONTEND_DIR/backend"
LOG_FILE="/tmp/build-monitor-$(date +%Y%m%d-%H%M%S).log"

echo "========================================="
echo "  Build Monitor - Starting"
echo "========================================="
echo "Frontend: $FRONTEND_DIR"
echo "Backend:  $BACKEND_DIR"
echo "Log:      $LOG_FILE"
echo ""

# Function to run build and capture output
run_build() {
    local name=$1
    local dir=$2
    local cmd=$3
    
    echo "[$(date +%H:%M:%S)] Building $name..." | tee -a "$LOG_FILE"
    cd "$dir"
    
    if eval "$cmd" 2>&1 | tee -a "$LOG_FILE"; then
        echo "[$(date +%H:%M:%S)] ✓ $name build SUCCESS" | tee -a "$LOG_FILE"
        return 0
    else
        echo "[$(date +%H:%M:%S)] ✗ $name build FAILED" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Function to analyze build output
analyze_build() {
    local log_file=$1
    echo ""
    echo "========================================="
    echo "  Build Analysis"
    echo "========================================="
    
    # Extract bundle sizes
    echo ""
    echo "Bundle Sizes:"
    grep -E "\.(js|css)" "$log_file" | grep -E "kB │" | tail -10 || echo "  No bundle info found"
    
    # Count warnings
    local warnings=$(grep -c "(!)" "$log_file" 2>/dev/null || echo "0")
    echo ""
    echo "Warnings: $warnings"
    
    # Check for errors
    if grep -qi "error\|failed\|✗" "$log_file"; then
        echo ""
        echo "⚠️  ERRORS DETECTED:"
        grep -i "error\|failed\|✗" "$log_file" | head -5
    fi
    
    # Build time
    local build_time=$(grep "built in" "$log_file" | tail -1 | grep -oE "[0-9]+\.[0-9]+s" || echo "N/A")
    echo ""
    echo "Build Time: $build_time"
    
    echo ""
    echo "Full log: $log_file"
}

# Run frontend build
run_build "Frontend" "$FRONTEND_DIR" "npm run build"

# Run backend build
if [ -d "$BACKEND_DIR" ]; then
    run_build "Backend" "$BACKEND_DIR" "npm run build"
fi

# Analyze results
analyze_build "$LOG_FILE"

echo ""
echo "========================================="
echo "  Build Monitor - Complete"
echo "========================================="

