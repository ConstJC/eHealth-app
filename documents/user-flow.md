# User Flow Documentation

## Overview

This document outlines the complete user journey through eHealth EMR, detailing how different user roles interact with the system during daily clinic operations. Each flow is designed to minimize clicks, reduce documentation time, and ensure accurate medical record keeping.

## User Roles and Responsibilities

### Admin
- Full system access
- User account management
- System configuration
- Audit log review
- Backup management

### Doctor
- Patient consultations
- Medical documentation
- Prescription writing
- Diagnosis recording
- Report generation

### Nurse
- Vital signs recording
- Patient registration assistance
- Basic visit documentation
- Prescription viewing

### Receptionist
- Patient registration
- Appointment scheduling (future)
- Billing and payment processing
- Report printing

## Initial User Journey

### System Access and Authentication

**First-Time User Setup (Admin creates accounts):**

1. **Admin Creates User Account**
   - Navigate to Users Management
   - Click "Add New User"
   - Enter user details:
     - Email address
     - Full name
     - Role selection (Doctor, Nurse, Receptionist)
     - Assigned patients (if applicable)
   - System sends email verification link
   - User receives welcome email with temporary password

2. **User First Login**
   - User receives email with login link
   - Click "Verify Email" button in email
   - Redirected to Set Password page
   - Create strong password (min 8 chars, uppercase, number, symbol)
   - Password strength indicator provides feedback
   - Submit and automatically logged in
   - Redirect to role-specific dashboard

3. **Subsequent Logins**
   - Navigate to login page
   - Enter email and password
   - Optional: "Remember Me" checkbox
   - Click "Sign In"
   - Redirect to dashboard
   - Session expires after 30 minutes of inactivity

4. **Password Reset Flow**
   - Click "Forgot Password?" on login page
   - Enter registered email
   - Receive password reset email (within 2 minutes)
   - Click reset link (valid for 1 hour)
   - Enter new password twice
   - Confirmation message
   - Redirect to login with new password

## Core Workflows

### 1. Patient Registration Flow

**Performed by: Receptionist, Nurse, or Doctor**

**Scenario: New Patient Arrives at Clinic**

1. **Initiate Registration**
   - Click "Patients" in sidebar
   - Click "Add New Patient" button
   - Registration form opens

2. **Enter Patient Information**
   
   **Step 1: Basic Information**
   - First Name (required)
   - Last Name (required)
   - Date of Birth (date picker)
   - Gender (dropdown: Male, Female, Other)
   - Phone Number (required, validation for format)
   - Email (optional)
   - Address (optional)
   - Real-time validation feedback

   **Step 2: Emergency Contact**
   - Emergency contact name
   - Emergency contact phone
   - Relationship to patient
   
   **Step 3: Medical History**
   - Known allergies (multi-select or free text)
   - Chronic conditions (multi-select)
   - Current medications
   - Past surgeries
   - Family medical history (optional)
   
   **Step 4: Insurance (Optional)**
   - Insurance provider
   - Insurance number
   - Insurance expiry date

   **Step 5: Photo (Optional)**
   - Upload patient photo
   - Drag-and-drop or click to browse
   - Image preview before upload
   - Crop and adjust (if needed)

3. **Save Patient**
   - Click "Register Patient"
   - System validates all required fields
   - Patient ID auto-generated (e.g., P2024-00001)
   - Success message displayed
   - Redirect to patient profile
   - Option to "Create Visit" immediately

**Estimated Time: 2-3 minutes for complete registration**

### 2. Patient Search Flow

**Performed by: All Users**

**Scenario: Looking for Existing Patient**

1. **Quick Search**
   - Navigate to Patients page
   - Search box prominent at top
   - Begin typing patient name, ID, or phone
   - Real-time search results appear below
   - Results show: Photo, Name, ID, Age, Last Visit
   - Recent patients displayed by default

