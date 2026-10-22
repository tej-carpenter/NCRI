import {
  SummaryKPIs,
  TrendPoint,
  SectorStat,
  AttackTypeStat,
  GeoStat,
  SeverityStat,
  CyberIncident,
  NCRIOverviewResponse,
  DataSource,
  IngestionRun,
} from '../types';

function getApiBase(): string {
  const custom =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    '';

  if (custom) {
    const clean = custom.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return '/api';
}

export const API_BASE = getApiBase();

async function fetchJson<T>(url: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      let detail = `Status ${res.status}`;
      try {
        const body = await res.json();
        if (body?.detail) {
          detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
        }
      } catch {
        // body not json
      }
      console.warn(`[NCRI API] ${res.status} on ${url}:`, detail);
      return fallback;
    }
    const data = await res.json();
    return data ?? fallback;
  } catch (err) {
    console.error(`[NCRI API] Network error on ${url}:`, err);
    return fallback;
  }
}

export async function fetchHealth(): Promise<{ status: string; project?: string; version?: string }> {
  return fetchJson(`${API_BASE}/health`, { status: 'degraded' });
}

const emptyKPIs: SummaryKPIs = {
  total_incidents: 0,
  total_sources: 0,
  total_vulnerabilities: 0,
  total_countries: 0,
  top_sector: null,
  top_attack_type: null,
  critical_severity_percentage: 0,
  ransomware_percentage: 0,
  latest_incident_date: null,
  records_with_known_actors_percentage: 0,
};

export async function fetchKpis(country?: string, sector?: string): Promise<SummaryKPIs> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  if (sector && sector !== 'All') params.append('sector', sector);
  return fetchJson(`${API_BASE}/analytics/kpis?${params.toString()}`, emptyKPIs);
}

export async function fetchTrends(
  country?: string,
  sector?: string,
  granularity: string = 'yearly'
): Promise<TrendPoint[]> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  if (sector && sector !== 'All') params.append('sector', sector);
  params.append('granularity', granularity);
  return fetchJson(`${API_BASE}/analytics/trends?${params.toString()}`, []);
}

export async function fetchSectors(country?: string): Promise<SectorStat[]> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  return fetchJson(`${API_BASE}/analytics/sectors?${params.toString()}`, []);
}

export async function fetchAttackTypes(country?: string, sector?: string): Promise<AttackTypeStat[]> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  if (sector && sector !== 'All') params.append('sector', sector);
  return fetchJson(`${API_BASE}/analytics/attack-types?${params.toString()}`, []);
}

export async function fetchGeography(limit: number = 20): Promise<GeoStat[]> {
  return fetchJson(`${API_BASE}/analytics/geography?limit=${limit}`, []);
}

export async function fetchSeverity(country?: string, sector?: string): Promise<SeverityStat[]> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  if (sector && sector !== 'All') params.append('sector', sector);
  return fetchJson(`${API_BASE}/analytics/severity?${params.toString()}`, []);
}

export async function fetchIncidents(params: {
  page?: number;
  size?: number;
  search?: string;
  sector?: string;
  country?: string;
  attack_type?: string;
  severity?: string;
  year?: number;
  sort_by?: string;
  sort_dir?: string;
}): Promise<{ items: CyberIncident[]; total: number; page: number; size: number; pages: number }> {
  const q = new URLSearchParams();
  const page = params.page || 1;
  const size = params.size || 8;
  q.append('page', page.toString());
  q.append('size', size.toString());
  if (params.search) q.append('search', params.search);
  if (params.sector && params.sector !== 'All') q.append('sector', params.sector);
  if (params.country && params.country !== 'All') q.append('country', params.country);
  if (params.attack_type && params.attack_type !== 'All') q.append('attack_type', params.attack_type);
  if (params.severity && params.severity !== 'All') q.append('severity', params.severity);
  if (params.year) q.append('year', params.year.toString());
  if (params.sort_by) q.append('sort_by', params.sort_by);
  if (params.sort_dir) q.append('sort_dir', params.sort_dir);

  return fetchJson(
    `${API_BASE}/incidents?${q.toString()}`,
    { items: [], total: 0, page, size, pages: 1 }
  );
}

export async function fetchIncidentDetail(id: number): Promise<CyberIncident | null> {
  return fetchJson(`${API_BASE}/incidents/${id}`, null);
}

export async function fetchRiskIndex(
  period: string = 'All-Time',
  country: string = 'All'
): Promise<NCRIOverviewResponse | null> {
  return fetchJson(
    `${API_BASE}/risk/index?period=${encodeURIComponent(period)}&country=${encodeURIComponent(country)}`,
    null
  );
}

export async function calculateCustomRisk(payload: {
  assessment_period?: string;
  country?: string;
  weight_frequency?: number;
  weight_severity?: number;
  weight_criticality?: number;
  weight_exploitation?: number;
}): Promise<NCRIOverviewResponse | null> {
  return fetchJson(
    `${API_BASE}/risk/calculate`,
    null,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchRiskMethodology() {
  return fetchJson(`${API_BASE}/risk/methodology`, null);
}

export async function fetchSources(): Promise<DataSource[]> {
  return fetchJson(`${API_BASE}/sources`, []);
}

export interface SyncTriggerResult {
  source_slug?: string;
  status: string;
  message: string;
  run_id?: number;
}

export async function triggerSourceSync(slug: string, max_records?: number): Promise<SyncTriggerResult> {
  const url = max_records
    ? `${API_BASE}/sources/${slug}/sync?max_records=${max_records}`
    : `${API_BASE}/sources/${slug}/sync`;
  return fetchJson<SyncTriggerResult>(
    url,
    { source_slug: slug, status: 'failed', message: 'Sync failed' },
    { method: 'POST' }
  );
}

export async function fetchSourceRuns(slug: string): Promise<IngestionRun[]> {
  return fetchJson(`${API_BASE}/sources/${slug}/runs`, []);
}

export async function uploadDatasetFile(formData: FormData): Promise<SyncTriggerResult> {
  return fetchJson<SyncTriggerResult>(
    `${API_BASE}/sources/upload`,
    { source_slug: 'custom_upload', status: 'failed', message: 'Upload failed' },
    {
      method: 'POST',
      body: formData,
    }
  );
}

export async function fetchVulnerabilities(
  page: number = 1,
  size: number = 20,
  search?: string,
  ransomwareOnly: boolean = false
) {
  const q = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (search) q.append('search', search);
  if (ransomwareOnly) q.append('ransomware_only', 'true');
  return fetchJson(
    `${API_BASE}/vulnerabilities?${q.toString()}`,
    { items: [], total: 0, page, size, pages: 1 }
  );
}

export function getCsvExportUrl(filters: {
  sector?: string;
  country?: string;
  attack_type?: string;
  severity?: string;
  year?: number;
}) {
  const q = new URLSearchParams();
  if (filters.sector && filters.sector !== 'All') q.append('sector', filters.sector);
  if (filters.country && filters.country !== 'All') q.append('country', filters.country);
  if (filters.attack_type && filters.attack_type !== 'All') q.append('attack_type', filters.attack_type);
  if (filters.severity && filters.severity !== 'All') q.append('severity', filters.severity);
  if (filters.year) q.append('year', filters.year.toString());
  return `${API_BASE}/reports/export-csv?${q.toString()}`;
}
