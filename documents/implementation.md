# Implementation Standards and Development Approach

## Development Philosophy

eHealth EMR follows modern software development practices with emphasis on code quality, security, maintainability, and scalability. Our implementation standards ensure consistent development patterns across the full-stack application, making it easier for team members to collaborate and maintain the healthcare system over time.

## Code Organization and Architecture

### Full-Stack Monorepo Structure (Development)

**Important:** The project uses a monorepo architecture for **development** to maintain both frontend (Next.js) and backend (NestJS) in a single repository with shared types and utilities. However, **frontend and backend are deployed separately in production** for security, scalability, and performance.

**Development Structure:**
```
healthcare-app/
├── apps/
│   ├── frontend/          # Next.js application (deploys separately)
│   └── backend/           # NestJS application (deploys separately)
├── packages/
│   ├── shared-types/      # Shared TypeScript types (dev only)
│   └── shared-utils/      # Shared utilities (dev only)
├── docker/
│   ├── frontend.Dockerfile
│   └── backend.Dockerfile
├── docker-compose.yml     # Development only
└── package.json
```

**Production Deployment:**
- Frontend and backend are deployed as **separate, independent services**
- See [Deployment Architecture](./DEPLOYMENT_ARCHITECTURE.md) for detailed deployment strategies
- CORS must be configured for cross-origin requests
- Environment variables must be set for production URLs

### Frontend Implementation (Next.js)

Our Next.js application follows the App Router architecture with server and client components for optimal performance.

#### Directory Structure:
```typescript
apps/frontend/
├── src/
│   ├── app/                      # App Router pages
│   │   ├── (auth)/              # Auth group routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/         # Dashboard group routes
│   │   │   ├── patients/
│   │   │   ├── visits/
│   │   │   ├── prescriptions/
│   │   │   ├── billing/
│   │   │   ├── reports/
│   │   │   └── layout.tsx
│   │   ├── api/                 # API routes (BFF layer)
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── forms/               # Form components
│   │   │   ├── patient-form.tsx
│   │   │   ├── visit-form.tsx
│   │   │   └── prescription-form.tsx
│   │   ├── layouts/             # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── dashboard-layout.tsx
│   │   └── features/            # Feature-specific components
│   │       ├── patients/
│   │       ├── visits/
│   │       └── prescriptions/
│   │
│   ├── lib/                     # Utility functions
│   │   ├── api-client.ts        # Axios configuration
│   │   ├── auth.ts              # Auth utilities
│   │   ├── utils.ts             # Helper functions
│   │   └── validators.ts        # Validation schemas
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-patient.ts
│   │   ├── use-visit.ts
│   │   ├── use-auth.ts
│   │   └── use-toast.ts
│   │
│   ├── store/                   # State management
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   └── patient-store.ts
│   │
│   ├── types/                   # Frontend-specific types
│   │   └── index.ts
│   │
│   └── styles/                  # Global styles
│       └── globals.css
│
├── public/                      # Static assets
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

#### Component Example (Patient Search):

```typescript
'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { searchPatients } from '@/lib/api-client'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { PatientCard } from '@/components/features/patients/patient-card'
import type { Patient } from '@shared/types'

