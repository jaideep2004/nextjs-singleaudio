import 'server-only';

import * as archiverModule from 'archiver';
import type { Archiver } from 'archiver';
import ExcelJS from 'exceljs';
import fs from 'fs';
import { ObjectId, type Db } from 'mongodb';
import path from 'path';
import { connectToDatabase } from '@/utils/mongodb';
import { asString } from '@/lib/musicPublishing';

export type CatalogExportState =
  | 'queued'
  | 'running'
  | 'completed'
  | 'completed_with_warnings'
  | 'failed';

export type CatalogExportPart = {
  name: string;
  type: 'metadata' | 'tracks';
  path: string;
  size: number;
  trackCount: number;
  createdAt: Date;
};

type CatalogExportCounts = {
  releases: number;
  tracks: number;
  files: number;
  missing: number;
  parts: number;
};

export type CatalogExportJob = {
  _id: ObjectId;
  scope: 'approved';
  state: CatalogExportState;
  createdBy: string;
  createdByEmail?: string;
  counts: CatalogExportCounts;
  parts: CatalogExportPart[];
  errors: string[];
  warnings: string[];
  startedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type ExportUser = {
  _id: string;
  email?: string;
};

type TrackFileResolution =
  | { ok: true; path: string; size: number; extension: string }
  | { ok: false; reason: string; source: string };

const runningJobs = new Set<string>();
const EXPORT_COLLECTION = 'catalogExportJobs';
const DEFAULT_PART_TRACK_LIMIT = 1000;
const DEFAULT_PART_BYTE_LIMIT = 2 * 1024 * 1024 * 1024;
const DEFAULT_EXPORT_TTL_DAYS = 7;
const DEFAULT_BATCH_SIZE = 100;
const ZipArchive = (archiverModule as unknown as {
  ZipArchive: new (options: Record<string, unknown>) => Archiver;
}).ZipArchive;

const releaseColumns = [
  { header: 'Release ID', key: 'releaseId', width: 28 },
  { header: 'Release Title', key: 'releaseTitle', width: 36 },
  { header: 'Release Type', key: 'releaseType', width: 18 },
  { header: 'Status', key: 'status', width: 16 },
  { header: 'UPC', key: 'upc', width: 20 },
  { header: 'Primary Artist', key: 'primaryArtist', width: 28 },
  { header: 'Label', key: 'label', width: 28 },
  { header: 'Owner Name', key: 'ownerName', width: 24 },
  { header: 'Owner Email', key: 'ownerEmail', width: 30 },
  { header: 'Release Date', key: 'releaseDate', width: 20 },
  { header: 'Stores', key: 'stores', width: 42 },
  { header: 'Track Count', key: 'trackCount', width: 14 },
  { header: 'Created At', key: 'createdAt', width: 24 },
  { header: 'Updated At', key: 'updatedAt', width: 24 },
];

const trackColumns = [
  { header: 'Release ID', key: 'releaseId', width: 28 },
  { header: 'Release Title', key: 'releaseTitle', width: 36 },
  { header: 'Release UPC', key: 'releaseUpc', width: 20 },
  { header: 'Track Number', key: 'trackNumber', width: 14 },
  { header: 'Disc Number', key: 'discNumber', width: 12 },
  { header: 'Track Title', key: 'title', width: 36 },
  { header: 'Version', key: 'version', width: 20 },
  { header: 'Artist', key: 'artist', width: 28 },
  { header: 'Featuring', key: 'featuring', width: 28 },
  { header: 'ISRC', key: 'isrc', width: 20 },
  { header: 'Genre', key: 'genre', width: 20 },
  { header: 'Subgenre', key: 'subgenre', width: 20 },
  { header: 'Duration', key: 'duration', width: 14 },
  { header: 'Explicit', key: 'explicit', width: 12 },
  { header: 'Composers', key: 'composers', width: 34 },
  { header: 'Lyricists', key: 'lyricists', width: 34 },
  { header: 'Publishers', key: 'publishers', width: 34 },
  { header: 'Producers', key: 'producers', width: 34 },
  { header: 'Audio File', key: 'audioFile', width: 46 },
  { header: 'Audio URL', key: 'audioUrl', width: 58 },
  { header: 'Archive Path', key: 'archivePath', width: 72 },
];

const missingColumns = [
  { header: 'Release ID', key: 'releaseId', width: 28 },
  { header: 'Release Title', key: 'releaseTitle', width: 36 },
  { header: 'Track Title', key: 'trackTitle', width: 36 },
  { header: 'ISRC', key: 'isrc', width: 20 },
  { header: 'Source', key: 'source', width: 58 },
  { header: 'Reason', key: 'reason', width: 42 },
];

function getExportCollection(db: Db) {
  return db.collection<CatalogExportJob>(EXPORT_COLLECTION);
}

export async function ensureCatalogExportIndexes(db: Db) {
  const collection = getExportCollection(db);
  await Promise.all([
    collection.createIndex({ createdAt: -1 }),
    collection.createIndex({ state: 1, createdAt: -1 }),
    collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

export function getCatalogExportRoot() {
  if (process.env.CATALOG_EXPORT_DIR) {
    return path.resolve(process.env.CATALOG_EXPORT_DIR);
  }

  return path.join(/*turbopackIgnore: true*/ process.cwd(), 'private-exports', 'catalog');
}

function getTrackSearchRoots() {
  return [
    process.env.CATALOG_EXPORT_TRACKS_DIR,
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'uploads', 'tracks'),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'server', 'uploads', 'tracks'),
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => path.resolve(value));
}

function getPartTrackLimit() {
  return Math.max(1, Number(process.env.CATALOG_EXPORT_PART_TRACK_LIMIT || DEFAULT_PART_TRACK_LIMIT));
}

function getPartByteLimit() {
  return Math.max(1, Number(process.env.CATALOG_EXPORT_PART_BYTE_LIMIT || DEFAULT_PART_BYTE_LIMIT));
}

function getBatchSize() {
  return Math.max(10, Number(process.env.CATALOG_EXPORT_BATCH_SIZE || DEFAULT_BATCH_SIZE));
}

function getExpiryDate() {
  const days = Math.max(1, Number(process.env.CATALOG_EXPORT_TTL_DAYS || DEFAULT_EXPORT_TTL_DAYS));
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function sanitizeArchiveSegment(value: unknown, fallback: string) {
  const cleaned = String(value || fallback)
    .normalize('NFKD')
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
    .slice(0, 120);

  return cleaned || fallback;
}

function fileNameFromSource(source: string) {
  const trimmed = source.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    return path.basename(decodeURIComponent(url.pathname));
  } catch {
    return path.basename(trimmed.replace(/\\/g, '/'));
  }
}

function isExternalOnly(source: string) {
  if (!/^https?:\/\//i.test(source)) return false;

  try {
    const url = new URL(source);
    return !url.pathname.includes('/uploads/tracks/');
  } catch {
    return true;
  }
}

export async function resolveTrackFile(track: Record<string, unknown>): Promise<TrackFileResolution> {
  const sources = [asString(track.audioFile), asString(track.audioUrl), asString(track.audio)]
    .map((value) => value.trim())
    .filter(Boolean);

  if (!sources.length) {
    return { ok: false, reason: 'No local audio filename or URL stored', source: '' };
  }

  let lastFailure = { reason: 'Local audio file not found', source: sources[0] };

  for (const source of sources) {
    if (isExternalOnly(source)) {
      lastFailure = { reason: 'External audio URL skipped in v1 export', source };
      continue;
    }

    const filename = fileNameFromSource(source);
    if (!filename) {
      lastFailure = { reason: 'Audio filename could not be parsed', source };
      continue;
    }

    for (const root of getTrackSearchRoots()) {
      const candidate = path.resolve(root, filename);
      if (!candidate.startsWith(`${root}${path.sep}`) && candidate !== root) continue;

      try {
        const stats = await fs.promises.stat(candidate);
        if (stats.isFile()) {
          return {
            ok: true,
            path: candidate,
            size: stats.size,
            extension: path.extname(candidate) || '.bin',
          };
        }
      } catch {
        lastFailure = { reason: 'Local audio file not found', source };
      }
    }
  }

  return { ok: false, ...lastFailure };
}

function createWorkbook(filename: string, worksheetName: string, columns: ExcelJS.Column[]) {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    filename,
    useStyles: false,
    useSharedStrings: false,
  });
  const worksheet = workbook.addWorksheet(worksheetName);
  worksheet.columns = columns;
  return { workbook, worksheet };
}

function releaseRow(release: Record<string, unknown>) {
  const tracks = Array.isArray(release.tracks) ? release.tracks : [];
  return {
    releaseId: asString(release._id),
    releaseTitle: asString(release.releaseTitle || release.title),
    releaseType: asString(release.releaseType),
    status: asString(release.status),
    upc: asString(release.upc),
    primaryArtist: asString(release.primaryArtist),
    label: asString(release.label),
    ownerName: asString(release.ownerName || release.ownerArtistName),
    ownerEmail: asString(release.ownerEmail),
    releaseDate: asString(release.releaseDate),
    stores: asString(release.stores),
    trackCount: tracks.length,
    createdAt: asString(release.createdAt),
    updatedAt: asString(release.updatedAt),
  };
}

function lyricistsFrom(track: Record<string, unknown>) {
  const contributors = Array.isArray(track.contributors) ? track.contributors : [];
  return contributors
    .filter((item) => typeof item === 'object' && item && (item as Record<string, unknown>).role === 'lyricist')
    .map((item) => asString((item as Record<string, unknown>).name))
    .filter(Boolean)
    .join(', ');
}

function trackRow(
  release: Record<string, unknown>,
  track: Record<string, unknown>,
  index: number,
  archivePath = ''
) {
  return {
    releaseId: asString(release._id),
    releaseTitle: asString(release.releaseTitle || release.title),
    releaseUpc: asString(release.upc),
    trackNumber: asString(track.trackNumber || index + 1),
    discNumber: asString(track.discNumber || 1),
    title: asString(track.title),
    version: asString(track.version),
    artist: asString(track.artist || release.primaryArtist),
    featuring: asString(track.featuring),
    isrc: asString(track.isrc),
    genre: asString(track.genre),
    subgenre: asString(track.subgenre),
    duration: asString(track.duration),
    explicit: track.explicit ? 'Yes' : 'No',
    composers: asString(track.composers),
    lyricists: lyricistsFrom(track),
    publishers: asString(track.publishers || track.publisher),
    producers: asString(track.producers),
    audioFile: asString(track.audioFile),
    audioUrl: asString(track.audioUrl),
    archivePath,
  };
}

function createArchivePath(
  release: Record<string, unknown>,
  track: Record<string, unknown>,
  index: number,
  extension: string
) {
  const releaseId = asString(release._id);
  const releaseDir = sanitizeArchiveSegment(release.releaseTitle || release.title, releaseId || 'release');
  const trackTitle = sanitizeArchiveSegment(track.title, `track-${index + 1}`);
  const isrc = sanitizeArchiveSegment(track.isrc, '').slice(0, 24);
  const suffix = isrc ? `-${isrc}` : '';
  const fileBase = `${String(index + 1).padStart(2, '0')}-${trackTitle}${suffix}`;
  return path.posix.join('tracks', releaseDir, `${fileBase}${extension}`);
}

function writeJsonFile(filename: string, value: unknown) {
  return fs.promises.writeFile(filename, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function zipFiles(
  zipPath: string,
  files: Array<{ sourcePath: string; archivePath: string }>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 6 }, forceZip64: true });

    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', reject);
    archive.pipe(output);

    files.forEach((file) => archive.file(file.sourcePath, { name: file.archivePath }));
    archive.finalize().catch(reject);
  });
}

