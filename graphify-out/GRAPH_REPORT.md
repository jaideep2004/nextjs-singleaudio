# Graph Report - nextjs-singleaudio  (2026-06-18)

## Corpus Check
- 374 files · ~1,853,963 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1693 nodes · 2776 edges · 62 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 662 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
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
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 81|Community 81]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 91 edges
2. `successResponse()` - 87 edges
3. `proxyBackend()` - 52 edges
4. `connectToDatabase()` - 33 edges
5. `getCurrentBackendUser()` - 29 edges
6. `PATCH()` - 26 edges
7. `DspDeliveryService` - 25 edges
8. `processCatalogExportJob()` - 22 edges
9. `notFoundResponse()` - 18 edges
10. `releasesCollection()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `getAdminKnowledgeBaseArticles()` --calls--> `listAdminArticles()`  [INFERRED]
  server\src\controllers\knowledgeBase.controller.ts → server\src\services\knowledgeBase.service.ts
- `updateTrackAcrCloudById()` --calls--> `startTrackAcrCloudScan()`  [INFERRED]
  server\src\repositories\track.repository.ts → server\src\services\acrCloud.service.ts
- `asString()` --calls--> `getReleaseIdString()`  [INFERRED]
  src\lib\musicPublishing.ts → src\lib\repositories\tracks.ts
- `asString()` --calls--> `serializeAssetRef()`  [INFERRED]
  src\lib\musicPublishing.ts → src\lib\repositories\tracks.ts
- `asString()` --calls--> `serializeFingerprintRef()`  [INFERRED]
  src\lib\musicPublishing.ts → src\lib\repositories\tracks.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (122): acrCloudCallbackHandler(), getAcrCloudScanResultHandler(), authPayload(), changePassword(), checkArtistName(), escapeRegex(), forgotPassword(), getMe() (+114 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (75): PATCH(), POST(), POST(), GET(), getSecret(), POST(), runBromaOutletSync(), GET() (+67 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (77): canManageYoutube(), GET(), getClientKey(), normalizeRange(), GET(), getClientKey(), GET(), getClientKey() (+69 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (72): normalizeMusicPublishingTracks(), acquireUpcAssignmentLock(), assignReleaseUpcWithGs1(), buildGs1CreateInput(), cleanString(), clearUpcAssignmentLock(), getPrimaryArtist(), getReleaseDate() (+64 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (44): mapYoutubeAnalyticsRows(), queryYoutubeAnalyticsReport(), YoutubeAnalyticsApiError, fetchYoutubeVideosMetadata(), YoutubeDataApiError, addDays(), appendYoutubeAnalyticsSyncRun(), claimNextYoutubeAnalyticsSyncJob() (+36 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): deliver(), validateCredentials(), validateTrack(), useColorMode(), analyzeAudioHandler(), deleteTempFile(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler() (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (43): getYoutubeWorkflowLabel(), getYoutubeWorkflowStatus(), isYoutubeAnalyticsAccessStatus(), isYoutubeAnalyticsSyncStatus(), isYoutubeCmsStatus(), isYoutubeVerificationStatus(), consumeYoutubeOAuthState(), createYoutubeOAuthSession() (+35 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (14): asDate(), DspDeliveryService, getErrorMessage(), getHeadersRecord(), hashPayload(), hasOwn(), normalizeConfigAndCredentials(), sanitizeConfig() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (34): absoluteUrl(), appUrl(), buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getAdminRecipients(), getFrontendUrl(), getHelpCenterUrl() (+26 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (38): buildReleaseQuery(), createArchivePath(), createCatalogExportJob(), createMetadataZip(), createReleasePartZip(), createReleaseZipName(), createUsersParentZip(), createUserZip() (+30 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (17): formatAcrTime(), formatAcrTimeRange(), getTakedownProviders(), handleConfirmTakedown(), handleLifecycleAction(), openTakedownDialog(), refreshPending(), fetchAcrCloudScanResult() (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (17): handleLogout(), handleNotificationClick(), handleNotificationsClose(), checkToken(), clearToken(), loginAsAdmin(), clearToken(), setAdminRole() (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (35): buildCreateProductPayload(), buildCreateProductRequest(), buildMrpPayload(), cleanString(), collectFallbackGtins(), collectNamedGtins(), collectProductListItems(), collectValidationRecords() (+27 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (34): actorId(), assertCategory(), assertSection(), bulkDeleteArticles(), createArticle(), createCategory(), createRevision(), createSection() (+26 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (31): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected(), addTicketMessage(), addUnreadMessageCounts(), appendMessage() (+23 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (14): canSee(), AdminLayout(), AuthGuard(), flushDraftsBeforeLogout(), sendDraftBeacon(), useAuth(), useAdminAuth(), canAccessAdminPath() (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (5): fetchPayouts(), formatCurrency(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (19): assetOpsFromTrack(), asString(), backfillAssets(), backfillFingerprints(), backfillOrganizations(), backfillOwnership(), backfillTracks(), canonicalTrack() (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (17): assertBromaReleaseReady(), evaluateBromaReleaseReadiness(), firstString(), getContributors(), hasRole(), mapOutlets(), validateTrackComposition(), checkLocalAsset() (+9 more)

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (16): archiveArticle(), bulkArchiveArticles(), createBlankArticle(), createCategory(), createSection(), idOf(), load(), resetForm() (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (18): startSignup(), escapeHtml(), generateOtp(), getFrontendUrl(), getHelpCenterUrl(), getLogoUrl(), getOtpExpiry(), hashOtp() (+10 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (15): clearUnread(), handleAssignToMe(), handleCloseTicket(), handleCreate(), handleNote(), handleReopen(), handleReply(), handleStatus() (+7 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (2): handleSubmit(), BromaClient

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (13): applyDraft(), buildKycDraft(), goNext(), isArtistOrLabel(), loadDraft(), persistBeforeExit(), persistKycDraftLocally(), persistWhenHidden() (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.15
Nodes (10): buildDraftRow(), fetchReleases(), getDraftArtist(), getNormalizedReleaseStatus(), getReleaseDedupKey(), getStatusChip(), getTrackCount(), hasDraftContent() (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (8): applyDraft(), assertVercelUploadSize(), loadDraft(), persistBeforeExit(), persistWhenHidden(), resizeList(), uploadArtworkToServer(), uploadAudioToServer()

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (13): buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getAdminEmailRecipients(), getFrontendUrl(), getHelpCenterUrl(), getLogoUrl(), renderDetails() (+5 more)

### Community 28 - "Community 28"
Cohesion: 0.24
Nodes (5): BromaConnector, contentYear(), firstString(), getResponseId(), releaseTypeId()

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 31 - "Community 31"
Cohesion: 0.23
Nodes (6): buildExcelXml(), handleApprove(), handleExport(), handleTabChange(), loadTracks(), updateSelectedTracks()

### Community 32 - "Community 32"
Cohesion: 0.45
Nodes (10): assignTrackIsrc(), ensureIndexes(), formatIsrcForDisplay(), getDb(), isAlreadyUsed(), isDuplicateKeyError(), markTrackIsrcAssigned(), normalizeIsrc() (+2 more)

### Community 33 - "Community 33"
Cohesion: 0.31
Nodes (2): MockDspConnector, payloadId()

### Community 34 - "Community 34"
Cohesion: 0.24
Nodes (3): formatDate(), handleSaveSelection(), loadChannels()

### Community 35 - "Community 35"
Cohesion: 0.28
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (2): handleCreateExport(), resetExportDialog()

### Community 37 - "Community 37"
Cohesion: 0.28
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 38 - "Community 38"
Cohesion: 0.5
Nodes (7): asString(), canonicalFromReleaseTrack(), ensureIndexes(), loadServerEnv(), main(), ownerUserId(), trackKey()

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (3): protect(), protectAdminOrCronSecret(), timingSafeEqualString()

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (2): formatDate(), getReleaseTrackCount()

### Community 41 - "Community 41"
Cohesion: 0.43
Nodes (6): handleBootstrapPhase1(), handleDispatch(), handleProcessDue(), handleRetry(), handleSyncBromaOutlets(), load()

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (1): ApiConnector

### Community 43 - "Community 43"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 44 - "Community 44"
Cohesion: 0.38
Nodes (3): canFetchNotifications(), hasAuthToken(), isPublicAuthPath()

### Community 47 - "Community 47"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 48 - "Community 48"
Cohesion: 0.6
Nodes (5): getRequestHost(), isHelpHost(), middleware(), normalizeHost(), validateToken()

### Community 50 - "Community 50"
Cohesion: 0.4
Nodes (2): setImage(), uploadImage()

### Community 51 - "Community 51"
Cohesion: 0.6
Nodes (3): firstString(), mapOutlet(), normalize()

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 53 - "Community 53"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 60 - "Community 60"
Cohesion: 0.6
Nodes (3): PremiumPanel(), premiumSurfaceSx(), premiumTableSx()

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (2): ReleaseVersionService, stableStringify()

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (2): authStyleVars(), getAuthTokens()

### Community 66 - "Community 66"
Cohesion: 0.83
Nodes (3): cleanTitle(), getNotificationTitle(), titleFromMessage()

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (2): deliveryJobsCollection(), findDeliveryJobsForRelease()

### Community 68 - "Community 68"
Cohesion: 0.67
Nodes (2): findRoyaltiesForTrack(), royaltiesCollection()

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 73 - "Community 73"
Cohesion: 0.67
Nodes (1): GenericAudioConnector

### Community 74 - "Community 74"
Cohesion: 0.67
Nodes (1): ApiError

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (2): splitHref(), tabMatches()

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (2): handleSync(), load()

## Knowledge Gaps
- **Thin community `Community 22`** (20 nodes): `handleSubmit()`, `BromaClient`, `.addComposition()`, `.authHeaders()`, `.buildUploadForm()`, `.constructor()`, `.createRelease()`, `.getOutlets()`, `.getRelease()`, `.login()`, `.refresh()`, `.request()`, `.resolveUploadPath()`, `.sendModeration()`, `.updateDistribution()`, `.updateRecording()`, `.uploadCover()`, `.uploadRecording()`, `bromaClient.ts`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (10 nodes): `MockDspConnector`, `.constructor()`, `.deliver()`, `.getDeliveryStatus()`, `.takedown()`, `.update()`, `.validateCredentials()`, `.validateWebhookSignature()`, `payloadId()`, `mockDspConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (9 nodes): `formatBytes()`, `formatDate()`, `formatNumber()`, `getReleaseUserId()`, `handleCreateExport()`, `isActiveJob()`, `openCreateExport()`, `resetExportDialog()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (8 nodes): `fetchDashboardData()`, `fetchData()`, `formatDate()`, `getReleaseTrackCount()`, `getStatusChip()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (7 nodes): `ApiConnector`, `.buildHeaders()`, `.constructor()`, `.deliver()`, `.validateCredentials()`, `.validateWebhookSignature()`, `apiConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (6 nodes): `resizeSelectedMedia()`, `setImage()`, `setLink()`, `setYoutube()`, `uploadImage()`, `TiptapEditor.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `ReleaseVersionService`, `.createVersion()`, `stableStringify()`, `releaseVersion.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (4 nodes): `AuthLogo()`, `authStyleVars()`, `getAuthTokens()`, `authBrand.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (4 nodes): `deliveryJobsCollection()`, `deliverySnapshotsCollection()`, `findDeliveryJobsForRelease()`, `delivery.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (4 nodes): `findRoyaltiesForTrack()`, `payoutsCollection()`, `royaltiesCollection()`, `royalties.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (3 nodes): `GenericAudioConnector`, `.constructor()`, `genericAudioConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (3 nodes): `splitHref()`, `tabMatches()`, `RouteTabs.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `YoutubeAnalyticsPanel.tsx`, `handleSync()`, `load()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PATCH()` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 18`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `Boolean()` connect `Community 5` to `Community 0`, `Community 32`, `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 8`, `Community 16`, `Community 23`, `Community 24`, `Community 26`, `Community 28`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `sendUserAndAdminEmail()` connect `Community 0` to `Community 8`, `Community 2`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Are the 88 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 88 INFERRED edges - model-reasoned connections that need verification._
- **Are the 86 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 86 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `proxyBackend()` (e.g. with `POST()` and `GET()`) actually correct?**
  _`proxyBackend()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `connectToDatabase()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`connectToDatabase()` has 31 INFERRED edges - model-reasoned connections that need verification._