# Project Structure & Architecture

## Backend (NestJS)

The backend follows a **Modular Monolith** architecture. Each major domain is a self-contained module.

```text
src/
├── app.module.ts            # Root Module
├── main.ts                  # Entry point (Swagger, ValidationPipe, CORS)
├── common/                  # Shared utilities
│   ├── decorators/          # @CurrentUser, @Public
│   ├── dto/                 # PaginationDto, SearchDto
│   ├── filters/             # HttpExceptionFilter
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── interceptors/        # TransformInterceptor (Response formatting)
│   └── prisma/              # PrismaService
├── modules/                 # Feature Modules
│   ├── auth/                # Authentication (Login, Register, JWT)
│   ├── users/               # Staff/User Management
│   ├── patients/            # Patient CRUD
│   ├── visits/              # Clinical Encounters
│   ├── prescriptions/       # (TODO) Medication Management
│   ├── billing/             # (TODO) Invoices & Payments
│   ├── files/               # (TODO) File Uploads
│   ├── reports/             # (TODO) Aggregated Data
│   └── audit/               # (TODO) System Logs
└── templates/               # Email & PDF Templates
```

### Key Architectural Decisions

- **DTOs per Layer**: Strict use of Data Transfer Objects for all Inputs/Outputs.
- **Service Repository Pattern**: Services contain business logic; Prisma acts as the repository layer.
- **Global Pipes**: `ValidationPipe` with `whitelist: true` to strip unknown properties.

---

## Frontend (Next.js App Router)

The frontend uses **Next.js 14+** with the App Router architecture.

```text
src/
├── app/                     # App Router (Routes)
│   ├── (auth)/              # Route Group: Login/Register layouts
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected Routes
│   │   ├── layout.tsx       # Sidebar & Header
│   │   ├── page.tsx         # Dashboard Home
│   │   ├── patients/
│   │   │   ├── [id]/        # Patient Details
│   │   ├── records/         # EMR Views
│   │   └── settings/
│   └── api/                 # Next.js API Routes (BFF - Optional)
├── components/
│   ├── ui/                  # ShadCN/Radix primitives (Button, Card, Input)
│   ├── features/            # Business-aware components
│   │   ├── patient-card.tsx
│   │   ├── visit-timeline.tsx
│   │   └── prescription-form.tsx
│   └── shared/              # Generic reusable (DataTable, Modal)
├── lib/
│   ├── api.ts               # Axios instance & Interceptors
│   ├── utils.ts             # CN helper, Date formatters
│   └── store.ts             # Zustand stores (AuthStore, UIStore)
├── hooks/                   # Custom React Hooks
│   ├── use-auth.ts
│   └── use-debounce.ts
└── types/                   # TypeScript Interfaces (Shared with Backend DTOs)
```

### Design System

- **TailwindCSS**: Utility-first styling.
- **ShadCN UI**: Component library foundation.
- **Lucide React**: Iconography.
- **Zod**: Schema validation (matches Backend DTOs).
