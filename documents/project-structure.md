# Project Structure Documentation

## Overview

### Architecture Philosophy

eHealth EMR follows a **hybrid architecture approach**:

1. **Development:** Monorepo structure for shared code and easier development
2. **Production:** Separate, independent deployments for security and scalability

### Development Structure (Monorepo)

The project uses a **monorepo** structure for **development** to manage both frontend (Next.js) and backend (NestJS) applications in a single repository. This approach enables:
- ✅ Shared TypeScript types between frontend and backend
- ✅ Shared utility functions
- ✅ Synchronized development and versioning
- ✅ Easier dependency management
- ✅ Atomic changes across frontend and backend

### Production Deployment (Separate Services)

**Critical:** While the codebase is organized as a monorepo for development efficiency, **frontend and backend are deployed as separate, independent services in production**. This separation provides:

- ✅ **Security:** Isolated attack surfaces, network segmentation
- ✅ **Scalability:** Independent scaling of frontend and backend
- ✅ **Performance:** CDN for static assets, optimized resource allocation
- ✅ **Maintainability:** Independent deployments and versioning
- ✅ **Compliance:** Better HIPAA/GDPR compliance with data isolation

**See [Deployment Architecture](./DEPLOYMENT_ARCHITECTURE.md) for detailed production deployment strategies.**

## Full Repository Structure

```
healthcare-app/
├── apps/
│   ├── frontend/                 # Next.js application
│   └── backend/                  # NestJS application
├── packages/
│   ├── shared-types/             # Shared TypeScript types
│   └── shared-utils/             # Shared utility functions
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf               # Production reverse proxy config
├── docs/                         # Project documentation
│   ├── project-overview.md
│   ├── requirements.md
│   ├── tech-stack.md
│   ├── features.md
│   ├── implementation.md
│   ├── user-flow.md
│   └── project-structure.md     # This file
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI pipeline
│       └── deploy.yml           # Deployment pipeline
├── docker-compose.yml           # Local development environment
├── docker-compose.prod.yml      # Production environment
├── .gitignore
├── .env.example
├── README.md
├── package.json                 # Root package.json
└── turbo.json                   # Turborepo configuration (optional)
```

## Frontend Application (Next.js)

### Complete Directory Structure

