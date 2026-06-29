# Karhari Media Music Distribution Platform - Development Flow & Status
**Version 1.0 | Updated: May 9, 2026**

---

## 📋 Executive Summary

**Karhari Media** is an independent music distribution platform designed to deliver music to 40+ DSPs (Digital Service Providers) *directly* without relying on third-party aggregator APIs. The platform enables artists and labels to upload tracks, manage metadata, handle KYC verification, and track royalties/payouts.

**Current Development Stage**: Alpha with foundational infrastructure in place.

---

## 🏗️ Architecture Overview

```
nextjs-singleaudio (Monorepo)
├── Frontend (Next.js 15 + React 19 + Material UI)
│   ├── src/app/ - App Router pages & API routes
│   ├── src/components/ - Feature-based UI components
│   ├── src/services/api.ts - Axios API client with JWT interceptors
│   ├── src/context/ - React Context (AppContext, Auth state)
│   └── src/lib/ - Integration libraries (ACRCloud, ISRC, RSS, Platforms)
│
├── Backend (Express + TypeScript + MongoDB)
│   ├── server/src/controllers/ - Route handlers
│   ├── server/src/models/ - Mongoose schemas
│   ├── server/src/services/ - Business logic & integrations
│   ├── server/src/repositories/ - Data access layer
│   ├── server/src/middleware/ - Auth, validation, error handling
│   └── server/src/routes/ - API route definitions
│
└── Public Assets
    └── public/images/dsp/ - DSP provider logos
```

---

## 🔑 Key Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Material UI, Emotion, Axios, React Hook Form |
| **Backend** | Express, TypeScript, MongoDB/Mongoose, JWT Auth, Multer |
| **Audio Processing** | fluent-ffmpeg, music-metadata, ffmpeg/ffprobe (local development) |
| **Cloud Storage** | Local (development), S3/GCS providers available (production-ready) |
| **Build & Deploy** | npm workspaces, concurrently, TypeScript strict mode |

---

## 🎯 Core Features Implemented

### 1. **Authentication & User Management**
- JWT-based authentication (30 days default expiry)
- Role-based access control: `ARTIST`, `LABEL`, `ADMIN`
- Account types: Individual Artist, Label
- Token storage in secure cookies via `js-cookie`
- Axios interceptor attaches `Authorization: Bearer {token}` to all requests

**Files:**
- `server/src/controllers/auth.controller.ts` - Registration, login, logout
- `server/src/middleware/auth.middleware.ts` - `protect`, `authorize(roles)` middleware
- `src/services/api.ts` - Frontend API client

**Status**: ✅ Core implementation complete, role-based routing in place

---

### 2. **User Onboarding & Verification (KYC)**
Structured multi-step onboarding flow with document verification.

#### 2.1 Artist Onboarding
**Fields:**
- Legal name, ID type (PAN/Aadhaar), ID number, address, phone
- Number of tracks/releases in catalog
- Government ID file upload

#### 2.2 Label Onboarding
**Types:**
- Individual: Legal name + government ID
- Registered Company: Entity name + company type (private/public) + incorporation/GST cert

**Shared Fields:**
- Total artists, revenue, catalog size
- Rights type (exclusive/non-exclusive)
- Social media links, website

**Verification Providers:**
- `surepass` - Mobile OTP & KYC verification (in progress with client)
- `sandbox` - Testing provider
- `manual` - Admin review

**Storage:**
```typescript
verification: {
  status: 'pending' | 'submitted' | 'approved' | 'rejected',
  mobileProvider?: 'surepass' | 'sandbox' | 'manual',
  kycProvider?: 'surepass' | 'sandbox' | 'manual',
  phoneNumber?: string,
  submittedAt?: Date,
  reviewedAt?: Date,
  rejectionReason?: string,
}
```

**Files:**
- `server/src/models/user.model.ts` - User schema with onboarding subdocument
- `src/components/kyc/KycGate.tsx` - Frontend KYC guard
- `server/src/controllers/auth.controller.ts` - Onboarding submission

**Status**: 🟡 In Progress - DLT platform integration for mobile OTP in talks with client

---

### 3. **Track Upload & Metadata Management**

#### 3.1 Audio File Upload
- Accepts MP3, WAV formats
- Max file size: 100MB
- File storage: Local (`/uploads/tracks/`) or cloud (S3/GCS)
- Multer-based multipart handling