2. **Advanced Search**
   - Click "Advanced Filters" button
   - Filter options expand:
     - Date of birth range
     - Gender
     - Registration date range
     - Assigned doctor
     - Active/Inactive status
   - Apply filters
   - Results update automatically
   - Export option available (CSV/PDF)

3. **Select Patient**
   - Click on patient card
   - Navigate to patient detail page
   - View complete patient information
   - Access quick actions:
     - Create Visit
     - View History
     - Edit Information
     - Generate Reports

### 3. Consultation and Visit Documentation Flow

**Performed by: Doctor (with Nurse assistance for vitals)**

**Scenario: Patient Arrives for Consultation**

**Phase 1: Visit Creation (Nurse/Receptionist)**

1. **Initiate Visit**
   - Search and select patient
   - Click "Create Visit" button
   - Visit form opens
   
2. **Basic Visit Information**
   - Visit type auto-selected (Routine)
   - Visit date/time auto-populated (now)
   - Doctor assignment (dropdown or auto-assigned)
   - Status: "In Progress"

3. **Record Vital Signs**
   - Blood Pressure: Systolic / Diastolic
   - Heart Rate (BPM)
   - Temperature (°C or °F toggle)
   - Respiratory Rate
   - Oxygen Saturation (SpO2 %)
   - Weight (kg or lbs)
   - Height (cm or inches)
   - BMI auto-calculated
   - Pain Scale (0-10 slider)
   - Timestamp and "Recorded By" auto-filled
   - System flags abnormal values (red indicator)

4. **Preliminary Information**
   - Chief Complaint (free text)
   - Patient's description of symptoms
   - Save and notify doctor
   - Visit appears in doctor's queue

**Phase 2: Doctor Consultation**

1. **Doctor Accesses Visit**
   - View pending visits on dashboard
   - Click on patient visit
   - Patient info and vital signs visible
   - Previous visit history on sidebar

2. **SOAP Note Documentation**

   **Subjective Section:**
   - Review chief complaint entered by nurse
   - Add history of present illness
   - Review of systems checklist:
     - Constitutional (fever, fatigue, weight change)
     - Cardiovascular
     - Respiratory
     - Gastrointestinal
     - etc.
   - Quick checkboxes for "normal" or details for abnormalities

   **Objective Section:**
   - Review vital signs
   - Physical examination findings
   - Systematic examination:
     - General appearance
     - Head and neck
     - Cardiovascular
     - Respiratory
     - Abdomen
     - Extremities
     - Neurological
   - Template options for common findings
   - Free text for specific observations

   **Assessment Section:**
   - Primary diagnosis (searchable dropdown)
   - ICD-10 code (future enhancement)
   - Differential diagnoses (if applicable)
   - Clinical impressions
   - Severity assessment

   **Plan Section:**
   - Treatment recommendations
   - Medications (link to prescription creation)
   - Follow-up instructions
   - Referrals if needed
   - Patient education notes
   - Lab tests ordered (if applicable)

3. **Create Prescriptions**
   - Click "Add Prescription" within visit
   - Search medication database
   - Select medication
   - Specify:
     - Dosage (e.g., "500mg")
     - Frequency (dropdown: once daily, twice daily, etc.)
     - Route (oral, topical, injection, etc.)
     - Duration (days/weeks)
     - Quantity to dispense
     - Special instructions
   - System checks:
     - Allergy cross-reference (alerts if conflict)
     - Drug interaction warnings
     - Duplicate therapy check
   - Add to prescription list
   - Repeat for multiple medications

4. **Finalize Visit**
   - Review all documentation
   - Option to preview printable summary
   - Click "Complete Visit"
   - System prompts: "Sign and lock notes?"
   - Confirm to lock (prevents future edits)
   - Visit status changes to "Completed"
   - Redirect to billing (if enabled) or dashboard

**Estimated Time: 5-8 minutes for standard consultation**

### 4. Prescription Management Flow

**Performed by: Doctor**

**Scenario: Prescribing Medication**

