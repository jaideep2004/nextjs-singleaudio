# Graph Report - nextjs-singleaudio  (2026-05-07)

## Corpus Check
- 195 files · ~426,606 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 706 nodes · 838 edges · 34 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 173 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 49|Community 49]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 43 edges
2. `successResponse()` - 39 edges
3. `SpotifyStoreIntegration` - 18 edges
4. `AppleMusicStoreIntegration` - 17 edges
5. `YoutubeContentIdStoreIntegration` - 17 edges
6. `notFoundResponse()` - 17 edges
7. `StoreService` - 14 edges
8. `getCurrentBackendUser()` - 12 edges
9. `connectToDatabase()` - 12 edges
10. `proxyBackend()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `identifyWithAcrCloudHandler()` --calls--> `identifyAudioFile()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `scanWithAcrCloudHandler()` --calls--> `uploadFileForScan()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `getAcrCloudScanResultHandler()` --calls--> `getScanResult()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `acrCloudCallbackHandler()` --calls--> `normalizeScanPayload()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `checkArtistName()` --calls--> `onSubmit()`  [INFERRED]
  server\src\controllers\auth.controller.ts → src\app\(public)\signup\page.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (52): acrCloudCallbackHandler(), analyzeAudioHandler(), deleteTempFile(), getAcrCloudScanResultHandler(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler(), changePassword(), checkArtistName() (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (25): GET(), GET(), POST(), getCurrentBackendUser(), sanitizeDspKeys(), getRssPodcastAccessMode(), getRssWorkspaceSupervisorEmails(), isRssWorkspaceSupervisor() (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (16): GET(), DELETE(), GET(), PUT(), GET(), PUT(), fetchBackend(), getAuthToken() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (13): formatAcrTime(), formatAcrTimeRange(), refreshPending(), fetchAcrCloudScanResult(), formatProbability(), getAcrCloudColor(), getAcrCloudLabel(), getAcrCloudProviderMetadata() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (12): handleSubmit(), getErrorMessage(), login(), signup(), toUser(), handleSubmit(), handleNext(), onSubmit() (+4 more)

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
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (2): fetchPayouts(), onPayoutSubmit()

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (3): handleDeleteConfirm(), handleStatusToggle(), showSnackbar()

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (4): formatDate(), getAcrCloudColor(), getAcrCloudLabel(), getAcrCloudState()

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (6): handleEpisodeSubmit(), handlePodcastSubmit(), slugify(), toOptionalNullableUrl(), toOptionalString(), uploadAsset()

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 19 - "Community 19"
Cohesion: 0.2
Nodes (3): fetchPayouts(), handleApprovePayout(), handleRejectPayout()

### Community 20 - "Community 20"
Cohesion: 0.45
Nodes (10): assignTrackIsrc(), ensureIndexes(), formatIsrcForDisplay(), getDb(), isAlreadyUsed(), isDuplicateKeyError(), markTrackIsrcAssigned(), normalizeIsrc() (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.31
Nodes (2): getErrorMessage(), StoreFactory

### Community 22 - "Community 22"
Cohesion: 0.28
Nodes (4): fetchReleases(), getAcrCloudColor(), getAcrCloudLabel(), getAcrCloudState()

### Community 23 - "Community 23"
Cohesion: 0.38
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 24 - "Community 24"
Cohesion: 0.38
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 26 - "Community 26"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 28 - "Community 28"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 30 - "Community 30"
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

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (1): ApiError

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (2): middleware(), validateToken()

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

## Knowledge Gaps
- **Thin community `Community 7`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (15 nodes): `fetchPayouts()`, `fetchRoyaltyData()`, `fetchTracks()`, `formatCurrency()`, `formatDate()`, `getStatusColor()`, `handleMonthChange()`, `handleTabChange()`, `handleTrackChange()`, `handleYearChange()`, `onPayoutSubmit()`, `prepareStoreChartData()`, `prepareTrackChartData()`, `TabPanel()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (5 nodes): `checkToken()`, `clearToken()`, `loginAsAdmin()`, `testApiAccess()`, `admin-check.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (3 nodes): `middleware()`, `middleware.ts`, `validateToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `updateTrack()` connect `Community 0` to `Community 20`, `Community 5`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `normalizeIsrc()` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 40 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 38 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 38 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._