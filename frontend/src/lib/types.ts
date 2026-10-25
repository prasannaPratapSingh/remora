export type MemoryType = 
  | 'FACT'
  | 'PREFERENCE'
  | 'GOAL'
  | 'INSTRUCTION'
  | 'DECISION'
  | 'PROFILE'
  | 'PROJECT_CONTEXT'
  | 'OTHER'
  | 'SEMANTIC'
  | 'EPISODIC'
  | 'PROCEDURAL';
export type MemoryStatus = 'ACTIVE' | 'ARCHIVED' | 'EXPIRED' | 'SUPERSEDED' | 'DELETED';

export interface Memory {
  id: string;
  organizationId: string;
  projectId: string;
  externalUserId: string;
  namespace: string;
  content: string;
  type: MemoryType;
  status: MemoryStatus;
  importance: number;
  confidence: number;
  sourceType: string | null;
  sourceId?: string | null;
  metadata?: Record<string, any> | null;
  lastAccessedAt: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  similarity?: number;
  combinedScore?: number;
  decayFactor?: number;
  versions?: MemoryVersion[];
}

export interface MemoryVersion {
  id: string;
  memoryId: string;
  content: string;
  importance: number;
  confidence: number;
  reason?: string;
  createdAt: string;
}

export interface ApiKeyItem {
  id: string;
  projectId: string;
  name: string;
  prefix: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface MetricsSummary {
  totalMemories: number;
  activeUsers: number;
  ingestedTokens: number;
  p95LatencyMs: number | null;
  cacheHitRatePercent: number | null;
  typeDistribution: {
    SEMANTIC: number;
    EPISODIC: number;
    PROCEDURAL: number;
    FACT: number;
  };
}

export interface DashboardSummary {
  metrics: MetricsSummary & {
    activeMemories?: number;
    supersededMemories?: number;
    archivedMemories?: number;
    totalActiveApiKeys?: number;
  };
  memories: Memory[];
  apiKeys: ApiKeyItem[];
}

export interface ApiUsageSummary {
  projectId: string;
  days: Array<{
    date: string;
    requests: number;
    successes: number;
    errors: number;
    totalLatencyMs: number;
  }>;
  endpoints?: Record<string, number>;
  statusCodes?: Record<string, number>;
  totals: {
    requests: number;
    successes: number;
    errors: number;
    totalLatencyMs: number;
  };
}