1. **During Visit (Primary Method)**
   - As described in consultation flow
   - Prescriptions linked to visit
   - Auto-included in visit summary

2. **Standalone Prescription (Refills)**
   - Navigate to patient profile
   - Click "Prescriptions" tab
   - View active and past prescriptions
   - Click "Renew Prescription"
   - Review and modify if needed
   - Save new prescription
   - Increment refill count

3. **Print Prescription**
   - From visit page or prescriptions list
   - Click "Print" icon
   - Prescription formatted with:
     - Patient information
     - Doctor information
     - Medication details
     - Signature line
     - Date issued
   - Print or save as PDF

4. **Discontinue Medication**
   - Navigate to patient's active prescriptions
   - Select prescription
   - Click "Discontinue"
   - Enter reason (dropdown + free text)
   - Confirm discontinuation
   - Status changes to "Discontinued"
   - Audit log updated

### 5. Billing and Payment Flow

**Performed by: Receptionist or Doctor**

**Scenario: Patient Pays for Consultation**

1. **Create Invoice**
   
   **Option A: Automatic from Visit**
   - After visit completion
   - System prompts: "Create Invoice?"
   - Pre-populated with consultation fee
   - Proceed to invoice editing

   **Option B: Manual Invoice Creation**
   - Navigate to patient profile
   - Click "Billing" tab
   - Click "Create Invoice"
   - Select visit (if applicable)

2. **Add Service Items**
   - Pre-populated: Consultation Fee
   - Click "Add Item" for additional services
   - Enter:
     - Service description
     - Quantity
     - Unit price
     - Total auto-calculated
   - Common services dropdown:
     - Procedures
     - Lab tests
     - Imaging
     - Medical certificates
   - Custom service entry option

3. **Apply Adjustments**
   - Subtotal calculated automatically
   - Add discount:
     - Percentage or fixed amount
     - Reason for discount (dropdown)
   - Add tax (if applicable)
   - Insurance deduction (if applicable)
   - Grand total updates in real-time

4. **Process Payment**
   
   **Full Payment:**
   - Select payment method:
     - Cash
     - Credit/Debit Card
     - Mobile Payment (GCash, PayMaya)
     - Bank Transfer
   - Enter amount
   - Click "Record Payment"
   - Receipt auto-generated
   - Invoice status: "Paid"
   - Option to print receipt

   **Partial Payment:**
   - Enter partial amount
   - Select payment method
   - Click "Record Partial Payment"
   - Outstanding balance calculated
   - Invoice status: "Partially Paid"
   - Payment logged in history

   **Insurance/Deferred Payment:**
   - Select "Bill to Insurance" or "Pay Later"
   - Invoice status: "Unpaid"
   - Outstanding balance tracked
   - Appears in receivables report

5. **Receipt and Confirmation**
   - Receipt displayed on screen
   - Receipt includes:
     - Invoice number
     - Date and time
     - Itemized services
     - Payment amount
     - Payment method
     - Receipt number
   - Print or email to patient
   - Return to dashboard or patient profile

### 6. Reports Generation Flow

**Performed by: All Users (role-dependent access)**

**Scenario: Generating Daily Revenue Report**

1. **Access Reports**
   - Click "Reports" in sidebar
   - Report categories displayed:
     - Clinical Reports
     - Financial Reports
     - Administrative Reports

2. **Select Report Type**
   - Click "Financial Reports"
   - Select "Daily Revenue Report"

3. **Configure Report Parameters**
   - Date selection (calendar picker)
   - Additional filters:
     - Payment method
     - Doctor (for doctor-specific revenue)
     - Service type
   - Click "Generate Report"

4. **View Report**
   - Report loads on screen
   - Summary statistics at top:
     - Total revenue
     - Number of transactions
     - Average transaction value
   - Detailed breakdown:
     - By payment method
     - By service type
     - By doctor
   - Visual charts/graphs

