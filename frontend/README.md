# eHealth EMR Frontend

Web-based Electronic Medical Records (EMR) system frontend built with Next.js 16, React 19, and TypeScript.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Backend API running (default: http://localhost:4081)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Edit .env.local with your configuration
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4081/api/v1

# Application URL (for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── [language]/         # Language-based routing
│   │   └── (core)/        # Core application routes
│   ├── api/               # API route handlers (BFF)
│   ├── error.tsx          # Error boundary
│   ├── not-found.tsx      # 404 page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── common/           # Reusable components
│   ├── features/         # Feature-specific components
│   ├── layouts/          # Layout components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── api-client.ts     # Axios instance
│   ├── auth.ts           # Auth utilities
│   ├── constants.ts      # App constants
│   ├── validators.ts     # Zod schemas
│   └── utils/           # Utility functions
├── store/               # Zustand stores
├── types/               # TypeScript types
└── public/              # Static assets
```

## 🏗️ Architecture

### Routing

- **Language-based routing**: All routes are prefixed with `[language]` (e.g., `/en/dashboard`)
- **Route groups**: Use `(core)` for protected routes with dashboard layout
- **API routes**: Next.js API routes act as BFF (Backend for Frontend)

### State Management

- **Zustand**: Global state (auth, UI state)
- **React Context**: Feature-specific state (patients, visits, etc.)
- **React Hook Form**: Form state management

### Authentication

- JWT-based authentication with refresh tokens
- Access tokens stored in memory
- Refresh tokens in httpOnly cookies
- Automatic token refresh on 401 errors

### Error Handling

- Global error boundary (`app/error.tsx`)
- Component-level error boundaries
- Standardized error handling utilities
- User-friendly error messages

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) components:

- Button, Input, Card, Dialog
- Form components with validation
- Table, Tabs, Dropdown
- Loading states and skeletons

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Code formatting (configured)
- **Tailwind CSS**: Utility-first styling

## 🔒 Security

- HTTPS/TLS in production
- Security headers configured
- XSS protection
- CSRF protection
- Input validation and sanitization

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run E2E tests (when implemented)
npm run test:e2e
```

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

### Docker

```bash
# Build Docker image
docker build -t ehealth-frontend .

# Run container
docker run -p 3000:3000 ehealth-frontend
```

## 🐛 Troubleshooting

### Common Issues

1. **API connection errors**: Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. **Authentication issues**: Verify backend is running and tokens are valid
3. **Build errors**: Clear `.next` folder and rebuild

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Follow the existing code style
2. Write TypeScript types for all new code
3. Add error handling for API calls
4. Update documentation for new features

## 📄 License

Copyright © 2025 eHealth EMR. All rights reserved.
