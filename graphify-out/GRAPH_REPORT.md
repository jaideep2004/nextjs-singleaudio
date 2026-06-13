# Graph Report - nextjs-singleaudio  (2026-06-13)

## Corpus Check
- 365 files · ~1,856,102 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1657 nodes · 2652 edges · 66 communities detected
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 623 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
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
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 85|Community 85]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 90 edges
2. `successResponse()` - 86 edges
3. `proxyBackend()` - 51 edges
4. `connectToDatabase()` - 27 edges
5. `PATCH()` - 25 edges
6. `DspDeliveryService` - 23 edges
7. `getCurrentBackendUser()` - 23 edges
8. `processCatalogExportJob()` - 22 edges
9. `SpotifyStoreIntegration` - 18 edges
10. `notFoundResponse()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `getAdminKnowledgeBaseArticles()` --calls--> `listAdminArticles()`  [INFERRED]
  server\src\controllers\knowledgeBase.controller.ts → server\src\services\knowledgeBase.service.ts
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
Cohesion: 0.03
Nodes (133): handleSubmit(), acrCloudCallbackHandler(), getAcrCloudScanResultHandler(), authPayload(), changePassword(), checkArtistName(), escapeRegex(), forgotPassword() (+125 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (71): PATCH(), POST(), POST(), GET(), GET(), PATCH(), GET(), POST() (+63 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (79): canManageYoutube(), GET(), getClientKey(), normalizeRange(), GET(), getClientKey(), POST(), requireFullAdmin() (+71 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (63): buildReleaseQuery(), createArchivePath(), createCatalogExportJob(), createMetadataZip(), createReleasePartZip(), createReleaseZipName(), createUsersParentZip(), createUserZip() (+55 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (48): GET(), getClientKey(), getYoutubeWorkflowLabel(), getYoutubeWorkflowStatus(), isYoutubeAnalyticsAccessStatus(), isYoutubeAnalyticsSyncStatus(), isYoutubeCmsStatus(), isYoutubeVerificationStatus() (+40 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (51): buildCreateProductPayload(), buildCreateProductRequest(), buildMrpPayload(), cleanString(), collectFallbackGtins(), collectNamedGtins(), collectProductListItems(), collectValidationRecords() (+43 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (42): mapYoutubeAnalyticsRows(), queryYoutubeAnalyticsReport(), YoutubeAnalyticsApiError, fetchYoutubeVideosMetadata(), YoutubeDataApiError, addDays(), appendYoutubeAnalyticsSyncRun(), claimNextYoutubeAnalyticsSyncJob() (+34 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (31): deliver(), validateCredentials(), validateTrack(), useColorMode(), analyzeAudioHandler(), deleteTempFile(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler() (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (13): DspDeliveryService, getErrorMessage(), getHeadersRecord(), hashPayload(), hasOwn(), normalizeConfigAndCredentials(), sanitizeConfig(), toPlainObject() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (17): formatAcrTime(), formatAcrTimeRange(), getTakedownProviders(), handleConfirmTakedown(), handleLifecycleAction(), openTakedownDialog(), refreshPending(), fetchAcrCloudScanResult() (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (34): actorId(), assertCategory(), assertSection(), bulkDeleteArticles(), createArticle(), createCategory(), createRevision(), createSection() (+26 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (31): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected(), addTicketMessage(), addUnreadMessageCounts(), appendMessage() (+23 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (5): fetchPayouts(), formatCurrency(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (12): canSee(), AdminLayout(), AuthGuard(), useAuth(), useAdminAuth(), canAccessAdminPath(), getAdminRouteAccess(), getFirstAllowedAdminPath() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (19): assetOpsFromTrack(), asString(), backfillAssets(), backfillFingerprints(), backfillOrganizations(), backfillOwnership(), backfillTracks(), canonicalTrack() (+11 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (12): handleLogout(), handleNotificationClick(), handleNotificationsClose(), checkToken(), clearToken(), loginAsAdmin(), clearToken(), setAdminRole() (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.16
Nodes (16): archiveArticle(), bulkArchiveArticles(), createBlankArticle(), createCategory(), createSection(), idOf(), load(), resetForm() (+8 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (15): clearUnread(), handleAssignToMe(), handleCloseTicket(), handleCreate(), handleNote(), handleReopen(), handleReply(), handleStatus() (+7 more)

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
Cohesion: 0.23
Nodes (15): assignIsrcsToTracks(), ensureIsrcIndexes(), formatIsrcForDisplay(), isAlreadyUsed(), isDuplicateKeyError(), normalizeIsrc(), reserveGeneratedIsrc(), reserveManualIsrc() (+7 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (2): getErrorMessage(), StoreService

### Community 23 - "Community 23"
Cohesion: 0.23
Nodes (15): appUrl(), buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getAdminRecipients(), getFrontendUrl(), getLogoUrl(), readSmtpResponse() (+7 more)

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (12): buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getAdminEmailRecipients(), getFrontendUrl(), getLogoUrl(), renderDetails(), renderEmail() (+4 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 29 - "Community 29"
Cohesion: 0.23
Nodes (6): buildExcelXml(), handleApprove(), handleExport(), handleTabChange(), loadTracks(), updateSelectedTracks()

### Community 30 - "Community 30"
Cohesion: 0.23
Nodes (6): goNext(), isArtistOrLabel(), submitKyc(), userKycUnderReview(), userNeedsKyc(), validateStep()

### Community 31 - "Community 31"
Cohesion: 0.45
Nodes (10): assignTrackIsrc(), ensureIndexes(), formatIsrcForDisplay(), getDb(), isAlreadyUsed(), isDuplicateKeyError(), markTrackIsrcAssigned(), normalizeIsrc() (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.31
Nodes (2): MockDspConnector, payloadId()

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (2): fetchReleases(), getTrackCount()

### Community 34 - "Community 34"
Cohesion: 0.24
Nodes (3): assertVercelUploadSize(), uploadArtworkToServer(), uploadAudioToServer()

### Community 35 - "Community 35"
Cohesion: 0.24
Nodes (3): formatDate(), handleSaveSelection(), loadChannels()

### Community 36 - "Community 36"
Cohesion: 0.31
Nodes (2): getErrorMessage(), StoreFactory

### Community 37 - "Community 37"
Cohesion: 0.28
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (2): handleCreateExport(), resetExportDialog()

### Community 39 - "Community 39"
Cohesion: 0.28
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (2): handleNotificationClick(), handleNotificationsClose()

### Community 41 - "Community 41"
Cohesion: 0.5
Nodes (7): asString(), canonicalFromReleaseTrack(), ensureIndexes(), loadServerEnv(), main(), ownerUserId(), trackKey()

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (3): protect(), protectAdminOrCronSecret(), timingSafeEqualString()

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (2): formatDate(), getReleaseTrackCount()

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (1): ApiConnector

### Community 45 - "Community 45"
Cohesion: 0.48
Nodes (5): handleBootstrapPhase1(), handleDispatch(), handleProcessDue(), handleRetry(), load()

### Community 46 - "Community 46"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 47 - "Community 47"
Cohesion: 0.38
Nodes (3): canFetchNotifications(), hasAuthToken(), isPublicAuthPath()

### Community 48 - "Community 48"
Cohesion: 0.52
Nodes (6): checkLocalAsset(), checksumFile(), firstString(), normalizeUploadPath(), resolveUploadPath(), validateReleaseAssetsForDelivery()

### Community 50 - "Community 50"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (4): trackFingerprintsCollection(), upsertAcrCloudFingerprintsForTracks(), releasesCollection(), updateReleaseTrackAcrCloudByFileId()

### Community 53 - "Community 53"
Cohesion: 0.6
Nodes (5): getRequestHost(), isHelpHost(), middleware(), normalizeHost(), validateToken()

### Community 55 - "Community 55"
Cohesion: 0.6
Nodes (5): getDspDisplayName(), getDspInitials(), getDspMeta(), humanizeDspKey(), normalizeDspName()

### Community 56 - "Community 56"
Cohesion: 0.4
Nodes (2): setImage(), uploadImage()

### Community 57 - "Community 57"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 58 - "Community 58"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 64 - "Community 64"
Cohesion: 0.6
Nodes (3): authCssVars(), authStyleVars(), getAuthTokens()

### Community 66 - "Community 66"
Cohesion: 0.6
Nodes (3): PremiumPanel(), premiumSurfaceSx(), premiumTableSx()

### Community 68 - "Community 68"
Cohesion: 0.67
Nodes (2): ReleaseVersionService, stableStringify()

### Community 70 - "Community 70"
Cohesion: 0.83
Nodes (3): cleanTitle(), getNotificationTitle(), titleFromMessage()

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (2): deliveryJobsCollection(), findDeliveryJobsForRelease()

### Community 72 - "Community 72"
Cohesion: 0.67
Nodes (2): findRoyaltiesForTrack(), royaltiesCollection()

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 78 - "Community 78"
Cohesion: 0.67
Nodes (1): GenericAudioConnector

### Community 79 - "Community 79"
Cohesion: 0.67
Nodes (1): ApiError

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (2): splitHref(), tabMatches()

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (2): handleSync(), load()

## Knowledge Gaps
- **Thin community `Community 18`** (19 nodes): `SpotifyStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.ensureAuthenticated()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getErrorResolution()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `spotify.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (18 nodes): `AppleMusicStoreIntegration`, `.authenticate()`, `.constructor()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `apple-music.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (18 nodes): `YoutubeContentIdStoreIntegration`, `.authenticate()`, `.deliverTrack()`, `.fetchDetailedReport()`, `.fetchReports()`, `.formatTrackForDelivery()`, `.getDeliveryStatus()`, `.getStoreInfo()`, `.handleError()`, `.initializeApiClient()`, `.isRetryableError()`, `.mapStatus()`, `.refreshToken()`, `.removeTrack()`, `.updateTrack()`, `.validateCredentials()`, `.validateTrack()`, `youtube-content-id.store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (16 nodes): `store.service.ts`, `getErrorMessage()`, `StoreService`, `.constructor()`, `.deleteStore()`, `.deliverToStore()`, `.getActiveStores()`, `.getDeliveryStatus()`, `.getStoreById()`, `.getStoreEarnings()`, `.getStoresByType()`, `.processDelivery()`, `.registerStore()`, `.syncStoreReports()`, `.testStoreConnection()`, `.updateStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (10 nodes): `MockDspConnector`, `.constructor()`, `.deliver()`, `.getDeliveryStatus()`, `.takedown()`, `.update()`, `.validateCredentials()`, `.validateWebhookSignature()`, `payloadId()`, `mockDspConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (10 nodes): `fetchReleases()`, `formatDate()`, `getReleaseArtwork()`, `getStatusChip()`, `getTrackCount()`, `handlePendingExport()`, `handleTabChange()`, `resetPage()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (9 nodes): `store.factory.ts`, `getErrorMessage()`, `StoreFactory`, `.constructor()`, `.getInstance()`, `.getIntegration()`, `.getSupportedStores()`, `.initializeDefaultIntegrations()`, `.registerIntegration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (9 nodes): `formatBytes()`, `formatDate()`, `formatNumber()`, `getReleaseUserId()`, `handleCreateExport()`, `isActiveJob()`, `openCreateExport()`, `resetExportDialog()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (9 nodes): `formatNotificationDate()`, `getBreadcrumb()`, `getHelpCenterHref()`, `handleNotificationClick()`, `handleNotificationsClose()`, `handleNotificationsOpen()`, `handleUserMenuClose()`, `handleUserMenuOpen()`, `TopNavigation.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (8 nodes): `fetchDashboardData()`, `fetchData()`, `formatDate()`, `getReleaseTrackCount()`, `getStatusChip()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (7 nodes): `ApiConnector`, `.buildHeaders()`, `.constructor()`, `.deliver()`, `.validateCredentials()`, `.validateWebhookSignature()`, `apiConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (6 nodes): `resizeSelectedMedia()`, `setImage()`, `setLink()`, `setYoutube()`, `uploadImage()`, `TiptapEditor.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (4 nodes): `ReleaseVersionService`, `.createVersion()`, `stableStringify()`, `releaseVersion.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (4 nodes): `deliveryJobsCollection()`, `deliverySnapshotsCollection()`, `findDeliveryJobsForRelease()`, `delivery.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (4 nodes): `findRoyaltiesForTrack()`, `payoutsCollection()`, `royaltiesCollection()`, `royalties.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `GenericAudioConnector`, `.constructor()`, `genericAudioConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (3 nodes): `splitHref()`, `tabMatches()`, `RouteTabs.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (3 nodes): `YoutubeAnalyticsPanel.tsx`, `handleSync()`, `load()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PATCH()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 21`, `Community 23`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `sendUserAndAdminEmail()` connect `Community 0` to `Community 2`, `Community 23`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `errorResponse()` connect `Community 0` to `Community 7`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Are the 87 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 87 INFERRED edges - model-reasoned connections that need verification._
- **Are the 85 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 85 INFERRED edges - model-reasoned connections that need verification._
- **Are the 49 inferred relationships involving `proxyBackend()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyBackend()` has 49 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `connectToDatabase()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`connectToDatabase()` has 25 INFERRED edges - model-reasoned connections that need verification._