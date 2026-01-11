# Feature Dictionary

## 1. Patient Dashboard

The central hub for all patient-related activities.

- **Patient Search Bar**: Global search via debounce (300ms) for real-time results.
- **Patient Profile Card**: Quick view of age, gender, blood type, and known allergies.
- **Timeline View**: A chronological scroll of all Visits, Prescriptions, and Lab Results.

## 2. Doctor's Desk (Consultation Mode)

A focused interface for doctors during patient encounters.

- **Vitals Input Widget**: Quick entry for BP, HR, Temp, Weight. Auto-calculates BMI.
- **SOAP Note Editor**:
  - **S**ubjective: Chief Complaint (Free text).
  - **O**bjective: Physical Exam findings.
  - **A**ssessment: Diagnosis (Searchable ICD-10 or custom text).
  - **P**lan: Treatment instructions.
- **Quick-Prescribe**: Sidebar widget to add meds without leaving the note.

## 3. Prescription Manager

- **Medication Database**: Searchable list of clinic formulary meds.
- **Dose Calculator**: Helper fields for Frequency (e.g., "TID"), Duration (e.g., "7 days"), and Quantity.
- **Print Layout**: Generates a standardized, signed prescription PDF (A4/Letter).
- **History Check**: Warns if the patient has received the same class of drug recently.

## 4. Billing & Cashier

- **Invoice Builder**: Drag-and-drop or select services/items to add to the bill.
- **Split Payments**: Ability to accept $50 Cash and remaining balance via Card.
- **Receipt Generator**: Thermal printer friendly receipt format.
- **Daily Sales Report**: One-click "End of Day" summary for the cashier.

## 5. Clinic Settings (Admin)

- **User Management**: Invite staff via email, assign roles.
- **Service Catalog**: Manage price list for consultations and procedures.
- **Audit Values**: Read-only view of system logs for security reviews.

## 6. Audit & Security

- **Action Log**: Detailed history of "Who changed What".
  - _Example_: "User 'Dr. Smith' updated 'Patient John Doe' - Changed Phone Number."
- **Login History**: Track failed login attempts and IP addresses.
