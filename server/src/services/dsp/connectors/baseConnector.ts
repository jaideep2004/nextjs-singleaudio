import { DspConnector, DspConnectorContext, DspDeliveryResult, DspTrackPayload } from '../../../types/dsp';

export abstract class BaseDspConnector implements DspConnector {
  abstract key: string;
  abstract displayName: string;
  abstract capabilities: DspConnector['capabilities'];

  async validateCredentials(credentials: Record<string, unknown>): Promise<{ valid: boolean; error?: string }> {
    const hasApiKey = Boolean(credentials.apiKey || credentials.clientId);
    return hasApiKey ? { valid: true } : { valid: false, error: 'Missing apiKey/clientId' };
  }

  async validateTrack(payload: DspTrackPayload): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!payload.title) errors.push('Missing track title');
    if (!payload.artistName) errors.push('Missing artist name');
    if (!payload.audioFile) errors.push('Missing audio file');
    if (!payload.artwork) errors.push('Missing artwork');
    return { valid: errors.length === 0, errors };
  }

  async deliver(payload: DspTrackPayload, context: DspConnectorContext): Promise<DspDeliveryResult> {
    const result = await this.validateTrack(payload);
    if (!result.valid) {
      return { state: 'failed', message: result.errors.join(', ') };
    }

    return {
      state: 'processing',
      externalId: `${context.providerKey}-${payload.trackId}-${Date.now()}`,
      metadata: { mode: 'stub', note: 'Connector skeleton for direct API integration rollout' },
    };
  }
}