```
apps/frontend/
├── public/                      # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   ├── fonts/
│   └── icons/
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/             # Auth route group (no auth layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx      # Auth pages layout
│   │   │
│   │   ├── (dashboard)/        # Dashboard route group (with sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx    # Main dashboard
│   │   │   │
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx                    # Patient list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx               # New patient form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx               # Patient detail
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx          # Edit patient
│   │   │   │       └── visits/
│   │   │   │           └── new/
│   │   │   │               └── page.tsx      # New visit
│   │   │   │
│   │   │   ├── visits/
│   │   │   │   ├── page.tsx                   # All visits
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx              # Visit detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx         # Edit visit
│   │   │   │
│   │   │   ├── prescriptions/
│   │   │   │   ├── page.tsx                   # All prescriptions
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx              # Prescription detail
│   │   │   │
│   │   │   ├── billing/
│   │   │   │   ├── page.tsx                   # Billing dashboard
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── page.tsx              # All invoices
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx         # New invoice
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx         # Invoice detail
│   │   │   │   └── payments/
│   │   │   │       └── page.tsx              # Payment history
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx                   # Reports menu
│   │   │   │   ├── clinical/
│   │   │   │   │   └── page.tsx              # Clinical reports
│   │   │   │   ├── financial/
│   │   │   │   │   └── page.tsx              # Financial reports
│   │   │   │   └── administrative/
│   │   │   │       └── page.tsx              # Admin reports
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx                   # Settings home
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx              # User profile
│   │   │   │   ├── users/                     # Admin only
│   │   │   │   │   ├── page.tsx              # User management
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx         # Edit user
│   │   │   │   ├── audit-logs/               # Admin only
│   │   │   │   │   └── page.tsx
│   │   │   │   └── backup/                    # Admin only
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── layout.tsx      # Dashboard layout with sidebar
│   │   │
│   │   ├── api/                # Next.js API routes (BFF layer)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── refresh/
│   │   │   │       └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   │
│   │   ├── not-found.tsx       # 404 page
│   │   ├── error.tsx           # Error boundary
│   │   ├── loading.tsx         # Global loading
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page (redirects to dashboard)
│   │
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...             # Other shadcn components
│   │   │
│   │   ├── forms/             # Form components
│   │   │   ├── patient-form.tsx
│   │   │   ├── visit-form.tsx
│   │   │   ├── vital-signs-form.tsx
│   │   │   ├── prescription-form.tsx
│   │   │   ├── invoice-form.tsx
│   │   │   └── soap-note-form.tsx
│   │   │
│   │   ├── layouts/           # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── features/          # Feature-specific components
│   │   │   ├── patients/
│   │   │   │   ├── patient-card.tsx
│   │   │   │   ├── patient-search.tsx
│   │   │   │   ├── patient-list.tsx
│   │   │   │   ├── patient-header.tsx
│   │   │   │   ├── patient-history.tsx
│   │   │   │   └── patient-stats.tsx
│   │   │   │
│   │   │   ├── visits/
│   │   │   │   ├── visit-card.tsx
│   │   │   │   ├── visit-list.tsx
│   │   │   │   ├── visit-timeline.tsx
│   │   │   │   ├── vital-signs-display.tsx
│   │   │   │   └── soap-note-viewer.tsx
│   │   │   │
│   │   │   ├── prescriptions/
│   │   │   │   ├── prescription-card.tsx
│   │   │   │   ├── prescription-list.tsx
│   │   │   │   ├── medication-search.tsx
│   │   │   │   └── drug-interaction-alert.tsx
│   │   │   │
│   │   │   ├── billing/
│   │   │   │   ├── invoice-card.tsx
│   │   │   │   ├── invoice-list.tsx
│   │   │   │   ├── payment-form.tsx
│   │   │   │   └── receipt-viewer.tsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── report-generator.tsx
│   │   │   │   ├── report-viewer.tsx
│   │   │   │   ├── chart-component.tsx
│   │   │   │   └── export-options.tsx
│   │   │   │
│   │   │   └── auth/
│   │   │       ├── login-form.tsx
│   │   │       ├── register-form.tsx
│   │   │       ├── forgot-password-form.tsx
│   │   │       └── reset-password-form.tsx
│   │   │
│   │   └── common/            # Shared common components
│   │       ├── loading-spinner.tsx
│   │       ├── error-message.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirmation-dialog.tsx
│   │       ├── data-table.tsx
│   │       ├── pagination.tsx
│   │       ├── search-bar.tsx
│   │       └── breadcrumbs.tsx
│   │
│   ├── lib/                   # Utility functions and configurations
│   │   ├── api-client.ts     # Axios instance and config
│   │   ├── auth.ts           # Auth utilities
│   │   ├── utils.ts          # General utilities (cn, formatters, etc.)
│   │   ├── validators.ts     # Validation schemas (Zod)
│   │   ├── constants.ts      # App constants
│   │   ├── formatters.ts     # Date, currency, etc. formatters
│   │   └── permissions.ts    # Permission checking utilities
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-patient.ts
│   │   ├── use-visit.ts
│   │   ├── use-prescription.ts
│   │   ├── use-billing.ts
│   │   ├── use-toast.ts
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   └── use-media-query.ts
│   │
│   ├── store/                # State management (Zustand)
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   ├── patient-store.ts
│   │   └── notification-store.ts
│   │
│   ├── types/                # Frontend-specific types
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   └── ui.types.ts
│   │
│   └── styles/               # Global styles
│       ├── globals.css       # Tailwind imports and global styles
│       └── themes.css        # Theme variables
│
├── .env.local                # Local environment variables (gitignored)
├── .env.example              # Example environment variables
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── components.json          # shadcn/ui configuration
├── postcss.config.js        # PostCSS configuration
├── package.json
└── README.md
```

### Key Frontend Patterns

#### 1. Route Grouping
Routes are grouped using parentheses for shared layouts:
- `(auth)`: Authentication pages without sidebar
- `(dashboard)`: Main application pages with sidebar

#### 2. Server vs Client Components
```typescript
// Server Component (default) - for data fetching
// app/(dashboard)/patients/[id]/page.tsx
import { getPatient } from '@/lib/api-client'

export default async function PatientPage({ params }: { params: { id: string } }) {
  const patient = await getPatient(params.id)
  return <PatientDetail patient={patient} />
}

// Client Component - for interactivity
// components/features/patients/patient-search.tsx
'use client'

import { useState } from 'react'

export function PatientSearch() {
  const [search, setSearch] = useState('')
  // ... interactive logic
}
```

#### 3. API Integration Pattern
```typescript
// lib/api-client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Interceptor for auth tokens
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { apiClient }
```

## Backend Application (NestJS)

### Complete Directory Structure

