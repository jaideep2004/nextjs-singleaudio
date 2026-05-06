# Graph Report - nextjs-singleaudio  (2026-05-06)

## Corpus Check
- 192 files · ~415,695 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 679 nodes · 776 edges · 33 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 165 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 48|Community 48]]

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
- `notFoundHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\middleware\errorHandler.middleware.ts → server\src\utils\apiResponse.ts
- `errorHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\middleware\errorHandler.middleware.ts → server\src\utils\apiResponse.ts
- `identifyWithAcrCloudHandler()` --calls--> `identifyAudioFile()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `scanWithAcrCloudHandler()` --calls--> `uploadFileForScan()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts
- `getAcrCloudScanResultHandler()` --calls--> `getScanResult()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\services\acrCloud.service.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (49): acrCloudCallbackHandler(), analyzeAudioHandler(), deleteTempFile(), getAcrCloudScanResultHandler(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler(), changePassword(), checkArtistName() (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (30): GET(), GET(), POST(), getCurrentBackendUser(), sanitizeDspKeys(), getRssPodcastAccessMode(), getRssWorkspaceSupervisorEmails(), isRssWorkspaceSupervisor() (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (16): GET(), DELETE(), GET(), PUT(), GET(), PUT(), fetchBackend(), getAuthToken() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (13): formatAcrTime(), formatAcrTimeRange(), refreshPending(), fetchAcrCloudScanResult(), formatProbability(), getAcrCloudColor(), getAcrCloudLabel(), getAcrCloudProviderMetadata() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (10): handleSubmit(), getErrorMessage(), login(), signup(), toUser(), handleSubmit(), handleNext(), onSubmit() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.23
Nodes (15): getConfig(), getFsBaseUrl(), getScanResult(), identifyAudioFile(), isAcrCloudFileScanningConfigured(), isAcrCloudIdentifyConfigured(), mapScanState(), normalizeAiDetection() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (1): SpotifyStoreIntegration

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (1): AppleMusicStoreIntegration

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (1): YoutubeContentIdStoreIntegration

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (2): fetchPayouts(), onPayoutSubmit()

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (4): formatDate(), getAcrCloudColor(), getAcrCloudLabel(), getAcrCloudState()

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (3): handleDeleteConfirm(), handleStatusToggle(), showSnackbar()

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (6): handleEpisodeSubmit(), handlePodcastSubmit(), slugify(), toOptionalNullableUrl(), toOptionalString(), uploadAsset()

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 18 - "Community 18"
Cohesion: 0.2
Nodes (3): fetchPayouts(), handleApprovePayout(), handleRejectPayout()

### Community 19 - "Community 19"
Cohesion: 0.31
Nodes (2): getErrorMessage(), StoreFactory

### Community 20 - "Community 20"
Cohesion: 0.28
Nodes (4): fetchReleases(), getAcrCloudColor(), getAcrCloudLabel(), getAcrCloudState()

### Community 21 - "Community 21"
Cohesion: 0.38
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 22 - "Community 22"
Cohesion: 0.38
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 24 - "Community 24"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 26 - "Community 26"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 28 - "Community 28"
Cohesion: 0.6
Nodes (5): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected()

### Community 30 - "Community 30"
Cohesion: 0.47
Nodes (4): getApiKey(), parseResponse(), RssApiError, rssFetch()

### Community 31 - "Community 31"
Cohesion: 0.4
Nodes (3): ApiError, errorHandler(), notFoundHandler()

### Community 32 - "Community 32"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 33 - "Community 33"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (2): checkToken(), clearToken()

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (1): ApiError

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (2): middleware(), validateToken()

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

## Knowledge Gaps
- **Thin community `Community 6`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (15 nodes): `fetchPayouts()`, `fetchRoyaltyData()`, `fetchTracks()`, `formatCurrency()`, `formatDate()`, `getStatusColor()`, `handleMonthChange()`, `handleTabChange()`, `handleTrackChange()`, `handleYearChange()`, `onPayoutSubmit()`, `prepareStoreChartData()`, `prepareTrackChartData()`, `TabPanel()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (5 nodes): `checkToken()`, `clearToken()`, `loginAsAdmin()`, `testApiAccess()`, `admin-check.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `middleware()`, `middleware.ts`, `validateToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `errorResponse()` connect `Community 0` to `Community 31`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `checkArtistName()` connect `Community 0` to `Community 4`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 40 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 38 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 38 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._