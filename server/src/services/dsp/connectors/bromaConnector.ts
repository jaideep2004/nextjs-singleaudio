import { BaseDspConnector } from './baseConnector';
import { BromaClient } from './bromaClient';
import { DspCapability, DspConnectorContext, DspDeliveryPayload, DspDeliveryResult, DspReleasePayload } from '../../../types/dsp';
import DeliveryJob from '../../../models/deliveryJob.model';

type BromaStep =
  | 'create_release'
  | 'upload_recordings'
  | 'update_recordings'
  | 'add_compositions'
  | 'upload_cover'
  | 'update_distribution'
  | 'send_moderation'
  | 'poll_status'
  | 'done';

const STEP_ORDER: BromaStep[] = [
  'create_release',
  'upload_recordings',
  'update_recordings',
  'add_compositions',
  'upload_cover',
  'update_distribution',
  'send_moderation',
  'poll_status',
  'done',
];

const firstString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim();

const getResponseId = (response: any) =>
  String(response?.data?.id || response?.data?.release_id || response?.id || response?.release_id || '');

const splitListText = (value: string) =>
  value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const bromaStringList = (...values: unknown[]) =>
  Array.from(
    new Set(
      values.flatMap((value): string[] => {
        if (Array.isArray(value)) return value.flatMap((item) => bromaStringList(item));
        if (value && typeof value === 'object') {
          const named = firstString(
            (value as any).name,
            (value as any).title,
            (value as any).value,
            (value as any).label
          );
          return named ? splitListText(named) : [];
        }
        const text = firstString(value);
        return text ? splitListText(text) : [];
      })
    )
  );

const bromaArtists = (...values: unknown[]) => bromaStringList(...values);

const bromaGenres = (...values: unknown[]) => bromaStringList(...values).slice(0, 3);

const bromaRecordingTitle = (payload: DspReleasePayload, track: DspReleasePayload['tracks'][number]) =>
  payload.tracks.length === 1 ? payload.releaseTitle : track.title;

const AUTHOR_ROLES = ['A', 'C', 'CA', 'AR', 'AD', 'TR'] as const;
type BromaAuthorRole = typeof AUTHOR_ROLES[number];

type BromaCompositionContributor = {
  title: string;
  ownership: string;
  roles: BromaAuthorRole[];
  controlled_by_submitter: 0 | 1;
  publisher?: string;
  publisher_share?: string;
  contributor_author_id?: string;
};

const BROMA_COUNTRY_CODE_IDS: Record<string, number> = {
  IN: 32,
};

const BROMA_LANGUAGE_CODE_IDS: Record<string, number> = {
  EN: 40,
  HI: 59,
};

const toDateOnly = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const text = firstString(value);
  if (!text) return undefined;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
};

const todayDateOnly = () => new Date().toISOString().slice(0, 10);

const nonFutureDateOnly = (...values: unknown[]) => {
  const today = todayDateOnly();
  const date = values.map(toDateOnly).find((entry): entry is string => Boolean(entry));
  if (!date) return today;
  return date <= today ? date : today;
};

const addDaysDateOnly = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

const minFutureDateOnly = (minDaysFromToday: number, ...values: unknown[]) => {
  const minDate = addDaysDateOnly(new Date(), minDaysFromToday);
  const date = values.map(toDateOnly).find((entry): entry is string => Boolean(entry));
  if (!date) return minDate;
  return date >= minDate ? date : minDate;
};

const bromaInteger = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
};

const bromaDictionaryId = (value: unknown, codeMap: Record<string, number>) => {
  const numeric = bromaInteger(value);
  if (numeric !== undefined) return numeric;
  const code = firstString(value)?.toUpperCase();
  if (!code) return undefined;
  return codeMap[code];
};

const requireBromaInteger = (value: unknown, label: string) => {
  const parsed = bromaInteger(value);
  if (parsed === undefined) throw new Error(`${label} must be a numeric Broma dictionary id`);
  return parsed;
};

const requireBromaString = (value: unknown, label: string) => {
  const text = firstString(value);
  if (!text) throw new Error(`${label} is required`);
  return text;
};

const requireBromaDictionaryId = (value: unknown, label: string, codeMap: Record<string, number>) => {
  const parsed = bromaDictionaryId(value, codeMap);
  if (parsed === undefined) throw new Error(`${label} must be a numeric Broma dictionary id`);
  return parsed;
};

