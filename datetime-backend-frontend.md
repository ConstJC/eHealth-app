# DateTime, Date-Only, and Time-Only: Backend & Frontend (eHealth)

This document describes how date and time are handled in the eHealth backend (NestJS + Prisma) and frontend (Next.js). The app uses **DateTime only** in the database (no native PostgreSQL `date` or `time` columns). “Date-only” and “time-only” semantics are achieved via API format and helpers.

---

## Backend

### Stack

- **ORM:** Prisma (PostgreSQL)
- **DB type:** All date/time columns are `DateTime` (Prisma) → PostgreSQL `timestamp` / `timestamptz`
- **Utilities:** `backend/src/common/utils/date.utils.ts` — use these for consistent UTC handling

### DateTime (full timestamp)

- **DB:** Prisma `DateTime` (PostgreSQL `timestamp`/`timestamptz`)
- **Entity/Service:** TypeScript `Date`
- **API:** ISO 8601 strings, e.g. `2024-12-25T09:00:00.000Z` or `2024-12-25T09:00:00Z`
- **Used for:**  
  `visitDate`, `followUpDate`, `vitalSignsRecordedAt`, `lockedAt`, `createdAt`, `updatedAt`, `deletedAt`,  
  `startTime` / `endTime` (Appointment), `billedAt`, `issuedAt`, `discontinuedAt`, `resetPasswordExpires`, `expiresAt`, etc.
- **Validation:** `@IsDateString()` (class-validator) for DTOs
- **Logic:** `toUTC(dateString)` or `new Date(dateString)`; for “now”: `nowUTC()`
- **Display (server-side):** e.g. `date.toISOString()` or `date.toLocaleString('en-PH', { … })` where needed

### Date-only (semantic; stored as DateTime)

- **DB:** Same Prisma `DateTime`; stored at **midnight UTC** for consistency
- **Entity/DTO:** `string` in API/DTOs (YYYY-MM-DD)
- **API:** `YYYY-MM-DD`, e.g. `2024-12-25`
- **Used for:**  
  `dateOfBirth`, `insurancePolicyExpiry` (Patient),  
  `startDate`, `endDate`, `returnDate` (MedicalCertificate),  
  and query params: `startDate`, `endDate` (reports, visits, invoices, audit)
- **Validation:** `@IsDateString()` (accepts both YYYY-MM-DD and full ISO)
- **Logic:** `toUTCDateOnly(dateString)` → `new Date(dateString + 'T00:00:00.000Z')`
- **Range queries:** Use `createUTCDateRange(startDate?, endDate?)`; for **inclusive** end date use `toUTCEndOfDay(endDate)` for `lte`

### Time-only

- **Status:** Not used in this codebase. Appointments use full **DateTime** for `startTime` / `endTime`.
- **If added later:**  
  - DB: Prisma does not have a native `time` type; use `String` or keep DateTime.  
  - API: `HH:mm:ss` or `HH:mm`; validate with regex, e.g. `^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$`.

### Backend date utils (`backend/src/common/utils/date.utils.ts`)

| Function | Purpose |
|----------|---------|
| `nowUTC()` | Current time as `Date` (UTC) |
| `toUTC(date)` | String or Date → `Date` (UTC) |
| `toUTCDateOnly(dateString)` | YYYY-MM-DD → midnight UTC |
| `toUTCEndOfDay(dateString)` | YYYY-MM-DD → end of that day in UTC (23:59:59.999) |
| `createUTCDateRange(start?, end?)` | Returns `{ gte?, lte? }` using `toUTC`; for inclusive end use `lte: toUTCEndOfDay(end)` where needed |

### Backend DTOs (date/time validation)

- **Visits:** `CreateVisitDto` / `UpdateVisitDto` — `visitDate`, `followUpDate` → `@IsDateString()`  
- **Patients:** `CreatePatientDto` / `UpdatePatientDto` — `dateOfBirth`, `insurancePolicyExpiry` → `@IsDateString()`  
- **Appointments:** `CreateAppointmentDto` / `UpdateAppointmentDto` — `startTime`, `endTime` → `@IsDateString()` (full ISO)  
- **Certificates:** `CreateCertificateDto` / `UpdateCertificateDto` — `startDate`, `endDate`, `returnDate` → `@IsDateString()`  
- **Reports / search:** `ReportQueryDto`, `SearchVisitDto`, etc. — `startDate`, `endDate` → `@IsDateString()`

---

## Frontend

### Stack

- **Framework:** Next.js (React)
- **Formatters:** `frontend/lib/formatters.ts`
- **Also used:** `date-fns` (e.g. `format()`) in pages/components

### DateTime (full timestamp)

- **From API:** ISO strings; use `new Date(isoString)` or pass string into formatters
- **Display:**  
  - `formatDateTime(date)` in `formatters.ts` → `toLocaleString('en-US', { year, month, day, hour, minute })`  
  - Or `date-fns`: `format(new Date(visit.visitDate), 'MMM dd, yyyy')`, `format(..., 'hh:mm a')`, etc.
- **Send to API:** Serialize as ISO (e.g. `date.toISOString()`) when sending full timestamps

### Date-only

- **Input:** `<input type="date" />` → value is `YYYY-MM-DD`
- **Form → API:** Send `YYYY-MM-DD` (e.g. patient `dateOfBirth`, certificate `startDate`/`endDate`/`returnDate`); for patient form, `new Date(data.dateOfBirth)` is sent and may be serialized to ISO — backend accepts both via `@IsDateString()`
- **Display:**  
  - `formatDate(date)` in `formatters.ts` → short date (e.g. `toLocaleDateString('en-US', { year, month: 'short', day })`)  
  - Or `date-fns`: `format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')`
- **Pre-fill edit forms:** Use `new Date(patient.dateOfBirth).toISOString().split('T')[0]` to get `YYYY-MM-DD` for `type="date"`

### Time-only

- **Status:** Not used. Appointment times are full DateTime; display with `format(..., 'hh:mm a')` or `formatTime(date)`.

### Frontend formatters (`frontend/lib/formatters.ts`)

| Function | Purpose |
|----------|---------|
| `formatDate(date)` | Date-only display (e.g. MMM d, yyyy) |
| `formatDateTime(date)` | Date + time display |
| `formatTime(date)` | Time-only display (from Date or ISO string) |
| `formatRelativeTime(date)` | “just now”, “5m ago”, etc. |
| `calculateAge(dateOfBirth)` | Age from date of birth |

All accept `Date | string | null | undefined`; invalid/missing values return `'—'` or `null` as appropriate.

---

## Summary

| Kind | Backend DB | Backend API | Frontend input | Frontend display |
|------|------------|-------------|----------------|------------------|
| **DateTime** | Prisma `DateTime` | ISO string | N/A or datetime-local | `formatDateTime()` / date-fns |
| **Date-only** | `DateTime` (midnight UTC) | YYYY-MM-DD | `<input type="date">` → YYYY-MM-DD | `formatDate()` / date-fns |
| **Time-only** | Not used | — | — | — |

All backend date logic should go through `date.utils.ts`; all frontend date display should use `formatters.ts` or consistent date-fns patterns.
