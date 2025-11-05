# Telemedicine Component - Test Checklist

## ✅ Component Integration Tests

### 1. Navigation & Initial Load
- [ ] Navigate to "Telemedicine" tab in the main navigation
- [ ] Verify component loads without errors
- [ ] Verify existing scheduled session (tele-001) is displayed
- [ ] Verify existing completed session (tele-002) is displayed
- [ ] Verify "Schedule Session" and "Start Immediate Call" buttons are visible

### 2. Schedule Session Functionality
- [ ] Click "Schedule Session" button
- [ ] Modal opens correctly
- [ ] Test video/phone type selection (both buttons work)
- [ ] Fill in date field (future date)
- [ ] Fill in time field
- [ ] Enter provider name
- [ ] Select duration (15/30/45/60 minutes)
- [ ] Add optional notes
- [ ] Click "Schedule" button
- [ ] Verify session appears in "Scheduled Sessions" section
- [ ] Verify modal closes
- [ ] Check patient timeline - session should appear there

### 3. Start Immediate Call
- [ ] Click "Start Immediate Call" button
- [ ] Verify call interface appears
- [ ] Verify timer starts counting (format: MM:SS)
- [ ] Verify patient video panel shows patient name
- [ ] Verify provider video panel shows provider name
- [ ] Verify call controls are visible (Mic, Video, Chat buttons)

### 4. Call Controls During Active Call
- [ ] Click Mic button - verify it toggles mute/unmute (red when muted)
- [ ] Click Video button - verify it toggles video on/off (red when off, shows VideoOff icon)
- [ ] Verify timer continues counting
- [ ] Click "End Call" button
- [ ] Verify call ends
- [ ] Verify session appears in "Completed Sessions" section
- [ ] Verify duration is calculated and displayed (e.g., "1 min")
- [ ] Check patient timeline - completed session should appear

### 5. Start Scheduled Session
- [ ] Schedule a session for today's date or earlier
- [ ] Verify "Start" button appears on the scheduled session
- [ ] Click "Start" button on scheduled session
- [ ] Verify call interface opens with correct provider name
- [ ] Verify timer starts
- [ ] End the call
- [ ] Verify session status changes to "completed"

### 6. Cancel Session
- [ ] Find a scheduled session
- [ ] Click trash icon (cancel button)
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel" in dialog - verify session remains
- [ ] Click trash icon again
- [ ] Click "OK" in confirmation dialog
- [ ] Verify session status changes to "cancelled"
- [ ] Verify cancelled session is removed from scheduled list

### 7. Session Display & Organization
- [ ] Verify scheduled sessions show correct date, time, provider, duration
- [ ] Verify completed sessions show correct information
- [ ] Verify sessions are sorted correctly (scheduled first, then completed)
- [ ] Verify only first 5 completed sessions are shown
- [ ] Verify "No telemedicine sessions scheduled" message appears when no sessions exist

### 8. Form Validation
- [ ] Try to submit schedule form without date - verify validation error
- [ ] Try to submit without time - verify validation error
- [ ] Try to submit without provider - verify validation error
- [ ] Verify all required fields work correctly

### 9. Dark Mode Compatibility
- [ ] Toggle dark mode
- [ ] Verify all UI elements are visible and styled correctly
- [ ] Verify call interface looks good in dark mode
- [ ] Verify modal looks good in dark mode

### 10. Responsive Design
- [ ] Resize browser window to mobile size
- [ ] Verify call interface adapts (video panels stack vertically)
- [ ] Verify buttons and controls are accessible
- [ ] Verify modal is scrollable on small screens

## ✅ Integration Tests

### 11. Timeline Integration
- [ ] Schedule a new session
- [ ] Navigate to Timeline tab
- [ ] Verify telemedicine session appears in timeline
- [ ] Complete a call
- [ ] Verify completed session appears in timeline with duration

### 12. State Management
- [ ] Schedule multiple sessions
- [ ] Verify all sessions are stored correctly
- [ ] Start and end multiple calls
- [ ] Verify call history is maintained
- [ ] Refresh page (if state persists) or verify state management

## Expected Results Summary

✅ **All core functionality should work:**
- Session scheduling with form validation
- Immediate call initiation
- Call controls (mute, video toggle)
- Call timer with accurate duration
- Session status management (scheduled → in-progress → completed)
- Session cancellation
- Timeline integration
- Responsive design
- Dark mode support

## Known Features
- Call duration timer updates every second
- Duration is calculated when call ends
- Sessions are automatically added to timeline
- Only eligible scheduled sessions show "Start" button
- Confirmation required before cancelling sessions

