# Graph Report - nextjs-singleaudio  (2026-05-04)

## Corpus Check
- 180 files · ~244,529 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 601 nodes · 649 edges · 30 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 144 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 38 edges
2. `successResponse()` - 34 edges
3. `SpotifyStoreIntegration` - 18 edges
4. `AppleMusicStoreIntegration` - 17 edges
5. `YoutubeContentIdStoreIntegration` - 17 edges
6. `notFoundResponse()` - 17 edges
7. `StoreService` - 14 edges
8. `getCurrentBackendUser()` - 12 edges
9. `connectToDatabase()` - 12 edges
10. `proxyBackend()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `uploadTrack()` --calls--> `analyzeAudio()`  [INFERRED]
  server\src\controllers\track.controller.ts → server\src\utils\audioAnalysis.ts
- `notFoundHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\middleware\errorHandler.middleware.ts → server\src\utils\apiResponse.ts
- `errorHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\middleware\errorHandler.middleware.ts → server\src\utils\apiResponse.ts
- `handleSubmit()` --calls--> `login()`  [INFERRED]
  src\app\(public)\login\page.tsx → src\context\AppContext.tsx
- `handleSubmit()` --calls--> `login()`  [INFERRED]
  src\app\admin-login\page.tsx → src\context\AppContext.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (42): changePassword(), getMe(), login(), register(), updateProfile(), deleteNotification(), getNotificationById(), getNotifications() (+34 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (30): GET(), GET(), POST(), getCurrentBackendUser(), sanitizeDspKeys(), getRssPodcastAccessMode(), getRssWorkspaceSupervisorEmails(), isRssWorkspaceSupervisor() (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (15): DELETE(), GET(), PUT(), GET(), PUT(), fetchBackend(), getAuthToken(), getBackendBaseUrl() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (1): SpotifyStoreIntegration

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (1): AppleMusicStoreIntegration

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (1): YoutubeContentIdStoreIntegration

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (2): fetchPayouts(), onPayoutSubmit()

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (3): handleDeleteConfirm(), handleStatusToggle(), showSnackbar()

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 13 - "Community 13"
Cohesion: 0.2
Nodes (3): fetchPayouts(), handleApprovePayout(), handleRejectPayout()

### Community 14 - "Community 14"
Cohesion: 0.23
Nodes (7): handleSubmit(), getErrorMessage(), login(), signup(), toUser(), handleSubmit(), onSubmit()

### Community 15 - "Community 15"
Cohesion: 0.27
Nodes (6): handleEpisodeSubmit(), handlePodcastSubmit(), slugify(), toOptionalNullableUrl(), toOptionalString(), uploadAsset()

### Community 16 - "Community 16"
Cohesion: 0.2
Nodes (1): formatDate()

### Community 17 - "Community 17"
Cohesion: 0.31
Nodes (2): getErrorMessage(), StoreFactory

### Community 18 - "Community 18"
Cohesion: 0.38
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 22 - "Community 22"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 23 - "Community 23"
Cohesion: 0.6
Nodes (5): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected()

### Community 24 - "Community 24"
Cohesion: 0.47
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (1): fetchReleases()

### Community 28 - "Community 28"
Cohesion: 0.47
Nodes (4): getApiKey(), parseResponse(), RssApiError, rssFetch()

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 31 - "Community 31"
Cohesion: 0.5
Nodes (2): checkToken(), clearToken()

### Community 32 - "Community 32"
Cohesion: 0.5
Nodes (2): async(), uploadArtworkToServer()

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (2): analyzeAudioHandler(), analyzeAudio()

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (1): ApiError

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (2): middleware(), validateToken()

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

## Knowledge Gaps
- **Thin community `Community 3`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (15 nodes): `fetchPayouts()`, `fetchRoyaltyData()`, `fetchTracks()`, `formatCurrency()`, `formatDate()`, `getStatusColor()`, `handleMonthChange()`, `handleTabChange()`, `handleTrackChange()`, `handleYearChange()`, `onPayoutSubmit()`, `prepareStoreChartData()`, `prepareTrackChartData()`, `TabPanel()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (10 nodes): `fetchDashboardData()`, `fetchReleases()`, `fetchTracks()`, `formatDate()`, `getStatusColor()`, `getStatusIcon()`, `handleLogout()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (6 nodes): `fetchReleases()`, `formatDate()`, `getFilteredReleases()`, `handleTabChange()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (5 nodes): `checkToken()`, `clearToken()`, `loginAsAdmin()`, `testApiAccess()`, `admin-check.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (5 nodes): `page.tsx`, `async()`, `loadAllowed()`, `uploadArtworkToServer()`, `uploadAudioToServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (4 nodes): `analyzeAudioHandler()`, `audioController.ts`, `audioAnalysis.ts`, `analyzeAudio()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (3 nodes): `middleware()`, `middleware.ts`, `validateToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getCurrentBackendUser()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `connectToDatabase()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `errorResponse()` (e.g. with `register()` and `login()`) actually correct?**
  _`errorResponse()` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `successResponse()` (e.g. with `register()` and `login()`) actually correct?**
  _`successResponse()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._