5. **Export or Print**
   - Export options:
     - PDF (formatted for printing)
     - Excel (for analysis)
     - CSV (for import to other systems)
   - Print directly from browser
   - Email report (future feature)

**Clinical Report Example: Medical Certificate**

1. **From Visit or Patient Profile**
   - Click "Generate Report"
   - Select "Medical Certificate"

2. **Fill Certificate Details**
   - Patient info pre-filled
   - Select certificate type:
     - Fit to work
     - Sick leave
     - Medical clearance
   - Enter dates (from - to)
   - Add diagnosis/reason (optional)
   - Additional notes

3. **Preview and Print**
   - Preview certificate
   - Clinic letterhead displayed
   - Doctor signature line
   - Print or save as PDF

### 7. Patient History Review Flow

**Performed by: Doctor, Nurse**

**Scenario: Reviewing Patient's Medical History**

1. **Access Patient Profile**
   - Search and select patient
   - Patient detail page opens

2. **Navigate History Sections**
   
   **Tabs Available:**
   - Overview (summary dashboard)
   - Visits (chronological list)
   - Prescriptions (active and past)
   - Lab Results (future)
   - Documents (uploaded files)
   - Billing (financial history)

3. **Review Visit History**
   - Click "Visits" tab
   - All visits displayed chronologically (newest first)
   - Each visit card shows:
     - Date
     - Doctor
     - Chief complaint
     - Diagnosis
     - "View Details" button
   - Filter by date range
   - Search within visits

4. **View Visit Details**
   - Click "View Details" on any visit
   - Full SOAP notes displayed
   - Vital signs at time of visit
   - Prescriptions issued
   - Related billing
   - Documents attached
   - Audit trail (who created/modified)

5. **Compare Trends**
   - Vital signs trends visible
   - Graph showing BP, weight changes over time
   - Prescription history timeline
   - Diagnosis pattern recognition

## Administrative Workflows

### User Management Flow

**Performed by: Admin**

**Scenario: Adding New Doctor to System**

1. **Access User Management**
   - Click "Settings" or "Admin" in sidebar
   - Select "User Management"
   - List of all users displayed

2. **Create New User**
   - Click "Add User"
   - Fill form:
     - Email (username)
     - First Name
     - Last Name
     - Role (Doctor)
     - Phone (optional)
   - Generate temporary password (option)
   - Click "Create User"

3. **Configure Permissions**
   - Select newly created user
   - Role-based permissions auto-applied
   - Custom permissions (if needed):
     - Can view all patients
     - Can edit billing
     - Can generate reports
     - Can manage users (admin only)
   - Save permissions

4. **Send Invitation**
   - System sends email verification
   - User receives welcome email
   - Instructions for first login

5. **Manage Existing Users**
   - View all users list
   - Filter by role, status
   - Edit user details
   - Deactivate user (soft delete)
   - Reactivate user
   - Reset password
   - View user activity log

### Audit Log Review Flow

**Performed by: Admin**

**Scenario: Reviewing System Access Logs**

1. **Access Audit Logs**
   - Navigate to "Audit Logs" in admin section
   - Recent activity displayed by default

2. **Filter Logs**
   - Filter options:
     - Date range
     - User
     - Action type (login, patient access, data modification)
     - Entity type (patient, visit, user)
   - Apply filters
   - Results update

3. **Review Details**
   - Each log entry shows:
     - Timestamp
     - User who performed action
     - Action type
     - Entity affected
     - IP address
     - Device/browser info
   - Click for detailed view
   - View before/after values for data changes

4. **Export Logs**
   - Select date range
   - Export for compliance review
   - Format: CSV or PDF
   - Include all details

### Data Backup Flow

**Performed by: Admin**

**Scenario: Manual Backup Before Major Update**

1. **Access Backup Settings**
   - Navigate to "Settings" > "Backup"
   - View backup schedule
   - View recent backups list

2. **Initiate Manual Backup**
   - Click "Create Backup Now"
   - Backup type:
     - Full (database + files)
     - Database only
   - Add description/note
   - Click "Start Backup"

