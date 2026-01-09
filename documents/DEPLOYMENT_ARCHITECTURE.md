# 🏗️ Deployment Architecture - eHealth EMR

**Architect:** System Architecture Review  
**Created:** January 9, 2026  
**Status:** Production Deployment Strategy

---

## 📋 Executive Summary

**Recommendation: ✅ SEPARATE FRONTEND AND BACKEND**

For production deployment, **separating frontend and backend is strongly recommended** for security, scalability, performance, and maintainability. This document outlines the architecture, rationale, and implementation strategies.

---

## 🎯 Quick Answer

### Should You Separate Frontend and Backend?

**YES - Separate them in production** for the following reasons:

1. ✅ **Security:** Isolated attack surfaces
2. ✅ **Scalability:** Independent scaling
3. ✅ **Performance:** CDN for static assets
4. ✅ **Maintainability:** Independent deployments
5. ✅ **Cost Efficiency:** Optimize resources per service
6. ✅ **Compliance:** Better for HIPAA/GDPR requirements

**Exception:** Keep together only for:
- Very small deployments (< 100 users)
- Prototype/MVP phase
- Single-server constraints

---

## 🏛️ Architecture Options

### Option 1: Separated Deployment (✅ RECOMMENDED)

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   CDN / Load Balancer │
         │   (CloudFlare/Nginx)  │
         └───────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐        ┌───────────────┐
│   Frontend    │        │    Backend    │
│   (Next.js)   │        │   (NestJS)    │
│               │        │               │
│ - Static      │        │ - API Server  │
│ - SSR Pages   │        │ - Auth        │
│ - CDN Cached  │        │ - Business    │
│               │        │   Logic      │
└───────┬───────┘        └───────┬───────┘
        │                        │
        │                        ▼
        │                ┌───────────────┐
        │                │   Database    │
        │                │  (PostgreSQL) │
        │                └───────────────┘
        │
        └────────────────────────┘
              (API Calls)
```

**Characteristics:**
- Frontend: Static hosting or Next.js SSR
- Backend: API server (NestJS)
- Communication: REST API over HTTPS
- Deployment: Independent services

---

### Option 2: Monolithic Deployment (⚠️ NOT RECOMMENDED)

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Reverse Proxy       │
         │   (Nginx)             │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Single Container    │
         │                       │
         │  ┌─────────┐          │
         │  │Frontend │          │
         │  │(Next.js)│          │
         │  └────┬────┘          │
         │       │               │
         │  ┌────▼────┐          │
         │  │ Backend │          │
         │  │(NestJS) │          │
         │  └────┬────┘          │
         │       │               │
         └───────┼───────────────┘
                 │
                 ▼
         ┌───────────────┐
         │   Database   │
         │ (PostgreSQL)  │
         └───────────────┘
```

**Characteristics:**
- Everything in one container/service
- Simpler initial setup
- Less flexible for scaling
- Single point of failure

---

## 🔍 Detailed Comparison

### Separated Deployment

#### ✅ Advantages

1. **Security**
   - **Isolated Attack Surface:** Frontend compromise doesn't directly expose backend
   - **Network Isolation:** Backend not directly exposed to internet
   - **Firewall Rules:** Can restrict backend access to frontend only
   - **CORS Control:** Better control over cross-origin requests

2. **Scalability**
   - **Independent Scaling:** Scale frontend and backend separately
   - **Resource Optimization:** Frontend needs less CPU/memory
   - **Horizontal Scaling:** Add more backend instances as needed
   - **CDN Benefits:** Static assets served from edge locations

3. **Performance**
   - **CDN Caching:** Frontend assets cached globally
   - **Reduced Backend Load:** Static files don't hit backend
   - **Optimized Delivery:** Frontend optimized for delivery, backend for processing
   - **Better Caching:** Different caching strategies per service

4. **Maintainability**
   - **Independent Deployments:** Deploy frontend without affecting backend
   - **Version Control:** Different release cycles
   - **Team Separation:** Frontend and backend teams work independently
   - **Rollback Safety:** Rollback one service without affecting the other

5. **Cost Efficiency**
   - **Optimized Resources:** Pay only for what each service needs
   - **CDN Costs:** Often cheaper than serving from backend
   - **Scaling Costs:** Scale expensive backend only when needed

6. **Compliance (HIPAA/GDPR)**
   - **Data Isolation:** Backend (with PHI) can have stricter controls
   - **Audit Trails:** Clear separation of frontend vs backend access
   - **Network Segmentation:** Easier to implement security zones

#### ⚠️ Disadvantages

1. **Complexity**
   - More services to manage
   - More configuration
   - CORS configuration needed
   - Environment variable management

2. **Network Latency**
   - API calls over network (minimal with proper setup)
   - Need to handle network failures gracefully

