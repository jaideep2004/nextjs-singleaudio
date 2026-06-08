# DSP Delivery Backend

## Current Architecture

`DspDeliveryService` is the canonical backend path for DSP delivery. Old `StoreService` integrations are legacy and must not be used for new DSP dispatch.

The platform can be completed without official DSP contracts by using:

- encrypted provider credentials
- Mongo-backed delivery jobs
- release delivery snapshots
- generic HTTP adapters
- `mock_dsp` for end-to-end sandbox verification

## Required Environment

- `DSP_CREDENTIAL_ENCRYPTION_KEY`: 32-byte base64 key for provider credentials.
- `DSP_DELIVERY_CRON_SECRET`: optional secret for `POST /api/dsp/deliveries/process-due`.

Generate a local key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Provider Onboarding

1. Register provider with `POST /api/dsp/providers`.
2. Use `integrationMode: "shell"` until partner access exists.
3. Use `integrationMode: "sandbox"` with `mock_dsp` or a partner sandbox `baseUrl`.
4. Use `integrationMode: "live"` only after contract, endpoint, and credentials are issued.
5. Put secrets in `credentials`; `config.webhookSecret` is accepted but moved into encrypted credentials.

Provider responses expose only safe fields:

- `configuredCredentialKeys`
- `missingCredentialKeys`
- `readinessReport`
- sanitized `config`

Raw credentials, encrypted payloads, and webhook secrets are never returned.

## Worker

Delivery dispatch only queues jobs. Processing is done by:

```http
POST /api/dsp/deliveries/process-due
```

For scheduled execution through the Next app:

```http
GET /api/cron/dsp-deliveries?secret=<DSP_DELIVERY_CRON_SECRET>&maxJobs=5
```

The admin delivery matrix can also run the worker manually with the `Run Worker` action.

The worker claims due `queued` jobs with a Mongo lock, processes them, then releases the lock. Expired locks are returned to the queue. Retries use `nextRetryAt`, `retryCount`, `maxRetries`, and `deadLettered`.

## Mock DSP E2E

1. Set `DSP_CREDENTIAL_ENCRYPTION_KEY`.
2. Bootstrap phase-1 providers from the admin delivery matrix.
3. Approve a release with `mock_dsp` selected, or queue a track delivery to `mock_dsp`.
4. Run the worker.
5. Confirm the job has an `externalId`, attempts, and connector events.
6. Send a webhook signed with `x-dsp-signature = HMAC-SHA256(JSON.stringify(body), webhookSecret)` to move the job to `delivered`.

## Real DSP Adapter Checklist

After official provider contracts arrive:

1. Add provider-specific connector behind `DspConnector`.
2. Keep provider calls isolated inside connector.
3. Validate credentials without logging secrets.
4. Map provider errors to retryable/non-retryable states.
5. Implement `deliver`, `update`, `takedown`, and `getDeliveryStatus` only where partner API supports them.
6. Validate webhook signatures and normalize webhook states to internal `DspDeliveryState`.
7. Add integration tests with recorded sandbox responses or a local fake.