const payloadRightsholder = (payload: DspReleasePayload) =>
  firstString(
    payload.label,
    payload.metadata?.label,
    payload.metadata?.partyId,
    payload.metadata?.party_id,
    payload.metadata?.partyName,
    payload.metadata?.recordLabel,
    payload.metadata?.rightsholder,
    payload.metadata?.rightsHolder,
    payload.metadata?.producer,
    payload.primaryArtist,
    payload.releaseTitle
  );

const trackProducerRightsholder = (
  payload: DspReleasePayload,
  track: DspReleasePayload['tracks'][number]
) =>
  firstString(
    track.metadata?.producer,
    track.metadata?.producers,
    track.metadata?.rightsholder,
    track.metadata?.rightsHolder,
    track.metadata?.label,
    payload.metadata?.producer,
    payload.metadata?.producers,
    payloadRightsholder(payload),
    track.artistName,
    payload.primaryArtist
  );

const createdCountryId = (payload: DspReleasePayload, config: Record<string, unknown>, track?: DspReleasePayload['tracks'][number]) =>
  requireBromaDictionaryId(
    firstString(
      track?.metadata?.createdCountryId,
      track?.metadata?.created_country_id,
      payload.metadata?.createdCountryId,
      payload.metadata?.created_country_id,
      payload.metadata?.creationCountryId,
      config.createdCountryId,
      config.defaultCreatedCountryId
    ),
    'Broma created_country_id',
    BROMA_COUNTRY_CODE_IDS
  );

const languageId = (payload: DspReleasePayload, config: Record<string, unknown>, track: DspReleasePayload['tracks'][number]) =>
  requireBromaDictionaryId(
    firstString(
      track.metadata?.languageId,
      track.metadata?.language_id,
      track.language,
      payload.metadata?.languageId,
      payload.metadata?.language_id,
      payload.language,
      config.defaultLanguageId,
      config.defaultLanguageCode,
      'EN'
    ),
    'Broma language',
    BROMA_LANGUAGE_CODE_IDS
  );

const catalogNumber = (payload: DspReleasePayload, track?: DspReleasePayload['tracks'][number]) =>
  firstString(
    track?.metadata?.catalogNumber,
    track?.metadata?.catalog_number,
    payload.metadata?.catalogNumber,
    payload.metadata?.catalog_number,
    track?.upc,
    payload.upc,
    payload.releaseId
  );

const releaseTypeId = (payload: DspReleasePayload, config: Record<string, unknown>) => {
  const tracks = payload.tracks.length;
  const configured = config.releaseTypeIds as Record<string, unknown> | undefined;
  if (tracks === 1) return Number(configured?.single || config.defaultSingleReleaseTypeId || 51);
  if (tracks <= 7) return Number(configured?.ep || config.defaultEpReleaseTypeId || 52);
  return Number(config.defaultAlbumReleaseTypeId || 53);
};

const contentYear = (date?: string) => {
  const parsed = date ? new Date(date) : new Date();
  return String(Number.isNaN(parsed.getTime()) ? new Date().getFullYear() : parsed.getFullYear());
};

const toFiniteNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toOwnership = (value: number) => value.toFixed(2);

const normalizeAuthorRoles = (value: unknown): BromaAuthorRole[] => {
  const values = Array.isArray(value) ? value : [value];
  const roles = values.flatMap((entry): BromaAuthorRole[] => {
    const role = firstString(entry)?.toUpperCase().replace(/[^A-Z/]/g, '');
    if (!role) return [];
    if (role === 'A' || role.includes('LYRIC') || role.includes('AUTHOR') || role.includes('WRITER')) return ['A'];
    if (role === 'C' || role.includes('COMPOSER') || role.includes('MUSIC')) return ['C'];
    if (role === 'CA' || role.includes('SONGWRITER')) return ['CA'];
    if (role === 'AR' || role.includes('ARRANGER')) return ['AR'];
    if (role === 'AD' || role.includes('ADAPTER')) return ['AD'];
    if (role === 'TR' || role.includes('TRANSLATOR')) return ['TR'];
    return [];
  });
  return Array.from(new Set(roles));
};

const mergeAuthorRoles = (roles: BromaAuthorRole[]): BromaAuthorRole[] => {
  const unique = Array.from(new Set(roles));
  if (unique.includes('A') && unique.includes('C')) {
    return ['CA', ...unique.filter((role) => role !== 'A' && role !== 'C' && role !== 'CA')];
  }
  return unique;
};

