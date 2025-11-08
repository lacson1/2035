#!/bin/bash

# Performance Monitoring Script
# Comprehensive performance monitoring for Physician Dashboard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
OUTPUT_DIR="${OUTPUT_DIR:-./performance-reports}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$OUTPUT_DIR/performance_report_$TIMESTAMP.json"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create output directory
setup_output_dir() {
    mkdir -p "$OUTPUT_DIR"
    log_info "Created output directory: $OUTPUT_DIR"
}

# Health check
check_health() {
    log_info "Checking service health..."

    local backend_health=$(curl -s -w "%{http_code}" -o /dev/null "$BACKEND_URL/health")
    local frontend_health=$(curl -s -w "%{http_code}" -o /dev/null "$FRONTEND_URL")

    echo "{
  \"backend_health\": $backend_health,
  \"frontend_health\": $frontend_health
}" > /tmp/health_check.json

    if [ "$backend_health" -eq 200 ]; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed (HTTP $backend_health)"
    fi

    if [ "$frontend_health" -eq 200 ]; then
        log_success "Frontend health check passed"
    else
        log_warning "Frontend health check returned HTTP $frontend_health"
    fi
}

# API performance test
test_api_performance() {
    log_info "Testing API performance..."

    local results=$(curl -s -w "@curl-format.txt" -o /dev/null "$BACKEND_URL/health")
    local response_time=$(echo "$results" | grep -o '"time_total":[0-9.]*' | cut -d':' -f2)

    echo "{
  \"api_response_time\": $response_time
}" > /tmp/api_performance.json

    if (( $(echo "$response_time < 0.5" | bc -l) )); then
        log_success "API response time: ${response_time}s (Good)"
    elif (( $(echo "$response_time < 2.0" | bc -l) )); then
        log_warning "API response time: ${response_time}s (Acceptable)"
    else
        log_error "API response time: ${response_time}s (Poor)"
    fi
}

# Database connection test
test_database_connection() {
    log_info "Testing database connectivity..."

    # This would require database credentials and a test query
    # For now, we'll check if the backend can connect
    local db_status=$(curl -s "$BACKEND_URL/health/detailed" | jq -r '.database.status // "unknown"')

    echo "{
  \"database_status\": \"$db_status\"
}" > /tmp/database_status.json

    if [ "$db_status" = "connected" ]; then
        log_success "Database connection healthy"
    else
        log_error "Database connection issue: $db_status"
    fi
}

# Memory and CPU monitoring
monitor_system_resources() {
    log_info "Monitoring system resources..."

    # Get container resource usage if running in Docker
    if command -v docker &> /dev/null && docker ps | grep -q physician-dashboard-backend; then
        local container_stats=$(docker stats --no-stream --format json physician-dashboard-backend)

        echo "{
  \"container_stats\": $container_stats
}" > /tmp/container_stats.json

        log_success "Container resource monitoring enabled"
    else
        # System resource monitoring
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
        local mem_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')

        echo "{
  \"cpu_usage_percent\": $cpu_usage,
  \"memory_usage_percent\": $mem_usage
}" > /tmp/system_resources.json

        log_success "System CPU: ${cpu_usage}%, Memory: ${mem_usage}%"
    fi
}

# Lighthouse performance audit
run_lighthouse_audit() {
    if command -v lighthouse &> /dev/null; then
        log_info "Running Lighthouse performance audit..."

        lighthouse "$FRONTEND_URL" \
            --output json \
            --output-path "$OUTPUT_DIR/lighthouse_report_$TIMESTAMP.json" \
            --quiet \
            --chrome-flags="--headless --disable-gpu --no-sandbox"

        local performance_score=$(jq -r '.categories.performance.score * 100' "$OUTPUT_DIR/lighthouse_report_$TIMESTAMP.json")

        echo "{
  \"lighthouse_score\": $performance_score
}" > /tmp/lighthouse_score.json

        if [ "$performance_score" -ge 90 ]; then
            log_success "Lighthouse score: $performance_score/100 (Excellent)"
        elif [ "$performance_score" -ge 75 ]; then
            log_success "Lighthouse score: $performance_score/100 (Good)"
        elif [ "$performance_score" -ge 50 ]; then
            log_warning "Lighthouse score: $performance_score/100 (Needs improvement)"
        else
            log_error "Lighthouse score: $performance_score/100 (Poor)"
        fi
    else
        log_warning "Lighthouse not installed, skipping frontend audit"
        echo "{
  \"lighthouse_score\": null
}" > /tmp/lighthouse_score.json
    fi
}