3. **Monitor Progress**
   - Progress bar displays
   - Estimated time shown
   - Can continue using system
   - Notification when complete

4. **Verify Backup**
   - Backup appears in list
   - Status: "Completed"
   - Size and timestamp shown
   - Option to download
   - Option to restore (careful!)

## Error Handling and Edge Cases

### Connection Lost During Documentation

**Scenario: Internet drops while doctor is documenting visit**

1. **System Detects Connection Loss**
   - Banner appears: "Connection lost. Your work is being saved locally."
   - Continue working normally
   - Data saved to browser local storage

2. **Connection Restored**
   - Banner: "Connection restored. Syncing your changes..."
   - Local data syncs to server
   - Confirmation: "All changes saved"
   - Normal operation resumes

### Concurrent Editing

**Scenario: Two users edit same patient record simultaneously**

1. **First User Saves Changes**
   - Changes saved successfully
   - Record updated

2. **Second User Attempts to Save**
   - System detects conflict
   - Alert: "This record was modified by [User Name] at [Time]"
   - Options:
     - View their changes
     - Overwrite with your changes
     - Merge changes
   - User makes decision
   - Save proceeds with conflict resolution

### Invalid Data Entry

**Scenario: User enters invalid phone number format**

1. **Real-time Validation**
   - Field highlights in red
   - Error message below field: "Invalid phone number format"
   - Continue filling other fields

2. **Attempt to Save**
   - Save button disabled until errors fixed
   - Summary of errors at top
   - Scroll to first error
   - Fix all errors to proceed

### Patient Not Found

**Scenario: Searching for patient who doesn't exist**

1. **Empty Search Results**
   - Message: "No patients found matching your search"
   - Suggestions:
     - Check spelling
     - Try different search terms
     - Register as new patient
   - "Add New Patient" button prominent

## Mobile and Tablet Specific Flows

### Tablet Use at Bedside

**Scenario: Nurse recording vitals with iPad**

1. **Touch-Optimized Interface**
   - Larger buttons and input fields
   - Touch-friendly dropdowns
   - Numeric keyboard for vital signs
   - Minimal typing required

2. **Quick Vital Signs Entry**
   - Dedicated vitals entry screen
   - Large numeric inputs
   - Previous values shown for reference
   - Quick save and move to next patient

3. **Offline Capability (Future)**
   - Work continues without connection
   - Sync when back online
   - Visual indicator of sync status

## Performance Expectations

### System Response Times

- **Page Load**: < 2 seconds
- **Search Results**: < 1 second
- **Save Operations**: < 500ms
- **Report Generation**: < 5 seconds
- **PDF Generation**: < 3 seconds

### User Efficiency Goals

- **Patient Registration**: < 3 minutes
- **Vital Signs Entry**: < 1 minute
- **Visit Documentation**: < 8 minutes
- **Prescription Creation**: < 30 seconds per medication
- **Billing and Payment**: < 2 minutes

## Keyboard Shortcuts (Power Users)

- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + N`: New patient
- `Ctrl/Cmd + V`: New visit
- `Ctrl/Cmd + P`: Print/Preview
- `Ctrl/Cmd + S`: Save (auto-save enabled)
- `Esc`: Close modal/dialog
- `Tab`: Navigate form fields
- `Enter`: Submit form/Save

## Future Enhancements

### Appointment Scheduling Flow
- Calendar view of appointments
- Drag-and-drop scheduling
- SMS/Email reminders
- Waitlist management

### Telemedicine Flow
- Video consultation initiation
- Screen sharing capabilities
- Virtual waiting room
- Remote vital signs input

### Patient Portal Flow
- Patient self-registration
- View medical records
- Request prescription refills
- Book appointments online
- Secure messaging with doctor

These user flows are designed to maximize efficiency while maintaining data accuracy and security. Regular user feedback will help refine these workflows for optimal clinic operations.
