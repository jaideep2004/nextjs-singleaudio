# Graph Report - nextjs-singleaudio  (2026-05-20)

## Corpus Check
- 276 files · ~446,870 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1085 nodes · 1475 edges · 48 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 351 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 64|Community 64]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 60 edges
2. `successResponse()` - 56 edges
3. `proxyBackend()` - 34 edges
4. `connectToDatabase()` - 29 edges
5. `getCurrentBackendUser()` - 27 edges
6. `SpotifyStoreIntegration` - 18 edges
7. `notFoundResponse()` - 18 edges
8. `processCatalogExportJob()` - 18 edges
9. `AppleMusicStoreIntegration` - 17 edges
10. `YoutubeContentIdStoreIntegration` - 17 edges

## Surprising Connections (you probably didn't know these)
- `identifyWithAcrCloudHandler()` --calls--> `identifyAudioFile()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `scanWithAcrCloudHandler()` --calls--> `uploadFirstThirtySecondsForScan()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `scanWithAcrCloudHandler()` --calls--> `identifyFirstThirtySeconds()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `scanWithAcrCloudHandler()` --calls--> `uploadFileForScan()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `getAcrCloudScanResultHandler()` --calls--> `getScanResult()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (79): handleSubmit(), acrCloudCallbackHandler(), analyzeAudioHandler(), deleteTempFile(), getAcrCloudScanResultHandler(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler(), authPayload() (+71 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (41): POST(), GET(), GET(), POST(), POST(), canReadRelease(), DELETE(), GET() (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (48): GET(), GET(), POST(), GET(), serializeJob(), getCurrentBackendUser(), sanitizeDspKeys(), getRssPodcastAccessMode() (+40 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (30): appUrl(), buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getAdminRecipients(), getFrontendUrl(), readSmtpResponse(), renderDetails() (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (28): createArchivePath(), createCatalogExportJob(), createMetadataZip(), createWorkbook(), ensureCatalogExportIndexes(), fileNameFromSource(), getBatchSize(), getCatalogExportJob() (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (16): formatAcrTime(), formatAcrTimeRange(), humanizeDspKey(), matchDsp(), normalizeDspName(), refreshPending(), fetchAcrCloudScanResult(), formatProbability() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (23): GET(), getClientKey(), POST(), requireFullAdmin(), serializeJob(), enforceMongoRateLimit(), ensureRateLimitIndexes(), RateLimitError (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (23): deliver(), validateCredentials(), validateTrack(), Boolean(), episodeStepValid(), createThirtySecondSample(), getConfig(), getFsBaseUrl() (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (9): DspDeliveryService, getErrorMessage(), getHeadersRecord(), toPlainObject(), baseRequirement(), evaluateDspReadiness(), getDspRequirement(), applyMetadataRules() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (5): fetchPayouts(), formatCurrency(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (12): canSee(), AdminLayout(), AuthGuard(), useAuth(), useAdminAuth(), canAccessAdminPath(), getAdminRouteAccess(), getFirstAllowedAdminPath() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (16): startSignup(), generateOtp(), getOtpExpiry(), hashOtp(), readSmtpResponse(), sendAmazeSmsOtp(), sendEmailMessage(), sendEmailOtp() (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (9): handleAddMidroll(), handleEpisodeSubmit(), handlePodcastSubmit(), parseMarkerTimeToMs(), readJson(), slugify(), toOptionalNullableUrl(), toOptionalString() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (1): SpotifyStoreIntegration

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (1): AppleMusicStoreIntegration

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (1): YoutubeContentIdStoreIntegration

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

### Community 18 - "Community 18"
Cohesion: 0.23
Nodes (10): checkLocalAsset(), checksumFile(), firstString(), normalizeUploadPath(), resolveUploadPath(), validateReleaseAssetsForDelivery(), buildSnapshot(), createReleaseDeliveryShellJobs() (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 22 - "Community 22"
Cohesion: 0.3
Nodes (11): buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getAdminEmailRecipients(), getFrontendUrl(), renderDetails(), renderEmail(), sendActionEmail() (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.23
Nodes (6): buildExcelXml(), handleApprove(), handleExport(), handleTabChange(), loadTracks(), updateSelectedTracks()

### Community 24 - "Community 24"
Cohesion: 0.23
Nodes (6): goNext(), isArtistOrLabel(), submitKyc(), userKycUnderReview(), userNeedsKyc(), validateStep()

### Community 25 - "Community 25"
Cohesion: 0.45
Nodes (10): assignTrackIsrc(), ensureIndexes(), formatIsrcForDisplay(), getDb(), isAlreadyUsed(), isDuplicateKeyError(), markTrackIsrcAssigned(), normalizeIsrc() (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (2): handleNotificationClick(), handleNotificationsClose()

### Community 27 - "Community 27"
Cohesion: 0.31
Nodes (2): getErrorMessage(), StoreFactory

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (2): handleNotificationClick(), handleNotificationsClose()

### Community 29 - "Community 29"
Cohesion: 0.32
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (2): formatDate(), getReleaseTrackCount()

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (2): fetchReleases(), getTrackCount()

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (1): ApiConnector

### Community 33 - "Community 33"
Cohesion: 0.38
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 35 - "Community 35"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 38 - "Community 38"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 39 - "Community 39"
Cohesion: 0.6
Nodes (5): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected()

### Community 40 - "Community 40"
Cohesion: 0.53
Nodes (4): handleBootstrapPhase1(), handleDispatch(), handleRetry(), load()

### Community 43 - "Community 43"
Cohesion: 0.47
Nodes (3): canFetchNotifications(), hasAuthToken(), isPublicAuthPath()

### Community 44 - "Community 44"
Cohesion: 0.47
Nodes (4): getApiKey(), parseResponse(), RssApiError, rssFetch()

### Community 46 - "Community 46"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 47 - "Community 47"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (2): checkToken(), clearToken()

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (2): ReleaseVersionService, stableStringify()

### Community 54 - "Community 54"
Cohesion: 0.83
Nodes (3): PremiumPanel(), premiumSurfaceSx(), premiumTableSx()

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 60 - "Community 60"
Cohesion: 0.67
Nodes (1): GenericAudioConnector

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (1): ApiError

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (2): middleware(), validateToken()

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

## Knowledge Gaps
- **Thin community `Community 13`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (10 nodes): `formatNotificationDate()`, `getBreadcrumb()`, `getNotificationTitle()`, `handleClick()`, `handleClose()`, `handleLogout()`, `handleNotificationClick()`, `handleNotificationsClose()`, `handleNotificationsOpen()`, `AdminHeader.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (9 nodes): `formatNotificationDate()`, `getBreadcrumb()`, `getNotificationTitle()`, `handleNotificationClick()`, `handleNotificationsClose()`, `handleNotificationsOpen()`, `handleUserMenuClose()`, `handleUserMenuOpen()`, `TopNavigation.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (8 nodes): `fetchDashboardData()`, `fetchData()`, `formatDate()`, `getReleaseTrackCount()`, `getStatusChip()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (8 nodes): `fetchReleases()`, `formatDate()`, `getFilteredReleases()`, `getStatusChip()`, `getTrackCount()`, `handleTabChange()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (7 nodes): `ApiConnector`, `.buildHeaders()`, `.constructor()`, `.deliver()`, `.validateCredentials()`, `.validateWebhookSignature()`, `apiConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (5 nodes): `checkToken()`, `clearToken()`, `loginAsAdmin()`, `testApiAccess()`, `admin-check.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `ReleaseVersionService`, `.createVersion()`, `stableStringify()`, `releaseVersion.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `GenericAudioConnector`, `.constructor()`, `genericAudioConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `middleware()`, `middleware.ts`, `validateToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sendUserAndAdminEmail()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `PATCH()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 18`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `Boolean()` connect `Community 7` to `Community 2`, `Community 3`, `Community 9`, `Community 24`, `Community 25`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 57 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 57 INFERRED edges - model-reasoned connections that need verification._
- **Are the 55 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 55 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `proxyBackend()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyBackend()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `connectToDatabase()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`connectToDatabase()` has 27 INFERRED edges - model-reasoned connections that need verification._