# Bundle size analysis
analyze_bundle_size() {
    log_info "Analyzing bundle sizes..."

    if [ -d "dist" ]; then
        local bundle_sizes=$(find dist -name "*.js" -o -name "*.css" | xargs ls -lh | awk '{print "{\"file\":\""$9"\",\"size\":"$5"}"}' | jq -s '.')

        echo "{
  \"bundle_sizes\": $bundle_sizes
}" > /tmp/bundle_sizes.json

        log_success "Bundle size analysis completed"
    else
        log_warning "Dist directory not found, skipping bundle analysis"
        echo "{
  \"bundle_sizes\": []
}" > /tmp/bundle_sizes.json
    fi
}

# Generate comprehensive report
generate_report() {
    log_info "Generating comprehensive performance report..."

    # Combine all metrics
    local health_check=$(cat /tmp/health_check.json)
    local api_performance=$(cat /tmp/api_performance.json)
    local database_status=$(cat /tmp/database_status.json)
    local lighthouse_score=$(cat /tmp/lighthouse_score.json)
    local bundle_sizes=$(cat /tmp/bundle_sizes.json)

    local system_resources="{}"
    if [ -f /tmp/system_resources.json ]; then
        system_resources=$(cat /tmp/system_resources.json)
    elif [ -f /tmp/container_stats.json ]; then
        system_resources=$(cat /tmp/container_stats.json)
    fi

    # Create final report
    cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "environment": {
    "backend_url": "$BACKEND_URL",
    "frontend_url": "$FRONTEND_URL"
  },
  "health_checks": $health_check,
  "performance": {
    "api": $api_performance,
    "lighthouse": $lighthouse_score
  },
  "system": $system_resources,
  "database": $database_status,
  "assets": $bundle_sizes
}
EOF

    log_success "Performance report generated: $REPORT_FILE"

    # Pretty print summary
    echo "=== Performance Report Summary ==="
    echo "Timestamp: $TIMESTAMP"
    echo "Backend Health: $(jq -r '.backend_health' "$REPORT_FILE")"
    echo "Frontend Health: $(jq -r '.frontend_health' "$REPORT_FILE")"
    echo "API Response Time: $(jq -r '.performance.api.api_response_time' "$REPORT_FILE")s"
    echo "Lighthouse Score: $(jq -r '.performance.lighthouse.lighthouse_score // "N/A"' "$REPORT_FILE")"
    echo "=================================="
}

# Clean up temporary files
cleanup() {
    rm -f /tmp/health_check.json
    rm -f /tmp/api_performance.json
    rm -f /tmp/database_status.json
    rm -f /tmp/lighthouse_score.json
    rm -f /tmp/bundle_sizes.json
    rm -f /tmp/system_resources.json
    rm -f /tmp/container_stats.json
}

# Main execution
main() {
    log_info "Starting comprehensive performance monitoring..."

    setup_output_dir

    # Run all checks
    check_health
    test_api_performance
    test_database_connection
    monitor_system_resources
    run_lighthouse_audit
    analyze_bundle_size

    # Generate report
    generate_report

    # Cleanup
    cleanup

    log_success "Performance monitoring completed successfully"
}

# Handle command line arguments
case "${1:-all}" in
    "health")
        setup_output_dir
        check_health
        ;;
    "api")
        setup_output_dir
        test_api_performance
        ;;
    "database")
        setup_output_dir
        test_database_connection
        ;;
    "resources")
        setup_output_dir
        monitor_system_resources
        ;;
    "lighthouse")
        setup_output_dir
        run_lighthouse_audit
        ;;
    "bundle")
        setup_output_dir
        analyze_bundle_size
        ;;
    "all")
        main
        ;;
    *)
        echo "Usage: $0 [health|api|database|resources|lighthouse|bundle|all]"
        echo "Default: all"
        exit 1
        ;;
esac
