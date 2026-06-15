import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { errorResponse, successResponse } from '../utils/apiResponse';
import { dspDeliveryService } from '../services/dsp/dspDelivery.service';

export const listProviders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const providers = await dspDeliveryService.listProviders();
    successResponse(res, providers, 'DSP providers fetched');
  } catch (error) {
    errorResponse(res, 'Failed to fetch DSP providers', error);
  }
};

export const registerProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const provider = await dspDeliveryService.registerProvider(req.body);
    successResponse(res, provider, 'DSP provider registered');
  } catch (error) {
    errorResponse(res, 'Failed to register DSP provider', error);
  }
};

export const bootstrapPhase1Providers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const providers = await dspDeliveryService.bootstrapPhase1Providers();
    successResponse(res, providers, 'Phase-1 DSP providers bootstrapped');
  } catch (error) {
    errorResponse(res, 'Failed to bootstrap phase-1 providers', error);
  }
};

export const syncBromaOutlets = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await dspDeliveryService.syncBromaOutlets();
    successResponse(res, result, 'Broma outlets synced');
  } catch (error) {
    errorResponse(res, 'Failed to sync Broma outlets', error);
  }
};

export const dispatchDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { trackId, providerKey, operation = 'deliver' } = req.body;
    const job = await dspDeliveryService.dispatchDelivery(trackId, providerKey, operation, req.user?._id?.toString());
    successResponse(res, job, 'Delivery job queued', 201);
  } catch (error) {
    errorResponse(res, 'Failed to queue delivery job', error);
  }
};

export const listDeliveries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await dspDeliveryService.listJobs({
      providerKey: typeof req.query.providerKey === 'string' ? req.query.providerKey : undefined,
      state: typeof req.query.state === 'string' ? req.query.state : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    successResponse(res, result, 'Delivery jobs fetched');
  } catch (error) {
    errorResponse(res, 'Failed to fetch delivery jobs', error);
  }
};

export const getDeliveryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await dspDeliveryService.getJob(req.params.jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Delivery job not found', data: null });
      return;
    }
    successResponse(res, job, 'Delivery job fetched');
  } catch (error) {
    errorResponse(res, 'Failed to fetch delivery job', error);
  }
};

export const retryDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await dspDeliveryService.retryJob(req.params.jobId);
    successResponse(res, job, 'Delivery retry queued');
  } catch (error) {
    errorResponse(res, 'Failed to retry delivery job', error);
  }
};

export const processDueDeliveries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const maxJobs = req.body?.maxJobs ? Number(req.body.maxJobs) : undefined;
    const result = await dspDeliveryService.processDueDeliveryJobs({
      maxJobs,
      workerId: typeof req.body?.workerId === 'string' ? req.body.workerId : undefined,
    });
    successResponse(res, result, 'Due delivery jobs processed');
  } catch (error) {
    errorResponse(res, 'Failed to process due delivery jobs', error);
  }
};

export const processWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await dspDeliveryService.processWebhook(
      req.params.providerKey.toLowerCase(),
      req.body || {},
      req.headers as unknown as Record<string, unknown>
    );
    successResponse(res, event, 'Webhook processed');
  } catch (error) {
    errorResponse(res, 'Failed to process webhook', error);
  }
};

export const createRightsClaim = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const claim = await dspDeliveryService.createRightsClaim(req.body);
    successResponse(res, claim, 'Rights claim created', 201);
  } catch (error) {
    errorResponse(res, 'Failed to create rights claim', error);
  }
};

export const addFingerprintMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await dspDeliveryService.addFingerprintMatch(req.body);
    successResponse(res, match, 'Fingerprint match stored', 201);
  } catch (error) {
    errorResponse(res, 'Failed to store fingerprint match', error);
  }
};