const splitContributorText = (value: string) =>
  value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const getContributorName = (value: unknown) => {
  if (value && typeof value === 'object') {
    return firstString(
      (value as any).title,
      (value as any).name,
      (value as any).fullName,
      (value as any).value,
      (value as any).label
    );
  }
  return firstString(value);
};

const getContributorOwnership = (value: unknown) => {
  if (!value || typeof value !== 'object') return undefined;
  return toFiniteNumber(
    (value as any).ownership ??
    (value as any).share ??
    (value as any).percentage ??
    (value as any).split
  );
};

const getControlledBySubmitter = (value: unknown): 0 | 1 => {
  if (!value || typeof value !== 'object') return 1;
  const raw = (value as any).controlled_by_submitter ?? (value as any).controlledBySubmitter ?? (value as any).controlled;
  return raw === false || raw === 0 || raw === '0' ? 0 : 1;
};

const collectBromaAuthors = (
  value: unknown,
  defaultRoles: BromaAuthorRole[] = []
): Array<Omit<BromaCompositionContributor, 'ownership'> & { ownership?: number }> => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((entry) => collectBromaAuthors(entry, defaultRoles));
  if (typeof value === 'string') {
    return splitContributorText(value).map((title) => ({
      title,
      roles: defaultRoles,
      controlled_by_submitter: 1,
    }));
  }
  if (typeof value !== 'object') return [];

  const title = getContributorName(value);
  if (!title) return [];
  const roles = normalizeAuthorRoles((value as any).roles || (value as any).role || (value as any).type || (value as any).category);
  const mergedRoles = mergeAuthorRoles(roles.length ? roles : defaultRoles);
  if (!mergedRoles.some((role) => AUTHOR_ROLES.includes(role))) return [];

  return [{
    title,
    roles: mergedRoles,
    ownership: getContributorOwnership(value),
    controlled_by_submitter: getControlledBySubmitter(value),
    publisher: firstString((value as any).publisher, (value as any).publisherName),
    publisher_share: firstString((value as any).publisher_share, (value as any).publisherShare),
    contributor_author_id: firstString((value as any).contributor_author_id, (value as any).contributorAuthorId),
  }];
};

const normalizeBromaCompositionContributors = (
  contributors: Array<Omit<BromaCompositionContributor, 'ownership'> & { ownership?: number }>
) => {
  const byName = new Map<string, Omit<BromaCompositionContributor, 'ownership'> & { ownership?: number }>();
  for (const contributor of contributors) {
    const key = contributor.title.toLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...contributor, roles: mergeAuthorRoles(contributor.roles) });
      continue;
    }
    byName.set(key, {
      ...existing,
      roles: mergeAuthorRoles([...existing.roles, ...contributor.roles]),
      ownership: existing.ownership ?? contributor.ownership,
      publisher: existing.publisher || contributor.publisher,
      publisher_share: existing.publisher_share || contributor.publisher_share,
      contributor_author_id: existing.contributor_author_id || contributor.contributor_author_id,
      controlled_by_submitter: existing.controlled_by_submitter || contributor.controlled_by_submitter,
    });
  }

  const normalized = Array.from(byName.values()).filter((contributor) => contributor.roles.length > 0);
  const providedTotal = normalized.reduce((sum, contributor) => sum + (contributor.ownership || 0), 0);
  const missing = normalized.filter((contributor) => !contributor.ownership);
  const fallbackShare = missing.length ? Math.max(0, 100 - providedTotal) / missing.length : 0;

  return normalized.map((contributor) => {
    const ownership = contributor.ownership || fallbackShare || (normalized.length ? 100 / normalized.length : 100);
    return {
      title: contributor.title,
      ownership: toOwnership(ownership),
      roles: contributor.roles,
      controlled_by_submitter: contributor.controlled_by_submitter,
      ...(contributor.publisher ? { publisher: contributor.publisher } : {}),
      ...(contributor.publisher_share ? { publisher_share: contributor.publisher_share } : {}),
      ...(contributor.contributor_author_id ? { contributor_author_id: contributor.contributor_author_id } : {}),
    };
  });
};

export class BromaConnector extends BaseDspConnector {
  key = 'broma';
  displayName = 'Broma';
  capabilities: DspCapability[] = ['audio_delivery', 'reporting', 'takedown'];

  async validateCredentials(credentials: Record<string, unknown>): Promise<{ valid: boolean; error?: string }> {
    const missing = ['email', 'password'].filter((key) => !credentials[key]);
    return missing.length ? { valid: false, error: `Missing credentials: ${missing.join(', ')}` } : { valid: true };
  }

