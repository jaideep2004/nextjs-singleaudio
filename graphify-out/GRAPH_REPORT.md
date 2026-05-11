# Graph Report - nextjs-singleaudio  (2026-05-11)

## Corpus Check
- 250 files · ~447,789 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 888 nodes · 1091 edges · 46 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 258 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 59|Community 59]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 60 edges
2. `successResponse()` - 56 edges
3. `proxyBackend()` - 32 edges
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
- `POST()` --calls--> `markIsrcsAssigned()`  [INFERRED]
  src\app\api\releases\route.ts → src\lib\isrcAllocator.ts
- `identifyWithAcrCloudHandler()` --calls--> `identifyAudioFile()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `scanWithAcrCloudHandler()` --calls--> `uploadFileForScan()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (71): handleSubmit(), acrCloudCallbackHandler(), analyzeAudioHandler(), deleteTempFile(), getAcrCloudScanResultHandler(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler(), authPayload() (+63 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (37): POST(), GET(), GET(), POST(), POST(), canReadRelease(), DELETE(), GET() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (36): GET(), GET(), POST(), getCurrentBackendUser(), enforceMongoRateLimit(), ensureRateLimitIndexes(), RateLimitError, sanitizeDspKeys() (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (16): formatAcrTime(), formatAcrTimeRange(), humanizeDspKey(), matchDsp(), normalizeDspName(), refreshPending(), fetchAcrCloudScanResult(), formatProbability() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (5): fetchPayouts(), formatCurrency(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (12): canSee(), AdminLayout(), AuthGuard(), useAuth(), useAdminAuth(), canAccessAdminPath(), getAdminRouteAccess(), getFirstAllowedAdminPath() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (14): startSignup(), generateOtp(), getOtpExpiry(), readSmtpResponse(), sendAmazeSmsOtp(), sendEmailMessage(), sendEmailOtp(), smtpCommand() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (5): DspDeliveryService, getErrorMessage(), getHeadersRecord(), applyMetadataRules(), validateDdexPayload()

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (15): getConfig(), getFsBaseUrl(), getScanResult(), identifyAudioFile(), isAcrCloudFileScanningConfigured(), isAcrCloudIdentifyConfigured(), mapScanState(), normalizeAiDetection() (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (1): SpotifyStoreIntegration

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (1): AppleMusicStoreIntegration

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (1): YoutubeContentIdStoreIntegration

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (1): formatDate()

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (6): handleEpisodeSubmit(), handlePodcastSubmit(), slugify(), toOptionalNullableUrl(), toOptionalString(), uploadAsset()

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 19 - "Community 19"
Cohesion: 0.45
Nodes (10): assignTrackIsrc(), ensureIndexes(), formatIsrcForDisplay(), getDb(), isAlreadyUsed(), isDuplicateKeyError(), markTrackIsrcAssigned(), normalizeIsrc() (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (2): handleNotificationClick(), handleNotificationsClose()

### Community 21 - "Community 21"
Cohesion: 0.44
Nodes (9): assignIsrcsToTracks(), ensureIsrcIndexes(), formatIsrcForDisplay(), isAlreadyUsed(), isDuplicateKeyError(), markIsrcsAssigned(), normalizeIsrc(), reserveGeneratedIsrc() (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.31
Nodes (2): getErrorMessage(), StoreFactory

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (2): handleNotificationClick(), handleNotificationsClose()

### Community 24 - "Community 24"
Cohesion: 0.32
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 25 - "Community 25"
Cohesion: 0.38
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (1): formatDate()

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (1): fetchReleases()

### Community 28 - "Community 28"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 30 - "Community 30"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 32 - "Community 32"
Cohesion: 0.6
Nodes (5): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected()

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (1): ApiConnector

### Community 35 - "Community 35"
Cohesion: 0.47
Nodes (3): canFetchNotifications(), hasAuthToken(), isPublicAuthPath()

### Community 36 - "Community 36"
Cohesion: 0.47
Nodes (4): getApiKey(), parseResponse(), RssApiError, rssFetch()

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (3): ApiError, errorHandler(), notFoundHandler()

### Community 39 - "Community 39"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 40 - "Community 40"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 41 - "Community 41"
Cohesion: 0.5
Nodes (2): checkToken(), clearToken()

### Community 42 - "Community 42"
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

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 54 - "Community 54"
Cohesion: 0.67
Nodes (1): GenericAudioConnector

### Community 55 - "Community 55"
Cohesion: 0.67
Nodes (1): ApiError

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (2): middleware(), validateToken()

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

## Knowledge Gaps
- **Thin community `Community 9`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (18 nodes): `page.tsx`, `page.tsx`, `fetchTracks()`, `formatDate()`, `formatDuration()`, `getStatusColor()`, `getStatusIcon()`, `getStoreCount()`, `handleChangePage()`, `handleChangeRowsPerPage()`, `handleEditTrack()`, `handleGenreFilterChange()`, `handleSearch()`, `handleStatusFilterChange()`, `handleViewTrack()`, `load()`, `togglePlay()`, `togglePlayTrack()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (10 nodes): `formatNotificationDate()`, `getBreadcrumb()`, `getNotificationTitle()`, `handleClick()`, `handleClose()`, `handleLogout()`, `handleNotificationClick()`, `handleNotificationsClose()`, `handleNotificationsOpen()`, `AdminHeader.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (9 nodes): `formatNotificationDate()`, `getBreadcrumb()`, `getNotificationTitle()`, `handleNotificationClick()`, `handleNotificationsClose()`, `handleNotificationsOpen()`, `handleUserMenuClose()`, `handleUserMenuOpen()`, `TopNavigation.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (7 nodes): `fetchDashboardData()`, `fetchData()`, `formatDate()`, `getStatusChip()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (7 nodes): `fetchReleases()`, `formatDate()`, `getFilteredReleases()`, `getStatusChip()`, `handleTabChange()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (6 nodes): `ApiConnector`, `.constructor()`, `.deliver()`, `.validateCredentials()`, `.validateWebhookSignature()`, `apiConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (5 nodes): `checkToken()`, `clearToken()`, `loginAsAdmin()`, `testApiAccess()`, `admin-check.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `ReleaseVersionService`, `.createVersion()`, `stableStringify()`, `releaseVersion.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (4 nodes): `deliver()`, `validateCredentials()`, `validateTrack()`, `baseConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `isArtistOrLabel()`, `submitKyc()`, `userNeedsKyc()`, `KycGate.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (3 nodes): `GenericAudioConnector`, `.constructor()`, `genericAudioConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `middleware()`, `middleware.ts`, `validateToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `updateTrack()` connect `Community 0` to `Community 19`, `Community 21`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 2` to `Community 21`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `normalizeIsrc()` connect `Community 21` to `Community 0`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 57 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 57 INFERRED edges - model-reasoned connections that need verification._
- **Are the 55 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 55 INFERRED edges - model-reasoned connections that need verification._
- **Are the 30 inferred relationships involving `proxyBackend()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyBackend()` has 30 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `notFoundResponse()` (e.g. with `getNotificationById()` and `markAsRead()`) actually correct?**
  _`notFoundResponse()` has 16 INFERRED edges - model-reasoned connections that need verification._