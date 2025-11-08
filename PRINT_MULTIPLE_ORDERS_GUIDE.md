# 🖨️ How to Print Multiple Imaging Orders

## Quick Steps

### Method 1: Print Selected Studies (Bulk Print)

1. **Select Multiple Studies**
   - Go to the **Imaging** tab
   - Check the checkbox next to each study you want to print
   - You can select studies from any status (pending, completed, cancelled)

2. **Print Selected**
   - A blue bar will appear at the top showing how many studies are selected
   - Click the **"Print Selected"** button (printer icon) in the bulk actions bar
   - A print preview window will open with all selected studies

3. **Review and Print**
   - The preview shows:
     - Organization header
     - Patient information
     - All selected studies numbered sequentially
     - Each study on its own section (with page breaks)
     - Signature line at the bottom
   - Click **"Print"** in the preview window
   - Your browser's print dialog will open

### Method 2: Print Individual Study

1. **Find the Study**
   - Navigate to the Imaging tab
   - Find the study you want to print

2. **Print Single Study**
   - Click the **printer icon** button next to the study
   - Print preview opens for that single study
   - Click "Print" to print

---

## Features

### Bulk Print Includes:
- ✅ All selected studies in one document
- ✅ Patient information header (name, DOB, ID)
- ✅ Each study numbered (#1, #2, #3, etc.)
- ✅ Study details: Type, Modality, Body Part, Date
- ✅ Clinical indications/findings (if available)
- ✅ Ordering physician information (if assigned)
- ✅ Page breaks between studies (each study starts on new page)
- ✅ Professional formatting with organization branding

### Print Format:
- **Page Size**: Letter (8.5" x 11")
- **Margins**: 0.75 inches
- **Layout**: Each study gets its own section
- **Page Breaks**: Automatic between studies
- **Header**: Organization name and details
- **Footer**: Generation timestamp and organization footer

---

## Tips

1. **Select Multiple Studies**
   - Use checkboxes on the left side of each study row
   - You can select studies from different statuses
   - Selected count shows in the blue bar

2. **Clear Selection**
   - Click "Clear selection" to deselect all
   - Or uncheck individual studies

3. **Filter Before Selecting**
   - Use status filter to show only "Pending" studies
   - Use modality filter to show only "CT" studies, etc.
   - Then select and print only what you need

4. **Print Preview**
   - Always review the preview before printing
   - Check that all studies are included
   - Verify patient information is correct

---

## Use Cases

### Scenario 1: Print All Pending Orders
1. Filter by "Pending" status
2. Select all (or specific ones)
3. Click "Print Selected"
4. Print for filing or sending to radiology department

### Scenario 2: Print Multiple Completed Reports
1. Filter by "Completed" status
2. Select the reports you need
3. Click "Print Selected"
4. Print for patient records or referrals

### Scenario 3: Print Orders for Specific Date Range
1. Use search/filter to find studies by date
2. Select the studies you need
3. Click "Print Selected"
4. Print for documentation

---

## Technical Details

- **Print Technology**: Browser print dialog
- **Format**: HTML with print-optimized CSS
- **Page Breaks**: Automatic between studies
- **Print Preview**: Uses PrintPreview component
- **Print Handler**: Uses `openPrintWindow` utility

---

## Troubleshooting

### Print Preview Doesn't Open
- Check browser popup blocker settings
- Try clicking the print button again
- Check browser console for errors

### Studies Missing from Print
- Make sure studies are selected (checkboxes checked)
- Verify studies are visible in the list (check filters)
- Try refreshing the page

### Print Formatting Issues
- Use browser's print preview to adjust settings
- Check page size is set to "Letter"
- Adjust margins if needed in print dialog

---

**Happy Printing! 🖨️📄**