#### 3.2 Metadata Fields
**Identifiers:**
- **ISRC** ✅ - Integrated, auto-generated or manual
- **UPC** 🟡 - In progress (client acquiring codes)
- **ISWC** - Optional, for publishing rights
- **ISNI** - Optional, for artist identification

**Metadata:**
- Title, Artist, Genre, Release Date
- P-Line (phonogram copyright), C-Line (copyright)
- Label, Publisher
- Language, Explicit flag

**Technical Metadata:**
- Duration, Format, Bitrate
- Loudness (placeholder for future LUFS calculation)
- ACR Cloud fingerprint & AI detection results

**Files:**
- `server/src/models/track.model.ts` - Track schema with comprehensive metadata
- `server/src/controllers/track.controller.ts` - Upload, get, update, delete endpoints
- `server/src/validators/track.validator.ts` - Request validation

**Status**: ✅ Core upload complete, UPC integration pending

---

### 4. **ACRCloud Integration** ✅

**Purpose:** Music identification, AI generation detection, and fingerprinting.

**Capabilities:**
- **AI Detection** - Identifies AI-generated vocals/music with probability scores
- **Fingerprint Matching** - Matches uploaded tracks against ACRCloud database
- **Copyright Detection** - Flags potential matches to existing music
- **Stream Metadata** - Retrieves ISRC, UPC, artist info from existing matches

**Implementation:**
```typescript
// Automatic scan triggered on track upload
void startTrackAcrCloudScan(track._id.toString(), audioPath, title);

// Stores results in track.acrCloud:
{
  fileId: string,
  scanState: 'pending' | 'ready' | 'no_results' | 'error',
  aiDetection: AcrCloudAiDetection[],
  fingerprintMatches: AcrCloudFingerprintMatch[],
  checkedAt: Date
}
```

**API Endpoints:**
- `POST /api/audio/identify-by-acrid` - Query by ACR ID
- `GET /api/audio/scan-status/:trackId` - Check scan progress
- ACRCloud webhook endpoints for async result callbacks

**Configuration:**
```env
ACRCLOUD_CONSOLE_TOKEN=***
ACRCLOUD_FS_REGION=***
ACRCLOUD_FS_CONTAINER_ID=***
ACRCLOUD_IDENTIFY_HOST=***
ACRCLOUD_IDENTIFY_ACCESS_KEY=***
ACRCLOUD_IDENTIFY_ACCESS_SECRET=***
```

**Files:**
- `server/src/services/acrCloud.service.ts` - Core ACRCloud logic (388 lines)
- `server/src/types/acrCloud.ts` - TypeScript interfaces
- `server/src/controllers/audioController.ts` - HTTP handlers

**Status**: ✅ Fully Integrated & Tested

---

### 5. **ISRC Code Management** ✅

**System:** Real ISRC code generation & allocation with collision detection.

**Prefix:** `IN9SN` (India-based, Karhari Media registrant code)
**Format:** `IN9SN[YY][NNNNN]` (12 characters total)

**Features:**
- **Auto-Generation** - Sequential per year, collision-safe with MongoDB upserts
- **Manual Entry** - Support for pre-assigned ISRCs (from labels)
- **Uniqueness** - Prevents duplicates across allocations, releases, and tracks
- **Persistence** - Tracks allocation source (generated vs manual), status, timestamps

**Database Collections:**
```javascript
// isrcAllocations - Unique ISRC records
{
  _id: "IN9SN260001",
  isrc: "IN9SN260001",
  prefix: "IN9SN",
  year: "26",
  designation: 1,
  source: 'generated' | 'manual',
  status: 'reserved',
  trackTitle: "My Track",
  releaseTitle: "Release Name",
  createdAt: Date
}

// isrcCounters - Sequence tracking per prefix/year
{
  _id: "IN9SN:26",
  prefix: "IN9SN",
  year: "26",
  lastSequence: 100,
  createdAt: Date,
  updatedAt: Date
}
```

**API Endpoints:**
- `POST /api/tracks` - Auto-assigns ISRC on upload
- `GET /api/isrc/allocate` - Manual ISRC request (if needed)

**Functions:**
- `assignTrackIsrc(providedIsrc?, context)` - Reserve new/manual ISRC
- `markTrackIsrcAssigned(isrc, trackId)` - Mark as used after delivery
- `normalizeIsrc(value)` - Validate & format ISRC string

**Files:**
- `server/src/services/isrc.service.ts` - Core logic (162 lines)
- `src/lib/isrcAllocator.ts` - Frontend-facing allocation utilities

