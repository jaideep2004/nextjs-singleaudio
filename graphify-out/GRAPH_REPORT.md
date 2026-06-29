# Graph Report - nextjs-singleaudio  (2026-06-29)

## Corpus Check
- 385 files · ~1,868,098 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1765 nodes · 2940 edges · 63 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 693 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 78|Community 78]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 91 edges
2. `successResponse()` - 87 edges
3. `proxyBackend()` - 60 edges
4. `connectToDatabase()` - 34 edges
5. `getCurrentBackendUser()` - 30 edges
6. `DspDeliveryService` - 26 edges
7. `PATCH()` - 26 edges
8. `processCatalogExportJob()` - 22 edges
9. `BromaClient` - 20 edges
10. `Boolean()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `getAdminKnowledgeBaseArticles()` --calls--> `listAdminArticles()`  [INFERRED]
  server\src\controllers\knowledgeBase.controller.ts → server\src\services\knowledgeBase.service.ts
- `uploadTrack()` --calls--> `createStandaloneTrack()`  [INFERRED]
  server\src\controllers\track.controller.ts → server\src\repositories\track.repository.ts
- `deleteTrack()` --calls--> `deleteTrackDocument()`  [INFERRED]
  server\src\controllers\track.controller.ts → server\src\repositories\track.repository.ts
- `PUT()` --calls--> `proxyBackend()`  [INFERRED]
  src\app\api\admin\users\[id]\route.ts → src\app\api\_lib\backend.ts
- `identifyWithAcrCloudHandler()` --calls--> `errorResponse()`  [INFERRED]
  server\src\controllers\audioController.ts → server\src\utils\apiResponse.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (102): canManageYoutube(), GET(), getClientKey(), normalizeRange(), GET(), getClientKey(), GET(), getClientKey() (+94 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (80): PATCH(), POST(), POST(), GET(), getSecret(), POST(), runBromaOutletSync(), POST() (+72 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (109): acrCloudCallbackHandler(), authPayload(), changePassword(), checkArtistName(), escapeRegex(), forgotPassword(), getMe(), getUploadedFileUrl() (+101 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (87): mapYoutubeAnalyticsRows(), queryYoutubeAnalyticsReport(), YoutubeAnalyticsApiError, fetchYoutubeVideosMetadata(), YoutubeDataApiError, getYoutubeWorkflowLabel(), getYoutubeWorkflowStatus(), isYoutubeAnalyticsAccessStatus() (+79 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (63): buildReleaseQuery(), createArchivePath(), createCatalogExportJob(), createMetadataZip(), createReleasePartZip(), createReleaseZipName(), createUsersParentZip(), createUserZip() (+55 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (46): deliver(), validateCredentials(), validateTrack(), useColorMode(), analyzeAudioHandler(), deleteTempFile(), getAcrCloudScanResultHandler(), identifyWithAcrCloudHandler() (+38 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (53): buildCreateProductPayload(), buildCreateProductRequest(), buildMrpPayload(), cleanString(), collectFallbackGtins(), collectNamedGtins(), collectProductListItems(), collectValidationRecords() (+45 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (26): toAssetUrl(), toAssetUrl(), DEV_BACKEND_ORIGIN(), getBrowserApiBaseUrl(), getConfiguredApiBaseUrl(), getConfiguredBackendOrigin(), resolveMediaUrl(), stripApiSuffix() (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (44): startSignup(), absoluteUrl(), appUrl(), buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getFrontendUrl(), getHelpCenterUrl() (+36 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (17): asDate(), DspDeliveryService, getErrorMessage(), getHeadersRecord(), getProviderErrorResponseBody(), hashPayload(), hasOwn(), normalizeConfigAndCredentials() (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (17): formatAcrTime(), formatAcrTimeRange(), getTakedownProviders(), handleConfirmTakedown(), handleLifecycleAction(), openTakedownDialog(), refreshPending(), fetchAcrCloudScanResult() (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (17): handleLogout(), handleNotificationClick(), handleNotificationsClose(), checkToken(), clearToken(), loginAsAdmin(), clearToken(), setAdminRole() (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (34): actorId(), assertCategory(), assertSection(), bulkDeleteArticles(), createArticle(), createCategory(), createRevision(), createSection() (+26 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (31): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected(), addTicketMessage(), addUnreadMessageCounts(), appendMessage() (+23 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (28): assertBromaReleaseReady(), bromaDictionaryId(), candidateOutletKeys(), evaluateBromaReleaseReadiness(), firstString(), getContributors(), hasBromaDictionaryId(), hasRole() (+20 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (22): bromaArtists(), BromaConnector, bromaDictionaryId(), bromaGenres(), bromaInteger(), bromaRecordingTitle(), bromaStringList(), catalogNumber() (+14 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (6): handleSubmit(), BromaClient, collectBromaMessages(), filenameFromUrl(), getBromaErrorMessage(), sanitizeBromaResponse()

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (14): canSee(), AdminLayout(), AuthGuard(), flushDraftsBeforeLogout(), sendDraftBeacon(), useAuth(), useAdminAuth(), canAccessAdminPath() (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.08
Nodes (5): fetchPayouts(), formatCurrency(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (19): assetOpsFromTrack(), asString(), backfillAssets(), backfillFingerprints(), backfillOrganizations(), backfillOwnership(), backfillTracks(), canonicalTrack() (+11 more)

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (16): archiveArticle(), bulkArchiveArticles(), createBlankArticle(), createCategory(), createSection(), idOf(), load(), resetForm() (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (10): buildDraftRow(), fetchReleases(), getDraftArtist(), getNormalizedReleaseStatus(), getReleaseDedupKey(), getStatusChip(), getTrackCount(), hasDraftContent() (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (13): applyDraft(), buildKycDraft(), goNext(), isArtistOrLabel(), loadDraft(), persistBeforeExit(), persistKycDraftLocally(), persistWhenHidden() (+5 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (8): applyDraft(), assertVercelUploadSize(), loadDraft(), persistBeforeExit(), persistWhenHidden(), resizeList(), uploadArtworkToServer(), uploadAudioToServer()

### Community 24 - "Community 24"
Cohesion: 0.31
Nodes (13): DELETE(), GET(), POST(), PUT(), saveReleaseDraft(), serializeDraft(), deleteReleaseDraftForUser(), draftIdentityQuery() (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 27 - "Community 27"
Cohesion: 0.23
Nodes (6): buildExcelXml(), handleApprove(), handleExport(), handleTabChange(), loadTracks(), updateSelectedTracks()

### Community 28 - "Community 28"
Cohesion: 0.45
Nodes (10): assignTrackIsrc(), ensureIndexes(), formatIsrcForDisplay(), getDb(), isAlreadyUsed(), isDuplicateKeyError(), markTrackIsrcAssigned(), normalizeIsrc() (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.31
Nodes (2): MockDspConnector, payloadId()

### Community 30 - "Community 30"
Cohesion: 0.24
Nodes (3): fetchDeleteReleases(), handleDeleteRelease(), handleTabChange()

### Community 31 - "Community 31"
Cohesion: 0.24
Nodes (3): formatDate(), handleSaveSelection(), loadChannels()

### Community 32 - "Community 32"
Cohesion: 0.28
Nodes (3): audioFileFilter(), imageFileFilter(), trackUploadFileFilter()

### Community 33 - "Community 33"
Cohesion: 0.39
Nodes (8): formatAttemptResponse(), getLatestJobError(), handleProcessDue(), handleRetry(), handleSaveBromaConfig(), handleSyncBromaOutlets(), load(), notifyBromaJobErrors()

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (2): handleCreateExport(), resetExportDialog()

### Community 35 - "Community 35"
Cohesion: 0.28
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 36 - "Community 36"
Cohesion: 0.44
Nodes (7): artistProfilesCollection(), ensureOrganizationIndexes(), ensurePersonalOrganizationForUser(), getDefaultOrganizationIdForUser(), organizationMembersCollection(), organizationsCollection(), organizationsEnabled()

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (7): asString(), canonicalFromReleaseTrack(), ensureIndexes(), loadServerEnv(), main(), ownerUserId(), trackKey()

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (3): protect(), protectAdminOrCronSecret(), timingSafeEqualString()

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (2): formatDate(), getReleaseTrackCount()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (1): ApiConnector

### Community 41 - "Community 41"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 42 - "Community 42"
Cohesion: 0.38
Nodes (3): canFetchNotifications(), hasAuthToken(), isPublicAuthPath()

### Community 45 - "Community 45"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 46 - "Community 46"
Cohesion: 0.6
Nodes (5): getRequestHost(), isHelpHost(), middleware(), normalizeHost(), validateToken()

### Community 47 - "Community 47"
Cohesion: 0.6
Nodes (5): getDspDisplayName(), getDspInitials(), getDspMeta(), humanizeDspKey(), normalizeDspName()

### Community 48 - "Community 48"
Cohesion: 0.4
Nodes (2): setImage(), uploadImage()

### Community 49 - "Community 49"
Cohesion: 0.6
Nodes (3): firstString(), mapOutlet(), normalize()

### Community 50 - "Community 50"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 51 - "Community 51"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 56 - "Community 56"
Cohesion: 0.6
Nodes (3): PremiumPanel(), premiumSurfaceSx(), premiumTableSx()

### Community 58 - "Community 58"
Cohesion: 0.67
Nodes (2): ReleaseVersionService, stableStringify()

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (2): authStyleVars(), getAuthTokens()

### Community 62 - "Community 62"
Cohesion: 0.83
Nodes (3): cleanTitle(), getNotificationTitle(), titleFromMessage()

### Community 63 - "Community 63"
Cohesion: 0.67
Nodes (2): deliveryJobsCollection(), findDeliveryJobsForRelease()

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (2): findRoyaltiesForTrack(), royaltiesCollection()

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (2): connectDB(), startServer()

### Community 68 - "Community 68"
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
Nodes (2): devFrontendUrl(), getFrontendUrl()

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (2): splitHref(), tabMatches()

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (2): handleSync(), load()

## Knowledge Gaps
- **Thin community `Community 25`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (10 nodes): `MockDspConnector`, `.constructor()`, `.deliver()`, `.getDeliveryStatus()`, `.takedown()`, `.update()`, `.validateCredentials()`, `.validateWebhookSignature()`, `payloadId()`, `mockDspConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (9 nodes): `formatBytes()`, `formatDate()`, `formatNumber()`, `getReleaseUserId()`, `handleCreateExport()`, `isActiveJob()`, `openCreateExport()`, `resetExportDialog()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (8 nodes): `fetchDashboardData()`, `fetchData()`, `formatDate()`, `getReleaseTrackCount()`, `getStatusChip()`, `handlePlayPause()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (7 nodes): `ApiConnector`, `.buildHeaders()`, `.constructor()`, `.deliver()`, `.validateCredentials()`, `.validateWebhookSignature()`, `apiConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (6 nodes): `resizeSelectedMedia()`, `setImage()`, `setLink()`, `setYoutube()`, `uploadImage()`, `TiptapEditor.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `ReleaseVersionService`, `.createVersion()`, `stableStringify()`, `releaseVersion.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `AuthLogo()`, `authStyleVars()`, `getAuthTokens()`, `authBrand.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (4 nodes): `deliveryJobsCollection()`, `deliverySnapshotsCollection()`, `findDeliveryJobsForRelease()`, `delivery.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (4 nodes): `findRoyaltiesForTrack()`, `payoutsCollection()`, `royaltiesCollection()`, `royalties.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `index.ts`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (3 nodes): `GenericAudioConnector`, `.constructor()`, `genericAudioConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (3 nodes): `frontendUrl.ts`, `devFrontendUrl()`, `getFrontendUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `splitHref()`, `tabMatches()`, `RouteTabs.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `YoutubeAnalyticsPanel.tsx`, `handleSync()`, `load()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PATCH()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 8`, `Community 14`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `Boolean()` connect `Community 5` to `Community 0`, `Community 33`, `Community 3`, `Community 6`, `Community 9`, `Community 15`, `Community 18`, `Community 21`, `Community 22`, `Community 23`, `Community 28`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Why does `sendUserAndAdminEmail()` connect `Community 2` to `Community 8`, `Community 0`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Are the 88 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 88 INFERRED edges - model-reasoned connections that need verification._
- **Are the 86 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 86 INFERRED edges - model-reasoned connections that need verification._
- **Are the 58 inferred relationships involving `proxyBackend()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`proxyBackend()` has 58 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `connectToDatabase()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`connectToDatabase()` has 32 INFERRED edges - model-reasoned connections that need verification._