class TrackPartWriter {
  private archive: Archiver;
  private closePromise: Promise<void>;
  private workbook: ExcelJS.stream.xlsx.WorkbookWriter;
  private worksheet: ExcelJS.Worksheet;
  private readonly xlsxPath: string;
  private trackCount = 0;
  private bytes = 0;

  constructor(
    private readonly jobDir: string,
    private readonly index: number
  ) {
    this.xlsxPath = path.join(jobDir, `tracks-part-${String(index).padStart(4, '0')}.xlsx.tmp`);
    const zipPath = this.zipPath;
    const output = fs.createWriteStream(zipPath);
    this.archive = new ZipArchive({ zlib: { level: 6 }, forceZip64: true });
    this.closePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
      this.archive.on('error', reject);
      this.archive.on('warning', reject);
    });
    this.archive.pipe(output);

    const workbook = createWorkbook(this.xlsxPath, 'Tracks', trackColumns as ExcelJS.Column[]);
    this.workbook = workbook.workbook;
    this.worksheet = workbook.worksheet;
  }

  get name() {
    return `catalog-tracks-part-${String(this.index).padStart(4, '0')}.zip`;
  }

  get zipPath() {
    return path.join(this.jobDir, this.name);
  }

  get count() {
    return this.trackCount;
  }

  get byteCount() {
    return this.bytes;
  }

  addTrack(params: {
    row: Record<string, unknown>;
    filePath: string;
    archivePath: string;
    size: number;
  }) {
    this.archive.file(params.filePath, { name: params.archivePath });
    this.worksheet.addRow(params.row).commit();
    this.trackCount += 1;
    this.bytes += params.size;
  }

  async finalize(): Promise<CatalogExportPart> {
    await this.workbook.commit();
    this.archive.file(this.xlsxPath, {
      name: `metadata/tracks-part-${String(this.index).padStart(4, '0')}.xlsx`,
    });
    await this.archive.finalize();
    await this.closePromise;

    const stats = await fs.promises.stat(this.zipPath);
    await fs.promises.unlink(this.xlsxPath).catch(() => undefined);

    return {
      name: this.name,
      type: 'tracks',
      path: this.zipPath,
      size: stats.size,
      trackCount: this.trackCount,
      createdAt: new Date(),
    };
  }
}