**Status**: ✅ Fully Integrated

---

### 6. **Podcast/RSS Integration** ✅

**Provider:** RSS.com API for podcast distribution.

**Features:**
- Create & manage podcasts
- Upload episodes with metadata
- Presigned S3 uploads for media
- Category & language support
- Full syndication to podcast platforms

**Configuration:**
```env
RSS_API_BASE_URL=https://api.rss.com
RSS_API_KEY=*** (requires active subscription for podcast creation)
```

**API Wrapper Functions:**
- `rssApi.createPodcast(payload)` - Create new podcast
- `rssApi.getEpisodes(podcastId)` - List episodes
- `rssApi.createEpisode(podcastId, payload)` - Upload new episode
- `rssApi.presignedUpload()` - Get S3 upload URL
- `rssApi.getAnalytics()` - Note: Currently unavailable via API, dashboard-only

**Payload Types:**
```typescript
interface CreateRssPodcastPayload {
  title: string,
  description: string,
  imageUrl?: string,
  language?: string,
  categories?: string[],
  explicit: boolean,
  link?: string,
  email?: string,
  copyright?: string,
}
```

**Files:**
- `src/lib/rssApi.ts` - RSS.com API client (174 lines)
- `src/types/rss.ts` - TypeScript interfaces

**Status**: ✅ Integrated for podcast distribution

---

### 7. **DSP Integration Framework** (Scaffolding Ready)

**Target DSPs (40+ platforms):**
- **Major Streamers:** Spotify, Apple Music, Amazon Music, YouTube Music, Deezer, Tidal
- **Regional:** Pandora, SoundCloud
- **Future:** Bandcamp, Beatport, CD Baby, DistroKid integrations

**Current Status:**
- UI displays 8 major DSPs with logos/metadata
- Backend storage interface designed (`store.interface.ts`)
- Factory pattern ready for provider implementations
- DDEX XML delivery format support (for SFTP/API methods)

**Architecture:**
```typescript
// Each DSP implements IStoreIntegration interface:
- getStoreInfo() - Retrieve specs (max bitrate, artwork size, etc.)
- authenticate() - Store-specific auth flow
- validateTrack() - Pre-delivery validation
- deliverTrack() - Submit to DSP API/SFTP
- updateTrack() - Modify existing delivery
- fetchReports() - Retrieve earnings/streaming data
```

**Files:**
- `server/src/services/store/store.interface.ts` - Integration contract (125 lines)
- `server/src/services/store/base.store.ts` - Base implementation
- `server/src/services/store/store.factory.ts` - Provider factory
- `src/lib/platforms.ts` - Frontend DSP metadata

**Status**: 🟡 Framework ready, awaiting individual DSP API integrations

---

### 8. **Royalties & Payouts**

#### 8.1 Royalty Tracking
- Per-store, per-track earnings
- Currency support: USD, EUR, GBP, INR, JPY
- Stream count & reporting date logging
- Automatic aggregation from DSP reports

**Model:**
```typescript
{
  trackId: ObjectId,
  artistId: ObjectId,
  store: string,
  amount: number,
  currency: string,
  reportingDate: Date,
  streamCount: number
}
```

#### 8.2 Payout Management
- Status workflow: `pending` → `approved` → `rejected`
- Payment methods: UPI, PayPal
- Minimum payout: $5
- Admin approval & processing

**Model:**
```typescript
{
  artistId: ObjectId,
  amount: number,
  currency: string,
  status: 'pending' | 'approved' | 'rejected',
  paymentMethod: 'upi' | 'paypal',
  paymentDetails: { upiId? | paypalEmail? },
  requestDate: Date,
  processedDate?: Date,
  rejectionReason?: string
}
```

**Files:**
- `server/src/models/royalty.model.ts` - Royalty schema
- `server/src/models/payout.model.ts` - Payout schema
- `server/src/controllers/royalty.controller.ts` - Royalty endpoints
- `server/src/controllers/payout.controller.ts` - Payout endpoints

**Status**: ✅ Schema & basic endpoints ready, DSP report fetching pending

---

### 9. **Release Management & Workflow**

**Release Statuses:**
- `PENDING` - Awaiting admin review
- `APPROVED` - Cleared for distribution
- `REJECTED` - Requires resubmission

**Admin Operations:**
- Bulk review of pending releases
- Approve/reject with comments
- Track versioning & history
- Delivery status monitoring

