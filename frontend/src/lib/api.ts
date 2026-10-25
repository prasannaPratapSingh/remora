import { ApiUsageSummary, DashboardSummary, Memory, ApiKeyItem, ProjectItem, MetricsSummary } from './types';

const backendEnv = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_REMORA_API_URL || 'http://localhost:4003';
export const API_BASE_URL = backendEnv.replace(/\/api\/?$/, '');

export const INITIAL_PROJECTS: ProjectItem[] = [];
export const INITIAL_MEMORIES: Memory[] = [];
export const INITIAL_API_KEYS: ApiKeyItem[] = [];
let sessionToken: string | null = null;

function dashboardHeaders(): HeadersInit {
  return sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
}

export const INITIAL_METRICS: MetricsSummary = {
  totalMemories: 0,
  activeUsers: 0,
  ingestedTokens: 0,
  p95LatencyMs: null,
  cacheHitRatePercent: null,
  typeDistribution: {
    SEMANTIC: 0,
    FACT: 0,
    PROCEDURAL: 0,
    EPISODIC: 0
  }
};

export const apiService = {
  setSessionToken(token: string | null) {
    sessionToken = token;
  },

  async checkHealth(): Promise<{ online: boolean; latencyMs: number }> {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2500) });
      const latencyMs = Math.round(performance.now() - start);
      return { online: res.ok, latencyMs };
    } catch {
      return { online: false, latencyMs: 0 };
    }
  },

  async syncUserSession(clerkId: string, email: string, name?: string): Promise<{ user: any; organization: any; project: any; projects: ProjectItem[] } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...dashboardHeaders() },
        body: JSON.stringify({ clerkId, email, name }),
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) throw new Error('Failed to sync user with backend');
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.warn('Backend syncUserSession error:', err);
      return null;
    }
  },

  async fetchProjects(organizationId?: string): Promise<ProjectItem[]> {
    try {
      const url = organizationId 
        ? `${API_BASE_URL}/api/projects?organizationId=${organizationId}`
        : `${API_BASE_URL}/api/projects`;
      const res = await fetch(url, { headers: dashboardHeaders(), signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      return data.data || data.projects || data || [];
    } catch {
      return [];
    }
  },

  async createProject(organizationId: string, name: string): Promise<ProjectItem | null> {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...dashboardHeaders() },
        body: JSON.stringify({ organizationId, name, slug }),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error('Failed to create project');
      const data = await res.json();
      return data.data || data.project || data;
    } catch (err) {
      console.warn('Error creating project in backend:', err);
      return null;
    }
  },

  async fetchProjectMetrics(projectId: string): Promise<MetricsSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/metrics`, { headers: dashboardHeaders(), signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('Failed to fetch metrics');
      const data = await res.json();
      const m = data.data || data.metrics || {};
      
      const typeDist: { SEMANTIC: number; EPISODIC: number; PROCEDURAL: number; FACT: number } = {
        SEMANTIC: 0,
        FACT: 0,
        PROCEDURAL: 0,
        EPISODIC: 0
      };

      if (Array.isArray(m.memoriesByType)) {
        m.memoriesByType.forEach((item: any) => {
          const count = Number(item.count) || 0;
          const t = String(item.type || '').toUpperCase();
          if (t === 'FACT') typeDist.FACT += count;
          else if (t === 'INSTRUCTION' || t === 'PROCEDURAL') typeDist.PROCEDURAL += count;
          else if (t === 'PROJECT_CONTEXT' || t === 'EPISODIC' || t === 'DECISION') typeDist.EPISODIC += count;
          else typeDist.SEMANTIC += count; // PREFERENCE, PROFILE, GOAL, etc.
        });
      }

      return {
         totalMemories: m.activeMemories ?? m.totalMemories ?? 0,
        activeUsers: m.activeUsers ?? 0,
        ingestedTokens: m.ingestedTokens ?? 0,
         p95LatencyMs: m.p95LatencyMs ?? null,
         cacheHitRatePercent: m.cacheHitRate ?? m.cacheHitRatePercent ?? null,
         typeDistribution: typeDist
       };
    } catch {
      return INITIAL_METRICS;
    }
  },

  async fetchDashboardSummary(projectId: string): Promise<DashboardSummary | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/dashboard-summary`, {
        headers: dashboardHeaders(),
        signal: AbortSignal.timeout(6000),
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard summary');
      const json = await res.json();
      const data = json.data || json;
      return {
        metrics: normalizeMetrics(data.metrics),
        memories: normalizeMemories(data.memories || []),
        apiKeys: data.apiKeys || []
      };
    } catch (err) {
      console.warn('Backend fetchDashboardSummary error:', err);
      return null;
    }
  },

  async fetchProjectUsage(projectId: string, days = 30): Promise<ApiUsageSummary | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/usage?days=${days}`, {
        headers: dashboardHeaders(),
        signal: AbortSignal.timeout(5000),
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed to fetch API usage');
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.warn('Backend fetchProjectUsage error:', err);
      return null;
    }
  },

  async fetchApiKeys(projectId: string): Promise<ApiKeyItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/keys/project/${projectId}`, { headers: dashboardHeaders(), signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('Failed to fetch api keys');
      const data = await res.json();
      return data.data || data.apiKeys || data || [];
    } catch {
      return [];
    }
  },

  async createApiKey(projectId: string, name: string, isLive = true): Promise<{ rawKey: string; key: ApiKeyItem } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...dashboardHeaders() },
        body: JSON.stringify({ projectId, name, isLive }),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error('Failed to generate key in DB');
      const json = await res.json();
      const result = json.data || json;
      return {
        rawKey: result.apiKey || result.rawKey,
        key: {
          id: result.id,
          projectId,
          name: result.name,
          prefix: result.prefix,
          lastUsedAt: null,
          createdAt: result.createdAt
        }
      };
    } catch (err) {
      console.warn('Backend createApiKey error:', err);
      return null;
    }
  },

  async revokeApiKey(keyId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/keys/${keyId}/revoke`, {
        method: 'POST',
        headers: dashboardHeaders(),
        signal: AbortSignal.timeout(3000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchMemories(projectId: string): Promise<Memory[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/memories`, { headers: dashboardHeaders(), signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('Failed to fetch memories');
      const data = await res.json();
      return normalizeMemories(data.data || data.memories || []);
    } catch {
      return [];
    }
  },

  async createMemory(projectId: string, memoryData: Partial<Memory>): Promise<Memory | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...dashboardHeaders() },
        body: JSON.stringify(memoryData),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error('Failed to create memory in DB');
      const json = await res.json();
      return normalizeMemory(json.data || json);
    } catch (err) {
      console.warn('Backend createMemory error:', err);
      return null;
    }
  },

  async deleteMemory(projectId: string, memoryId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/memories/${memoryId}`, {
        method: 'DELETE',
        headers: dashboardHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend deleteMemory error:', err);
      return false;
    }
  },

  async exportUserMemories(projectId: string, userId: string): Promise<{ userId: string; count: number; memories: Memory[] } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/users/${encodeURIComponent(userId)}/export`, {
        headers: dashboardHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) throw new Error('Failed to export user memories');
      const json = await res.json();
      const data = json.data || json;
      return { ...data, memories: normalizeMemories(data.memories || []) };
    } catch (err) {
      console.warn('Backend exportUserMemories error:', err);
      return null;
    }
  },

  async deleteUserMemories(projectId: string, userId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: dashboardHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend deleteUserMemories error:', err);
      return false;
    }
  },

  async searchProjectMemories(projectId: string, query: string, externalUserId: string, namespace?: string, limit = 10): Promise<{ results: any[]; latencyMs: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, externalUserId, namespace, limit }),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return data.data || { results: [], latencyMs: 0 };
    } catch (err) {
      console.warn('Backend searchProjectMemories error:', err);
      return { results: [], latencyMs: 0 };
    }
  },

  async searchMemories(apiKey: string, query: string, externalUserId: string, namespace?: string, limit = 5): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/memories/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ query, externalUserId, namespace, limit }),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return data.data?.memories || data.data?.results || data.memories || data.results || data.data || [];
    } catch (err) {
      console.warn('Backend search error:', err);
      return [];
    }
  },

  async getContext(apiKey: string, externalUserId: string, namespace?: string): Promise<string> {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/memories/context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ user_id: externalUserId, namespace }),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error('Context generation failed');
      const data = await res.json();
      return data.data?.contextText || data.data?.context || data.contextText || data.context || '';
    } catch {
      return '';
    }
  }
};