```
apps/backend/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Health check endpoint
│   ├── app.service.ts
│   │
│   ├── auth/                # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── jwt-refresh.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       ├── login.dto.ts
│   │       ├── refresh-token.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       └── reset-password.dto.ts
│   │
│   ├── users/               # User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── change-password.dto.ts
│   │
│   ├── patients/            # Patient module
│   │   ├── patients.module.ts
│   │   ├── patients.controller.ts
│   │   ├── patients.service.ts
│   │   └── dto/
│   │       ├── create-patient.dto.ts
│   │       ├── update-patient.dto.ts
│   │       └── search-patient.dto.ts
│   │
│   ├── visits/              # Visit module
│   │   ├── visits.module.ts
│   │   ├── visits.controller.ts
│   │   ├── visits.service.ts
│   │   └── dto/
│   │       ├── create-visit.dto.ts
│   │       ├── update-visit.dto.ts
│   │       ├── vital-signs.dto.ts
│   │       └── soap-note.dto.ts
│   │
│   ├── prescriptions/       # Prescription module
│   │   ├── prescriptions.module.ts
│   │   ├── prescriptions.controller.ts
│   │   ├── prescriptions.service.ts
│   │   └── dto/
│   │       ├── create-prescription.dto.ts
│   │       ├── update-prescription.dto.ts
│   │       └── discontinue-prescription.dto.ts
│   │
│   ├── billing/             # Billing module
│   │   ├── billing.module.ts
│   │   ├── billing.controller.ts
│   │   ├── billing.service.ts
│   │   └── dto/
│   │       ├── create-invoice.dto.ts
│   │       ├── update-invoice.dto.ts
│   │       ├── payment.dto.ts
│   │       └── invoice-item.dto.ts
│   │
│   ├── reports/             # Reports module
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts
│   │   ├── generators/
│   │   │   ├── clinical-reports.generator.ts
│   │   │   ├── financial-reports.generator.ts
│   │   │   └── administrative-reports.generator.ts
│   │   └── dto/
│   │       ├── report-query.dto.ts
│   │       └── generate-report.dto.ts
│   │
│   ├── audit/               # Audit logging module
│   │   ├── audit.module.ts
│   │   ├── audit.service.ts
│   │   ├── audit.controller.ts
│   │   ├── interceptors/
│   │   │   └── audit.interceptor.ts
│   │   └── dto/
│   │       ├── audit-log.dto.ts
│   │       └── search-audit.dto.ts
│   │
│   ├── mail/                # Email module
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts
│   │   ├── templates/
│   │   │   ├── welcome.hbs
│   │   │   ├── email-verification.hbs
│   │   │   ├── password-reset.hbs
│   │   │   └── password-changed.hbs
│   │   └── interfaces/
│   │       └── mail-options.interface.ts
│   │
│   ├── files/               # File upload module
│   │   ├── files.module.ts
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   └── dto/
│   │       └── upload-file.dto.ts
│   │
│   ├── prisma/              # Prisma module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── common/              # Common utilities
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── api-paginated-response.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── guards/
│   │   │   └── throttle.guard.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── interfaces/
│   │   │   ├── paginated-response.interface.ts
│   │   │   └── jwt-payload.interface.ts
│   │   └── dto/
│   │       └── pagination.dto.ts
│   │
│   └── config/              # Configuration
│       ├── configuration.ts # Configuration schema
│       └── validation.ts    # Environment validation
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   │   └── ...
│   ├── seeds/               # Database seeding
│   │   ├── seed.ts
│   │   ├── users.seed.ts
│   │   └── patients.seed.ts
│   └── README.md
│
├── test/                    # E2E tests
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── patients.e2e-spec.ts
│   └── jest-e2e.json
│
├── uploads/                 # File uploads (development only)
│   └── .gitkeep
│
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── nest-cli.json           # Nest CLI configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.build.json     # Build TypeScript configuration
├── package.json
└── README.md
```

### Key Backend Patterns

#### 1. Module Structure
Each feature follows this pattern:
```
feature/
├── feature.module.ts      # Module definition
├── feature.controller.ts  # HTTP endpoints
├── feature.service.ts     # Business logic
└── dto/                   # Data Transfer Objects
    ├── create-feature.dto.ts
    ├── update-feature.dto.ts
    └── query-feature.dto.ts
```

#### 2. Dependency Injection
```typescript
// patients.service.ts
@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}
  
  // Service methods...
}
```

#### 3. Controller Pattern
```typescript
// patients.controller.ts
@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}
  
  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Create patient' })
  create(@Body() dto: CreatePatientDto, @CurrentUser('id') userId: string) {
    return this.patientsService.create(dto, userId)
  }
}
```