**Files:**
- `server/src/models/track.model.ts` - Status field + rejection reason
- `src/app/(auth)/admin` - Admin dashboard pages
- `src/components/admin/` - Release review components

**Status**: ✅ Core workflow implemented

---

### 10. **Audio Analysis** (Development-Ready)

**Features:**
- Audio format detection (MP3, WAV)
- Duration calculation
- Bitrate extraction
- Loudness measurement (placeholder for LUFS integration)

**Implementation:**
```typescript
analyzeAudio(filePath): Promise<{
  format: string,
  duration: number,
  bitrate: number,
  loudness?: number
}>
```

**Configuration:**
```env
# Windows requires explicit paths:
FFMPEG_PATH=C:\path\to\ffmpeg.exe
FFPROBE_PATH=C:\path\to\ffprobe.exe

# Enable/disable local analysis:
ENABLE_LOCAL_FFMPEG=true  # (default: true in dev, false in production)
```

**Files:**
- `server/src/services/audioAnalysisService.ts` - FFmpeg wrapper
- `server/src/utils/audioAnalysis.js` - Analysis utilities

**Status**: ✅ Implemented, LUFS enhancement pending

---

### 11. **Territory & Rights Management** (Scaffolding)

**Models:**
- Territory exclusion/inclusion rules
- Rights types: exclusive, non-exclusive
- Per-DSP territory restrictions
- Artist/label rights grants

**Files:**
- `server/src/models/territory.model.ts` - Territory definitions
- `server/src/models/rights.model.ts` - Rights grants
- `server/src/controllers/territoryController.ts` - Territory CRUD
- `server/src/controllers/rightsController.ts` - Rights CRUD

**Status**: 🟡 Models created, API endpoints partially implemented

---

### 12. **Notifications System**

**Notification Types:**
- `RELEASE_APPROVED` / `RELEASE_REJECTED`
- `PAYOUT_APPROVED` / `PAYOUT_REJECTED`
- `SYSTEM` - Platform announcements

**Features:**
- In-app notification center
- Read/unread tracking
- Email dispatch (infrastructure ready)

**Files:**
- `server/src/models/notification.model.ts`
- `server/src/services/notification.service.ts`
- `src/context/NotificationsContext.tsx` - Frontend state

**Status**: ✅ Basic implementation complete

---

### 13. **Admin Dashboard & Settings**

**Admin Capabilities:**
- User management (list, suspend, roles)
- Release/track review
- Payout management
- Platform settings
- Audit logs

**Settings Managed:**
- Signup enabled/disabled
- DSP visibility
- Metadata requirements
- Payout thresholds

**Files:**
- `src/app/(auth)/admin` - Admin pages
- `server/src/controllers/settings.controller.ts` - Settings API
- `server/src/models/settings.model.ts` - Settings storage

**Status**: ✅ Scaffolding complete, UX improvements ongoing

---

## 🚧 In-Progress & Upcoming Features

### 1. **DLT Platform Integration (Mobile OTP)**
- **Provider**: DLT (Digital Long-range Terrestrial)
- **Purpose**: OTP delivery for phone verification during KYC
- **Status**: 🟡 In talks with client for integration details
- **Expected**: Q3 2026

### 2. **UPC Code Integration**
- **Purpose**: Universal Product Code for track identification
- **Status**: 🟡 Client acquiring UPC codes (pending)
- **Next Steps**:
  - Add UPC field to track upload form
  - Validate against UPC registry APIs
  - Enforce UPC for certain DSPs (e.g., Walmart)
- **Expected**: Q3 2026

### 3. **DDEX XML Generation & Delivery**
- **Purpose**: Standards-compliant metadata delivery to DSPs
- **Format**: DDEX ERN (Encoded Release Notification)
- **Status**: 🟡 Schema designed, implementation pending
- **Scope**:
  - Generate DDEX XML from track metadata
  - SFTP delivery to DSPs accepting XML
  - Error reporting & retry logic

### 4. **Individual DSP API Integrations**
- **Priority DSPs**: Spotify, Apple Music, Amazon Music, YouTube
- **Status**: 🟡 Framework ready, API-specific implementations pending
- **Approach**:
  - Implement per-DSP provider class
  - OAuth flows where required
  - Delivery status tracking
  - Earnings reconciliation

### 5. **Enhanced Audio Analysis**
- **LUFS Loudness Standardization** - Implement loudness normalization
- **Audio Quality Scoring** - Flag poor quality uploads
- **Codec Optimization** - Transcode to DSP-required codecs

