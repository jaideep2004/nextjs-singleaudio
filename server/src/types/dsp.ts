export type DspDeliveryState =
  | 'queued'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'needs_attention'
  | 'cancelled';

export type DspCapability =
  | 'audio_delivery'
  | 'video_delivery'
  | 'rights_management'
  | 'fingerprinting'
  | 'reporting'
  | 'takedown';

export type DspDeliveryOperation = 'deliver' | 'update' | 'takedown';

export interface DspTrackPayload {
  trackId: string;
  title: string;
  artistName: string;
  version?: string;
  versionNumber?: number;
  isrc?: string;
  upc?: string;
  genre?: string;
  language?: string;
  explicit?: boolean;
  releaseDate?: string;
  audioFile: string;
  artwork: string;
  contributors?: Array<{ name: string; role: string }>;
  territories?: string[];
  contentRating?: 'explicit' | 'clean' | 'not_applicable';
  ddexProfile?: 'ERN-3' | 'ERN-4';
  metadata: Record<string, unknown>;
}

export interface DspConnectorContext {
  providerKey: string;
  credentials: Record<string, unknown>;
  region?: string;
  config?: Record<string, unknown>;
}

export interface DspDeliveryResult {
  externalId?: string;
  state: DspDeliveryState;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface MetadataRuleResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalized: DspTrackPayload;
}

export interface DspConnector {
  key: string;
  displayName: string;
  capabilities: DspCapability[];
  validateCredentials(credentials: Record<string, unknown>): Promise<{ valid: boolean; error?: string }>;
  validateTrack(payload: DspTrackPayload): Promise<{ valid: boolean; errors: string[] }>;
  deliver(payload: DspTrackPayload, context: DspConnectorContext): Promise<DspDeliveryResult>;
  update?(payload: DspTrackPayload, context: DspConnectorContext): Promise<DspDeliveryResult>;
  takedown?(payload: DspTrackPayload, context: DspConnectorContext): Promise<DspDeliveryResult>;
  getDeliveryStatus?(externalId: string, context: DspConnectorContext): Promise<DspDeliveryResult>;
  validateWebhookSignature?(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
    secret: string
  ): boolean;
}
