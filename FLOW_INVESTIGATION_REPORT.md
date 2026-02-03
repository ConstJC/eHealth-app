# User Flow Investigation Report
## Patient Registration → Billing & Payment Flow

**Date:** January 27, 2026  
**Scope:** Patient Registration, Consultation, Prescription Management, Billing & Payment flows

---

## Executive Summary

### ✅ Backend Status: **FULLY IMPLEMENTED**
- Patient Registration API: ✅ Complete
- Visit/Consultation API: ✅ Complete  
- Prescription API: ✅ Complete
- Invoice/Billing API: ✅ Complete

### ⚠️ Frontend Status: **PARTIALLY IMPLEMENTED**

---

## Detailed Findings

### 1. Patient Registration Flow

#### Current Implementation
- **Location:** `frontend/app/(core)/patients/new/page.tsx`
- **Form Component:** `frontend/components/features/patients/patient-form.tsx`
- **Status:** ⚠️ **Single form, not multi-step**

#### Issues Found:
1. ❌ **Not multi-step** - User flow requires 5 steps:
   - Step 1: Basic Information
   - Step 2: Emergency Contact
   - Step 3: Medical History
   - Step 4: Insurance (Optional)
   - Step 5: Photo (Optional)
   
   Current: All fields in one long form

2. ❌ **Photo upload** - Only URL input field
   - User flow requires: Drag-and-drop, preview, crop functionality
   - Current: Only text input for photo URL

3. ✅ **Form fields** - All required fields present
4. ✅ **Validation** - Proper validation implemented
5. ✅ **Responsive** - Has `md:` breakpoints for tablet

#### Required Changes:
- [ ] Convert to multi-step form with progress indicator
- [ ] Add drag-and-drop photo upload with preview
- [ ] Add image crop functionality
- [ ] Maintain responsive design for tablet/phone

---

### 2. Consultation and Visit Documentation Flow

#### Current Implementation
- **Location:** `frontend/app/(core)/consultation/page.tsx`
- **Status:** ✅ **MOSTLY COMPLETE**

#### Findings:
1. ✅ **Visit Queue** - Left sidebar with active consultations
2. ✅ **SOAP Notes** - All sections implemented (Subjective, Objective, Assessment, Plan)
3. ✅ **Auto-save** - Implemented (2 second delay)
4. ✅ **Vital Signs Display** - Shows recorded vitals
5. ✅ **Visit Completion** - Complete visit functionality
6. ✅ **Responsive** - Uses `lg:grid-cols-4` for layout
7. ⚠️ **Prescription Tab** - Shows "coming soon" placeholder
8. ✅ **Certificates** - Fully implemented

#### Required Changes:
- [ ] Implement prescription creation within consultation
- [ ] Verify tablet responsiveness (test at 768px)

---

### 3. Prescription Management Flow

#### Current Implementation
- **Location:** `frontend/app/(core)/prescriptions/page.tsx`
- **Status:** ❌ **PLACEHOLDER ONLY**

#### Issues Found:
1. ❌ **No API integration** - Static mock data
2. ❌ **No prescription creation** - "New Prescription" button does nothing
3. ❌ **No prescription list** - Hardcoded sample data
4. ❌ **No prescription management** - No edit, discontinue, or refill functionality
5. ❌ **No print functionality** - Print button not implemented

#### Backend Available:
- ✅ `POST /api/v1/prescriptions` - Create prescription
- ✅ `GET /api/v1/prescriptions` - List prescriptions (with filters)
- ✅ `GET /api/v1/prescriptions/:id` - Get prescription details
- ✅ `PATCH /api/v1/prescriptions/:id` - Update prescription
- ✅ `POST /api/v1/prescriptions/:id/discontinue` - Discontinue prescription
- ✅ `GET /api/v1/prescriptions/patient/:patientId` - Get patient prescriptions

#### Required Changes:
- [ ] Create prescription hooks (`use-prescriptions.ts`)
- [ ] Implement prescription list page with filters
- [ ] Implement prescription creation form
- [ ] Add prescription to consultation flow
- [ ] Implement prescription print/PDF functionality
- [ ] Add discontinue prescription functionality
- [ ] Ensure tablet/phone responsiveness

---

### 4. Billing and Payment Flow

#### Current Implementation
- **Location:** `frontend/app/(core)/billing/page.tsx`
- **Status:** ❌ **PLACEHOLDER ONLY**

#### Issues Found:
1. ❌ **No API integration** - Static mock data
2. ❌ **No invoice creation** - Hardcoded invoice
3. ❌ **No payment processing** - "Process Payment" button does nothing
4. ❌ **No visit linking** - Cannot create invoice from visit
5. ❌ **No patient selection** - No way to select patient
6. ❌ **No service items management** - Static items only

