# Troubleshooting Browser-Related Errors

## Chrome Extension Errors

### Error: `net::ERR_FILE_NOT_FOUND` for chrome-extension:// URLs

**What it means:**
This error indicates a Chrome browser extension is trying to load a file that doesn't exist. This is **NOT an error in your application** - it's a browser extension issue.

**Example:**
```
GET chrome-extension://pejdijmoenmkgeppbflobdenhhabjlaj/extensionState.js net::ERR_FILE_NOT_FOUND
```

**Why it happens:**
- Extension is corrupted or improperly installed
- Extension update introduced a missing file
- Extension files were deleted or moved
- Browser cache issue

**Impact on your application:**
- ✅ **No impact** - This error doesn't affect your app's functionality
- ⚠️ **Console noise** - May clutter browser console, making debugging harder
- ⚠️ **Performance** - Extension retries may cause minor performance impact

**How to fix:**

1. **Identify the extension:**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Look for extension with ID: `pejdijmoenmkgeppbflobdenhhabjlaj`
   - Check for error messages on the extension tile

2. **Quick fixes:**
   - **Disable and re-enable** the extension
   - **Reload** the extension (if developer mode is on)
   - **Update** the extension from Chrome Web Store

3. **If that doesn't work:**
   - **Remove** the extension completely
   - **Reinstall** from Chrome Web Store
   - **Update Chrome** to latest version

4. **To ignore (if extension works fine):**
   - This error is harmless if the extension functions normally
   - You can filter it out in DevTools console filters

---

## Other Common Browser Console Errors

### CORS Errors

**Error:**
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix:**
- Check backend CORS configuration
- Verify `CORS_ORIGIN` in backend `.env` includes frontend URL
- See `TROUBLESHOOTING_FETCH_ERRORS.md`

---

### Mixed Content Warnings

**Error:**
```
Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
```

**Fix:**
- Use HTTPS for both frontend and backend in production
- Or use HTTP for both in development
- Update API base URL to match protocol

---

### Service Worker Errors

**Error:**
```
Failed to register a ServiceWorker: The script has an unsupported MIME type
```

**Fix:**
- Check if service worker is needed (this app doesn't use one)
- Clear service worker cache: DevTools → Application → Service Workers → Unregister

---

### Extension Conflicts

**Symptoms:**
- App works in incognito but not normal mode
- Random errors that don't make sense
- Features not working

**Fix:**
1. Test in incognito mode (extensions disabled)
2. If works in incognito, disable extensions one by one
3. Common culprits: Ad blockers, privacy extensions, developer tools

---

## Filtering Console Errors

### In Chrome DevTools:

1. **Open Console** (F12)
2. **Click filter icon** (funnel icon)
3. **Add negative filter:**
   ```
   -chrome-extension://
   ```
4. This hides all extension-related errors

### Or use Console Settings:

1. Click **Settings** (gear icon) in console
2. Enable **"Hide network messages"**
3. Or add custom filter to hide extension errors

---

## Best Practices

### For Development:

1. **Use incognito mode** for testing (fewer extension conflicts)
2. **Filter console** to hide extension errors
3. **Disable unnecessary extensions** during development
4. **Use browser extensions** that don't interfere with localhost

### For Production:

1. **Monitor real user errors** (not extension errors)
2. **Use error tracking** (Sentry) to filter out browser noise
3. **Document known browser issues** for support team
4. **Test in multiple browsers** and clean profiles

---

## Extension IDs to Watch For

Common extensions that may cause console noise:

- **Ad blockers**: Various IDs (uBlock Origin, AdBlock Plus, etc.)
- **Privacy extensions**: Ghostery, Privacy Badger
- **Developer tools**: React DevTools, Redux DevTools
- **Password managers**: LastPass, 1Password
- **Translation tools**: Google Translate

**Note:** Extension IDs can change, so focus on the error pattern, not specific IDs.

---

## When to Worry

### ✅ Safe to Ignore:
- `chrome-extension://` errors
- Extension-related 404s
- Extension console warnings
- Mixed content warnings (if using HTTP in dev)

### ⚠️ Investigate:
- Errors from your domain (`localhost:5173`, `yourdomain.com`)
- API errors (`localhost:3000/api`)
- Application JavaScript errors
- Network errors to your backend

### 🚨 Fix Immediately:
- Authentication errors
- Data loss errors
- Security warnings
- CORS errors in production

---

## Quick Reference

| Error Type | Source | Action |
|------------|--------|--------|
| `chrome-extension://` 404 | Browser Extension | Ignore or fix extension |
| `localhost:3000` errors | Your Backend | Check backend status |
| `localhost:5173` errors | Your Frontend | Check frontend code |
| CORS errors | Backend Config | Update CORS settings |
| Network errors | Connection | Check if backend is running |

---

## Testing Without Extension Interference

### Method 1: Incognito Mode
```bash
# Chrome
Ctrl+Shift+N (Windows/Linux)
Cmd+Shift+N (Mac)

# Or use command line
google-chrome --incognito
```

### Method 2: Clean Profile
```bash
# Create new Chrome profile
# Settings → People → Add person
# Use this profile only for development
```

### Method 3: Disable Extensions
1. Go to `chrome://extensions/`
2. Disable all extensions
3. Test your app
4. Re-enable one by one to find conflicts

---

## Summary

**Chrome extension errors are NOT your application's problem.** They're browser-level issues that:
- Don't affect app functionality
- Can be safely ignored
- Can be filtered out in console
- Should be fixed by updating/reinstalling the extension

Focus your debugging efforts on errors from:
- Your frontend (`localhost:5173` or your domain)
- Your backend (`localhost:3000/api` or your API domain)
- Your application code

---

**Related Documents:**
- `TROUBLESHOOTING_FETCH_ERRORS.md` - API connection issues
- `TROUBLESHOOTING_AUTH_ERRORS.md` - Authentication problems
- `DEBUG_GUIDE.md` - General debugging guide

