# Graph Report - nextjs-singleaudio  (2026-05-08)

## Corpus Check
- 208 files · ~486,164 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 730 nodes · 858 edges · 37 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 185 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 45 edges
2. `successResponse()` - 41 edges
3. `SpotifyStoreIntegration` - 18 edges
4. `notFoundResponse()` - 18 edges
5. `AppleMusicStoreIntegration` - 17 edges
6. `YoutubeContentIdStoreIntegration` - 17 edges
7. `StoreService` - 14 edges
8. `proxyBackend()` - 13 edges
9. `getCurrentBackendUser()` - 13 edges
10. `connectToDatabase()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `checkArtistName()` --calls--> `onSubmit()`  [INFERRED]
  server\src\controllers\auth.controller.ts → src\app\(public)\signup\page.tsx
- `identifyWithAcrCloudHandler()` --calls--> `identifyAudioFile()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `scanWithAcrCloudHandler()` --calls--> `uploadFileForScan()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `getAcrCloudScanResultHandler()` --calls--> `getScanResult()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `acrCloudCallbackHandler()` --calls--> `normalizeScanPayload()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (56): handleSubmit(), acrCloudCallbackHandler(), analyzeAudioHandler(), deleteTempFile(), getAcrCloudScanResultHandler(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler(), changePassword() (+48 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (27): GET(), GET(), POST(), getCurrentBackendUser(), sanitizeDspKeys(), getRssPodcastAccessMode(), getRssWorkspaceSupervisorEmails(), isRssWorkspaceSupervisor() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (13): formatAcrTime(), formatAcrTimeRange(), refreshPending(), fetchAcrCloudScanResult(), formatProbability(), getAcrCloudColor(), getAcrCloudLabel(), getAcrCloudProviderMetadata() (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (18): GET(), DELETE(), GET(), PUT(), GET(), PUT(), PUT(), fetchBackend() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (4): fetchPayouts(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 5 - "Community 5"
Cohesion: 0.18
Nodes (17): assignIsrcsToTracks(), ensureIsrcIndexes(), formatIsrcForDisplay(), isAlreadyUsed(), isDuplicateKeyError(), markIsrcsAssigned(), normalizeIsrc(), reserveGeneratedIsrc() (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.23
Nodes (15): getConfig(), getFsBaseUrl(), getScanResult(), identifyAudioFile(), isAcrCloudFileScanningConfigured(), isAcrCloudIdentifyConfigured(), mapScanState(), normalizeAiDetection() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (1): SpotifyStoreIntegration

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (1): AppleMusicStoreIntegration

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (1): YoutubeContentIdStoreIntegration

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (1): formatDate()

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (6): handleNext(), onSubmit(), assertVercelUploadSize(), async(), uploadArtworkToServer(), uploadAudioToServer()

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (6): handleEpisodeSubmit(), handlePodcastSubmit(), slugify(), toOptionalNullableUrl(), toOptionalString(), uploadAsset()

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 18 - "Community 18"
Cohesion: 0.45
Nodes (10): assignTrackIsrc(), ensureIndexes(), formatIsrcForDisplay(), getDb(), isAlreadyUsed(), isDuplicateKeyError(), markTrackIsrcAssigned(), normalizeIsrc() (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.31
Nodes (2): getErrorMessage(), StoreFactory

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (3): AuthGuard(), useAuth(), useAdminAuth()

### Community 21 - "Community 21"
Cohesion: 0.38
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 22 - "Community 22"
Cohesion: 0.38
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (1): formatDate()

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (1): fetchReleases()

### Community 25 - "Community 25"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 28 - "Community 28"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 29 - "Community 29"
Cohesion: 0.6
Nodes (5): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected()

### Community 32 - "Community 32"
Cohesion: 0.47
Nodes (4): getApiKey(), parseResponse(), RssApiError, rssFetch()

### Community 33 - "Community 33"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 34 - "Community 34"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (2): checkToken(), clearToken()

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (2): isArtistOrLabel(), userNeedsKyc()

### Community 42 - "Community 42"
Cohesion: 0.83
Nodes (3): PremiumPanel(), premiumSurfaceSx(), premiumTableSx()

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (1): ApiError

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (2): middleware(), validateToken()

### Community 52 - "Community 52"
Cohesion: 0.67
Nodes (1): GET()

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

## Knowledge Gaps
- **Thin community `Community 7`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (18 nodes): `page.tsx`, `page.tsx`, `fetchTracks()`, `formatDate()`, `formatDuration()`, `getStatusColor()`, `getStatusIcon()`, `getStoreCount()`, `handleChangePage()`, `handleChangeRowsPerPage()`, `handleEditTrack()`, `handleGenreFilterChange()`, `handleSearch()`, `handleStatusFilterChange()`, `handleViewTrack()`, `load()`, `togglePlay()`, `togglePlayTrack()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (7 nodes): `fetchDashboardData()`, `fetchData()`, `formatDate()`, `getStatusChip()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (7 nodes): `fetchReleases()`, `formatDate()`, `getFilteredReleases()`, `getStatusChip()`, `handleTabChange()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (5 nodes): `checkToken()`, `clearToken()`, `loginAsAdmin()`, `testApiAccess()`, `admin-check.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (4 nodes): `isArtistOrLabel()`, `submitKyc()`, `userNeedsKyc()`, `KycGate.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (3 nodes): `middleware()`, `middleware.ts`, `validateToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (3 nodes): `GET()`, `route.ts`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `updateTrack()` connect `Community 0` to `Community 18`, `Community 5`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `normalizeIsrc()` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 42 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 42 INFERRED edges - model-reasoned connections that need verification._
- **Are the 40 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `notFoundResponse()` (e.g. with `getNotificationById()` and `markAsRead()`) actually correct?**
  _`notFoundResponse()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._