#### Backend Available:
- ✅ `POST /api/v1/invoices` - Create invoice
- ✅ `GET /api/v1/invoices` - List invoices (with filters)
- ✅ `GET /api/v1/invoices/:id` - Get invoice details
- ✅ `GET /api/v1/invoices/visit/:visitId` - Get invoice for visit
- ✅ `PUT /api/v1/invoices/:id` - Update invoice
- ✅ `PATCH /api/v1/invoices/:id/discount` - Apply discount
- ✅ `POST /api/v1/invoices/:id/payments` - Record payment
- ✅ `GET /api/v1/invoices/:id/payments` - Get payment history
- ✅ `POST /api/v1/invoices/:id/refund` - Process refund

#### Required Changes:
- [ ] Create invoice hooks (`use-invoices.ts`)
- [ ] Implement invoice creation from visit
- [ ] Implement invoice creation from patient profile
- [ ] Add service items management (add/remove items)
- [ ] Implement payment processing with multiple payment methods
- [ ] Add discount application
- [ ] Implement receipt generation/printing
- [ ] Add payment history display
- [ ] Ensure tablet/phone responsiveness

---

### 5. Responsiveness Analysis

#### Screens Checked:

1. **Patient Registration** (`/patients/new`)
   - ✅ Has `md:` breakpoints
   - ⚠️ Needs verification at 768px (tablet)
   - ⚠️ Needs verification at 320px (phone)

2. **Patient List** (`/patients`)
   - ✅ Responsive grid (`md:flex-row`, `md:grid-cols-*`)
   - ✅ Responsive table (scrollable on mobile)
   - ✅ Responsive text sizes (`text-xs md:text-sm lg:text-base`)
   - ✅ Touch-friendly buttons (`h-9 md:h-10 lg:h-11`)

3. **Visit/Triage** (`/visits`)
   - ✅ Responsive layout (`lg:grid-cols-3`)
   - ✅ Responsive form inputs
   - ⚠️ Needs verification at tablet size

4. **Consultation** (`/consultation`)
   - ✅ Responsive grid (`lg:grid-cols-4`)
   - ✅ Responsive tabs
   - ⚠️ Needs verification at tablet size

5. **Prescriptions** (`/prescriptions`)
   - ⚠️ Placeholder - needs full implementation with responsive design

6. **Billing** (`/billing`)
   - ⚠️ Placeholder - needs full implementation with responsive design

#### Responsive Breakpoints Used:
- `md:` - 768px (Tablet)
- `lg:` - 1024px (Desktop)
- Mobile-first approach: Base styles for mobile, then `md:` and `lg:` overrides

#### Recommendations:
- [ ] Test all screens at 768px (iPad)
- [ ] Test all screens at 320px (iPhone SE)
- [ ] Ensure touch targets are at least 44x44px
- [ ] Verify form inputs are easily tappable on tablet
- [ ] Check table scrolling on mobile devices

---

## Priority Action Items

### High Priority (Critical for MVP)
1. **Implement Prescription Management** - Doctors need to prescribe medications
2. **Implement Billing & Payment** - Clinic needs to process payments
3. **Add prescription creation to Consultation flow** - Link prescriptions to visits

### Medium Priority (Enhance UX)
4. **Convert Patient Registration to multi-step** - Better user experience
5. **Add photo upload with drag-and-drop** - Complete registration flow

### Low Priority (Polish)
6. **Verify and enhance tablet responsiveness** - Ensure all screens work on tablets
7. **Add loading states and error handling** - Improve user feedback

---

## Implementation Plan

### Phase 1: Prescription Management (Week 1)
- Create `use-prescriptions.ts` hook
- Implement prescription list page
- Implement prescription creation form
- Add prescription tab to consultation page
- Add print/PDF functionality

### Phase 2: Billing & Payment (Week 1-2)
- Create `use-invoices.ts` hook
- Implement invoice creation from visit
- Implement invoice creation from patient profile
- Add payment processing
- Add receipt generation

### Phase 3: Patient Registration Enhancement (Week 2)
- Convert to multi-step form
- Add photo upload with drag-and-drop
- Add image crop functionality

### Phase 4: Responsiveness & Polish (Week 2)
- Test all screens at tablet size (768px)
- Test all screens at phone size (320px)
- Fix any responsive issues
- Add loading states and error handling

---

## Notes

- Backend APIs are fully functional and ready to use
- Frontend needs to integrate with existing backend endpoints
- All flows should maintain responsive design for tablet and phone use
- Follow existing code patterns and component structure
