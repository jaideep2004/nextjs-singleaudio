# Copilot Instructions: Karhari Media Music Distribution Platform

## Project Overview

Karhari Media is a full-stack music distribution platform with:
- **Next.js 15 frontend** (`src/`) using App Router, React 19, Material UI, and Emotion
- **Standalone Express backend** (`server/src/`) with TypeScript, MongoDB, Mongoose, JWT auth
- **Monorepo workspace structure** linking both via npm scripts and `NEXT_PUBLIC_API_URL` environment variable

Key concept: **This is a hybrid API approach** — some features call the Express backend directly while others use Next.js API routes. Refer to `README.md` for architectural details.

## Architecture & Key Patterns

### Hybrid API Communication
- Frontend API layer: `src/services/api.ts` (Axios instance with JWT interceptors)
- Shared auth: JWT tokens stored in cookies, validated by `server/src/middleware/auth.middleware.ts`
- Next.js routes in `src/app/api/` are sometimes wrappers/proxies, sometimes return mock data — check controller implementations before assuming behavior

### Backend Layers (Express)
- **Controllers** (`server/src/controllers/`): Route handlers, use `AuthRequest` interface
- **Repositories** (`server/src/repositories/base.repository.ts`): Generic CRUD base class with pagination support
- **Models** (`server/src/models/`): Mongoose schemas (User, Track, Royalty, Payout, Notification, etc.)
- **Services** (`server/src/services/`): Business logic, storage abstraction, audio processing
- **Middleware**: Auth (`protect`, `authorize` role-based), error handling (custom `ApiError` class), CORS, validators

### Error Handling Pattern
```typescript
// Backend uses custom ApiError class for consistency
if (err instanceof ApiError) {
  errorResponse(res, err.message, err, err.statusCode);
}
// Global handler in server/src/middleware/errorHandler.middleware.ts
```

### Frontend Component Structure
- **Context** (`src/context/`): `AppContext.tsx` manages auth state, user, signup flow
- **Components**: Feature-based folders (`src/components/admin/`, `src/components/track/`, etc.)
- **Hooks**: `src/hooks/` (custom React hooks like `useAdminAuth`)
- **Types**: Separate `src/types/` for frontend types, `server/src/types/` for backend

## Critical Development Workflows

### Local Development (Start Here)
```bash
# Root directory - runs both client and server concurrently
npm install                    # Install all dependencies
npm run dev                    # Starts Next.js dev server (port 3000) + Express (port 5000)

# Or separately:
npm run dev:client            # Next.js only (port 3000)
npm run dev:server            # Express only (port 5000)
```

### Environment Setup
Required files:
- **Root `.env.local`** (Next.js): `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- **`server/.env`** (Express): `PORT=5000`, `MONGODB_URI=...`, `JWT_SECRET=...`, `JWT_EXPIRES_IN=30d`
- Optional: `FFMPEG_PATH`, `FFPROBE_PATH` for audio processing on Windows

### Backend Scripts
```bash
cd server
npm run dev                   # Development with nodemon
npm run build                 # Compile TypeScript to dist/
npm run start                 # Run compiled dist/index.js
npm run lint                  # ESLint check
npm run seed:admin           # Create default admin user (edit src/scripts/seedAdmin.ts for values)
```

### Build & Deployment
```bash
npm run build                # Builds both client and server
# Client output: .next/
# Server output: server/dist/
```

## Project-Specific Patterns

### JWT Authentication Pattern
1. User logs in via `/api/auth/login` (Express)
2. Backend returns JWT token
3. Frontend stores token in cookie via `Cookies.set('token', ...)`
4. Axios interceptor (`src/services/api.ts`) attaches `Authorization: Bearer {token}` to all requests
5. Backend validates via `protect` middleware, extends `AuthRequest` with `req.user`

### Role-Based Authorization
```typescript
// Backend: Use authorize middleware with role array
router.get('/admin-only', protect, authorize([UserRole.ADMIN]), handler);
```

### Pagination & Repository Pattern
```typescript
// BaseRepository provides: findById, findOne, find, paginate, create, update, delete
// Always use populate() for relationships
const result = await someRepository.paginate(
  { status: 'active' },
  { page: 1, limit: 10 },
  { createdAt: -1 },
  ['artistId']  // populate field
);
```

### Audio Processing
- Uses `fluent-ffmpeg` wrapper with `ffmpeg`/`ffprobe` binaries
- Windows users: Set `FFMPEG_PATH` and `FFPROBE_PATH` env vars in `server/.env`
- Audio metadata extracted via `music-metadata` package
- Local file uploads: `server/uploads/` directory structure for tracks, artwork, registration files

### Storage Abstraction
Backend supports pluggable storage (local/S3/GCS) — check `server/src/services/` for storage provider interface.

## File Locations by Feature

### Track Upload
- Frontend form: `src/components/track/` (upload UI)
- API handler: `src/services/api.ts` → `tracksAPI`
- Backend: `server/src/controllers/track.controller.ts` + `server/src/models/track.model.ts`
- Routes: `server/src/routes/track.route.ts`

### Admin Dashboard
- Frontend: `src/app/(auth)/admin` (layout, pages)
- Components: `src/components/admin/`
- Auth guard: `src/components/AuthGuard.tsx` (role-based redirect)
- Backend: `server/src/controllers/user.controller.ts` for user management

### Royalties & Payouts
- Models: `server/src/models/royalty.model.ts`, `server/src/models/payout.model.ts`
- Controllers: `server/src/controllers/royalty.controller.ts`, `server/src/controllers/payout.controller.ts`
- Frontend: `src/app/(auth)/dashboard` to view user's royalties

## Important Notes

1. **Graphify Knowledge Graph**: The project includes `graphify-out/` — use `graphify query`, `graphify path`, or read `GRAPH_REPORT.md` for cross-module dependencies before major refactors.

2. **Caveman Mode**: AGENTS.md specifies using "caveman mode (full)" by default for this project — read dependencies thoroughly.

3. **Testing**: No dedicated test setup currently visible — verify test infrastructure before writing test code.

4. **Next.js API Routes**: Some endpoints in `src/app/api/` may be incomplete or mock. Check backend Express routes first when debugging API behavior.

5. **TypeScript Strict Mode**: Both client and server enforce strict TypeScript — use proper types, avoid `any`.

## Quick Debugging Checklist

- Tokens not persisting? Check `js-cookie` usage in `AppContext.tsx` and axios interceptor in `api.ts`
- Audio analysis failing? Verify `ffmpeg`/`ffprobe` binaries and env vars on Windows
- MongoDB connection errors? Check `MONGODB_URI` in `server/.env` and Atlas firewall rules
- CORS issues? Check `server/src/middleware/cors.middleware.ts` and `setupCors()` in `index.ts`
- Role-based route access denied? Verify user role in `authorize()` middleware vs. route protection
