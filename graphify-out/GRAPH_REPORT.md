# Graph Report - nextjs-singleaudio  (2026-05-25)

## Corpus Check
- 328 files · ~815,922 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1414 nodes · 2165 edges · 57 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 522 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 73|Community 73]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 70 edges
2. `successResponse()` - 66 edges
3. `proxyBackend()` - 41 edges
4. `connectToDatabase()` - 34 edges
5. `getCurrentBackendUser()` - 32 edges
6. `PATCH()` - 25 edges
7. `processCatalogExportJob()` - 20 edges
8. `SpotifyStoreIntegration` - 18 edges
9. `notFoundResponse()` - 18 edges
10. `AppleMusicStoreIntegration` - 17 edges

## Surprising Connections (you probably didn't know these)
- `getUserSupportTickets()` --calls--> `listUserTickets()`  [INFERRED]
  server\src\controllers\support.controller.ts → server\src\services\support.service.ts
- `updateTrackAcrCloudById()` --calls--> `startTrackAcrCloudScan()`  [INFERRED]
  server\src\repositories\track.repository.ts → server\src\services\acrCloud.service.ts
- `identifyWithAcrCloudHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\utils\apiResponse.ts
- `identifyWithAcrCloudHandler()` --calls--> `successResponse()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\utils\apiResponse.ts
- `scanWithAcrCloudHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\utils\apiResponse.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (108): handleSubmit(), acrCloudCallbackHandler(), getAcrCloudScanResultHandler(), authPayload(), changePassword(), checkArtistName(), escapeRegex(), forgotPassword() (+100 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (49): PATCH(), POST(), POST(), GET(), PATCH(), GET(), POST(), POST() (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (69): asMusicPublishingStage(), asString(), getMusicPublishingTrackKey(), getReleaseOwnerQuery(), getTrackPublishingStatus(), normalizeMusicPublishingTrack(), normalizeMusicPublishingTracks(), acquireUpcAssignmentLock() (+61 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (48): GET(), GET(), POST(), GET(), serializeJob(), getCurrentBackendUser(), sanitizeDspKeys(), getRssPodcastAccessMode() (+40 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (51): GET(), getClientKey(), canManageYoutube(), GET(), getClientKey(), POST(), enforceMongoRateLimit(), ensureRateLimitIndexes() (+43 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (32): checkLocalAsset(), checksumFile(), firstString(), normalizeUploadPath(), resolveUploadPath(), validateReleaseAssetsForDelivery(), buildSnapshot(), createReleaseDeliveryShellJobs() (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (32): GET(), getClientKey(), POST(), requireFullAdmin(), serializeJob(), createArchivePath(), createCatalogExportJob(), createMetadataZip() (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (35): buildCreateProductPayload(), buildCreateProductRequest(), buildMrpPayload(), cleanString(), collectFallbackGtins(), collectNamedGtins(), collectProductListItems(), collectValidationRecords() (+27 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (16): formatAcrTime(), formatAcrTimeRange(), humanizeDspKey(), matchDsp(), normalizeDspName(), refreshPending(), fetchAcrCloudScanResult(), formatProbability() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (23): analyzeAudioHandler(), deleteTempFile(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler(), createThirtySecondSample(), getConfig(), getFsBaseUrl(), getScanResult() (+15 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (22): deliver(), validateCredentials(), validateTrack(), goNext(), isArtistOrLabel(), submitKyc(), userKycUnderReview(), userNeedsKyc() (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (28): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected(), addTicketMessage(), appendMessage(), assertCanManageSupportCategory() (+20 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (9): DspDeliveryService, getErrorMessage(), getHeadersRecord(), toPlainObject(), baseRequirement(), evaluateDspReadiness(), getDspRequirement(), applyMetadataRules() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (5): fetchPayouts(), formatCurrency(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (12): canSee(), AdminLayout(), AuthGuard(), useAuth(), useAdminAuth(), canAccessAdminPath(), getAdminRouteAccess(), getFirstAllowedAdminPath() (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (19): assetOpsFromTrack(), asString(), backfillAssets(), backfillFingerprints(), backfillOrganizations(), backfillOwnership(), backfillTracks(), canonicalTrack() (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (19): assignIsrcsToTracks(), ensureIsrcIndexes(), formatIsrcForDisplay(), isAlreadyUsed(), isDuplicateKeyError(), markIsrcsAssigned(), normalizeIsrc(), reserveGeneratedIsrc() (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (9): handleAddMidroll(), handleEpisodeSubmit(), handlePodcastSubmit(), parseMarkerTimeToMs(), readJson(), slugify(), toOptionalNullableUrl(), toOptionalString() (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (1): SpotifyStoreIntegration

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (1): AppleMusicStoreIntegration

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (1): YoutubeContentIdStoreIntegration

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

### Community 23 - "Community 23"
Cohesion: 0.26
Nodes (10): handleAssignToMe(), handleCloseTicket(), handleCreate(), handleNote(), handleReply(), handleStatus(), loadDetail(), loadTicketDetail() (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 27 - "Community 27"
Cohesion: 0.3
Nodes (11): buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getAdminEmailRecipients(), getFrontendUrl(), renderDetails(), renderEmail(), sendActionEmail() (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.23
Nodes (6): buildExcelXml(), handleApprove(), handleExport(), handleTabChange(), loadTracks(), updateSelectedTracks()

### Community 29 - "Community 29"
Cohesion: 0.21
Nodes (5): handleNext(), assertVercelUploadSize(), async(), uploadArtworkToServer(), uploadAudioToServer()

### Community 30 - "Community 30"
Cohesion: 0.24
Nodes (3): formatDate(), handleSaveSelection(), loadChannels()

### Community 31 - "Community 31"
Cohesion: 0.22
Nodes (2): handleNotificationClick(), handleNotificationsClose()

### Community 32 - "Community 32"
Cohesion: 0.31
Nodes (2): getErrorMessage(), StoreFactory

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (2): fetchReleases(), getTrackCount()

### Community 34 - "Community 34"
Cohesion: 0.28
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (2): handleNotificationClick(), handleNotificationsClose()

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (7): asString(), canonicalFromReleaseTrack(), ensureIndexes(), loadServerEnv(), main(), ownerUserId(), trackKey()

### Community 37 - "Community 37"
Cohesion: 0.32
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (2): formatDate(), getReleaseTrackCount()

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (1): ApiConnector

### Community 41 - "Community 41"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 43 - "Community 43"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 45 - "Community 45"
Cohesion: 0.4
Nodes (4): trackFingerprintsCollection(), upsertAcrCloudFingerprintsForTracks(), releasesCollection(), updateReleaseTrackAcrCloudByFileId()

### Community 46 - "Community 46"
Cohesion: 0.53
Nodes (4): handleBootstrapPhase1(), handleDispatch(), handleRetry(), load()

### Community 49 - "Community 49"
Cohesion: 0.47
Nodes (3): canFetchNotifications(), hasAuthToken(), isPublicAuthPath()

### Community 50 - "Community 50"
Cohesion: 0.47
Nodes (4): getApiKey(), parseResponse(), RssApiError, rssFetch()

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 53 - "Community 53"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (2): checkToken(), clearToken()

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (2): ReleaseVersionService, stableStringify()

### Community 60 - "Community 60"
Cohesion: 0.83
Nodes (3): PremiumPanel(), premiumSurfaceSx(), premiumTableSx()

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (2): AttachmentPreview(), formatBytes()

### Community 63 - "Community 63"
Cohesion: 0.67
Nodes (2): deliveryJobsCollection(), findDeliveryJobsForRelease()

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (2): findRoyaltiesForTrack(), royaltiesCollection()

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 69 - "Community 69"
Cohesion: 0.67
Nodes (1): GenericAudioConnector

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (1): ApiError

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (2): middleware(), validateToken()

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

## Knowledge Gaps
- **Thin community `Community 18`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (10 nodes): `formatNotificationDate()`, `getBreadcrumb()`, `getNotificationTitle()`, `handleClick()`, `handleClose()`, `handleLogout()`, `handleNotificationClick()`, `handleNotificationsClose()`, `handleNotificationsOpen()`, `AdminHeader.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (9 nodes): `fetchReleases()`, `formatDate()`, `getFilteredReleases()`, `getReleaseArtwork()`, `getStatusChip()`, `getTrackCount()`, `handleTabChange()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (9 nodes): `formatNotificationDate()`, `getBreadcrumb()`, `getNotificationTitle()`, `handleNotificationClick()`, `handleNotificationsClose()`, `handleNotificationsOpen()`, `handleUserMenuClose()`, `handleUserMenuOpen()`, `TopNavigation.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (8 nodes): `fetchDashboardData()`, `fetchData()`, `formatDate()`, `getReleaseTrackCount()`, `getStatusChip()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (7 nodes): `ApiConnector`, `.buildHeaders()`, `.constructor()`, `.deliver()`, `.validateCredentials()`, `.validateWebhookSignature()`, `apiConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (5 nodes): `checkToken()`, `clearToken()`, `loginAsAdmin()`, `testApiAccess()`, `admin-check.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `ReleaseVersionService`, `.createVersion()`, `stableStringify()`, `releaseVersion.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `AttachmentPreview.tsx`, `AttachmentPreview()`, `formatBytes()`, `getFileIcon()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (4 nodes): `deliveryJobsCollection()`, `deliverySnapshotsCollection()`, `findDeliveryJobsForRelease()`, `delivery.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (4 nodes): `findRoyaltiesForTrack()`, `payoutsCollection()`, `royaltiesCollection()`, `royalties.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (3 nodes): `GenericAudioConnector`, `.constructor()`, `genericAudioConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (3 nodes): `middleware()`, `middleware.ts`, `validateToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PATCH()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 16`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `sendUserAndAdminEmail()` connect `Community 0` to `Community 16`, `Community 5`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `Boolean()` connect `Community 10` to `Community 16`, `Community 9`, `Community 3`, `Community 13`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 67 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 67 INFERRED edges - model-reasoned connections that need verification._
- **Are the 65 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 65 INFERRED edges - model-reasoned connections that need verification._
- **Are the 39 inferred relationships involving `proxyBackend()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyBackend()` has 39 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `connectToDatabase()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`connectToDatabase()` has 32 INFERRED edges - model-reasoned connections that need verification._