async function createMetadataZip(params: {
  jobDir: string;
  releasesPath: string;
  tracksPath: string;
  missingPath: string;
  manifestPath: string;
}) {
  const zipPath = path.join(params.jobDir, 'catalog-metadata.zip');
  await zipFiles(zipPath, [
    { sourcePath: params.releasesPath, archivePath: 'metadata/releases.xlsx' },
    { sourcePath: params.tracksPath, archivePath: 'metadata/tracks.xlsx' },
    { sourcePath: params.missingPath, archivePath: 'metadata/missing-files.xlsx' },
    { sourcePath: params.manifestPath, archivePath: 'manifest.json' },
  ]);

  const stats = await fs.promises.stat(zipPath);
  return {
    name: 'catalog-metadata.zip',
    type: 'metadata' as const,
    path: zipPath,
    size: stats.size,
    trackCount: 0,
    createdAt: new Date(),
  };
}

async function updateJobProgress(
  db: Db,
  jobId: ObjectId,
  counts: CatalogExportCounts,
  force: boolean
) {
  if (!force && counts.tracks % 100 !== 0 && counts.releases % 25 !== 0) return;

  await getExportCollection(db).updateOne(
    { _id: jobId },
    {
      $set: {
        counts,
        updatedAt: new Date(),
      },
    }
  );
}