### 6. **Royalty Report Automation**
- **DSP Ingestion** - Fetch earnings data from each DSP
- **Aggregation** - Combine multi-store royalties
- **Payout Calculation** - Automatic payout generation
- **Currency Conversion** - Real-time forex rates

### 7. **Webhook Handlers for DSP Callbacks**
- Delivery status updates
- Sales/stream reports
- Content takedown notifications
- Metadata corrections

---

## 📊 Data Models Summary

### Collections/Tables

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **User** | Artists, labels, admins | email, role, onboarding, verification |
| **Track** | Individual songs/tracks | title, isrc, upc, acrCloud results, stores |
| **Royalty** | Earnings per store | trackId, artistId, store, amount, streams |
| **Payout** | Artist payout requests | artistId, amount, status, paymentMethod |
| **Notification** | User notifications | type, userId, relatedId, read status |
| **Settings** | Platform configuration | key, value |
| **Territory** | Geographic restrictions | code, name, dspRestrictions |
| **Rights** | Content rights info | artistId, scope, exclusivity, duration |
| **AuditLog** | Action history | userId, action, resource, timestamp |
| **IsrcAllocation** | ISRC tracking | isrc, prefix, year, designation, source |
| **IsrcCounter** | ISRC sequence tracking | prefix, year, lastSequence |

---

## 🔌 API Endpoints Overview

### Authentication
```
POST   /api/auth/register             - User signup
POST   /api/auth/login                - User login
POST   /api/auth/logout               - User logout
GET    /api/auth/check-artist-name    - Validate artist name availability
```

### Tracks
```
POST   /api/tracks                    - Upload track (auto ISRC, ACRCloud scan)
GET    /api/tracks                    - List user's tracks (role-filtered)
GET    /api/tracks/:id                - Track details + ACRCloud results
PATCH  /api/tracks/:id                - Update track metadata
DELETE /api/tracks/:id                - Remove track
```

### ACRCloud Audio
```
POST   /api/audio/identify-by-acrid   - Query ACRCloud by ACR ID
GET    /api/audio/scan-status/:trackId - Check fingerprint scan progress
POST   /api/audio/webhook             - ACRCloud async result delivery
```

### Royalties
```
GET    /api/royalties                 - List artist's royalties
GET    /api/royalties/summary         - Total earnings by store/date
```

### Payouts
```
POST   /api/payouts                   - Request payout
GET    /api/payouts                   - List user's payouts
GET    /api/payouts (admin)           - List all pending payouts
PATCH  /api/payouts/:id (admin)       - Approve/reject payout
```

### Notifications
```
GET    /api/notifications             - List user's notifications
PATCH  /api/notifications/:id         - Mark as read
```

### Admin - Users
```
GET    /api/admin/users               - List all users
PATCH  /api/admin/users/:id           - Update user role/status
PATCH  /api/admin/users/:id/verification - Review KYC submission
```

### Admin - Releases
```
GET    /api/admin/tracks              - List pending tracks
PATCH  /api/admin/tracks/:id/approve  - Approve track
PATCH  /api/admin/tracks/:id/reject   - Reject track
```

### Settings
```
GET    /api/settings                  - List all settings
PATCH  /api/settings/:key             - Update setting
```

### Store Integration (Planned)
```
GET    /api/stores                    - List available DSPs
POST   /api/stores/:storeName/auth    - Authenticate with DSP
POST   /api/stores/:storeName/deliver/:trackId - Deliver track
GET    /api/stores/:storeName/reports - Fetch earnings report
```

---

## 🛠️ Development & Deployment

### Local Setup a
```bash
# Install dependencies (root + server)
npm install

# Configure environment
# Root: .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Server: server/.env
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
ACRCLOUD_CONSOLE_TOKEN=***
ACRCLOUD_IDENTIFY_HOST=***
ACRCLOUD_IDENTIFY_ACCESS_KEY=***
ACRCLOUD_IDENTIFY_ACCESS_SECRET=***
RSS_API_KEY=***

# Start both frontend & backend concurrently
npm run dev
```

### Build & Production
```bash
# Build both client & server
npm run build

# Start production (requires PM2 or similar for process management)
npm run start

# Or deploy to:
# - Vercel (Next.js frontend)
# - Render.com (Express backend via render.yaml)
# - AWS Lambda (serverless with S3 storage)
```

