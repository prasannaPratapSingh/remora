'use client';

import React from 'react';
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import { ApiUsageSummary, MetricsSummary, ProjectItem } from '../lib/types';
import { TabType } from './Sidebar';

interface OverviewViewProps {
  metrics: MetricsSummary;
  selectedProject: ProjectItem | null;
  onNavigate: (tab: TabType) => void;
  onOpenAddMemory: () => void;
  onOpenCreateKey: () => void;
  backendStatus: { online: boolean; latencyMs: number };
  isSyncing: boolean;
  lastSyncedAt: string | null;
  usage: ApiUsageSummary | null;
}

const typeMeta = [
  { key: 'SEMANTIC' as const, label: 'Semantic', color: '#7c83ff' },
  { key: 'FACT' as const, label: 'Facts', color: '#31b7d8' },
  { key: 'PROCEDURAL' as const, label: 'Procedural', color: '#35c995' },
  { key: 'EPISODIC' as const, label: 'Episodic', color: '#bd8cff' }
];

const formatCompact = (value: number) => {
  if (value < 1000) return value.toLocaleString();
  if (value < 1_000_000) return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return `${(value / 1_000_000).toFixed(1)}m`;
};

const formatSyncedTime = (value: string | null) => {
  if (!value) return 'Waiting for first sync';
  return `Updated ${new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  selectedProject,
  onNavigate,
  onOpenAddMemory,
  onOpenCreateKey,
  backendStatus,
  isSyncing,
  lastSyncedAt,
  usage
}) => {
  const totalTypes = typeMeta.reduce((total, type) => total + metrics.typeDistribution[type.key], 0);
  const healthLabel = backendStatus.online ? 'All systems operational' : 'Using cached workspace data';

  return (
    <div className="dashboard-overview animate-fade-in">
      <section className="dashboard-hero">
        <div className="dashboard-hero-glow" />
        <div className="dashboard-hero-copy">
          <div className="dashboard-eyebrow"><span className="dashboard-live-dot" /> Memory control plane</div>
          <h1>{selectedProject?.name || 'Your memory workspace'}</h1>
          <p>
            See how your agent memory is growing, search the live index, and ship integrations without leaving the control plane.
          </p>
          <div className="dashboard-hero-meta">
            <span><Database size={14} /> PostgreSQL + pgvector</span>
            <span><Zap size={14} /> Hybrid retrieval</span>
            <span><ShieldCheck size={14} /> Tenant isolated</span>
          </div>
        </div>
        <div className="dashboard-hero-actions">
          <button onClick={onOpenAddMemory} className="btn-primary"><Plus size={16} /> Add memory</button>
          <button onClick={() => onNavigate('search')} className="dashboard-quiet-button"><Search size={16} /> Search index</button>
        </div>
      </section>

      <div className="dashboard-section-heading">
        <div>
          <div className="dashboard-eyebrow">Workspace pulse</div>
          <h2>What is happening right now</h2>
        </div>
        <div className="dashboard-refresh-state">
          <span className={backendStatus.online ? 'dashboard-status-dot is-online' : 'dashboard-status-dot'} />
          <span>{isSyncing ? 'Syncing live data…' : healthLabel}</span>
          <span className="dashboard-muted">{formatSyncedTime(lastSyncedAt)}</span>
        </div>
      </div>

      <section className="dashboard-metric-grid">
        <MetricCard icon={<BrainCircuit size={18} />} label="Active memories" value={metrics.totalMemories.toLocaleString()} meta="Stored knowledge vectors" tone="indigo" />
        <MetricCard icon={<Users size={18} />} label="Tracked end users" value={metrics.activeUsers.toLocaleString()} meta="Distinct active identities" tone="cyan" />
        <MetricCard icon={<Activity size={18} />} label="Estimated tokens" value={formatCompact(metrics.ingestedTokens)} meta="Approx. content volume" tone="purple" />
        <MetricCard icon={<Activity size={18} />} label="API requests" value={formatCompact(usage?.totals.requests || 0)} meta="Last 30 days" tone="cyan" />
        <MetricCard
          icon={<Clock3 size={18} />}
          label="Search telemetry"
          value={metrics.p95LatencyMs == null ? '—' : `${metrics.p95LatencyMs} ms`}
          meta={metrics.p95LatencyMs == null ? 'Latency instrumentation pending' : 'p95 response time'}
          tone="green"
        />
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-panel dashboard-type-panel">
          <div className="dashboard-panel-heading">
            <div><div className="dashboard-eyebrow">Knowledge mix</div><h3>Memory composition</h3></div>
            <span className="dashboard-panel-count">{totalTypes.toLocaleString()} active</span>
          </div>
          <div className="dashboard-type-bar" aria-label="Memory type distribution">
            {typeMeta.map((type) => (
              <span key={type.key} style={{ width: `${totalTypes ? (metrics.typeDistribution[type.key] / totalTypes) * 100 : 0}%`, background: type.color }} />
            ))}
          </div>
          <div className="dashboard-type-grid">
            {typeMeta.map((type) => (
              <div className="dashboard-type-item" key={type.key}>
                <span className="dashboard-type-label"><span className="dashboard-type-dot" style={{ background: type.color }} />{type.label}</span>
                <strong>{metrics.typeDistribution[type.key].toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel dashboard-status-panel">
          <div className="dashboard-panel-heading">
            <div><div className="dashboard-eyebrow">Runtime health</div><h3>Pipeline status</h3></div>
            <CheckCircle2 size={20} color={backendStatus.online ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
          </div>
          <div className="dashboard-health-row"><span><span className="dashboard-status-dot is-online" /> Database</span><strong>Connected</strong></div>
          <div className="dashboard-health-row"><span><span className="dashboard-status-dot is-online" /> Vector index</span><strong>Ready</strong></div>
          <div className="dashboard-health-row"><span><span className={backendStatus.online ? 'dashboard-status-dot is-online' : 'dashboard-status-dot'} /> Backend API</span><strong>{backendStatus.online ? `${backendStatus.latencyMs}ms` : 'Offline'}</strong></div>
          <div className="dashboard-status-footer">
            {usage ? `${usage.totals.successes.toLocaleString()} successful · ${usage.totals.errors.toLocaleString()} errors in the last 30 days` : 'Usage metrics will appear after API traffic'}
          </div>
          {usage?.endpoints && Object.keys(usage.endpoints).length > 0 && (
            <div className="dashboard-usage-routes">
              {Object.entries(usage.endpoints)
                .sort(([, first], [, second]) => second - first)
                .slice(0, 3)
                .map(([endpoint, count]) => (
                  <div className="dashboard-usage-route" key={endpoint}>
                    <code>{endpoint}</code>
                    <strong>{count.toLocaleString()}</strong>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-panel dashboard-actions-panel">
        <div className="dashboard-panel-heading">
          <div><div className="dashboard-eyebrow">Build momentum</div><h3>Next best actions</h3></div>
          <ArrowUpRight size={18} color="var(--text-muted)" />
        </div>
        <div className="dashboard-action-grid">
          <ActionCard icon={<KeyRound size={18} />} title="Create an API key" description="Connect an agent or local prototype to this project." onClick={onOpenCreateKey} />
          <ActionCard icon={<Sparkles size={18} />} title="Test retrieval" description="Run a real query against the hybrid ranker." onClick={() => onNavigate('search')} />
          <ActionCard icon={<Code2 size={18} />} title="Read the SDK docs" description="Copy a TypeScript or Python integration in minutes." onClick={() => onNavigate('docs')} />
        </div>
      </section>
    </div>
  );
};

function MetricCard({ icon, label, value, meta, tone }: { icon: React.ReactNode; label: string; value: string; meta: string; tone: string }) {
  return <div className={`dashboard-metric-card tone-${tone}`}><div className="dashboard-metric-top"><span>{label}</span><span className="dashboard-metric-icon">{icon}</span></div><strong>{value}</strong><p>{meta}</p></div>;
}

function ActionCard({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return <button className="dashboard-action-card" onClick={onClick}><span className="dashboard-action-icon">{icon}</span><span><strong>{title}</strong><small>{description}</small></span><ArrowUpRight size={16} /></button>;
}
