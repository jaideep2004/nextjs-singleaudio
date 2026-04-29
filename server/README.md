# Backend README

This folder contains the standalone Express + TypeScript backend for the Karhari Media music distribution platform.

## What The Backend Handles

- Authentication and authorization
- User management
- Track upload workflows
- Release-related business logic
- Royalties and payouts
- Notifications
- Settings management
- Rights and territory data
- Audio analysis
- Storage abstraction for local, S3, or GCS-style file handling

## Stack

- Express
- TypeScript
- MongoDB with Mongoose
- JWT
- Express Validator
- Multer
- `fluent-ffmpeg`
- `music-metadata`

## Folder Structure

```text
server/
|-- src/
|   |-- config/          # Environment-backed constants and DB connection
|   |-- controllers/     # Route handlers
|   |-- middleware/      # Auth, validation, CORS, error handling
|   |-- models/          # Mongoose models
|   |-- repositories/    # Base repository abstractions
|   |-- routes/          # Express route modules
|   |-- scripts/         # Utility scripts such as admin seeding
|   |-- services/        # Business and infrastructure services
|   |-- types/           # Shared backend types
|   |-- utils/           # Helpers
|   `-- validators/      # Request validation rules
|-- uploads/             # Local development uploads
|-- package.json
`-- tsconfig.json
```

## API Areas

The backend registers these route groups under `/api`:

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

There is also a health endpoint at:

```text
GET /health
```

## Environment Variables

Create `server/.env` and define:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
FFMPEG_PATH=C:\path\to\ffmpeg.exe
FFPROBE_PATH=C:\path\to\ffprobe.exe
API_URL=http://localhost:5000
```

Optional storage settings:

```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET=
```

Or:

```env
STORAGE_PROVIDER=gcs
GCS_PROJECT_ID=
GCS_KEY_FILE=
GCS_BUCKET=
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Add `server/.env`

3. Start the development server:

```bash
npm run dev
```

4. Verify the API:

```text
http://localhost:5000/health
http://localhost:5000/api
```

## Scripts

- `npm run dev` starts the server with `nodemon`
- `npm run build` compiles TypeScript
- `npm run start` runs the compiled app from `dist/`
- `npm run lint` runs ESLint
- `npm run seed:admin` creates or resets the default admin user

## Admin Seed

To create or reset the admin account:

```bash
npm run seed:admin
```

The seed values currently come from `src/scripts/seedAdmin.ts`.

## MongoDB Setup

If you need help generating a connection string or creating an Atlas cluster, use:

- [MONGODB_SETUP.md](MONGODB_SETUP.md)

## Storage and Uploads

- Local uploads are stored in `server/uploads/`
- Static upload access is exposed through `/uploads`
- This is suitable for development
- For production, remote object storage is recommended

## Current Notes

- This backend is already fairly modular and ready for extension.
- Some features in the frontend still use Next.js route handlers in parallel with this backend.
- If you continue developing the project, it is worth keeping the source of truth for business logic inside this backend to avoid duplication.