  async validateTrack(payload: DspDeliveryPayload): Promise<{ valid: boolean; errors: string[] }> {
    const base = await super.validateTrack(payload);
    const errors = [...base.errors];
    if (!('releaseId' in payload)) errors.push('Broma delivery requires release payload');
    if ('releaseId' in payload) {
      if (!payload.upc) errors.push('Missing release UPC/EAN');
      payload.tracks.forEach((track, index) => {
        if (!track.isrc) errors.push(`Track ${index + 1}: missing ISRC`);
        if (!track.audioFile) errors.push(`Track ${index + 1}: missing audio file`);
      });
    }
    return { valid: errors.length === 0, errors };
  }

  async deliver(payload: DspDeliveryPayload, context: DspConnectorContext): Promise<DspDeliveryResult> {
    if (!('releaseId' in payload)) return { state: 'failed', message: 'Broma accepts release deliveries only' };

    const metadata = { ...(context.jobMetadata || {}) } as Record<string, any>;
    const config = context.config || {};
    const client = new BromaClient({ credentials: context.credentials, config });
    const currentStep = (metadata.bromaStep || 'create_release') as BromaStep;
    const releaseId = String(metadata.bromaReleaseId || '');
    const step = STEP_ORDER.includes(currentStep) ? currentStep : 'create_release';

    if (step === 'poll_status' && releaseId) {
      const response = await client.getRelease(releaseId);
      const status = String(response?.data?.moderation_status || response?.data?.status || response?.status || '').toLowerCase();
      const live = ['live', 'published', 'delivered', 'processed', 'done', 'accepted', 'active', 'success', 'moderated'].includes(status);
      return {
        state: live ? 'delivered' : 'processing',
        externalId: releaseId,
        message: live ? 'Broma release is live/processed' : 'Broma release still processing',
        metadata: {
          ...metadata,
          bromaStep: live ? 'done' : 'poll_status',
          bromaModerationStatus: status || 'processing',
          nextPollAt: live ? undefined : new Date(Date.now() + Number(config.pollIntervalMs || 30 * 60_000)).toISOString(),
        },
      };
    }

    const next = await this.runUntilNextBoundary(client, payload, config, metadata, step, context.jobId);
    return {
      state: 'processing',
      externalId: String(next.bromaReleaseId || releaseId || ''),
      message: `Broma step completed: ${next.bromaStep}`,
      metadata: {
        ...next,
        nextPollAt: new Date(Date.now() + Number(config.pollIntervalMs || 30 * 60_000)).toISOString(),
      },
    };
  }

  async getDeliveryStatus(externalId: string, context: DspConnectorContext): Promise<DspDeliveryResult> {
    const client = new BromaClient({ credentials: context.credentials, config: context.config || {} });
    const response = await client.getRelease(externalId);
    const data = response?.data || response || {};
    const status = String(
      data?.moderation_status ||
      data?.moderationStatus ||
      data?.release_status ||
      data?.status ||
      data?.state ||
      ''
    ).toLowerCase().trim();
    const normalized = status.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const delivered = ['live', 'published', 'delivered', 'processed', 'done', 'accepted', 'active', 'success', 'moderated', 'approved'].includes(normalized);
    const rejected = ['rejected', 'declined', 'failed', 'error', 'cancelled'].includes(normalized);

    return {
      state: delivered ? 'delivered' : rejected ? 'needs_attention' : 'processing',
      externalId,
      message: status ? `Broma status: ${status}` : 'Broma status refreshed',
      metadata: {
        bromaReleaseId: externalId,
        bromaStep: delivered ? 'done' : 'poll_status',
        bromaModerationStatus: normalized || 'processing',
        bromaLastStatusAt: new Date().toISOString(),
      },
    };
  }

