# DSP Delivery Backend

## Current Architecture

`DspDeliveryService` is the canonical backend path for DSP delivery. Broma is the live mediator for DSP/store delivery. Old per-store `StoreService` integrations have been removed from active code.

The platform delivers through:

- encrypted provider credentials
- Mongo-backed delivery jobs
- release delivery snapshots
- Broma outlet mappings
- Broma moderation/status polling
- `mock_dsp` for end-to-end sandbox verification

## Required Environment

- `DSP_CREDENTIAL_ENCRYPTION_KEY`: 32-byte base64 key for provider credentials.
- `DSP_DELIVERY_CRON_SECRET`: optional secret for `POST /api/dsp/deliveries/process-due`.

Generate a local key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Provider Onboarding

1. Bootstrap `broma` and `mock_dsp` with `POST /api/dsp/providers/bootstrap-phase1`.
2. Register Broma with `POST /api/dsp/providers`.
3. Put `email` and `password` in encrypted `credentials`.
4. Put `baseUrl` and `accountId` in `config`.
5. Sync outlets with `POST /api/dsp/broma/outlets/sync`.
6. Use `integrationMode: "live"` only after Broma credentials and outlet mappings are confirmed.

Provider responses expose only safe fields:

- `configuredCredentialKeys`
- `missingCredentialKeys`
- `readinessReport`
- sanitized `config`

Raw credentials, encrypted payloads, and webhook secrets are never returned.

## Broma Worker

Release approval validates metadata/assets/composition locally, then creates one release job with `providerKey: "broma"`. Processing is done by:

```http
POST /api/dsp/deliveries/process-due
```

For scheduled execution through the Next app:

```http
GET /api/cron/dsp-deliveries?secret=<DSP_DELIVERY_CRON_SECRET>&maxJobs=5
```

The admin delivery matrix can also run the worker manually with the `Run Worker` action.

The worker claims due `queued` jobs and due `processing` poll jobs with a Mongo lock, processes them, then releases the lock. Expired locks are returned to the queue. Retries use `nextRetryAt`, `retryCount`, `maxRetries`, and `deadLettered`.

Broma delivery is idempotent through persisted job metadata:

- `bromaReleaseId`
- `bromaRecordingIds`
- `bromaStep`
- `bromaModerationStatus`
- `bromaOutletIds`

No access or refresh tokens are stored in delivery jobs.

## Outlet Sync

Sync Broma outlet dictionary daily:

```http
GET /api/cron/broma-outlets?secret=<DSP_DELIVERY_CRON_SECRET>
```

Selected release stores remain user-facing labels. Delivery maps them to active `bromaOutlets` records. Missing mappings block approval with user-facing readiness errors.

## Mock DSP E2E

1. Set `DSP_CREDENTIAL_ENCRYPTION_KEY`.
2. Bootstrap phase-1 providers from the admin delivery matrix.
3. Approve a release with `mock_dsp` selected, or queue a track delivery to `mock_dsp`.
4. Run the worker.
5. Confirm the job has an `externalId`, attempts, and connector events.
6. Send a webhook signed with `x-dsp-signature = HMAC-SHA256(JSON.stringify(body), webhookSecret)` to move the job to `delivered`.

## Broma Checklist

1. Keep Broma calls isolated inside `BromaClient` and `BromaConnector`.
2. Validate locally before sending to Broma.
3. Persist IDs after every external create/upload step.
4. Treat Broma 4xx validation/moderation errors as `needs_attention`.
5. Treat 429/5xx/network errors as retryable.
6. Poll Broma release data because no webhook is assumed.
