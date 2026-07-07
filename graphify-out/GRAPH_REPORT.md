# Graph Report - nextjs-singleaudio  (2026-07-07)

## Corpus Check
- 397 files · ~1,946,125 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1908 nodes · 3277 edges · 61 communities detected
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 745 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 76|Community 76]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 100 edges
2. `successResponse()` - 96 edges
3. `proxyBackend()` - 65 edges
4. `connectToDatabase()` - 39 edges
5. `DspDeliveryService` - 36 edges
6. `getCurrentBackendUser()` - 34 edges
7. `BromaClient` - 31 edges
8. `firstString()` - 28 edges
9. `PATCH()` - 26 edges
10. `releasesCollection()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `startSignup()` --calls--> `generateOtp()`  [INFERRED]
  server\src\controllers\auth.controller.ts → server\src\services\otp.service.ts
- `startSignup()` --calls--> `getOtpExpiry()`  [INFERRED]
  server\src\controllers\auth.controller.ts → server\src\services\otp.service.ts
- `startSignup()` --calls--> `sendAmazeSmsOtp()`  [INFERRED]
  server\src\controllers\auth.controller.ts → server\src\services\otp.service.ts
- `getAdminKnowledgeBaseArticles()` --calls--> `listAdminArticles()`  [INFERRED]
  server\src\controllers\knowledgeBase.controller.ts → server\src\services\knowledgeBase.service.ts
- `PUT()` --calls--> `proxyBackend()`  [INFERRED]
  src\app\api\admin\users\[id]\route.ts → src\app\api\_lib\backend.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (135): acrCloudCallbackHandler(), getAcrCloudScanResultHandler(), authPayload(), changePassword(), checkArtistName(), escapeRegex(), forgotPassword(), getMe() (+127 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (81): PATCH(), POST(), POST(), GET(), getSecret(), POST(), runBromaOutletSync(), POST() (+73 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (86): canReadRelease(), DELETE(), firstString(), GET(), getReleaseOwnerId(), PATCH(), PUT(), getAdminRecipients() (+78 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (76): canManageYoutube(), GET(), getClientKey(), normalizeRange(), GET(), getClientKey(), GET(), getClientKey() (+68 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (63): addDaysDateOnly(), bromaArtists(), BromaConnector, bromaDictionaryId(), bromaGenres(), bromaInteger(), bromaRecordingTitle(), bromaSnippetRange() (+55 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (34): formatDate(), getReleaseTrackCount(), getStatusChip(), formatAcrTime(), formatAcrTimeRange(), getTakedownProviders(), handleApprove(), handleConfirmTakedown() (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (54): buildCreateProductPayload(), buildCreateProductRequest(), buildMrpPayload(), cleanString(), collectFallbackGtins(), collectNamedGtins(), collectProductListItems(), collectValidationRecords() (+46 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (17): asDate(), DspDeliveryService, getErrorMessage(), getHeadersRecord(), getProviderErrorResponseBody(), hashPayload(), hasOwn(), normalizeConfigAndCredentials() (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (26): toAssetUrl(), toAssetUrl(), DEV_BACKEND_ORIGIN(), getBrowserApiBaseUrl(), getConfiguredApiBaseUrl(), getConfiguredBackendOrigin(), resolveMediaUrl(), stripApiSuffix() (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (34): deliver(), validateCredentials(), validateTrack(), useColorMode(), getBromaProgress(), getBromaReleaseId(), handleProcessDue(), handleRefreshStatus() (+26 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (44): getYoutubeWorkflowLabel(), getYoutubeWorkflowStatus(), isYoutubeAnalyticsAccessStatus(), isYoutubeAnalyticsSyncStatus(), isYoutubeCmsStatus(), isYoutubeVerificationStatus(), consumeYoutubeOAuthState(), createYoutubeOAuthSession() (+36 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (42): mapYoutubeAnalyticsRows(), queryYoutubeAnalyticsReport(), YoutubeAnalyticsApiError, fetchYoutubeVideosMetadata(), YoutubeDataApiError, addDays(), appendYoutubeAnalyticsSyncRun(), claimNextYoutubeAnalyticsSyncJob() (+34 more)

### Community 12 - "Community 12"
Cohesion: 0.1
Nodes (44): buildReleaseQuery(), createArchivePath(), createCatalogExportJob(), createMetadataZip(), createReleasePartZip(), createReleaseZipName(), createUsersParentZip(), createUserZip() (+36 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (41): absoluteUrl(), appUrl(), buildNotificationMessage(), createEmailNotifications(), escapeHtml(), getFrontendUrl(), getHelpCenterUrl(), getLogoUrl() (+33 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (6): handleSubmit(), BromaClient, collectBromaMessages(), filenameFromUrl(), getBromaErrorMessage(), sanitizeBromaResponse()

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (17): handleLogout(), handleNotificationClick(), handleNotificationsClose(), checkToken(), clearToken(), loginAsAdmin(), clearToken(), setAdminRole() (+9 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (34): actorId(), assertCategory(), assertSection(), bulkDeleteArticles(), createArticle(), createCategory(), createRevision(), createSection() (+26 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (31): createNotification(), notifyPayoutApproved(), notifyPayoutRejected(), notifyReleaseApproved(), notifyReleaseRejected(), addTicketMessage(), addUnreadMessageCounts(), appendMessage() (+23 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (28): assertBromaReleaseReady(), bromaDictionaryId(), candidateOutletKeys(), evaluateBromaReleaseReadiness(), firstString(), getContributors(), hasBromaDictionaryId(), hasRole() (+20 more)

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (23): analyzeAudioHandler(), deleteTempFile(), identifyWithAcrCloudHandler(), scanWithAcrCloudHandler(), updateTrackAcrCloudById(), createThirtySecondSample(), getConfig(), getFsBaseUrl() (+15 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (14): canSee(), AdminLayout(), AuthGuard(), flushDraftsBeforeLogout(), sendDraftBeacon(), useAuth(), useAdminAuth(), canAccessAdminPath() (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.08
Nodes (5): fetchPayouts(), formatCurrency(), handleApprovePayout(), handleRejectPayout(), onPayoutSubmit()

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (19): assetOpsFromTrack(), asString(), backfillAssets(), backfillFingerprints(), backfillOrganizations(), backfillOwnership(), backfillTracks(), canonicalTrack() (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (16): archiveArticle(), bulkArchiveArticles(), createBlankArticle(), createCategory(), createSection(), idOf(), load(), resetForm() (+8 more)

### Community 24 - "Community 24"
Cohesion: 0.15
Nodes (11): buildDraftRow(), fetchReleases(), getDraftArtist(), getNormalizedReleaseStatus(), getReleaseDedupKey(), getStatusChip(), getTrackCount(), handleSyncBromaStatuses() (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (13): applyDraft(), buildKycDraft(), goNext(), isArtistOrLabel(), loadDraft(), persistBeforeExit(), persistKycDraftLocally(), persistWhenHidden() (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.42
Nodes (11): collectRows(), createBromaStatisticsReport(), deleteBromaStatisticsReport(), firstNumber(), firstString(), getReportId(), getReportState(), normalizeBromaStatistics() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (2): find(), paginate()

### Community 29 - "Community 29"
Cohesion: 0.24
Nodes (6): audioFileFilter(), createOriginalNameFilename(), createReadableUniqueFilename(), imageFileFilter(), sanitizeUploadBasename(), trackUploadFileFilter()

### Community 30 - "Community 30"
Cohesion: 0.23
Nodes (6): buildExcelXml(), handleApprove(), handleExport(), handleTabChange(), loadTracks(), updateSelectedTracks()

### Community 31 - "Community 31"
Cohesion: 0.31
Nodes (2): MockDspConnector, payloadId()

### Community 32 - "Community 32"
Cohesion: 0.24
Nodes (3): fetchDeleteReleases(), handleDeleteRelease(), handleTabChange()

### Community 33 - "Community 33"
Cohesion: 0.24
Nodes (3): formatDate(), handleSaveSelection(), loadChannels()

### Community 34 - "Community 34"
Cohesion: 0.36
Nodes (7): intervalMs(), isEnabled(), maxJobs(), startDspWorkerScheduler(), tick(), connectDB(), startServer()

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (2): handleCreateExport(), resetExportDialog()

### Community 36 - "Community 36"
Cohesion: 0.28
Nodes (3): fetchUser(), handleSubmit(), handleUserUpdate()

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (7): asString(), canonicalFromReleaseTrack(), ensureIndexes(), loadServerEnv(), main(), ownerUserId(), trackKey()

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (3): protect(), protectAdminOrCronSecret(), timingSafeEqualString()

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (1): ApiConnector

### Community 40 - "Community 40"
Cohesion: 0.38
Nodes (3): handleDrop(), handleInputChange(), validateAndSet()

### Community 41 - "Community 41"
Cohesion: 0.38
Nodes (3): canFetchNotifications(), hasAuthToken(), isPublicAuthPath()

### Community 44 - "Community 44"
Cohesion: 0.47
Nodes (4): getProvider(), getSignedUrl(), saveFileMeta(), logAudit()

### Community 45 - "Community 45"
Cohesion: 0.47
Nodes (3): firstString(), mapOutlet(), normalize()

### Community 46 - "Community 46"
Cohesion: 0.6
Nodes (5): getRequestHost(), isHelpHost(), middleware(), normalizeHost(), validateToken()

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (1): formatDate()

### Community 48 - "Community 48"
Cohesion: 0.4
Nodes (2): setImage(), uploadImage()

### Community 49 - "Community 49"
Cohesion: 0.4
Nodes (1): GCSProvider

### Community 50 - "Community 50"
Cohesion: 0.4
Nodes (1): S3Provider

### Community 55 - "Community 55"
Cohesion: 0.6
Nodes (3): PremiumPanel(), premiumSurfaceSx(), premiumTableSx()

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (2): ReleaseVersionService, stableStringify()

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (2): authStyleVars(), getAuthTokens()

### Community 60 - "Community 60"
Cohesion: 0.83
Nodes (3): cleanTitle(), getNotificationTitle(), titleFromMessage()

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (2): deliveryJobsCollection(), findDeliveryJobsForRelease()

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (2): findRoyaltiesForTrack(), royaltiesCollection()

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (2): analyzeAudio(), getFfmpeg()

### Community 66 - "Community 66"
Cohesion: 0.67
Nodes (1): GenericAudioConnector

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (1): ApiError

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (2): devFrontendUrl(), getFrontendUrl()

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (2): POST(), saveFileToDisk()

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (2): splitHref(), tabMatches()

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (2): handleSync(), load()

## Knowledge Gaps
- **Thin community `Community 27`** (12 nodes): `constructor()`, `count()`, `create()`, `delete()`, `exists()`, `find()`, `findById()`, `findOne()`, `paginate()`, `softDelete()`, `update()`, `base.repository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (10 nodes): `MockDspConnector`, `.constructor()`, `.deliver()`, `.getDeliveryStatus()`, `.takedown()`, `.update()`, `.validateCredentials()`, `.validateWebhookSignature()`, `payloadId()`, `mockDspConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (9 nodes): `formatBytes()`, `formatDate()`, `formatNumber()`, `getReleaseUserId()`, `handleCreateExport()`, `isActiveJob()`, `openCreateExport()`, `resetExportDialog()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (7 nodes): `ApiConnector`, `.buildHeaders()`, `.constructor()`, `.deliver()`, `.validateCredentials()`, `.validateWebhookSignature()`, `apiConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (6 nodes): `page.tsx`, `page.tsx`, `formatDate()`, `load()`, `loadTracks()`, `togglePlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (6 nodes): `resizeSelectedMedia()`, `setImage()`, `setLink()`, `setYoutube()`, `uploadImage()`, `TiptapEditor.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (5 nodes): `gcsProvider.ts`, `GCSProvider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (5 nodes): `s3Provider.ts`, `S3Provider`, `.constructor()`, `.generateSignedUrl()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `ReleaseVersionService`, `.createVersion()`, `stableStringify()`, `releaseVersion.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (4 nodes): `AuthLogo()`, `authStyleVars()`, `getAuthTokens()`, `authBrand.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `deliveryJobsCollection()`, `deliverySnapshotsCollection()`, `findDeliveryJobsForRelease()`, `delivery.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `findRoyaltiesForTrack()`, `payoutsCollection()`, `royaltiesCollection()`, `royalties.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `audioAnalysisService.ts`, `analyzeAudio()`, `getFfmpeg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (3 nodes): `GenericAudioConnector`, `.constructor()`, `genericAudioConnector.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (3 nodes): `ApiError.ts`, `ApiError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (3 nodes): `frontendUrl.ts`, `devFrontendUrl()`, `getFrontendUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (3 nodes): `POST()`, `saveFileToDisk()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (3 nodes): `splitHref()`, `tabMatches()`, `RouteTabs.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `YoutubeAnalyticsPanel.tsx`, `handleSync()`, `load()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Boolean()` connect `Community 9` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 19`, `Community 21`, `Community 24`, `Community 25`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Why does `PATCH()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 6`, `Community 10`, `Community 13`, `Community 18`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `sendUserAndAdminEmail()` connect `Community 0` to `Community 2`, `Community 3`, `Community 13`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `errorResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`errorResponse()` has 97 INFERRED edges - model-reasoned connections that need verification._
- **Are the 95 inferred relationships involving `successResponse()` (e.g. with `identifyWithAcrCloudHandler()` and `scanWithAcrCloudHandler()`) actually correct?**
  _`successResponse()` has 95 INFERRED edges - model-reasoned connections that need verification._
- **Are the 63 inferred relationships involving `proxyBackend()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyBackend()` has 63 INFERRED edges - model-reasoned connections that need verification._
- **Are the 37 inferred relationships involving `connectToDatabase()` (e.g. with `GET()` and `GET()`) actually correct?**
  _`connectToDatabase()` has 37 INFERRED edges - model-reasoned connections that need verification._