## Shared Packages

### Shared Types Package

```
packages/shared-types/
├── src/
│   ├── index.ts           # Main export
│   ├── user.types.ts
│   ├── patient.types.ts
│   ├── visit.types.ts
│   ├── prescription.types.ts
│   ├── billing.types.ts
│   ├── report.types.ts
│   └── api.types.ts       # API response types
│
├── tsconfig.json
└── package.json
```

**Example: Shared Types**

```typescript
// packages/shared-types/src/patient.types.ts
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: Gender
  phone: string
  email?: string
  address?: string
  photoUrl?: string
  status: PatientStatus
  allergies: string[]
  chronicConditions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreatePatientInput {
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: Gender
  phone: string
  email?: string
  address?: string
  allergies?: string[]
  chronicConditions?: string[]
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### Shared Utils Package

```
packages/shared-utils/
├── src/
│   ├── index.ts
│   ├── formatters.ts      # Date, currency, phone formatters
│   ├── validators.ts      # Common validation functions
│   └── constants.ts       # Shared constants
│
├── tsconfig.json
└── package.json
```

## Docker Configuration

### Development Docker Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: healthcare_db
    environment:
      POSTGRES_USER: ${DB_USER:-healthcareuser}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-healthcarepass}
      POSTGRES_DB: ${DB_NAME:-healthcare_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - healthcare_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U healthcareuser"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./apps/backend
      dockerfile: ../../docker/backend.Dockerfile
      target: development
    container_name: healthcare_backend
    env_file:
      - ./apps/backend/.env
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
    ports:
      - "3001:3001"
    volumes:
      - ./apps/backend:/app
      - /app/node_modules
      - ./packages:/packages
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - healthcare_network
    command: npm run start:dev

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: ../../docker/frontend.Dockerfile
      target: development
    container_name: healthcare_frontend
    env_file:
      - ./apps/frontend/.env.local
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
      - /app/.next
      - ./packages:/packages
    depends_on:
      - backend
    networks:
      - healthcare_network
    command: npm run dev

volumes:
  postgres_data:
    driver: local

networks:
  healthcare_network:
    driver: bridge
```

### Backend Dockerfile

**docker/backend.Dockerfile:**
```dockerfile
# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm ci

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev", "--prefix", "apps/backend"]

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build --prefix apps/backend
RUN npm prune --production

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "apps/backend/dist/main.js"]
```

### Frontend Dockerfile

**docker/frontend.Dockerfile:**
```dockerfile
# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm ci

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--prefix", "apps/frontend"]

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build --prefix apps/frontend

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=build /app/apps/frontend/public ./apps/frontend/public
COPY --from=build /app/apps/frontend/package*.json ./apps/frontend/
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start", "--prefix", "apps/frontend"]
```

## Database Structure (Prisma)

The database schema is located at `apps/backend/prisma/schema.prisma`.

**Key Models:**
- **User**: System users (doctors, nurses, admins)
- **RefreshToken**: JWT refresh tokens
- **Patient**: Patient records
- **Visit**: Consultation records
- **Prescription**: Medication prescriptions
- **Invoice**: Billing invoices
- **AuditLog**: System audit trail

**Migrations:**
```bash
# Create migration
npm run prisma:migrate:dev --prefix apps/backend

# Apply migrations
npm run prisma:migrate:deploy --prefix apps/backend

# Generate Prisma Client
npm run prisma:generate --prefix apps/backend

# Open Prisma Studio
npm run prisma:studio --prefix apps/backend
```

## Data Flow Architecture

### Authentication Flow

```
Frontend (Next.js)
    ↓ [POST /api/auth/login]
Backend API (NestJS)
    ↓ [Validate credentials]
Database (PostgreSQL via Prisma)
    ↓ [Return user data]
Backend API
    ↓ [Generate JWT tokens]
    ↓ [Store refresh token]
Frontend
    ↓ [Store tokens in httpOnly cookies]
    ↓ [Redirect to dashboard]
```

### Data Fetching Flow

```
Frontend Component (Server Component)
    ↓ [Fetch data on server]
API Client (Axios)
    ↓ [GET /api/patients/:id with JWT]
Backend Controller
    ↓ [Validate JWT, check permissions]
Backend Service
    ↓ [Query database via Prisma]
Database
    ↓ [Return data]
Backend Service
    ↓ [Transform and format data]
Backend Controller
    ↓ [Return response]
Frontend Component
    ↓ [Render with data]
```

### File Upload Flow

