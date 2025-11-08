# Build Monitoring Guide

## Overview

This document describes the build monitoring setup for the Physician Dashboard 2035 application.

## Quick Start

### Monitor Both Frontend and Backend
```bash
npm run build:monitor
```

### Monitor Frontend Only
```bash
npm run build
```

### Monitor Backend Only
```bash
cd backend && npm run build
```

## Available Scripts

### Frontend Build Scripts
- `npm run build` - Standard production build
- `npm run build:watch` - Watch mode for development
- `npm run build:check` - Type check + build
- `npm run build:analyze` - Build + bundle analysis
- `npm run build:monitor` - Full build monitoring with analysis

### Backend Build Scripts
- `cd backend && npm run build` - TypeScript compilation
- `cd backend && npm run dev` - Development mode with watch

## Build Monitor Script

The `scripts/monitor-build.sh` script provides comprehensive build monitoring:

### Features
- ✅ Monitors both frontend and backend builds
- ✅ Captures detailed build logs
- ✅ Analyzes bundle sizes
- ✅ Counts warnings and errors
- ✅ Reports build times
- ✅ Saves logs with timestamps

### Usage
```bash
./scripts/monitor-build.sh
```

### Output
The script provides:
1. **Build Status** - Success/Failure for each build
2. **Bundle Analysis** - File sizes and gzip compression
3. **Warning Count** - Number of build warnings
4. **Error Detection** - Any build errors
5. **Build Time** - Duration of each build
6. **Log File** - Full build log saved with timestamp

## Current Build Status

### Frontend
- **Status**: ✅ Success
- **Main Bundle**: 1,072.11 kB (207.65 kB gzipped)
- **Build Time**: ~2.5s
- **Warnings**: 8 dynamic/static import conflicts

### Backend
- **Status**: ✅ Success
- **Build Time**: <1s

## Build Warnings

### Dynamic/Static Import Conflicts
These warnings indicate modules that are both:
- Statically imported (eager loading)
- Dynamically imported (lazy loading)

**Affected Modules:**
1. `src/services/patients.ts`
2. `src/components/Consultation.tsx`
3. `src/components/Telemedicine.tsx`
4. `src/components/Longevity.tsx`
5. `src/components/Microbiome.tsx`
6. `src/components/UserManagement.tsx`
7. `src/components/UserProfile.tsx`
8. `src/components/Settings.tsx`
9. `src/utils/sentry.ts`

**Impact**: These warnings don't prevent the build from succeeding, but they prevent optimal code-splitting. The modules will be included in the main bundle instead of separate chunks.

### Large Bundle Warning
- Main bundle exceeds 500 kB recommendation
- Current size: 1,072.11 kB
- Consider code-splitting for better performance

## Monitoring in CI/CD

### GitHub Actions
The build is automatically monitored in CI/CD pipelines. Check `.github/workflows/` for configuration.

### Local Development
Use watch mode for continuous monitoring during development:
```bash
npm run build:watch
```

## Troubleshooting

### Build Fails
1. Check TypeScript errors: `npx tsc --noEmit`
2. Check linting errors: `npm run lint`
3. Review full build log: Check `/tmp/build-monitor-*.log`

### Large Bundle Size
1. Run bundle analysis: `npm run build:analyze`
2. Review lazy-loaded components
3. Consider manual chunking in `vite.config.ts`

### Import Conflicts
To resolve dynamic/static import conflicts:
1. Remove static imports for lazy-loaded components
2. Use consistent import strategy
3. Consider component registry pattern

## Log Files

Build monitor logs are saved to:
```
/tmp/build-monitor-YYYYMMDD-HHMMSS.log
```

Each log contains:
- Full build output
- Timestamps for each step
- Error and warning details
- Bundle size information

## Best Practices

1. **Regular Monitoring**: Run `npm run build:monitor` before deployments
2. **Watch Mode**: Use `npm run build:watch` during development
3. **Check Warnings**: Address import conflicts for better code-splitting
4. **Bundle Analysis**: Use `npm run build:analyze` to identify optimization opportunities
5. **Review Logs**: Check log files for detailed build information

---

**Last Updated**: $(date)
**Build Status**: ✅ Operational

