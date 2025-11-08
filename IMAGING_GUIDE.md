# 📸 Imaging Studies - Order & View Results Guide

## 🚀 Frontend is Running!

**Access the application at:** http://localhost:5173

---

## 📋 How to Order Multiple Imaging Studies

### Step 1: Navigate to Imaging Tab
1. Log in to the application
2. Select a patient from the patient list
3. Click on the **"Imaging"** tab in the sidebar (under Diagnostics group)
   - Look for the scan icon 🔍

### Step 2: Order Single or Multiple Studies

#### Option A: Order One Study (Quick)
1. Click **"Order Imaging Study"** button (top right)
2. Fill in the form:
   - **Quick Select**: Click any common study type (CT Head, MRI Brain, etc.)
   - **Study Type**: e.g., "CT Head"
   - **Modality**: CT, MRI, X-Ray, Ultrasound, or PET
   - **Body Part**: e.g., "Head", "Chest", "Abdomen"
   - **Study Date**: Select date
   - **Clinical Indication**: Optional notes
   - **Status**: Pending, Completed, or Cancelled
3. Click **"Order Study"**

#### Option B: Order Multiple Studies (New Feature!)
1. Click **"Order Imaging Study"** button
2. Fill in the first study details
3. Click **"Add Another"** button (bottom left)
   - The study is added to your order list
   - Form resets for the next study
4. Repeat steps 2-3 for each additional study
5. Review your list at the top of the form
6. Click **"Order X Studies"** to submit all at once

**Visual Indicators:**
- ✅ List of studies appears at top of form
- ✅ Count shows in modal title: "Order Imaging Studies (3)"
- ✅ Each study shows: Type, Modality, Body Part, Date
- ✅ Remove individual studies with X button
- ✅ Clear all with "Clear All" button

---

## 👀 Where to View Results

### Tab 1: "All Studies" Tab
- Shows **all** imaging orders regardless of status
- Includes: Pending, Completed, and Cancelled studies
- Use filters to narrow down:
  - **Status Filter**: All, Pending, Completed, Cancelled
  - **Modality Filter**: All, CT, MRI, X-Ray, Ultrasound, PET
  - **Search**: By study type, body part, modality, or findings

### Tab 2: "Completed" Tab
- Shows **only completed** studies with results
- Quick access to viewable imaging results
- Click **"View"** button (eye icon) to open image viewer

---

## 🖼️ Viewing Imaging Results

### For Completed Studies:

1. **Navigate to Completed Tab** or filter by "Completed" status
2. **Click "View" button** (eye icon 👁️) on any completed study
3. **Image Viewer Opens** with:
   - Full-screen dark viewer
   - Study information header
   - Image display area
   - Controls toolbar:
     - **Zoom Out** (-)
     - **Zoom Level** (50% - 200%)
     - **Zoom In** (+)
     - **Rotate** button
     - **Download** button
   - **Radiology Report Panel** at bottom showing findings

### Additional Features:
- **Compare Studies**: Click the columns icon (📊) to compare two studies side-by-side
- **Print Report**: Click printer icon to print radiology report
- **Download Report**: If report URL is provided, download button available
- **Bulk Actions**: Select multiple studies with checkboxes for bulk status updates

---

## 🎯 Quick Reference

### Common Imaging Studies Available:
- **CT**: Head, Chest, Abdomen, Pelvis
- **MRI**: Brain, Spine, Knee
- **X-Ray**: Chest, Abdominal, Extremity
- **Ultrasound**: Abdominal, Pelvic, Cardiac Echo
- **PET**: Whole Body Scan

### Status Types:
- **Pending**: Study ordered, awaiting completion
- **Completed**: Study done, results available
- **Cancelled**: Study cancelled

### Actions Available:
- ✅ Order single or multiple studies
- ✅ View completed study images
- ✅ Compare two studies
- ✅ Print imaging requests/reports
- ✅ Download reports (if URL provided)
- ✅ Bulk update status
- ✅ Search and filter studies
- ✅ Delete studies (admin/physician/radiologist only)

---

## 🔧 Technical Details

### Frontend Location:
- Component: `src/components/ViewImaging.tsx`
- Route: Available in Dashboard → Imaging tab
- API Service: `src/services/imaging-studies.ts`

### Backend Endpoints:
- `GET /api/v1/patients/:patientId/imaging-studies` - Get all studies
- `POST /api/v1/patients/:patientId/imaging-studies` - Create study
- `PUT /api/v1/patients/:patientId/imaging-studies/:studyId` - Update study
- `DELETE /api/v1/patients/:patientId/imaging-studies/:studyId` - Delete study

---

## 🎨 UI Features

### Visual Indicators:
- **Modality Badges**: Color-coded (CT=teal, MRI=purple, X-Ray=green, etc.)
- **Status Badges**: Color-coded (Completed=green, Pending=yellow, Cancelled=red)
- **Bulk Selection**: Checkboxes for selecting multiple studies
- **Responsive Design**: Works on desktop and mobile

### Keyboard Shortcuts:
- Click outside modal to close
- ESC key closes modals (if implemented)

---

## 🐛 Troubleshooting

### If studies don't appear:
1. Check backend is running: `curl http://localhost:3000/health`
2. Check browser console for errors
3. Verify patient is selected
4. Check network tab for API calls

### If ordering fails:
1. Ensure all required fields are filled (Type, Modality, Body Part, Date)
2. Check backend logs
3. Verify database connection

### If images don't load:
- Currently shows placeholder (DICOM viewer integration needed)
- Report/findings text should still display

---

## 📝 Notes

- Multiple orders are submitted in parallel (Promise.all)
- Form validation ensures required fields before submission
- Studies are sorted by date (newest first)
- All dates are stored in ISO format
- Reports can include URLs for external DICOM viewers

---

**Happy Ordering! 🏥📸**

