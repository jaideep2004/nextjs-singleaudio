import crypto from 'crypto';
import { BaseDspConnector } from './baseConnector';
import { DspCapability, DspConnectorContext, DspDeliveryResult, DspTrackPayload } from '../../../types/dsp';

type ApiConnectorConfig = {
  key: string;
  displayName: string;
  capabilities: DspCapability[];
  requiredCredentialKeys: string[];
  deliveryPath: string;
};

export class ApiConnector extends BaseDspConnector {
  key: string;
  displayName: string;
  capabilities: DspCapability[];
  private requiredCredentialKeys: string[];
  private deliveryPath: string;

  constructor(config: ApiConnectorConfig) {
    super();
    this.key = config.key;
    this.displayName = config.displayName;
    this.capabilities = config.capabilities;
    this.requiredCredentialKeys = config.requiredCredentialKeys;
    this.deliveryPath = config.deliveryPath;
  }

  async validateCredentials(credentials: Record<string, unknown>): Promise<{ valid: boolean; error?: string }> {
    const missing = this.requiredCredentialKeys.filter((key) => !credentials[key]);
    if (missing.length > 0) {
      return { valid: false, error: `Missing credentials: ${missing.join(', ')}` };
    }
    return { valid: true };
  }

  async deliver(payload: DspTrackPayload, context: DspConnectorContext): Promise<DspDeliveryResult> {
    const validated = await this.validateTrack(payload);
    if (!validated.valid) {
      return { state: 'failed', message: validated.errors.join(', ') };
    }

    const endpoint = String(context.config?.baseUrl || 'https://api.example-dsp.local');
    const externalId = `${this.key}-${payload.trackId}-${Date.now()}`;

    return {
      state: 'processing',
      externalId,
      metadata: {
        endpoint: `${endpoint}${this.deliveryPath}`,
        adapter: 'apiConnector',
        ddexProfile: payload.ddexProfile || 'ERN-4',
      },
    };
  }

  validateWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
    secret: string
  ): boolean {
    const signature = headers['x-dsp-signature'];
    if (!signature || !secret) return false;

    const payload = JSON.stringify(body || {});
    const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const incoming = Array.isArray(signature) ? signature[0] : signature;
    return digest === incoming;
  }
}