export async function createCatalogExportJob(db: Db, user: ExportUser) {
  await ensureCatalogExportIndexes(db);
  const now = new Date();
  const result = await getExportCollection(db).insertOne({
    _id: new ObjectId(),
    scope: 'approved',
    state: 'queued',
    createdBy: String(user._id),
    createdByEmail: user.email,
    counts: { releases: 0, tracks: 0, files: 0, missing: 0, parts: 0 },
    parts: [],
    errors: [],
    warnings: [],
    expiresAt: getExpiryDate(),
    createdAt: now,
    updatedAt: now,
  });

  const jobId = result.insertedId.toHexString();
  void processCatalogExportJob(jobId).catch(() => undefined);
  return getExportCollection(db).findOne({ _id: result.insertedId });
}

export async function listCatalogExportJobs(db: Db, limit = 10) {
  await ensureCatalogExportIndexes(db);
  return getExportCollection(db)
    .find({})
    .sort({ createdAt: -1 })
    .limit(Math.min(50, Math.max(1, limit)))
    .toArray();
}

export async function getCatalogExportJob(db: Db, jobId: string) {
  if (!ObjectId.isValid(jobId)) return null;
  await ensureCatalogExportIndexes(db);
  return getExportCollection(db).findOne({ _id: new ObjectId(jobId) });
}

export async function getCatalogExportPart(db: Db, jobId: string, partName: string) {
  const job = await getCatalogExportJob(db, jobId);
  if (!job) return null;

  const root = getCatalogExportRoot();
  const part = job.parts.find((item) => item.name === partName);
  if (!part) return null;

  const resolved = path.resolve(part.path);
  if (!resolved.startsWith(`${root}${path.sep}`)) return null;

  return { job, part: { ...part, path: resolved } };
}