  private async runUntilNextBoundary(
    client: BromaClient,
    payload: DspReleasePayload,
    config: Record<string, unknown>,
    metadata: Record<string, any>,
    startStep: BromaStep,
    jobId?: string
  ) {
    const next = { ...metadata };
    let step = startStep;

    if (step === 'create_release') {
      if (!next.bromaReleaseId) {
        const response = await client.createRelease(this.buildReleasePayload(payload, config));
        next.bromaReleaseId = getResponseId(response);
        if (!next.bromaReleaseId) throw new Error('Broma create release response missing release id');
      }
      step = next.bromaStep = 'upload_recordings';
      await this.persistProgress(jobId, next);
    }

    if (step === 'upload_recordings') {
      const recordingIds = { ...(next.bromaRecordingIds || {}) };
      for (const track of payload.tracks) {
        const key = track.trackId;
        if (recordingIds[key]) continue;
        const response = await client.uploadRecording(String(next.bromaReleaseId), track.audioFile);
        const recordingId = getResponseId(response);
        if (!recordingId) throw new Error(`Broma upload response missing recording id for ${track.title}`);
        recordingIds[key] = recordingId;
        next.bromaRecordingIds = recordingIds;
        await this.persistProgress(jobId, next);
      }
      next.bromaRecordingIds = recordingIds;
      step = next.bromaStep = 'update_recordings';
      await this.persistProgress(jobId, next);
    }

    if (step === 'update_recordings') {
      for (const track of payload.tracks) {
        const recordingId = next.bromaRecordingIds?.[track.trackId];
        if (!recordingId) throw new Error(`Missing Broma recording id for ${track.title}`);
        await client.updateRecording(String(next.bromaReleaseId), String(recordingId), this.buildRecordingPayload(payload, track, config, recordingId));
      }
      step = next.bromaStep = 'add_compositions';
      await this.persistProgress(jobId, next);
    }

    if (step === 'add_compositions') {
      for (const track of payload.tracks) {
        const recordingId = next.bromaRecordingIds?.[track.trackId];
        await client.addComposition(String(next.bromaReleaseId), String(recordingId), this.buildCompositionPayload(payload, track));
      }
      step = next.bromaStep = 'upload_cover';
      await this.persistProgress(jobId, next);
    }

    if (step === 'upload_cover') {
      if (!next.bromaCoverUploaded) {
        const artwork = firstString(payload.metadata?.artwork, payload.tracks[0]?.artwork);
        if (!artwork) throw new Error('Missing release artwork for Broma cover upload');
        await client.uploadCover(String(next.bromaReleaseId), artwork);
        next.bromaCoverUploaded = true;
      }
      step = next.bromaStep = 'update_distribution';
      await this.persistProgress(jobId, next);
    }

    if (step === 'update_distribution') {
      const outletIds = Array.isArray(next.bromaOutletIds) ? next.bromaOutletIds : [];
      if (!outletIds.length) throw new Error('Missing Broma outlet ids');
      const distributionType = firstString(payload.metadata?.bromaDistributionType, config.bromaDistributionType, config.distributionType, 'asap') || 'asap';
      const saleStartDate = minFutureDateOnly(
        distributionType === 'transfer' ? 0 : 2,
        payload.metadata?.saleStartDate,
        payload.metadata?.sale_start_date,
        payload.releaseDate
      );
      await client.updateDistribution(String(next.bromaReleaseId), {
        outlets: outletIds.map((id) => requireBromaInteger(id, 'Broma outlet id')),
        type: ['asap', 'regular', 'transfer'].includes(distributionType) ? distributionType : 'asap',
        sale_start_date: saleStartDate,
      });
      step = next.bromaStep = 'send_moderation';
      await this.persistProgress(jobId, next);
    }

    if (step === 'send_moderation') {
      if (!next.bromaModerationSentAt) {
        await client.sendModeration(String(next.bromaReleaseId));
        next.bromaModerationSentAt = new Date().toISOString();
      }
      next.bromaStep = 'poll_status';
      await this.persistProgress(jobId, next);
    }

    return next;
  }

  private async persistProgress(jobId: string | undefined, metadata: Record<string, any>) {
    if (!jobId) return;
    await DeliveryJob.findByIdAndUpdate(jobId, {
      metadata,
      $push: {
        events: {
          state: 'processing',
          message: `Broma progress saved: ${metadata.bromaStep || 'unknown'}`,
          source: 'connector',
        },
      },
    });
  }

