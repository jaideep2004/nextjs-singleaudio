# Karhari Media Music Distribution Platform

A full-stack music distribution platform for artists and admins. The project combines a Next.js web app with a standalone Express API and MongoDB database to support artist onboarding, track uploads, release management, royalties, payouts, notifications, and admin operations.

## What This Project Currently Includes

### Public experience
- Landing page
- Login and signup flows
- Public artist profile pages

### Artist experience
- Authenticated dashboard
- Track and artwork upload flow
- Release management
- Royalties view
- Settings/profile management

### Admin experience
- Admin dashboard
- User management
- Release review pages
- Track overview
- Payout management
- Analytics pages
- Platform settings management

### Backend capabilities
- JWT-based authentication
- MongoDB models for users, tracks, royalties, payouts, notifications, settings, rights, territories, and audit logs
- Audio file upload handling with Multer
- Audio analysis support via `ffmpeg` / `ffprobe`
- Pluggable storage provider structure
- Store integration scaffolding for Spotify, Apple Music, and YouTube Content ID

## Tech Stack

### Frontend
- Next.js 15 App Router
- React 19
- TypeScript
- Material UI
- Emotion
- React Hook Form
- Recharts / Chart.js
- Axios

### Backend
- Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Express Validator
- Multer
- `fluent-ffmpeg`
- `music-metadata`

## Architecture Overview

This repository is organized as a workspace-style monorepo:

```text
nextjs-singleaudio/
|-- src/                     # Next.js application
|   |-- app/                 # App Router pages, layouts, route handlers
|   |-- components/          # Shared UI and feature components
|   |-- context/             # App-level React providers
|   |-- hooks/               # Custom React hooks
|   |-- services/            # Frontend API client layer
|   |-- utils/               # Shared frontend utilities
|   `-- types/               # Frontend types
|
|-- public/                  # Static assets
|
|-- server/                  # Standalone Express API
|   |-- src/
|   |   |-- config/          # DB and constants
|   |   |-- controllers/     # Route handlers
|   |   |-- middleware/      # Auth, validation, errors, CORS
|   |   |-- models/          # Mongoose schemas
|   |   |-- repositories/    # Data access base layer
|   |   |-- routes/          # API route definitions
|   |   |-- scripts/         # Utility scripts such as admin seeding
|   |   |-- services/        # Domain and infrastructure services
|   |   |-- types/           # Backend types
|   |   |-- utils/           # Helpers
|   |   `-- validators/      # Request validators
|   `-- uploads/             # Local uploaded media files for development
|
|-- package.json             # Root scripts
`-- tsconfig.json
```

## Important Architectural Note

The current codebase uses a hybrid API approach:

- The main backend lives in `server/src` as a standalone Express API.
- The Next.js app also contains route handlers in `src/app/api`.

In practice, that means some frontend features talk to the Express server directly, while some features are proxied or handled through Next.js route handlers. A few of those Next route handlers currently act as convenience wrappers, and some return temporary/mock data. This is important to know before extending the project.

## Current Route / Feature Areas

### Next.js app sections
- `src/app/(public)` for public pages
- `src/app/(auth)/dashboard` for artist pages
- `src/app/(auth)/admin` for admin pages
- `src/app/api` for Next.js route handlers and proxy-style endpoints

### Express API areas
- `/api/auth`
- `/api/audio`
- `/api/tracks`
- `/api/royalties`
- `/api/payouts`
- `/api/notifications`
- `/api/users`
- `/api/settings`
- `/api/territory`
- `/api/rights`
- `/api/uploads`

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB instance
- `ffmpeg` and `ffprobe` available locally if you want audio analysis to work

## Environment Variables

### Root app

Create a root `.env.local` file for the Next.js app:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Server app

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

# Optional but recommended for audio analysis
FFMPEG_PATH=C:\path\to\ffmpeg.exe
FFPROBE_PATH=C:\path\to\ffprobe.exe

# Optional if you use generated media URLs
API_URL=http://localhost:5000

# Optional storage provider config
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET=

# Or for Google Cloud Storage
GCS_PROJECT_ID=
GCS_KEY_FILE=
GCS_BUCKET=
```

Notes:
- The Next.js project also contains MongoDB access for some `src/app/api` routes, and that code currently reads `server/.env`.
- If you only want the Express API to own the database, keep your MongoDB config in `server/.env`.

## Local Setup

1. Install root dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
npm run install:server
```

3. Add your environment variables:
- Create `.env.local` in the project root
- Create `.env` inside `server/`

4. Start both apps in development:

```bash
npm run dev
```

5. Open the apps:
- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/health`
- Backend API base: `http://localhost:5000/api`

## Available Scripts

### Root scripts
- `npm run dev` starts frontend and backend together
- `npm run dev:client` starts Next.js only
- `npm run dev:server` starts Express only
- `npm run build` builds both apps
- `npm run build:client` builds Next.js
- `npm run build:server` compiles the backend
- `npm run start` starts both production servers
- `npm run lint` runs client and server lint tasks

### Server scripts
- `npm run dev` runs the Express server with `nodemon`
- `npm run build` compiles TypeScript to `dist/`
- `npm run start` starts the compiled backend
- `npm run lint` runs backend linting
- `npm run seed:admin` creates or resets the default admin user

## Admin Seed

The backend includes an admin seed script:

```bash
cd server
npm run seed:admin
```

At the time of writing, this script creates or resets the default admin account defined in `server/src/scripts/seedAdmin.ts`.

## Setup Details for MongoDB

There is a dedicated guide here:

- [server/MONGODB_SETUP.md](server/MONGODB_SETUP.md)

Use it if you need help creating an Atlas cluster and generating a valid `MONGODB_URI`.

## Media and Uploads

- Uploaded files are stored locally under `server/uploads/` in the current development setup.
- Artwork and audio file uploads are supported.
- The backend exposes static uploads from `/uploads`.
- For production, you will usually want to move media storage to S3 or GCS instead of relying on local disk.

## Known Implementation Notes

- The codebase mixes Express API routes and Next.js route handlers.
- Some frontend API routes currently act as proxies to the backend.
- Some Next.js API handlers still use direct MongoDB access or mock data.
- The project already has the structure for scale, but parts of the app are still in an integration-heavy stage rather than a fully unified architecture.

## Recommended Development Workflow

1. Start both apps with `npm run dev`
2. Confirm MongoDB connectivity
3. Seed the admin user if needed
4. Test frontend pages from `http://localhost:3000`
5. Verify backend responses from `http://localhost:5000/api`

## Deployment Notes

This project is best treated as two deployable units:

- Next.js frontend
- Express backend

Typical deployment approach:
- Deploy the frontend to Vercel or another Next-compatible host
- Deploy the backend to Render, Railway, or a Node.js server
- Point `NEXT_PUBLIC_API_URL` at the deployed backend API
- Configure production storage and database credentials

## Repository Status Summary

This is not an empty starter. It already contains:
- a functioning Next.js application structure
- a real Express backend with models, middleware, validation, and uploads
- artist, public, and admin page groups
- MongoDB integration
- admin seeding support
- audio-processing support

The main area to keep in mind while building is consistency between the Next.js `app/api` layer and the standalone Express API.