### Database
```bash
# MongoDB Atlas Setup
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Generate connection string
3. Add IP whitelist
4. Set MONGODB_URI in server/.env

# Local MongoDB (optional)
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## 🔐 Security & Best Practices

### Authentication
- ✅ JWT with 30-day expiry
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Role-based authorization middleware
- ✅ Secure cookie storage

### Input Validation
- ✅ Express-validator on all routes
- ✅ TypeScript strict mode enforced
- ✅ File type/size restrictions (Multer)

### API Security
- ✅ CORS middleware with configurable origins
- ✅ Helmet.js for HTTP headers
- ✅ Request rate limiting (MongoDB-backed)
- ✅ Error message sanitization (no stack traces to client)

### Storage
- ✅ Local upload to isolated directories
- ✅ Cloud storage provider abstraction (S3/GCS compatible)
- ✅ Signed URL generation for secure file access

### Audit Trail
- ✅ Comprehensive audit logging for critical actions
- ✅ User action tracking (uploads, approvals, payouts)

---

## 📈 Scalability Considerations

### Current Bottlenecks
1. **Local File Storage** - Must migrate to S3/GCS for production
2. **Single MongoDB Instance** - Use Atlas with sharding/replication
3. **FFmpeg Processing** - Move to Lambda/Cloud Tasks for serverless
4. **ACRCloud Scanning** - Async queue for batch processing

### Planned Improvements
1. **Message Queue** - Bull/Kafka for async tasks (uploads, DSP delivery, report fetching)
2. **Caching Layer** - Redis for royalty aggregations, DSP metadata
3. **CDN Integration** - CloudFront for artwork/audio distribution
4. **Webhooks** - Event-driven architecture for DSP callbacks
5. **GraphQL** - Consider for complex royalty queries (optional)

---

## 🎓 Developer Quick-Start Guide

### Understanding the Flow: Artist Upload to Distribution

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ARTIST SIGNUP & KYC                                          │
├─────────────────────────────────────────────────────────────────┤
│ POST /api/auth/register with onboarding docs                    │
│ ↓ Status: 'pending' → Admin reviews → 'approved' or 'rejected' │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. TRACK UPLOAD (POST /api/tracks)                              │
├─────────────────────────────────────────────────────────────────┤
│ • Audio file (MP3/WAV) + artwork (JPEG/PNG)                    │
│ • Metadata: title, genre, releaseDate, stores                  │
│ • ISRC auto-generated: IN9SN260001 (example)                   │
│ • Files stored in /uploads/tracks/ and /uploads/artwork/       │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ASYNC ACRCOULD SCAN (Background Job)                         │
├─────────────────────────────────────────────────────────────────┤
│ • Upload audio to ACRCloud Fingerprint Service                 │
│ • Receive fileId, monitor scan state                           │
│ • Get results: AI detection, fingerprint matches               │
│ • Store in track.acrCloud object                               │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. ADMIN REVIEW (GET /api/admin/tracks)                         │
├─────────────────────────────────────────────────────────────────┤
│ • Admin sees pending tracks                                    │
│ • Reviews ACRCloud results (copyright check, AI detection)     │
│ • Checks metadata completeness                                 │
│ • Approves → Status: 'approved'                               │
│ • Rejects → Sends notification + rejection reason              │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. DSP DELIVERY (TODO: Individual integrations)                 │
├─────────────────────────────────────────────────────────────────┤
│ • Generate DDEX XML metadata                                   │
│ • Authenticate with each DSP (OAuth/API key)                  │
│ • Submit via API/SFTP with audio + artwork                    │
│ • Track delivery status & externalIds (Spotify URI, etc.)     │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. MONITORING & ROYALTIES (Background)                          │
├─────────────────────────────────────────────────────────────────┤
│ • DSPs submit daily stream reports                             │
│ • Royalty records created (per store/per day)                  │
│ • Artist views royalties: GET /api/royalties                   │
│ • Automatic payout threshold triggers payout                   │
└─────────────────────────────────────────────────────────────────┘
```

### Code Examples

#### Upload a Track (Frontend)
```typescript
// src/components/track/TrackUploadForm.tsx
const handleSubmit = async (formData) => {
  const payload = new FormData();
  payload.append('title', formData.title);
  payload.append('genre', formData.genre);
  payload.append('releaseDate', formData.releaseDate);
  payload.append('isrc', formData.isrc || ''); // Leave empty for auto-generate
  payload.append('stores', JSON.stringify(formData.stores));
  payload.append('audio', audioFile);
  payload.append('artwork', artworkFile);

  const response = await tracksAPI.uploadTrack(payload);
  // Triggers ACRCloud scan in background
};
```