function normalizeMemory(memory: any): Memory {
  return {
    ...memory,
    lastAccessedAt: memory.lastAccessedAt || null,
    sourceType: memory.sourceType || null,
    metadata: memory.metadata || null,
    versions: (memory.versions || []).map((version: any) => ({
      ...version,
      reason: version.reason || version.changeReason || undefined
    }))
  };
}

function normalizeMemories(memories: any[]): Memory[] {
  return memories.map(normalizeMemory);
}

function normalizeMetrics(metrics: any): MetricsSummary {
  const typeDist: MetricsSummary['typeDistribution'] = {
    SEMANTIC: 0,
    FACT: 0,
    PROCEDURAL: 0,
    EPISODIC: 0
  };

  for (const item of metrics?.memoriesByType || []) {
    const count = Number(item.count) || 0;
    const type = String(item.type || '').toUpperCase();
    if (type === 'FACT') typeDist.FACT += count;
    else if (type === 'INSTRUCTION' || type === 'BEHAVIOR' || type === 'PROCEDURAL') typeDist.PROCEDURAL += count;
    else if (type === 'PROJECT_CONTEXT' || type === 'RELATIONSHIP' || type === 'TEMPORARY' || type === 'EPISODIC') typeDist.EPISODIC += count;
    else typeDist.SEMANTIC += count;
  }

  return {
    totalMemories: Number(metrics?.totalMemories ?? metrics?.activeMemories ?? 0),
    activeUsers: Number(metrics?.activeUsers ?? 0),
    ingestedTokens: Number(metrics?.ingestedTokens ?? 0),
    p95LatencyMs: metrics?.p95LatencyMs == null ? null : Number(metrics.p95LatencyMs),
    cacheHitRatePercent: metrics?.cacheHitRatePercent == null && metrics?.cacheHitRate == null
      ? null
      : Number(metrics.cacheHitRatePercent ?? metrics.cacheHitRate),
    typeDistribution: typeDist
  };
}