  private buildReleasePayload(payload: DspReleasePayload, config: Record<string, unknown>) {
    const year = contentYear(payload.releaseDate);
    const releaseCatalogNumber = catalogNumber(payload);
    const rightsholder = payloadRightsholder(payload);
    const createdDate = nonFutureDateOnly(
      payload.metadata?.createdDate,
      payload.metadata?.created_date,
      payload.metadata?.originalReleaseDate,
      payload.metadata?.original_release_date,
      payload.releaseDate
    );
    return {
      title: payload.releaseTitle,
      release_type_id: releaseTypeId(payload, config),
      catalog_number: releaseCatalogNumber,
      generate_catalog_number: !releaseCatalogNumber,
      performers: bromaArtists(payload.primaryArtist),
      genres: bromaGenres(payload.genre, payload.metadata?.genre),
      created_country_id: createdCountryId(payload, config),
      ean: payload.upc,
      parental_warning_type: payload.tracks.some((track) => track.explicit) ? 1 : 0,
      account_id: Number(config.accountId),
      p_line: String(payload.metadata?.pline || rightsholder || payload.primaryArtist || payload.releaseTitle),
      c_line: String(payload.metadata?.cline || rightsholder || payload.primaryArtist || payload.releaseTitle),
      date_p_line: year,
      date_c_line: year,
      created_date: createdDate,
      generate_ean: !payload.upc,
      various_artists: Boolean(payload.metadata?.variousArtists),
    };
  }

  private buildRecordingPayload(
    payload: DspReleasePayload,
    track: DspReleasePayload['tracks'][number],
    config: Record<string, unknown> = {},
    recordingId?: unknown
  ) {
    const trackCatalogNumber = catalogNumber(payload, track);
    const primaryArtist = firstString(track.artistName, payload.primaryArtist);
    const featuredArtist = firstString(track.metadata?.featuredArtist, track.metadata?.featuring, payload.metadata?.featuredArtist, payload.metadata?.featuring);
    const rightsholder = payloadRightsholder(payload);
    const partyId = requireBromaString(
      firstString(
        track.metadata?.partyId,
        track.metadata?.party_id,
        track.metadata?.partyName,
        payload.metadata?.partyId,
        payload.metadata?.party_id,
        payload.metadata?.partyName,
        rightsholder,
        payload.label
      ),
      'Broma party_id'
    );
    const createdDate = nonFutureDateOnly(
      track.metadata?.createdDate,
      track.metadata?.created_date,
      track.metadata?.originalReleaseDate,
      track.metadata?.original_release_date,
      track.metadata?.recordingDate,
      payload.metadata?.createdDate,
      payload.metadata?.created_date,
      payload.metadata?.originalReleaseDate,
      payload.metadata?.original_release_date,
      track.releaseDate,
      payload.releaseDate
    );
    return {
      id: requireBromaInteger(recordingId, 'Broma recording id'),
      title: bromaRecordingTitle(payload, track),
      subtitle: firstString(track.version, track.metadata?.subtitle, track.metadata?.version),
      performers: bromaArtists(primaryArtist),
      main_performer: bromaArtists(primaryArtist),
      featured_artist: bromaArtists(featuredArtist),
      isrc: track.isrc,
      generate_isrc: !track.isrc,
      is_instrumental: Boolean(track.metadata?.instrumental || track.metadata?.isInstrumental),
      catalog_number: trackCatalogNumber,
      generate_catalog_number: !trackCatalogNumber,
      genres: bromaGenres(track.genre, track.metadata?.genre, payload.genre, payload.metadata?.genre),
      created_country_id: createdCountryId(payload, config, track),
      created_date: createdDate,
      language: languageId(payload, config, track),
      party_id: partyId,
      parental_warning_type: track.explicit ? 'explicit' : 'not_explicit',
      label: rightsholder,
      producer: trackProducerRightsholder(payload, track),
      lyrics: firstString(track.metadata?.lyrics, track.metadata?.lyric, (track as any).lyrics),
    };
  }

  private buildCompositionPayload(payload: DspReleasePayload, track: DspReleasePayload['tracks'][number]) {
    const contributors = [
      ...collectBromaAuthors(track.metadata?.contributors),
      ...collectBromaAuthors(track.contributors),
      ...collectBromaAuthors(track.metadata?.composers, ['C']),
      ...collectBromaAuthors((track as any).composers, ['C']),
      ...collectBromaAuthors(track.metadata?.lyricists, ['A']),
      ...collectBromaAuthors((track as any).lyricists, ['A']),
      ...collectBromaAuthors(track.metadata?.writers, ['CA']),
      ...collectBromaAuthors((track as any).writers, ['CA']),
    ];

    const normalizedContributors = normalizeBromaCompositionContributors(contributors);
    const fallbackContributors = normalizedContributors.length
      ? normalizedContributors
      : normalizeBromaCompositionContributors(
          collectBromaAuthors(firstString(track.artistName, payload.primaryArtist), ['CA'])
        );

    return {
      title: track.title,
      contributors: fallbackContributors,
    };
  }
}