#### Check ACRCloud Results (Frontend)
```typescript
// src/lib/acrCloud.ts
export const getTrackWithAcrResults = async (trackId: string) => {
  const track = await tracksAPI.getTrack(trackId);
  
  if (track.acrCloud?.scanState === 'ready') {
    console.log('AI Detection:', track.acrCloud.aiDetection);
    console.log('Matches:', track.acrCloud.fingerprintMatches);
  }
};
```

#### Generate ISRC (Backend - Already Implemented)
```typescript
// server/src/services/isrc.service.ts
const isrc = await assignTrackIsrc(undefined, {
  trackTitle: 'My Song',
  releaseTitle: 'Album Name'
});
// Returns: "IN9SN260001" (auto-generated)
```

#### Review & Approve Track (Admin Backend)
```typescript
// server/src/controllers/track.controller.ts (expand method)
export const approveTrack = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const track = await Track.findByIdAndUpdate(id, {
    status: ReleaseStatus.APPROVED
  }, { new: true });

  // Trigger DSP delivery in next phase
  await notificationService.notifyArtist(track.artistId, {
    type: 'RELEASE_APPROVED',
    trackId: id
  });

  successResponse(res, track, 'Track approved');
};
```

---

## 📋 Roadmap & Timeline

| Phase | Milestone | Timeline | Status |
|-------|-----------|----------|--------|
| **Alpha** | MVP with ACRCloud, ISRC, KYC scaffolding | Now | ✅ |
| **Beta 1** | DLT + Mobile OTP integration | Q3 2026 | 🟡 In talks |
| **Beta 2** | Spotify & Apple Music APIs | Q3 2026 | 🟡 Framework ready |
| **Beta 3** | DDEX XML delivery, Amazon/YouTube | Q4 2026 | 🟡 Planned |
| **Production** | 40+ DSP coverage, full royalty automation | Q4 2026 | 🟡 Target |
| **Enhancement** | LUFS normalization, AI detection webhooks | Q1 2027 | 🟡 Planned |

---

## 🤝 Integration Checklist for DSPs

### Per-DSP Implementation Tasks

**Template for each DSP (e.g., Spotify):**

- [ ] Create `server/src/services/store/integrations/spotify.store.ts`
- [ ] Implement `IStoreIntegration` interface
- [ ] OAuth2 flow or API key authentication
- [ ] DDEX XML generation from track metadata
- [ ] API endpoints for delivery, status checking
- [ ] Earnings report fetching & parsing
- [ ] Test with sandbox credentials
- [ ] Document API rate limits & quotas
- [ ] Deploy to production
- [ ] Monitor webhook callbacks

---

## 🐛 Known Issues & Limitations

| Issue | Impact | Workaround | Fix Timeline |
|-------|--------|-----------|--------------|
| Local FFmpeg required on Windows | Dev setup friction | Set FFMPEG_PATH env var | N/A (by design) |
| RSS.com requires paid subscription for podcast creation | Feature limited in free tier | Use sandbox/manual testing | N/A (RSS service limitation) |
| LUFS loudness not yet calculated | Quality metrics incomplete | Placeholder value added | Q3 2026 |
| No individual DSP integrations yet | Can't deliver to platforms | Build per-DSP adapters | Q3/Q4 2026 |
| UPC validation not implemented | Tracks missing universal codes | Manual UPC entry, pending validation | Q3 2026 (when codes acquired) |
| File uploads local-only in dev | Scalability issues on production | Migrate to S3/GCS providers | On-demand |

---

## 🔗 File Location Reference

### Frontend Key Files
```
src/
├── app/
│   ├── (auth)/admin/        - Admin dashboard pages
│   ├── (auth)/dashboard/    - Artist dashboard
│   ├── (public)/            - Public pages (landing, profile)
│   └── api/                 - Next.js API routes
├── components/
│   ├── track/               - Track upload UI
│   ├── kyc/                 - KYC verification components
│   ├── admin/               - Admin-only components
│   └── ui/                  - Shared UI components
├── services/
│   └── api.ts               - Axios client + endpoint definitions
├── lib/
│   ├── acrCloud.ts          - ACRCloud utilities
│   ├── isrcAllocator.ts     - ISRC generation
│   ├── rssApi.ts            - RSS.com API wrapper
│   └── platforms.ts         - DSP metadata
└── context/
    └── AppContext.tsx       - Auth state management
```

