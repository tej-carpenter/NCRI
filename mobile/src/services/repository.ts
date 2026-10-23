import {
  SummaryKPIs,
  TrendPoint,
  SectorStat,
  AttackTypeStat,
  GeoStat,
  CyberIncident,
  NCRIOverviewResponse,
  DataSource,
  Vulnerability,
} from '../types';
import { NativeService } from './native';

const DEFAULT_BACKEND_URL = 'https://ncri.onrender.com';
const STORAGE_KEYS = {
  BACKEND_URL: 'ncri_backend_url',
  KPIS_CACHE: 'ncri_cache_kpis',
  TRENDS_CACHE: 'ncri_cache_trends',
  SECTORS_CACHE: 'ncri_cache_sectors',
  INCIDENTS_CACHE: 'ncri_cache_incidents',
  RISK_CACHE: 'ncri_cache_risk',
  SOURCES_CACHE: 'ncri_cache_sources',
  LAST_SYNC: 'ncri_last_sync_timestamp',
};

export class NCRIRepository {
  private static backendUrl: string = DEFAULT_BACKEND_URL;

  static async init(): Promise<void> {
    const saved = await NativeService.getStorage<string>(STORAGE_KEYS.BACKEND_URL, DEFAULT_BACKEND_URL);
    this.backendUrl = saved.trim().replace(/\/+$/, '').replace(/\/api$/, '');
  }

  static getBackendUrl(): string {
    return this.backendUrl;
  }

  static async setBackendUrl(url: string): Promise<void> {
    const cleaned = (url || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, '').replace(/\/api$/, '');
    this.backendUrl = cleaned;
    await NativeService.setStorage(STORAGE_KEYS.BACKEND_URL, cleaned);
  }

  private static getApiBase(): string {
    return `${this.backendUrl}/api`;
  }

