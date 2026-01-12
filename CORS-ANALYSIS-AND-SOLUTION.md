# CORS Analysis & Solution
## System Architecture Analysis
**Prepared by: System Architect & Software Engineer**

---

## 🔍 Current Architecture

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│                  http://localhost:3000                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌──────────────────┐
│  Direct Call  │       │  Next.js Proxy   │
│   (CORS ❌)   │       │  /api/* routes   │
│               │       │   (No CORS ✅)   │
└───────┬───────┘       └────────┬─────────┘
        │                        │
        │                        │
        └──────────┬─────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   NestJS Backend     │
        │ http://localhost:4081│
        │    /api/v1/*         │
        └──────────────────────┘
```

---

## ❌ ROOT CAUSES IDENTIFIED

### 1. **Dual Request Pattern (Architecture Issue)**

**Problem:** Your frontend has TWO different ways of calling the backend:

#### A. Direct Browser Calls (Triggers CORS)
```typescript
// frontend/lib/api-client.ts
const apiClient = axios.create({
  baseURL: 'http://localhost:4081/api/v1',  // Different origin!
  withCredentials: true,
});
```
- **Origin:** `http://localhost:3000`
- **Target:** `http://localhost:4081`
- **CORS:** ❌ Required (cross-origin request)
- **Used by:** TanStack Query hooks (e.g., `use-patients.ts`)

#### B. Next.js API Routes (Proxy Pattern - No CORS)
```typescript
// frontend/app/api/patients/route.ts
export async function GET(request: NextRequest) {
  const response = await axios.get(`${BACKEND_API_URL}/patients`);
  // This runs on the server, not in the browser
}
```
- **Origin:** Server-side (no origin)
- **Target:** `http://localhost:4081`
- **CORS:** ✅ Not needed (server-to-server)
- **Used by:** Auth routes, some settings

**Why This Matters:** You're mixing patterns, which creates:
- Inconsistent behavior
- Confusion about which endpoints need CORS
- Maintenance complexity

---

### 2. **Backend CORS Configuration Issues**

**File:** `backend/src/main.ts`

#### Issue A: Strict Origin Matching
```typescript:44:59:backend/src/main.ts
app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      frontendUrl,  // Must match EXACTLY
      apiUrl,
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS')); // ❌ This is your error
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
});
```

**Problem:** 
- If `FRONTEND_URL=http://localhost:8000` but frontend is on port 3000 → CORS error
- If `FRONTEND_URL=http://localhost:3000` but you change port → CORS error
- Too strict for development

#### Issue B: Missing Error Logging
```typescript:55:58:backend/src/main.ts
if (allowedOrigins.includes(origin)) {
  callback(null, true);
} else {
  callback(new Error('Not allowed by CORS')); // No logging!
}
```

**Problem:** You can't see WHY CORS failed in logs.

#### Issue C: Redundant CORS Configuration
```typescript:19:19:backend/src/main.ts
const app = await NestFactory.create(AppModule, { cors: true });
```

**Problem:** This enables CORS globally, then line 44 overrides it. Confusing.

---

### 3. **Environment Variable Mismatch**

#### Backend Environment Variables
```env
# backend/env.example
FRONTEND_URL=http://localhost:3000  # Must match actual frontend port
BACKEND_URL=http://localhost:4081
```

#### Frontend Environment Variables
```env
# frontend/env.example
NEXT_PUBLIC_API_URL=http://localhost:4081/api/v1
```

**Problem:** 
- If `FRONTEND_URL` doesn't match where frontend actually runs → CORS error
- No validation on startup
- Easy to get out of sync

---

## ✅ RECOMMENDED SOLUTIONS

### Option 1: Use Next.js API Routes (BFF Pattern) - **RECOMMENDED** ⭐

**Why:** Best for production, no CORS issues, better security.

#### Architecture:
```
Browser → Next.js API Routes → NestJS Backend
(Same origin, no CORS)
```

#### Changes Required:

1. **Update all TanStack Query hooks to use Next.js API routes:**

```typescript
// frontend/hooks/queries/use-patients.ts
export function usePatients(params: PatientSearchParams) {
  return useQuery<PaginatedResponse<Patient>, Error>({
    queryKey: ['patients', params],
    queryFn: async () => {
      // ✅ Use Next.js API route instead of direct backend call
      const response = await apiClient.get('/api/patients', { params });
      return response.data;
    },
  });
}
```

2. **Update api-client.ts to point to Next.js routes:**

```typescript
// frontend/lib/api-client.ts
const apiClient = axios.create({
  baseURL: '/', // ✅ Same origin - no CORS!
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
```

3. **Create/update Next.js API routes for all endpoints**

**Pros:**
- ✅ No CORS issues ever
- ✅ Better security (hide backend URL)
- ✅ Can add rate limiting, caching at BFF layer
- ✅ Can transform data before sending to frontend
- ✅ Production-ready

**Cons:**
- ❌ More boilerplate (need API route for each endpoint)
- ❌ Extra network hop (minimal latency)

---

### Option 2: Fix CORS and Use Direct Calls - **SIMPLER FOR DEV**

**Why:** Faster development, less code, good for MVP.

#### Changes Required:

1. **Update backend CORS to be more permissive in development:**

```typescript
// backend/src/main.ts
app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Development: Allow any localhost
    if (process.env.NODE_ENV === 'development') {
      const localhostRegex = /^http:\/\/localhost:\d+$/;
      if (localhostRegex.test(origin)) {
        return callback(null, true);
      }
    }
    
    // Production: Strict matching
    const allowedOrigins = [
      frontendUrl,
      apiUrl,
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // ✅ Add logging
      console.error(`CORS blocked request from: ${origin}`);
      console.error(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
```

2. **Add startup validation:**

```typescript
// backend/src/main.ts (after app.listen)
console.log('🔧 Environment Configuration:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  Backend URL: ${apiUrl}`);
console.log(`  Frontend URL: ${frontendUrl}`);
console.log(`  Port: ${port}`);

if (process.env.NODE_ENV === 'production' && frontendUrl?.includes('localhost')) {
  console.warn('⚠️  WARNING: FRONTEND_URL is set to localhost in production!');
}
```

3. **Keep using direct API calls:**

```typescript
// frontend/lib/api-client.ts (keep as is)
const apiClient = axios.create({
  baseURL: API_BASE_URL, // http://localhost:4081/api/v1
  withCredentials: true,
});
```

**Pros:**
- ✅ Simple, less code
- ✅ Faster development
- ✅ Direct backend calls (no proxy overhead)

**Cons:**
- ❌ CORS configuration must be maintained
- ❌ Backend URL exposed to frontend
- ❌ Need to handle CORS in production

---

### Option 3: Hybrid Approach - **FLEXIBLE**

Use Next.js API routes for:
- Authentication (sensitive)
- File uploads
- Operations requiring server-side logic

Use direct calls for:
- Public data fetching
- Real-time updates
- Read-only operations

---

## 🛠️ IMPLEMENTATION PLAN

### Immediate Fix (5 minutes)
1. Update `backend/.env`: `FRONTEND_URL=http://localhost:3000`
2. Restart backend server
3. Test - CORS should work

### Short-term (Development) - Option 2
1. Implement permissive CORS for localhost in development
2. Add logging and validation
3. Keep using direct API calls
4. **Estimated time:** 30 minutes

### Long-term (Production) - Option 1
1. Migrate to Next.js API routes (BFF pattern)
2. Update all query hooks
3. Remove CORS from backend (or make it very restrictive)
4. **Estimated time:** 4-6 hours

---

## 📋 CHECKLIST

### Backend
- [ ] Update `backend/.env` with correct `FRONTEND_URL`
- [ ] Implement development-friendly CORS
- [ ] Add CORS error logging
- [ ] Add startup validation
- [ ] Test with different origins

### Frontend
- [ ] Decide: BFF pattern or direct calls?
- [ ] Update `frontend/.env` with correct `NEXT_PUBLIC_API_URL`
- [ ] If BFF: Create all necessary API routes
- [ ] If direct: Ensure all requests use `withCredentials: true`
- [ ] Test authentication flow
- [ ] Test refresh token rotation

### DevOps
- [ ] Document environment variables
- [ ] Create `.env.development` and `.env.production` templates
- [ ] Add environment validation in CI/CD
- [ ] Update deployment docs

---

## 🔐 SECURITY CONSIDERATIONS

### Current Security (Good)
✅ httpOnly cookies for refresh tokens  
✅ Short-lived access tokens (15m)  
✅ Token rotation on refresh  
✅ CSRF protection via SameSite cookies  
✅ Helmet security headers  

### Recommendations
1. **Production CORS:** Must be strict (exact origin match)
2. **Rate Limiting:** Already implemented with `@nestjs/throttler` ✅
3. **Cookie Security:** Ensure `secure: true` in production
4. **HTTPS:** Use HTTPS in production (CORS + cookies + HTTPS = secure)

---

## 📊 COMPARISON TABLE

| Aspect | Direct Calls | BFF Pattern |
|--------|--------------|-------------|
| CORS Issues | ⚠️ Need to configure | ✅ No CORS |
| Development Speed | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐ Medium |
| Production Ready | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| Security | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Better |
| Backend URL Hidden | ❌ No | ✅ Yes |
| Latency | ⭐⭐⭐⭐⭐ Direct | ⭐⭐⭐⭐ +1 hop |
| Code Complexity | ⭐⭐⭐⭐⭐ Simple | ⭐⭐⭐ More code |
| Caching | ⭐⭐⭐ Client only | ⭐⭐⭐⭐⭐ Server + Client |

---

## 🎯 MY RECOMMENDATION

**For your current stage (MVP/Development):**
→ **Use Option 2** (Fix CORS, keep direct calls)

**Reasons:**
1. You already have TanStack Query hooks using direct calls
2. Faster to implement and iterate
3. Good enough for development and MVP
4. Can migrate to BFF later if needed

**For production:**
→ **Migrate to Option 1** (BFF pattern)

**Reasons:**
1. Better security posture
2. No CORS complexity
3. Can add middleware, rate limiting, caching
4. Hide internal backend architecture

---

## 📝 NEXT STEPS

1. **Right Now:** I'll implement Option 2 (fix CORS properly)
2. **This Week:** Test thoroughly, document
3. **Before Production:** Evaluate migration to BFF pattern
4. **Production:** Implement strict CORS for production environment

Would you like me to implement Option 2 now?