### Backend Key Files
```
server/src/
├── controllers/
│   ├── auth.controller.ts   - Auth & signup
│   ├── track.controller.ts  - Track CRUD
│   ├── audioController.ts   - ACRCloud endpoints
│   ├── royalty.controller.ts - Royalty queries
│   └── payout.controller.ts - Payout management
├── services/
│   ├── acrCloud.service.ts  - ACRCloud integration (388 lines)
│   ├── isrc.service.ts      - ISRC allocation (162 lines)
│   ├── store/               - DSP integrations
│   ├── storage/             - File storage providers
│   └── notification.service.ts - Notifications
├── models/
│   ├── user.model.ts        - User schema
│   ├── track.model.ts       - Track schema
│   ├── royalty.model.ts     - Royalty schema
│   ├── payout.model.ts      - Payout schema
│   └── territory.model.ts   - Territory schema
├── middleware/
│   ├── auth.middleware.ts   - JWT validation
│   └── errorHandler.middleware.ts - Global error handling
└── routes/
    ├── track.route.ts
    ├── auth.route.ts
    └── ... (one per feature)
```

---

## 📚 External Resources & Documentation

### Integrations Implemented
- [ACRCloud API Docs](https://www.acrcloud.com/docs/guides/) - Music fingerprinting
- [ISRC Standard](https://www.ifpi.org/isrc/) - International Standard Recording Code
- [RSS.com API](https://rss.com/api-docs/) - Podcast distribution

### Integrations Pending
- Spotify Web API
- Apple Music API
- Amazon Music API
- YouTube Content ID API
- DDEX Standard for XML delivery

### Tools & Libraries
- [Express.js](https://expressjs.com/) - Backend framework
- [Next.js 15](https://nextjs.org/) - Frontend framework
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [Material-UI](https://mui.com/) - Component library
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - Audio processing
- [Multer](https://github.com/expressjs/multer) - File uploads

---

## 📞 Support & Contribution

### For Developers
1. **Setup**: Follow "Development & Deployment" section above
2. **Code Style**: TypeScript strict mode, ESLint enforced
3. **Commits**: Clear messages with feature/fix prefix
4. **Testing**: Add tests for critical paths (unit + integration)
5. **Docs**: Update this FLOW9MAY.md when adding features

### For API Integration Partners
- Refer to "Integration Checklist for DSPs" above
- Use store interface template in `server/src/services/store/store.interface.ts`
- Test with sandbox credentials first
- Document any deviations from spec

---

## ✅ Checklist for Completeness (Q3 2026 Target)

**Must-Have for Independent Distribution:**
- [x] User registration & KYC framework
- [x] Track upload with metadata
- [x] ISRC auto-generation
- [x] ACRCloud fingerprinting & AI detection
- [x] Admin review workflow
- [ ] DLT mobile OTP integration
- [ ] UPC code validation
- [ ] Spotify direct delivery
- [ ] Apple Music direct delivery
- [ ] Amazon Music direct delivery
- [ ] DDEX XML generation
- [ ] Earnings report aggregation
- [ ] Automated payouts

**Nice-to-Have:**
- [ ] YouTube Music integration
- [ ] Deezer API integration
- [ ] Tidal API integration
- [ ] LUFS loudness normalization
- [ ] Real-time playlist analytics
- [ ] AI content moderation
- [ ] Mobile app (iOS/Android)

---

## 🎯 Final Notes

**Karhari Media** is positioned to become an **independent music distribution powerhouse**. By integrating directly with 40+ DSPs rather than relying on aggregators, you'll enable artists to:

1. **Maintain data ownership** - Direct DSP relationships
2. **Reduce costs** - No aggregator middleman (higher artist payouts)
3. **Faster delivery** - Direct API submission
4. **Better compliance** - ISO/DDEX standards adherence
5. **Real-time monitoring** - Immediate visibility into earnings

The foundation is **solid**. Focus on:
- **Locking in DSP partnerships** (Q3 priority)
- **DLT mobile OTP** for frictionless KYC
- **Royalty automation** for scale

---

**Document Version:** 1.0  
**Last Updated:** May 9, 2026  
**Next Review:** July 1, 2026  
**Maintained By:** Development Team
