# Implementation Roadmap

This document outlines the step-by-step engineering plan to move the **eHealth** app from its current state (Partial MVP) to Production Ready.

## Phase 1: Foundation Repair (Critical Technical Debt)

**Target**: Week 1
_Goal: Ensure the backend handles data consistently before building complex features._

1.  **Standardize API Responses**
    - Create `TransformInterceptor` to wrap all responses in `{ success: true, data: ... }`.
    - Create `AllExceptionsFilter` to standardize error messages.
2.  **Versioning**
    - Refactor all Controllers to use `@Controller('api/v1/...')`.
3.  **Global Validation**
    - Ensure `ValidationPipe` with `whitelist: true` is active globally.

## Phase 2: Core Medical Logic (The "Missing" Modules)

**Target**: Weeks 2-3
_Goal: Enable the clinic to actually treat patients._

### 2.1 Prescriptions Module

- **Backend**:
  - Create `Prescription` Entity & Relation to `Visit`.
  - Implement `POST /prescriptions` (Batch create).
  - Implement `PATCH /prescriptions/:id/status` (Discontinue).
- **Frontend**:
  - "Add Medication" dynamic form array.
  - Prescription Print View (PDF style component).

### 2.2 Billing Module (Complexity High)

- **Backend**:
  - Create `Invoice` and `Payment` entities.
  - Implement "generate invoice from visit" logic (Auto-pull consultation fee).
  - Implement Partial Payment logic (Balance Tracking).
- **Frontend**:
  - Invoice Builder interface.
  - Payment Modal (Cash/Card/HMO).

## Phase 3: Operational Excellence

**Target**: Week 4
_Goal: Safety, Security, and Reporting._

1.  **File Management**:
    - Implement Local Storage Service (Dev) and S3 Adapter (Prod).
    - Endpoints for Patient Photo Uploads.
2.  **Audit Logs**:
    - Global Interceptor to log generic actions.
    - Specific Service calls for sensitive actions ("Viewer Access").
3.  **Basic Reporting**:
    - Daily Revenue Stats.
    - Patient Count Stats.

## Phase 4: Frontend Polish & UX

**Target**: Week 5
_Goal: Make it look "Premium" as per design requirements._

1.  **Dashboard Redesign**: Glassmorphism cards, smooth charts (Recharts).
2.  **Loading States**: Skeleton loaders for all tables.
3.  **Optimistic UI**: Immediate feedback on "Save" before server responds.

## Implementation Checklist (Synced with MISSING_IMPLEMENTATIONS.md)

- [ ] Global Response Interceptor
- [ ] Prescriptions Module (Backend)
- [ ] Billing Module (Backend)
- [ ] Prescriptions UI
- [ ] Billing UI
- [ ] Audit Logging
- [ ] File Uploads