3. **Initial Setup**
   - More moving parts
   - Requires reverse proxy/load balancer

---

### Monolithic Deployment

#### ✅ Advantages

1. **Simplicity**
   - Single service to deploy
   - Easier initial setup
   - Less configuration

2. **Development**
   - Easier local development
   - No CORS issues in development
   - Shared code easier to access

3. **Small Scale**
   - Fine for < 100 users
   - Lower infrastructure costs initially
   - Simpler monitoring

#### ⚠️ Disadvantages

1. **Scalability Issues**
   - Can't scale frontend and backend independently
   - Wasted resources (frontend doesn't need backend resources)
   - Single point of failure

2. **Security Concerns**
   - Larger attack surface
   - Frontend and backend in same process
   - Harder to implement network segmentation

3. **Performance**
   - Static assets served by backend (inefficient)
   - No CDN benefits
   - Backend handles both API and static files

4. **Deployment**
   - Must redeploy everything for any change
   - Longer deployment times
   - Higher risk deployments

---

## 🚀 Recommended Production Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   CloudFlare / CDN     │
            │   - DDoS Protection    │
            │   - SSL Termination    │
            │   - Global CDN          │
            └────────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   Load Balancer        │
            │   (Nginx / AWS ALB)    │
            │   - SSL Termination    │
            │   - Health Checks      │
            └────────────┬───────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐              ┌───────────────┐
│   Frontend    │              │    Backend    │
│   (Next.js)   │              │   (NestJS)   │
│               │              │               │
│ Deployment:   │              │ Deployment:   │
│ - Vercel      │              │ - Railway     │
│ - Netlify     │              │ - Render      │
│ - AWS S3+CF   │              │ - AWS ECS     │
│ - VPS (Nginx) │              │ - VPS (PM2)   │
│               │              │               │
│ Features:     │              │ Features:     │
│ - Static      │              │ - API Server │
│ - SSR         │              │ - Auth        │
│ - Edge Cache  │              │ - Business    │
│               │              │   Logic      │
└───────┬───────┘              └───────┬───────┘
        │                              │
        │  HTTPS API Calls             │
        │  (CORS Configured)           │
        │                              │
        │                              ▼
        │                    ┌──────────────────┐
        │                    │   Database       │
        │                    │  (PostgreSQL)    │
        │                    │                  │
        │                    │  - Managed DB   │
        │                    │  - Read Replicas │
        │                    │  - Backups       │
        │                    └──────────────────┘
        │
        └──────────────────────────┘
              (Optional: Redis Cache)
```

---

## 📦 Deployment Strategies

### Strategy 1: Cloud Platform (Recommended for Production)

#### Frontend: Vercel / Netlify
```yaml
Benefits:
  - Optimized for Next.js
  - Automatic deployments from Git
  - Global CDN included
  - SSL certificates automatic
  - Edge functions support
  - Zero configuration

Configuration:
  - Build Command: npm run build
  - Output Directory: .next
  - Environment Variables: NEXT_PUBLIC_API_URL
```

#### Backend: Railway / Render / AWS ECS
```yaml
Benefits:
  - Easy Git-based deployment
  - Managed PostgreSQL available
  - Automatic HTTPS
  - Health checks
  - Auto-scaling

Configuration:
  - Build Command: npm run build
  - Start Command: npm run start:prod
  - Port: 3000 (or configured)
  - Environment Variables: All backend vars
```

**Cost:** ~$20-50/month for small clinic

---

### Strategy 2: VPS Deployment (Cost-Effective)

#### Single VPS with Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/ehealth-emr
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
            proxy_pass http://localhost:3000;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
```

**Docker Compose for VPS:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    networks:
      - app-network

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      PORT: 3001
    depends_on:
      - postgres
    restart: always
    networks:
      - app-network
    # Don't expose port - only accessible via Nginx

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      target: production
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://yourdomain.com/api
    restart: always
    networks:
      - app-network
    # Don't expose port - only accessible via Nginx

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

**Cost:** ~$10-20/month (DigitalOcean, Linode, Hetzner)

---

### Strategy 3: Hybrid (Best of Both Worlds)

#### Frontend: Vercel (Free/Paid)
- Optimized Next.js hosting
- Global CDN
- Automatic deployments

#### Backend: VPS or Cloud
- Full control
- Database on same network
- Cost-effective

**Best for:** Production deployments with budget constraints

---

## 🔒 Security Architecture

### Separated Deployment Security

```
Internet
   │
   ▼
┌─────────────┐
│   CDN/WAF   │ ← DDoS Protection, SSL Termination
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Load Balancer│ ← SSL Termination, Health Checks
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌──────┐
│Front│ │Backend│
│end  │ │       │
└──┬──┘ └───┬───┘
   │        │
   │        │ (Internal Network)
   │        ▼
   │   ┌─────────┐
   │   │Database │ ← Not exposed to internet
   │   └─────────┘
   │
   └──────────┘
   (HTTPS API Calls)
```

**Security Benefits:**
1. **Network Isolation:** Backend not directly accessible
2. **Firewall Rules:** Restrict backend access
3. **CORS:** Control which origins can access API
4. **Rate Limiting:** Applied at load balancer level
5. **WAF:** Web Application Firewall at CDN level

---

## 📊 Scalability Considerations

### Separated Deployment Scaling

#### Frontend Scaling
- **Static Assets:** CDN handles automatically
- **SSR Pages:** Can use edge functions (Vercel)
- **Scaling:** Automatic with CDN
- **Cost:** Minimal (CDN is cheap)

#### Backend Scaling
- **Horizontal Scaling:** Add more backend instances
- **Load Balancing:** Distribute API requests
- **Database:** Add read replicas
- **Caching:** Redis for frequently accessed data

**Example Scaling:**
```
Initial: 1 backend instance
Growth:  2-3 backend instances (load balanced)
Scale:   5+ backend instances + read replicas
```

---

## 💰 Cost Comparison

### Separated Deployment

| Service | Provider | Cost/Month |
|---------|----------|------------|
| Frontend | Vercel (Hobby) | $0-20 |
| Backend | Railway | $5-20 |
| Database | Railway/Render | $5-15 |
| **Total** | | **$10-55** |

### VPS Deployment

| Service | Provider | Cost/Month |
|---------|----------|------------|
| VPS (4GB RAM) | DigitalOcean | $24 |
| Domain | Namecheap | $1 |
| SSL | Let's Encrypt | $0 |
| **Total** | | **$25** |

### Cloud Platform (AWS)

| Service | Provider | Cost/Month |
|---------|----------|------------|
| Frontend (S3 + CloudFront) | AWS | $5-10 |
| Backend (ECS Fargate) | AWS | $15-30 |
| Database (RDS) | AWS | $15-50 |
| **Total** | | **$35-90** |

---

## 🛠️ Implementation Guide

### Step 1: Prepare for Separation

1. **Update Frontend Environment Variables**
   ```bash
   # apps/frontend/.env.production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

2. **Configure Backend CORS**
   ```typescript
   // apps/backend/src/main.ts
   app.enableCors({
     origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   });
   ```

3. **Update API Client**
   ```typescript
   // apps/frontend/src/lib/api-client.ts
   const apiClient = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_URL,
     withCredentials: true, // For httpOnly cookies
   });
   ```

### Step 2: Create Production Dockerfiles

#### Frontend Dockerfile
```dockerfile
# apps/frontend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm ci

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --prefix apps/frontend

