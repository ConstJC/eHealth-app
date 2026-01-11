# System Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to define the functional and non-functional requirements for the **Medical Clinic EMR (Electronic Medical Record)** system. This system aims to digitize patient records, streamline clinical workflows, and manage clinic operations for small to medium-sized healthcare facilities.

### 1.2 Scope

The system will cover:

- Patient Management (Registration, History)
- Clinical Documentation (Visits, Diagnoses, Vitals)
- Prescription Management
- Billing and Invoicing
- Staff and Role Management
- Reporting and Analytics

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization (Auth Module)

- **FR_AUTH_01**: System must support secure login using Email/Password.
- **FR_AUTH_02**: System must use JWT (JSON Web Tokens) for session management (Access + Refresh tokens).
- **FR_AUTH_03**: System must force password changes for new accounts or resets.
- **FR_AUTH_04**: System must enforce Role-Based Access Control (RBAC) with the following roles:
  - **Admin**: Full system access.
  - **Doctor**: Clinical access (Patients, Visits, Prescriptions, Reports). No access to User Management.
  - **Nurse/Staff**: Operational access (Registration, Vitals, Billing). Read-only clinical access (if applicable).

### 2.2 Patient Management

- **FR_PAT_01**: Staff must be able to register new patients with mandatory fields: First Name, Last Name, DOB, Gender, Contact Number.
- **FR_PAT_02**: System must support "Soft Delete" for patients (never permanently delete medical records).
- **FR_PAT_03**: System must allow searching patients by Name, Phone, or ID.
- **FR_PAT_04**: Users must be able to view a longitudinal timeline of a patient's history.

### 2.3 Clinical Encounters (Visits)

- **FR_VISIT_01**: Doctors must be able to create a new Visit record for a patient.
- **FR_VISIT_02**: A Visit must capture: Chief Complaint, HPI (History of Present Illness), Vitals, Diagnosis, and Treatment Plan.
- **FR_VISIT_03**: System must warn if a visit is closed without a diagnosis.

### 2.4 Prescriptions (Critical)

- **FR_RX_01**: Doctors must be able to add multiple medications to a single prescription.
- **FR_RX_02**: System must generate a printable PDF format for the prescription.
- **FR_RX_03**: Prescriptions must track status: `ACTIVE`, `DISCONTINUED`, `COMPLETED`.

### 2.5 Billing & Invoicing (Critical)

- **FR_BILL_01**: Staff must be able to generate an Invoice for a Visit.
- **FR_BILL_02**: Invoice must support multiple line items (Consultation Fee, Procedures, Meds).
- **FR_BILL_03**: System must track payment status: `UNPAID`, `PARTIAL`, `PAID`.
- **FR_BILL_04**: System must support applying discounts (Percentage or Fixed Amount).

### 2.6 File Management

- **FR_FILE_01**: System must allow uploading patient profile photos.
- **FR_FILE_02**: System must allow attaching documents (Lab Results, X-Rays) to a Visit.
- **FR_FILE_03**: All uploads must be validated for file type and size (Max 5MB).

---

## 3. Non-Functional Requirements

### 3.1 Security & Compliance

- **NFR_SEC_01**: All data in transit must be encrypted via TLS 1.3 (HTTPS).
- **NFR_SEC_02**: Passwords must be hashed using `bcrypt` with a minimum salt round of 10.
- **NFR_SEC_03**: Sensitive patient data (PII) should be protected according to standard data privacy guidelines.
- **NFR_SEC_04**: Audit Logs must record every Create, Update, and Delete action on Patient and Clinical data.

### 3.2 Performance

- **NFR_PERF_01**: System load time (Time to Interactive) should be under 1.5 seconds on 4G networks.
- **NFR_PERF_02**: API responses must be returned within 200ms for standard read operations.
- **NFR_PERF_03**: Support concurrent usage by up to 50 staff members without degradation.

### 3.3 Reliability & Availability

- **NFR_REL_01**: System Availability target is 99.9% during clinic operating hours.
- **NFR_REL_02**: Database backups must be automated daily.

### 3.4 Usability

- **NFR_UI_01**: Interface must be responsive (Desktop, Tablet).
- **NFR_UI_02**: Clinical workflows (Prescribing) must require fewer than 5 clicks to complete.
- **NFR_UI_03**: Support for Dark Mode and High Contrast (User preference).

---

## 4. Data Constraints

- **DC_01**: Monetary values must be stored with 2 or 4 decimal precision (or as integers in cents) to prevent rounding errors.
- **DC_02**: Timestamps must be stored in UTC and converted to local clinic time on the client.