  /**
   * Generic fetcher with offline cache fallback
   */
  private static async fetchWithCache<T>(
    endpoint: string,
    cacheKey: string,
    fallback: T,
    init?: RequestInit
  ): Promise<{ data: T; isCached: boolean; error?: string }> {
    const url = `${this.getApiBase()}${endpoint}`;
    
    // Check network first
    const net = await NativeService.getNetworkStatus();
    
    if (!net.connected) {
      // Return cached version
      const cached = await NativeService.getStorage<T | null>(cacheKey, null);
      if (cached !== null) {
        return { data: cached, isCached: true };
      }
      return { data: fallback, isCached: false, error: 'Offline - No cached data available' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const data = json ?? fallback;

      // Update local storage cache
      await NativeService.setStorage(cacheKey, data);
      await NativeService.setStorage(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

      return { data, isCached: false };
    } catch (err: any) {
      console.warn(`[NCRI Repository] Network request failed for ${url}:`, err);

      // Attempt to load from offline cache
      const cached = await NativeService.getStorage<T | null>(cacheKey, null);
      if (cached !== null) {
        return { data: cached, isCached: true, error: err.message };
      }
      return { data: fallback, isCached: false, error: err.message };
    }
  }

  // --- API Endpoints with Repository Pattern ---

  static async getHealth(): Promise<{ status: string; project?: string; version?: string }> {
    try {
      const res = await fetch(`${this.getApiBase()}/health`);
      if (res.ok) return await res.json();
    } catch {
      //
    }
    return { status: 'offline' };
  }

  static async getKPIs(country?: string): Promise<{ data: SummaryKPIs; isCached: boolean }> {
    const q = country && country !== 'All' ? `?country=${encodeURIComponent(country)}` : '';
    const emptyKPIs: SummaryKPIs = {
      total_incidents: 0,
      total_sources: 5,
      total_vulnerabilities: 0,
      total_countries: 0,
      top_sector: null,
      top_attack_type: null,
      critical_severity_percentage: 0,
      ransomware_percentage: 0,
      latest_incident_date: null,
      records_with_known_actors_percentage: 0,
    };
    return this.fetchWithCache<SummaryKPIs>(`/analytics/kpis${q}`, `${STORAGE_KEYS.KPIS_CACHE}_${country || 'All'}`, emptyKPIs);
  }

  static async getTrends(country?: string, granularity: string = 'yearly'): Promise<{ data: TrendPoint[]; isCached: boolean }> {
    const params = new URLSearchParams();
    if (country && country !== 'All') params.append('country', country);
    params.append('granularity', granularity);
    return this.fetchWithCache<TrendPoint[]>(
      `/analytics/trends?${params.toString()}`,
      `${STORAGE_KEYS.TRENDS_CACHE}_${country || 'All'}_${granularity}`,
      []
    );
  }

  static async getSectors(country?: string): Promise<{ data: SectorStat[]; isCached: boolean }> {
    const q = country && country !== 'All' ? `?country=${encodeURIComponent(country)}` : '';
    return this.fetchWithCache<SectorStat[]>(`/analytics/sectors${q}`, `${STORAGE_KEYS.SECTORS_CACHE}_${country || 'All'}`, []);
  }

  static async getAttackTypes(country?: string): Promise<{ data: AttackTypeStat[]; isCached: boolean }> {
    const q = country && country !== 'All' ? `?country=${encodeURIComponent(country)}` : '';
    return this.fetchWithCache<AttackTypeStat[]>(`/analytics/attack-types${q}`, `ncri_cache_attacks_${country || 'All'}`, []);
  }

  static async getGeography(limit: number = 25): Promise<{ data: GeoStat[]; isCached: boolean }> {
    return this.fetchWithCache<GeoStat[]>(`/analytics/geography?limit=${limit}`, `ncri_cache_geo_${limit}`, []);
  }

  static async getIncidents(params: {
    page?: number;
    size?: number;
    search?: string;
    sector?: string;
    country?: string;
    attack_type?: string;
    severity?: string;
    year?: number;
  }): Promise<{ data: { items: CyberIncident[]; total: number; page: number; size: number; pages: number }; isCached: boolean }> {
    const q = new URLSearchParams();
    q.append('page', (params.page || 1).toString());
    q.append('size', (params.size || 15).toString());
    if (params.search) q.append('search', params.search);
    if (params.sector && params.sector !== 'All') q.append('sector', params.sector);
    if (params.country && params.country !== 'All') q.append('country', params.country);
    if (params.attack_type && params.attack_type !== 'All') q.append('attack_type', params.attack_type);
    if (params.severity && params.severity !== 'All') q.append('severity', params.severity);
    if (params.year) q.append('year', params.year.toString());

    return this.fetchWithCache(
      `/incidents?${q.toString()}`,
      `${STORAGE_KEYS.INCIDENTS_CACHE}_p${params.page || 1}`,
      { items: [], total: 0, page: 1, size: 15, pages: 1 }
    );
  }

  static async getRiskIndex(period: string = 'All-Time', country: string = 'All'): Promise<{ data: NCRIOverviewResponse | null; isCached: boolean }> {
    return this.fetchWithCache<NCRIOverviewResponse | null>(
      `/risk/index?period=${encodeURIComponent(period)}&country=${encodeURIComponent(country)}`,
      `${STORAGE_KEYS.RISK_CACHE}_${period}_${country}`,
      null
    );
  }

  static async calculateCustomRisk(payload: {
    assessment_period?: string;
    country?: string;
    weight_frequency?: number;
    weight_severity?: number;
    weight_criticality?: number;
    weight_exploitation?: number;
  }): Promise<NCRIOverviewResponse | null> {
    try {
      const res = await fetch(`${this.getApiBase()}/risk/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error calculating custom risk:', err);
    }
    return null;
  }

  static async getSources(): Promise<{ data: DataSource[]; isCached: boolean }> {
    return this.fetchWithCache<DataSource[]>(`/sources`, STORAGE_KEYS.SOURCES_CACHE, []);
  }

  static async triggerSourceSync(slug: string, max_records?: number): Promise<{ status: string; message: string }> {
    const url = max_records
      ? `${this.getApiBase()}/sources/${slug}/sync?max_records=${max_records}`
      : `${this.getApiBase()}/sources/${slug}/sync`;
    try {
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
      return { status: 'error', message: `Server returned status ${res.status}` };
    } catch (err: any) {
      return { status: 'error', message: err.message || 'Network request failed' };
    }
  }

  static async getVulnerabilities(
    page: number = 1,
    size: number = 15,
    search?: string,
    ransomwareOnly: boolean = false
  ): Promise<{ items: Vulnerability[]; total: number; page: number; size: number; pages: number }> {
    const q = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (search) q.append('search', search);
    if (ransomwareOnly) q.append('ransomware_only', 'true');

    try {
      const res = await fetch(`${this.getApiBase()}/vulnerabilities?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      //
    }
    return { items: [], total: 0, page: 1, size: 15, pages: 1 };
  }

  static async getLastSyncTime(): Promise<string | null> {
    return await NativeService.getStorage<string | null>(STORAGE_KEYS.LAST_SYNC, null);
  }
}