export function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  // React Query for efficient data fetching with caching
  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients', 'search', debouncedSearch],
    queryFn: () => searchPatients(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  })

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search by name, patient ID, or phone..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full"
      />

      {isLoading && <div>Searching...</div>}
      
      {error && <div className="text-destructive">Error searching patients</div>}

      {patients && patients.length === 0 && (
        <div className="text-muted-foreground">No patients found</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients?.map((patient: Patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  )
}
```

#### Server Component Example:

```typescript
// app/(dashboard)/patients/[id]/page.tsx
import { Suspense } from 'react'
import { getPatient } from '@/lib/api-client'
import { PatientHeader } from '@/components/features/patients/patient-header'
import { PatientHistory } from '@/components/features/patients/patient-history'
import { VisitList } from '@/components/features/visits/visit-list'

export default async function PatientPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const patient = await getPatient(params.id)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PatientHeader patient={patient} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Loading history...</div>}>
          <PatientHistory patientId={patient.id} />
        </Suspense>
        
        <Suspense fallback={<div>Loading visits...</div>}>
          <VisitList patientId={patient.id} />
        </Suspense>
      </div>
    </div>
  )
}
```

### Backend Implementation (NestJS)

Our NestJS backend follows a modular architecture with clear separation of concerns.

#### Directory Structure:

```typescript
apps/backend/
├── src/
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts            # Root module
│   │
│   ├── auth/                    # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── public.decorator.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       └── refresh-token.dto.ts
│   │
│   ├── users/                   # User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── patients/                # Patient module
│   │   ├── patients.module.ts
│   │   ├── patients.controller.ts
│   │   ├── patients.service.ts
│   │   └── dto/
│   │       ├── create-patient.dto.ts
│   │       ├── update-patient.dto.ts
│   │       └── search-patient.dto.ts
│   │
│   ├── visits/                  # Visit module
│   │   ├── visits.module.ts
│   │   ├── visits.controller.ts
│   │   ├── visits.service.ts
│   │   └── dto/
│   │
│   ├── prescriptions/           # Prescription module
│   │   ├── prescriptions.module.ts
│   │   ├── prescriptions.controller.ts
│   │   ├── prescriptions.service.ts
│   │   └── dto/
│   │
│   ├── billing/                 # Billing module
│   │   ├── billing.module.ts
│   │   ├── billing.controller.ts
│   │   ├── billing.service.ts
│   │   └── dto/
│   │
│   ├── reports/                 # Reports module
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   └── reports.service.ts
│   │
│   ├── audit/                   # Audit logging module
│   │   ├── audit.module.ts
│   │   ├── audit.service.ts
│   │   └── interceptors/
│   │       └── audit.interceptor.ts
│   │
│   ├── mail/                    # Email module
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts
│   │   └── templates/
│   │       ├── welcome.hbs
│   │       ├── password-reset.hbs
│   │       └── email-verification.hbs
│   │
│   ├── prisma/                  # Prisma module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── common/                  # Common utilities
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── guards/
│   │
│   └── config/                  # Configuration
│       └── configuration.ts
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Database seeding
│
├── test/                        # E2E tests
├── nest-cli.json
├── tsconfig.json
└── package.json
```

#### Service Layer Example (Patients Service):

```typescript
// apps/backend/src/patients/patients.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { CreatePatientDto, UpdatePatientDto, SearchPatientDto } from './dto'
import { Patient, Prisma } from '@prisma/client'

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreatePatientDto, userId: string): Promise<Patient> {
    // Check for duplicate patients
    const existing = await this.prisma.patient.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { 
            firstName: dto.firstName,
            lastName: dto.lastName,
            dateOfBirth: dto.dateOfBirth,
          },
        ],
      },
    })

    if (existing) {
      throw new ConflictException('Patient already exists')
    }

    // Create patient
    const patient = await this.prisma.patient.create({
      data: {
        ...dto,
        patientId: await this.generatePatientId(),
      },
    })

    // Log audit trail
    await this.auditService.log({
      userId,
      action: 'PATIENT_CREATED',
      entityType: 'Patient',
      entityId: patient.id,
      details: { patientId: patient.patientId },
    })

    return patient
  }

  async findAll(query: SearchPatientDto) {
    const { search, page = 1, limit = 20, status } = query
    const skip = (page - 1) * limit

    const where: Prisma.PatientWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { patientId: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { visits: true },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ])

    return {
      data: patients,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string, userId: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        prescriptions: {
          where: { status: 'ACTIVE' },
        },
      },
    })

    if (!patient) {
      throw new NotFoundException('Patient not found')
    }

    // Log access
    await this.auditService.log({
      userId,
      action: 'PATIENT_ACCESSED',
      entityType: 'Patient',
      entityId: patient.id,
    })

    return patient
  }

  async update(id: string, dto: UpdatePatientDto, userId: string): Promise<Patient> {
    const patient = await this.findOne(id, userId)

    const updated = await this.prisma.patient.update({
      where: { id },
      data: dto,
    })

    // Log changes
    await this.auditService.log({
      userId,
      action: 'PATIENT_UPDATED',
      entityType: 'Patient',
      entityId: patient.id,
      details: { changes: dto },
    })

    return updated
  }

  private async generatePatientId(): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.prisma.patient.count({
      where: {
        patientId: { startsWith: `P${year}` },
      },
    })
    
    return `P${year}${String(count + 1).padStart(5, '0')}`
  }
}
```

#### Controller Example (Patients Controller):

```typescript
// apps/backend/src/patients/patients.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { PatientsService } from './patients.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CreatePatientDto, UpdatePatientDto, SearchPatientDto } from './dto'
import { Role } from '@prisma/client'

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 409, description: 'Patient already exists' })
  create(
    @Body() dto: CreatePatientDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.patientsService.create(dto, userId)
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Search patients' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully' })
  findAll(@Query() query: SearchPatientDto) {
    return this.patientsService.findAll(query)
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get patient details' })
  @ApiResponse({ status: 200, description: 'Patient retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.patientsService.findOne(id, userId)
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Update patient information' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.patientsService.update(id, dto, userId)
  }
}
```

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  DOCTOR
  NURSE
  RECEPTIONIST
  PHARMACIST
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum PatientStatus {
  ACTIVE
  INACTIVE
}

model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  password               String
  firstName              String
  lastName               String
  role                   Role      @default(DOCTOR)
  isEmailVerified        Boolean   @default(false)
  emailVerificationToken String?
  resetPasswordToken     String?
  resetPasswordExpires   DateTime?
  isActive               Boolean   @default(true)
  
  refreshTokens          RefreshToken[]
  visits                 Visit[]
  auditLogs              AuditLog[]
  
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  deletedAt              DateTime?

  @@index([email])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

model Patient {
  id              String         @id @default(cuid())
  patientId       String         @unique  // e.g., P2024-00001
  firstName       String
  lastName        String
  dateOfBirth     DateTime
  gender          Gender
  phone           String
  email           String?
  address         String?
  
  // Emergency Contact
  emergencyContactName  String?
  emergencyContactPhone String?
  
  // Medical Information
  bloodType       String?
  allergies       String[]       // Array of allergy strings
  chronicConditions String[]     // Array of conditions
  
  // Insurance
  insuranceProvider String?
  insuranceNumber   String?
  
  // Photo
  photoUrl        String?
  
  // Status
  status          PatientStatus  @default(ACTIVE)
  
  // Relations
  visits          Visit[]
  prescriptions   Prescription[]
  invoices        Invoice[]
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?

  @@index([patientId])
  @@index([phone])
  @@index([email])
  @@map("patients")
}

model Visit {
  id              String    @id @default(cuid())
  patientId       String
  patient         Patient   @relation(fields: [patientId], references: [id])
  doctorId        String
  doctor          User      @relation(fields: [doctorId], references: [id])
  
  // Visit Info
  visitDate       DateTime  @default(now())
  visitType       String    // ROUTINE, FOLLOWUP, EMERGENCY, SPECIALIST
  status          String    // IN_PROGRESS, COMPLETED, CANCELLED
  
  // Vital Signs
  bloodPressureSystolic   Int?
  bloodPressureDiastolic  Int?
  heartRate               Int?
  respiratoryRate         Int?
  temperature             Float?
  oxygenSaturation        Int?
  weight                  Float?
  height                  Float?
  bmi                     Float?
  painScale               Int?
  
  // SOAP Notes
  chiefComplaint  String?
  subjective      String?   // History of present illness
  objective       String?   // Physical examination
  assessment      String?   // Diagnosis
  plan            String?   // Treatment plan
  
  // Additional
  diagnosis       String[]  // Array of diagnoses
  notes           String?   // Free-text notes
  followUpDate    DateTime?
  isLocked        Boolean   @default(false)
  lockedAt        DateTime?
  
  // Relations
  prescriptions   Prescription[]
  invoice         Invoice?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([patientId])
  @@index([doctorId])
  @@index([visitDate])
  @@map("visits")
}

model Prescription {
  id              String    @id @default(cuid())
  patientId       String
  patient         Patient   @relation(fields: [patientId], references: [id])
  visitId         String?
  visit           Visit?    @relation(fields: [visitId], references: [id])
  
  // Medication Info
  medicationName  String
  dosage          String
  frequency       String
  route           String    // ORAL, TOPICAL, INJECTION, etc.
  duration        String
  quantity        String
  refills         Int       @default(0)
  instructions    String?
  
  // Status
  status          String    @default("ACTIVE")  // ACTIVE, DISCONTINUED, COMPLETED
  discontinuedAt  DateTime?
  discontinueReason String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([patientId])
  @@index([visitId])
  @@map("prescriptions")
}

model Invoice {
  id              String    @id @default(cuid())
  invoiceNumber   String    @unique
  patientId       String
  patient         Patient   @relation(fields: [patientId], references: [id])
  visitId         String?   @unique
  visit           Visit?    @relation(fields: [visitId], references: [id])
  
  // Invoice Items (JSON array)
  items           Json      // [{ description, quantity, unitPrice, total }]
  
  // Amounts
  subtotal        Float
  discount        Float     @default(0)
  tax             Float     @default(0)
  total           Float
  
  // Payment
  amountPaid      Float     @default(0)
  balance         Float
  status          String    // UNPAID, PARTIAL, PAID
  
  // Payment History (JSON array)
  payments        Json      @default("[]")  // [{ date, amount, method, receiptNo }]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([patientId])
  @@index([invoiceNumber])
  @@map("invoices")
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  action      String   // PATIENT_CREATED, PATIENT_ACCESSED, etc.
  entityType  String   // Patient, Visit, User, etc.
  entityId    String?
  details     Json?    // Additional details
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

## Development Workflow

### Branch Strategy

```
main                 # Production-ready code
├── develop          # Integration branch
├── feature/         # New features
│   ├── feature/patient-registration
│   ├── feature/visit-documentation
│   └── feature/prescription-management
├── fix/             # Bug fixes
│   ├── fix/search-pagination
│   └── fix/auth-token-refresh
└── release/         # Release preparation
    └── release/v1.0.0
```

### Commit Convention

Follow Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(patients): add patient search with filters

Implemented advanced patient search with filters for name, ID, phone, and date of birth.
Added pagination and sorting capabilities.

Closes #123

fix(auth): resolve token refresh issue

Fixed bug where refresh token was not being properly validated.

Refs #456

docs(api): update swagger documentation for visits endpoint

Updated API documentation to reflect new visit status field.
```

### Code Review Process

1. **Create Feature Branch**: Branch from `develop`
2. **Implement Feature**: Write code following standards
3. **Write Tests**: Ensure adequate test coverage
4. **Create Pull Request**: Detailed description of changes
5. **Code Review**: At least one approval required
6. **CI/CD Checks**: All tests and lints must pass
7. **Merge**: Squash and merge to `develop`

### Testing Strategy

#### Frontend Testing

```typescript
// Example: Testing Patient Search Component
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PatientSearch } from './patient-search'

const queryClient = new QueryClient()

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('PatientSearch', () => {
  it('should search patients when typing in search box', async () => {
    render(<PatientSearch />, { wrapper })
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await userEvent.type(searchInput, 'John')
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
    })
  })
})
```

#### Backend Testing

```typescript
// Example: Testing Patients Service
import { Test, TestingModule } from '@nestjs/testing'
import { PatientsService } from './patients.service'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

describe('PatientsService', () => {
  let service: PatientsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: {
            patient: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<PatientsService>(PatientsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('create', () => {
    it('should create a new patient', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'MALE',
        phone: '1234567890',
      }

      jest.spyOn(prisma.patient, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.patient, 'create').mockResolvedValue({
        id: '1',
        patientId: 'P202400001',
        ...dto,
      } as any)

      const result = await service.create(dto, 'user-id')

      expect(result).toBeDefined()
      expect(result.patientId).toBe('P202400001')
    })
  })
})
```

## Environment Configuration

### Environment Variables

**.env.example:**
```bash
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare_db

# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@ehealth-emr.com

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Docker Setup

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: healthcare_db
    environment:
      POSTGRES_USER: healthcareuser
      POSTGRES_PASSWORD: healthcarepass
      POSTGRES_DB: healthcare_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
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
    container_name: healthcare_backend
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://healthcareuser:healthcarepass@postgres:5432/healthcare_db
    ports:
      - "3001:3001"
    volumes:
      - ./apps/backend:/app
      - /app/node_modules
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
    container_name: healthcare_frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - healthcare_network
    command: npm run dev

volumes:
  postgres_data:

networks:
  healthcare_network:
    driver: bridge
```

## Deployment Strategy

### Development Deployment
1. Use Docker Compose for local development
2. Hot reload enabled for both frontend and backend
3. Use development database

### Staging Deployment
1. Deploy to staging environment
2. Run migrations
3. Seed test data
4. Run E2E tests
5. Manual QA testing

### Production Deployment
1. Create release branch
2. Update version numbers
3. Run full test suite
4. Build Docker images
5. Tag images with version
6. Deploy to production
7. Run database migrations (with backup)
8. Smoke tests
9. Monitor for errors

### CI/CD Pipeline (.github/workflows/ci.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add deployment scripts here
          echo "Deploying to production..."
```

## Code Quality Standards

### TypeScript Configuration

Strict mode enabled for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

## Performance Optimization

### Frontend Optimization
- Use Next.js Server Components where possible
- Implement dynamic imports for large components
- Optimize images with Next.js Image component
- Use React Query for intelligent caching
- Implement pagination for large datasets
- Debounce search inputs

### Backend Optimization
- Use database indexes on frequently queried fields
- Implement connection pooling
- Use Redis for caching (production)
- Optimize Prisma queries with proper includes
- Implement pagination for large responses
- Use database transactions for atomic operations

## Security Best Practices

1. **Input Validation**: Validate all inputs on both frontend and backend
2. **SQL Injection Prevention**: Use Prisma ORM exclusively
3. **XSS Protection**: Sanitize user inputs, use React (auto-escapes)
4. **CSRF Protection**: Implement CSRF tokens for state-changing operations
5. **Rate Limiting**: Protect all endpoints from abuse
6. **Audit Logging**: Log all sensitive operations
7. **Password Security**: Use bcrypt with 12+ salt rounds
8. **JWT Security**: Use httpOnly cookies, short-lived access tokens
9. **HTTPS Only**: Enforce HTTPS in production
10. **Regular Updates**: Keep dependencies updated

## Documentation Standards

### Code Documentation
- Use JSDoc comments for functions and classes
- Document complex logic and business rules
- Keep comments up-to-date with code changes

### API Documentation
- Use Swagger/OpenAPI for REST API documentation
- Document all request/response schemas
- Include example requests and responses
- Document error responses

### README Files
- Maintain README.md in each major directory
- Include setup instructions
- Document environment variables
- Provide usage examples

This implementation guide provides a solid foundation for building a secure, scalable, and maintainable EMR system. Following these standards will ensure code quality and consistency across the entire application.
