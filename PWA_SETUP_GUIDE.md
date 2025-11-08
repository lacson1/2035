# PWA Setup Guide

This guide explains how to set up and configure the Progressive Web App (PWA) features for Bluequee2.0.

## Features Implemented

✅ **Offline Capability**
- Service worker with advanced caching strategies
- Offline page served when network unavailable
- Background sync for failed requests
- Cached API responses and static assets

✅ **Installable on Mobile Devices**
- Web App Manifest with proper metadata
- PWA installation prompts
- App shortcuts and splash screen
- iOS and Android support

✅ **Push Notifications**
- Push notification subscription management
- Permission handling
- Custom notification actions
- Background message handling

✅ **Service Worker Implementation**
- Custom service worker with Workbox integration
- Runtime caching strategies
- Background sync and periodic updates
- Push event handling

## Environment Setup

### 1. VAPID Keys for Push Notifications

Push notifications require VAPID (Voluntary Application Server Identification) keys. Generate them using one of these methods:

#### Option A: Using web-push CLI
```bash
npm install -g web-push
web-push generate-vapid-keys
```

#### Option B: Using Node.js
```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);
```

#### Option C: Using an online generator
Visit: https://vapidkeys.com/ or https://tools.reactpwa.com/vapid

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# VAPID Keys for Push Notifications
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

### 3. Backend Push Notification Setup

The backend needs to handle push notification subscriptions and sending. Implement these endpoints:

#### Save Subscription
```
POST /api/push/subscribe
Body: { endpoint, keys: { p256dh, auth } }
```

#### Remove Subscription
```
POST /api/push/unsubscribe
Body: { endpoint }
```

#### Send Notification
```
POST /api/push/send
Body: { subscription, payload }
```

#### Example Backend Implementation (Node.js/Express)
```javascript
const webpush = require('web-push');

// Set VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification
app.post('/api/push/send', async (req, res) => {
  const { subscription, payload } = req.body;

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Push notification failed:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});
```

## Building and Testing

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Testing PWA Features

1. **Installation Testing:**
   - Open the app in Chrome/Edge
   - Look for the install prompt in the address bar
   - Or use the PWA Settings component to install

2. **Offline Testing:**
   - Open DevTools → Network tab
   - Check "Offline" checkbox
   - Navigate around the app
   - Should see cached content and offline page

3. **Push Notification Testing:**
   - Use the PWA Settings component
   - Grant notification permission
   - Subscribe to notifications
   - Click "Test Notification"

4. **Lighthouse Audit:**
   - Open DevTools → Lighthouse
   - Run PWA audit
   - Should score 100% on PWA metrics

## Browser Support

- **Chrome/Edge**: Full PWA support
- **Firefox**: Limited PWA support (no install prompts)
- **Safari**: PWA support on iOS 11.3+, macOS 10.14+
- **Mobile browsers**: Full support on Android Chrome, iOS Safari

## Service Worker Cache Strategies

The PWA implements several caching strategies:

1. **API Routes**: NetworkFirst with background sync
2. **Images**: CacheFirst with 30-day expiration
3. **Google Fonts**: StaleWhileRevalidate
4. **Static Assets**: Precached by Workbox

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Ensure HTTPS in production
   - Check console for registration errors
   - Verify service worker file exists at `/sw.js`

2. **Push Notifications Not Working**
   - Verify VAPID keys are correct
   - Check notification permissions
   - Ensure backend endpoints are implemented

3. **PWA Not Installable**
   - Verify manifest.json is served correctly
   - Check that site is served over HTTPS
   - Ensure service worker is registered

4. **Offline Not Working**
   - Check service worker is active
   - Verify cache strategies are working
   - Test with DevTools Network offline mode

### Debug Commands

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service workers:', registrations);
});

// Check push subscription
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.getSubscription().then(subscription => {
    console.log('Push subscription:', subscription);
  });
});

// Clear all caches
caches.keys().then(names => {
  names.forEach(name => {
    caches.delete(name);
  });
});
```

## Performance Optimization

- **Bundle Splitting**: Vendor and UI chunks separated
- **Code Splitting**: Routes and components lazy-loaded
- **Caching**: Aggressive caching with proper expiration
- **Compression**: Enable gzip/brotli on server

## Security Considerations

- VAPID keys should be kept secure
- Push notification payloads should be validated
- HTTPS is required for service workers and push notifications
- Content Security Policy should allow service worker scripts