export async function processCatalogExportJob(jobId: string) {
  if (runningJobs.has(jobId) || !ObjectId.isValid(jobId)) return;
  runningJobs.add(jobId);

  const { db } = await connectToDatabase();
  const objectId = new ObjectId(jobId);
  const collection = getExportCollection(db);
  const now = new Date();
  const counts: CatalogExportCounts = { releases: 0, tracks: 0, files: 0, missing: 0, parts: 0 };
  const warnings: string[] = [];
  const parts: CatalogExportPart[] = [];

  try {
    const lock = await collection.findOneAndUpdate(
      { _id: objectId, state: 'queued' },
      {
        $set: {
          state: 'running',
          startedAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' }
    );

    if (!lock.value) return;

    const exportRoot = getCatalogExportRoot();
    const jobDir = path.join(exportRoot, jobId);
    await fs.promises.mkdir(jobDir, { recursive: true });

    const releasesPath = path.join(jobDir, 'releases.xlsx');
    const tracksPath = path.join(jobDir, 'tracks.xlsx');
    const missingPath = path.join(jobDir, 'missing-files.xlsx');
    const manifestPath = path.join(jobDir, 'manifest.json');

    const releaseBook = createWorkbook(releasesPath, 'Releases', releaseColumns as ExcelJS.Column[]);
    const trackBook = createWorkbook(tracksPath, 'Tracks', trackColumns as ExcelJS.Column[]);
    const missingBook = createWorkbook(missingPath, 'Missing Files', missingColumns as ExcelJS.Column[]);

    let currentPart: TrackPartWriter | null = null;
    let nextPartIndex = 1;

    const finalizeCurrentPart = async () => {
      if (!currentPart || currentPart.count === 0) return;
      const part = await currentPart.finalize();
      parts.push(part);
      counts.parts = parts.length;
      currentPart = null;
      await collection.updateOne(
        { _id: objectId },
        { $set: { counts, parts, updatedAt: new Date() } }
      );
    };

    const releases = db
      .collection('releases')
      .find(
        { status: 'approved' },
        {
          projection: {
            releaseTitle: 1,
            title: 1,
            releaseType: 1,
            status: 1,
            releaseDate: 1,
            originalReleaseDate: 1,
            label: 1,
            upc: 1,
            ownerName: 1,
            ownerArtistName: 1,
            ownerEmail: 1,
            primaryArtist: 1,
            territories: 1,
            stores: 1,
            tracks: 1,
            updatedAt: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ _id: 1 })
      .batchSize(getBatchSize());

    for await (const release of releases) {
      counts.releases += 1;
      releaseBook.worksheet.addRow(releaseRow(release)).commit();

      const tracks = Array.isArray(release.tracks) ? release.tracks : [];
      for (const rawTrack of tracks) {
        const track = typeof rawTrack === 'object' && rawTrack ? rawTrack as Record<string, unknown> : {};
        const trackIndex = counts.tracks;
        counts.tracks += 1;
        const resolved = await resolveTrackFile(track);

        if (!resolved.ok) {
          counts.missing += 1;
          missingBook.worksheet
            .addRow({
              releaseId: asString(release._id),
              releaseTitle: asString(release.releaseTitle || release.title),
              trackTitle: asString(track.title),
              isrc: asString(track.isrc),
              source: resolved.source,
              reason: resolved.reason,
            })
            .commit();
          trackBook.worksheet.addRow(trackRow(release, track, trackIndex)).commit();
          await updateJobProgress(db, objectId, counts, false);
          continue;
        }

        const archivePath = createArchivePath(release, track, trackIndex, resolved.extension);
        const row = trackRow(release, track, trackIndex, archivePath);
        trackBook.worksheet.addRow(row).commit();

        const trackLimit = getPartTrackLimit();
        const byteLimit = getPartByteLimit();
        const shouldRotate =
          currentPart &&
          currentPart.count > 0 &&
          (currentPart.count >= trackLimit || currentPart.byteCount + resolved.size > byteLimit);

        if (shouldRotate) {
          await finalizeCurrentPart();
        }

        if (!currentPart) {
          currentPart = new TrackPartWriter(jobDir, nextPartIndex);
          nextPartIndex += 1;
        }

        currentPart.addTrack({
          row,
          filePath: resolved.path,
          archivePath,
          size: resolved.size,
        });
        counts.files += 1;
        await updateJobProgress(db, objectId, counts, false);
      }
    }

    await finalizeCurrentPart();
    await Promise.all([
      releaseBook.workbook.commit(),
      trackBook.workbook.commit(),
      missingBook.workbook.commit(),
    ]);

    const manifest = {
      jobId,
      scope: 'approved',
      generatedAt: new Date().toISOString(),
      counts,
      parts: parts.map((part) => ({
        name: part.name,
        type: part.type,
        size: part.size,
        trackCount: part.trackCount,
      })),
      warnings,
    };
    await writeJsonFile(manifestPath, manifest);

    const metadataPart = await createMetadataZip({
      jobDir,
      releasesPath,
      tracksPath,
      missingPath,
      manifestPath,
    });
    parts.unshift(metadataPart);
    counts.parts = parts.length;

    const state: CatalogExportState = counts.missing > 0 || warnings.length > 0
      ? 'completed_with_warnings'
      : 'completed';

    await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          state,
          counts,
          parts,
          warnings,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Catalog export failed';
    await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          state: 'failed',
          errors: [message],
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  } finally {
    runningJobs.delete(jobId);
  }
}
