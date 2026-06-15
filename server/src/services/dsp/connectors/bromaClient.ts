import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import fs from 'fs/promises';
import path from 'path';

type BromaClientInput = {
  credentials: Record<string, unknown>;
  config: Record<string, unknown>;
};

export class BromaClient {
  private http: AxiosInstance;
  private credentials: Record<string, unknown>;
  private accessToken?: string;
  private refreshToken?: string;
  private language: string;

  constructor(input: BromaClientInput) {
    const baseUrl = String(input.config.baseUrl || 'https://api-rod.broma16.com/api').replace(/\/+$/, '');
    this.credentials = input.credentials;
    this.accessToken = typeof input.credentials.accessToken === 'string' ? input.credentials.accessToken : undefined;
    this.refreshToken = typeof input.credentials.refreshToken === 'string' ? input.credentials.refreshToken : undefined;
    this.language = String(input.config.language || 'en');
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: Number(input.config.timeoutMs || 60_000),
      headers: { 'Content-Language': this.language },
      validateStatus: (status) => status >= 200 && status < 500,
    });
  }

  private authHeaders() {
    return this.accessToken ? { 'X-Access-Token': this.accessToken } : {};
  }

  private async login() {
    const response = await this.http.post('/auth/login', {
      email: this.credentials.email,
      password: this.credentials.password,
    });
    const data = response.data?.data || response.data || {};
    this.accessToken = data.access_token || data.accessToken;
    this.refreshToken = data.refresh_token || data.refreshToken || this.refreshToken;
    if (!this.accessToken) throw new Error('Broma authorization failed: missing access token');
  }

  private async refresh() {
    if (!this.refreshToken) {
      await this.login();
      return;
    }

    const response = await this.http.post('/auth/refresh', { refresh_token: this.refreshToken });
    if (response.status === 401) {
      await this.login();
      return;
    }
    const data = response.data?.data || response.data || {};
    this.accessToken = data.access_token || data.accessToken;
    this.refreshToken = data.refresh_token || data.refreshToken || this.refreshToken;
    if (!this.accessToken) throw new Error('Broma token refresh failed: missing access token');
  }

  private async request<T = any>(config: AxiosRequestConfig, retry = true): Promise<T> {
    if (!this.accessToken) await this.login();
    const response = await this.http.request({
      ...config,
      headers: {
        ...(config.headers || {}),
        ...this.authHeaders(),
      },
    });

    if (response.status === 401 && retry) {
      await this.refresh();
      return this.request<T>(config, false);
    }

    if (response.status >= 400) {
      const message =
        response.data?.message ||
        response.data?.error ||
        response.data?.errors?.join?.(', ') ||
        `Broma HTTP ${response.status}`;
      const error = new Error(message);
      (error as any).statusCode = response.status;
      (error as any).responseBody = response.data;
      throw error;
    }

    return response.data as T;
  }

  async getOutlets() {
    return this.request<any>({ method: 'GET', url: '/dictionaries/outlets' });
  }

  async createRelease(payload: Record<string, unknown>) {
    return this.request<any>({ method: 'POST', url: '/repertoire/release/', data: payload });
  }

  async uploadRecording(releaseId: string, file: unknown) {
    const form = await this.buildUploadForm(file);
    return this.request<any>({
      method: 'POST',
      url: `/repertoire/release/${releaseId}/recording/upload`,
      data: form,
    });
  }

  async updateRecording(releaseId: string, recordingId: string, payload: Record<string, unknown>) {
    return this.request<any>({
      method: 'PUT',
      url: `/repertoire/release/${releaseId}/recording/${recordingId}`,
      data: payload,
    });
  }

  async addComposition(releaseId: string, recordingId: string, payload: Record<string, unknown>) {
    return this.request<any>({
      method: 'POST',
      url: `/repertoire/release/${releaseId}/recording/${recordingId}/composition`,
      data: payload,
    });
  }

  async uploadCover(releaseId: string, file: unknown) {
    const form = await this.buildUploadForm(file);
    return this.request<any>({
      method: 'POST',
      url: `/repertoire/release/${releaseId}/cover/upload`,
      data: form,
    });
  }

  async updateDistribution(releaseId: string, payload: Record<string, unknown>) {
    return this.request<any>({
      method: 'POST',
      url: `/repertoire/release/${releaseId}/distribution`,
      data: payload,
    });
  }

  async sendModeration(releaseId: string) {
    return this.request<any>({
      method: 'POST',
      url: `/repertoire/release/${releaseId}/send-moderate`,
    });
  }

  async getRelease(releaseId: string) {
    return this.request<any>({
      method: 'GET',
      url: `/repertoire/release/${releaseId}/data`,
    });
  }

  private async buildUploadForm(file: unknown) {
    const source = typeof file === 'string' ? file.trim() : '';
    if (!source) throw new Error('Broma upload failed: missing file path');
    if (/^https?:\/\//i.test(source)) {
      const form = new FormData();
      form.append('source_url', source);
      return form;
    }

    const fullPath = this.resolveUploadPath(source);
    const data = await fs.readFile(fullPath);
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(data)]), path.basename(fullPath));
    return form;
  }

  private resolveUploadPath(value: string) {
    const cleaned = value.replace(/\\/g, '/').replace(/^\/+/, '');
    const relative = cleaned.startsWith('uploads/') ? cleaned.slice('uploads/'.length) : cleaned;
    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const fullPath = path.resolve(uploadsRoot, relative);
    if (!fullPath.startsWith(uploadsRoot)) throw new Error('Broma upload failed: invalid file path');
    return fullPath;
  }
}