```
Frontend Form
    ↓ [Upload file via form]
API Client
    ↓ [POST /api/files with multipart/form-data]
Backend Files Controller
    ↓ [Validate file type and size]
    ↓ [Save to disk or cloud storage]
Backend Files Service
    ↓ [Generate file URL]
    ↓ [Link to patient/visit record]
Database
    ↓ [Store file metadata]
```

## Development Workflow

### Starting the Application

```bash
# Clone repository
git clone <repository-url>
cd healthcare-app

# Install dependencies
npm install

# Setup environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# Start Docker services
docker-compose up -d

# Run database migrations
npm run prisma:migrate:dev --prefix apps/backend

# Seed database (optional)
npm run prisma:seed --prefix apps/backend

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### Running Tests

```bash
# Frontend tests
npm run test --prefix apps/frontend

# Backend tests
npm run test --prefix apps/backend

# E2E tests
npm run test:e2e --prefix apps/backend
```

## Production Deployment

### Deployment Architecture

**Critical:** Frontend and backend are deployed as **separate, independent services** in production. This separation provides:

- ✅ **Security**: Isolated attack surfaces, network segmentation
- ✅ **Scalability**: Independent scaling of frontend and backend
- ✅ **Performance**: CDN for static assets, optimized resource allocation
- ✅ **Maintainability**: Independent deployments and versioning
- ✅ **Compliance**: Better HIPAA/GDPR compliance with data isolation

### Deployment Options

#### Option 1: Separate Cloud Platforms (Recommended)
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Deploy to Railway, Render, AWS ECS, or VPS
- **Database**: Managed PostgreSQL (Railway, Render, AWS RDS)

#### Option 2: VPS with Reverse Proxy
- **Single VPS**: Nginx reverse proxy routes traffic
- **Frontend**: Next.js app on port 3000
- **Backend**: NestJS API on port 3001
- **Database**: PostgreSQL container

See [Deployment Architecture Documentation](./DEPLOYMENT_ARCHITECTURE.md) for detailed deployment strategies.

### Building for Production

#### Frontend Build (Deploy Separately)
```bash
cd apps/frontend
npm run build
# Deploy .next folder to Vercel, Netlify, or VPS
```

#### Backend Build (Deploy Separately)
```bash
cd apps/backend
npm run build
# Deploy dist folder to Railway, Render, or VPS
```

#### Docker Builds (For Containerized Deployment)
```bash
# Build frontend image
docker build -f docker/frontend.Dockerfile -t ehealth-frontend:latest ./apps/frontend

# Build backend image
docker build -f docker/backend.Dockerfile -t ehealth-backend:latest ./apps/backend

# Deploy containers separately or use docker-compose.prod.yml for VPS deployment
```

### Environment Configuration for Separate Deployment

#### Frontend Environment Variables
```bash
# apps/frontend/.env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### Backend Environment Variables
```bash
# apps/backend/.env.production
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

### CORS Configuration

Since frontend and backend are on different domains, CORS must be configured:

```typescript
// apps/backend/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## Key Design Decisions

### Why Monorepo for Development?
- **Shared Code**: Types, utilities shared between frontend and backend
- **Atomic Changes**: Update both API and UI in single PR
- **Simplified Versioning**: Single version for entire application
- **Easier Development**: Run entire stack locally with one command
- **Type Safety**: Shared TypeScript types ensure consistency

### Why Separate Deployment in Production?
- **Security**: Isolated services reduce attack surface
- **Scalability**: Scale frontend and backend independently
- **Performance**: CDN for static assets, optimized resource allocation
- **Maintainability**: Deploy updates without affecting other service
- **Compliance**: Better data isolation for HIPAA/GDPR requirements
- **Cost Efficiency**: Optimize resources per service

### Why Next.js App Router?
- **Server Components**: Improved performance, less client JavaScript
- **File-based Routing**: Intuitive and scalable
- **Built-in API Routes**: BFF layer without separate server
- **SSR/SSG**: Better SEO and initial load performance

### Why NestJS?
- **TypeScript-First**: Type safety throughout backend
- **Modular Architecture**: Scalable and maintainable
- **Dependency Injection**: Easy testing and flexibility
- **Decorators**: Clean, readable code
- **Enterprise-Ready**: Used by large organizations

### Why Prisma?
- **Type-Safe**: Generated types from schema
- **Excellent DX**: Easy to use, great tooling
- **Migration System**: Version-controlled database changes
- **Query Optimization**: Automatic query optimization
- **Prisma Studio**: Visual database management

This structure provides a solid foundation for building a secure, scalable, and maintainable EMR system suitable for small to medium-sized medical clinics.
