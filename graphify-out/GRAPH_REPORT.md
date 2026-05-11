# Graph Report - nextjs-singleaudio  (2026-05-09)

## Corpus Check
- 247 files · ~435,180 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 858 nodes · 1034 edges · 43 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 247 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 12|Community 12]]
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
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 60|Community 60]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 60 edges
2. `successResponse()` - 56 edges
3. `proxyBackend()` - 27 edges
4. `SpotifyStoreIntegration` - 18 edges
5. `notFoundResponse()` - 18 edges
6. `AppleMusicStoreIntegration` - 17 edges
7. `YoutubeContentIdStoreIntegration` - 17 edges
8. `getCurrentBackendUser()` - 17 edges
9. `DspDeliveryService` - 15 edges
10. `StoreService` - 14 edges

## Surprising Connections (you probably didn't know these)
- `notFoundHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\middleware\errorHandler.middleware.ts → server\src\utils\apiResponse.ts
- `errorHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\middleware\errorHandler.middleware.ts → server\src\utils\apiResponse.ts
- `identifyWithAcrCloudHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\utils\apiResponse.ts
- `identifyWithAcrCloudHandler()` --calls--> `successResponse()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\utils\apiResponse.ts
- `scanWithAcrCloudHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\utils\apiResponse.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (66): handleSubmit(), acrCloudCallbackHandler(), getAcrCloudScanResultHandler(), authPayload(), changePassword(), checkArtistName(), escapeRegex(), forgotPassword() (+58 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (32): POST(), GET(), GET(), POST(), POST(), canReadRelease(), DELETE(), GET() (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (37): GET(), GET(), POST(), getCurrentBackendUser(), markIsrcsAssigned(), enforceMongoRateLimit(), ensureRateLimitIndexes(), RateLimitError (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (13): formatAcrTime(), formatAcrTimeRange(), refreshPending(), fetchAcrCloudScanResult(), formatProbability(), getAcrCloudColor(), getAcrCloudLabel(), getAcrCloudProviderMetadata() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (20): analyzeAudioHandler(), deleteTempFile(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler(), getConfig(), getFsBaseUrl(), getScanResult(), identifyAudioFile() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (5): DspDeliveryService, getErrorMessage(), getHeadersRecord(), applyMetadataRules(), validateDdexPayload()

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (14): startSignup(), generateOtp(), getOtpExpiry(), readSmtpResponse(), sendAmazeSmsOtp(), sendEmailMessage(), sendEmailOtp(), smtpCommand() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (4): fetchPayouts(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (1): SpotifyStoreIntegration

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (1): AppleMusicStoreIntegration

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (1): YoutubeContentIdStoreIntegration

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (1): formatDate()

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

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
Cohesion: 0.53
Nodes (8): assignIsrcsToTracks(), ensureIsrcIndexes(), formatIsrcForDisplay(), isAlreadyUsed(), isDuplicateKeyError(), normalizeIsrc(), reserveGeneratedIsrc(), reserveManualIsrc()

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (3): AuthGuard(), useAuth(), useAdminAuth()

### Community 22 - "Community 22"
Cohesion: 0.32
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 23 - "Community 23"
Cohesion: 0.38
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (1): formatDate()

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (1): fetchReleases()

### Community 26 - "Community 26"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 29 - "Community 29"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 30 - "Community 30"
Cohesion: 0.6
Nodes (5): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected()

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (1): ApiConnector

### Community 34 - "Community 34"
Cohesion: 0.47
Nodes (4): getApiKey(), parseResponse(), RssApiError, rssFetch()

### Community 36 - "Community 36"
Cohesion: 0.4
Nodes (3): ApiError, errorHandler(), notFoundHandler()

### Community 37 - "Community 37"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (2): checkToken(), clearToken()

### Community 40 - "Community 40"
Cohesion: 0.7
Nodes (4): handleBootstrapPhase1(), handleDispatch(), handleRetry(), load()

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (2): ReleaseVersionService, stableStringify()

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (2): deliver(), validateTrack()

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (2): isArtistOrLabel(), userNeedsKyc()

### Community 49 - "Community 49"
Cohesion: 0.83
Nodes (3): PremiumPanel(), premiumSurfaceSx(), premiumTableSx()

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 55 - "Community 55"
Cohesion: 0.67
Nodes (1): GenericAudioConnector

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (1): ApiError

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (2): middleware(), validateToken()

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

## Knowledge Gaps
- **Thin community `Community 8`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (18 nodes): `page.tsx`, `page.tsx`, `fetchTracks()`, `formatDate()`, `formatDuration()`, `getStatusColor()`, `getStatusIcon()`, `getStoreCount()`, `handleChangePage()`, `handleChangeRowsPerPage()`, `handleEditTrack()`, `handleGenreFilterChange()`, `handleSearch()`, `handleStatusFilterChange()`, `handleViewTrack()`, `load()`, `togglePlay()`, `togglePlayTrack()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (7 nodes): `fetchDashboardData()`, `fetchData()`, `formatDate()`, `getStatusChip()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (7 nodes): `fetchReleases()`, `formatDate()`, `getFilteredReleases()`, `getStatusChip()`, `handleTabChange()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (6 nodes): `ApiConnector`, `.constructor()`, `.deliver()`, `.validateCredentials()`, `.validateWebhookSignature()`, `apiConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (5 nodes): `checkToken()`, `clearToken()`, `loginAsAdmin()`, `testApiAccess()`, `admin-check.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `ReleaseVersionService`, `.createVersion()`, `stableStringify()`, `releaseVersion.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (4 nodes): `deliver()`, `validateCredentials()`, `validateTrack()`, `baseConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `isArtistOrLabel()`, `submitKyc()`, `userNeedsKyc()`, `KycGate.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (3 nodes): `GenericAudioConnector`, `.constructor()`, `genericAudioConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (3 nodes): `middleware()`, `middleware.ts`, `validateToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `updateTrack()` connect `Community 0` to `Community 18`, `Community 20`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 2` to `Community 20`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `normalizeIsrc()` connect `Community 20` to `Community 0`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 57 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 57 INFERRED edges - model-reasoned connections that need verification._
- **Are the 55 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 55 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `proxyBackend()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyBackend()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `notFoundResponse()` (e.g. with `getNotificationById()` and `markAsRead()`) actually correct?**
  _`notFoundResponse()` has 16 INFERRED edges - model-reasoned connections that need verification._