# Production
FROM base AS runner
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Backend Dockerfile
```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --prefix apps/backend

# Production
FROM base AS runner
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/prisma ./prisma

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

### Step 3: Deployment Scripts

#### Deploy to VPS
```bash
#!/bin/bash
# deploy.sh

# Build and push images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] SSL certificates ready
- [ ] Database migrations tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking (Sentry) configured

### Deployment
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and healthy
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] SSL certificates valid
- [ ] CORS working correctly
- [ ] API endpoints responding

### Post-Deployment
- [ ] Smoke tests passing
- [ ] Performance monitoring active
- [ ] Error tracking working
- [ ] Backups running
- [ ] Documentation updated

---

## 🎯 Final Recommendation

### For Production: **SEPARATE FRONTEND AND BACKEND**

**Recommended Architecture:**
1. **Frontend:** Vercel or Netlify (optimized for Next.js)
2. **Backend:** Railway, Render, or VPS (full control)
3. **Database:** Managed PostgreSQL (Railway, Render, or AWS RDS)
4. **CDN:** CloudFlare (free tier) for additional protection

**Why:**
- ✅ Better security
- ✅ Independent scaling
- ✅ Cost-effective
- ✅ Better performance
- ✅ Easier maintenance
- ✅ Compliance-friendly

**Exception:** Only use monolithic deployment for:
- Prototype/MVP
- Very small scale (< 50 users)
- Single-server constraints
- Development environment

---

## 📚 Additional Resources

### Deployment Platforms
- **Vercel:** https://vercel.com (Frontend)
- **Railway:** https://railway.app (Backend)
- **Render:** https://render.com (Full Stack)
- **DigitalOcean:** https://digitalocean.com (VPS)

### Documentation
- Next.js Deployment: https://nextjs.org/docs/deployment
- NestJS Deployment: https://docs.nestjs.com/recipes/deployment
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/

---

**Last Updated:** January 9, 2026  
**Status:** Production Ready

