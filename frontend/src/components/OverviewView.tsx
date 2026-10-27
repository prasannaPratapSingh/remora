'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Activity, ArrowUpRight, BrainCircuit, CheckCircle2, Clock3, Code2, Database, KeyRound, Plus, Search, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';
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

const types = [
  { key: 'SEMANTIC' as const, label: 'Semantic', color: '#5b63e8' },
  { key: 'FACT' as const, label: 'Facts', color: '#168bb3' },
  { key: 'PROCEDURAL' as const, label: 'Procedural', color: '#168c68' },
  { key: 'EPISODIC' as const, label: 'Episodic', color: '#9555c7' }
];

const compact = (value: number) => value < 1000 ? value.toLocaleString() : value < 1_000_000 ? `${(value / 1000).toFixed(value > 10_000 ? 0 : 1)}k` : `${(value / 1_000_000).toFixed(1)}m`;

export const OverviewView: React.FC<OverviewViewProps> = ({ metrics, selectedProject, onNavigate, onOpenAddMemory, onOpenCreateKey, backendStatus, isSyncing, lastSyncedAt, usage }) => {
  const totalTypes = types.reduce((sum, type) => sum + metrics.typeDistribution[type.key], 0);
  const syncLabel = isSyncing ? 'Syncing workspace' : backendStatus.online ? 'Live workspace' : 'Offline mode';

  return (
    <div className="dashboard-view dashboard-overview animate-fade-in">
      <div className="dashboard-page-intro">
        <div><span className="dashboard-eyebrow">Control plane / Overview</span><h1>Your memory workspace</h1><p>One clear place to see what your agent knows, how retrieval behaves, and where to ship next.</p></div>
        <div className="dashboard-intro-actions"><button className="dashboard-button dashboard-button-primary" onClick={onOpenAddMemory}><Plus size={16} /> Add memory</button><button className="dashboard-button dashboard-button-soft" onClick={() => onNavigate('search')}><Search size={16} /> Explore retrieval</button></div>
      </div>

      <motion.section className="dashboard-hero-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
        <div className="dashboard-hero-grid" />
        <div className="dashboard-hero-content"><div className="dashboard-live-pill"><span className={`dashboard-status-dot ${backendStatus.online ? 'is-online' : ''}`} /> {syncLabel}</div><h2>{selectedProject?.name || 'Select a project to begin'}</h2><p>Persistent context, hybrid search, and safe memory operations for the agents you are building.</p><div className="dashboard-hero-facts"><span><Database size={14} /> PostgreSQL + pgvector</span><span><Zap size={14} /> Hybrid ranking</span><span><ShieldCheck size={14} /> Tenant isolated</span></div></div>
        <div className="dashboard-hero-orbit"><div className="dashboard-orbit-ring dashboard-orbit-ring-one" /><div className="dashboard-orbit-ring dashboard-orbit-ring-two" /><div className="dashboard-orbit-core"><BrainCircuit size={30} /></div><span className="dashboard-orbit-node node-one" /><span className="dashboard-orbit-node node-two" /><span className="dashboard-orbit-node node-three" /></div>
      </motion.section>

      <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">Workspace pulse</span><h2>What is happening now</h2></div><span className="dashboard-sync-copy"><span className={`dashboard-status-dot ${backendStatus.online ? 'is-online' : ''}`} />{lastSyncedAt ? `Updated ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Waiting for first sync'}</span></div>

      <section className="dashboard-metric-grid">
        <MetricCard icon={<BrainCircuit size={18} />} label="Active memories" value={metrics.totalMemories.toLocaleString()} meta="Stored knowledge vectors" tone="blue" />
        <MetricCard icon={<Users size={18} />} label="Tracked users" value={metrics.activeUsers.toLocaleString()} meta="Distinct active identities" tone="teal" />
        <MetricCard icon={<Activity size={18} />} label="Estimated tokens" value={compact(metrics.ingestedTokens)} meta="Approx. content volume" tone="violet" />
        <MetricCard icon={<Zap size={18} />} label="API requests" value={compact(usage?.totals.requests || 0)} meta="Last 30 days" tone="orange" />
        <MetricCard icon={<Clock3 size={18} />} label="p95 latency" value={metrics.p95LatencyMs == null ? '—' : `${metrics.p95LatencyMs}ms`} meta={metrics.p95LatencyMs == null ? 'Instrumentation pending' : 'Search response time'} tone="green" />
      </section>

      <section className="dashboard-two-column">
        <div className="dashboard-card dashboard-composition-card"><CardHeading eyebrow="Knowledge mix" title="Memory composition" aside={`${totalTypes.toLocaleString()} active`} /><div className="dashboard-type-bar">{types.map((type) => <span key={type.key} style={{ width: `${totalTypes ? metrics.typeDistribution[type.key] / totalTypes * 100 : 0}%`, backgroundColor: type.color }} />)}</div><div className="dashboard-type-grid">{types.map((type) => <div className="dashboard-type-row" key={type.key}><span><i style={{ backgroundColor: type.color }} />{type.label}</span><strong>{metrics.typeDistribution[type.key].toLocaleString()}</strong></div>)}</div></div>
        <div className="dashboard-card dashboard-health-card"><CardHeading eyebrow="Runtime health" title="Pipeline status" aside={<CheckCircle2 size={19} className={backendStatus.online ? 'dashboard-icon-success' : 'dashboard-icon-warning'} />} /><HealthRow label="Database" value="Connected" good /><HealthRow label="Vector index" value="Ready" good /><HealthRow label="Backend API" value={backendStatus.online ? `${backendStatus.latencyMs}ms` : 'Offline'} good={backendStatus.online} /><div className="dashboard-health-footer">{usage ? `${usage.totals.successes.toLocaleString()} successful · ${usage.totals.errors.toLocaleString()} errors` : 'Usage metrics appear after API traffic'}</div></div>
      </section>

      <section className="dashboard-card dashboard-actions-card"><CardHeading eyebrow="Build momentum" title="Next best actions" aside={<ArrowUpRight size={18} />} /><div className="dashboard-action-grid"><ActionCard icon={<KeyRound size={17} />} title="Create an API key" description="Connect an agent or local prototype." onClick={onOpenCreateKey} /><ActionCard icon={<Sparkles size={17} />} title="Test retrieval" description="Run a real query against your ranker." onClick={() => onNavigate('search')} /><ActionCard icon={<Code2 size={17} />} title="Read the SDK docs" description="Copy a TypeScript or Python integration." onClick={() => onNavigate('docs')} /></div></section>
    </div>
  );
};

function CardHeading({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: React.ReactNode }) { return <div className="dashboard-card-heading"><div><span className="dashboard-eyebrow">{eyebrow}</span><h3>{title}</h3></div>{aside && <span className="dashboard-card-aside">{aside}</span>}</div>; }
function MetricCard({ icon, label, value, meta, tone }: { icon: React.ReactNode; label: string; value: string; meta: string; tone: string }) { return <motion.div className={`dashboard-metric-card metric-${tone}`} whileHover={{ y: -3 }} transition={{ duration: .2 }}><div className="dashboard-metric-top"><span>{label}</span><span className="dashboard-metric-icon">{icon}</span></div><strong>{value}</strong><small>{meta}</small></motion.div>; }
function HealthRow({ label, value, good }: { label: string; value: string; good: boolean }) { return <div className="dashboard-health-row"><span><i className={`dashboard-status-dot ${good ? 'is-online' : ''}`} />{label}</span><strong>{value}</strong></div>; }
function ActionCard({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) { return <button className="dashboard-action-card" onClick={onClick}><span className="dashboard-action-icon">{icon}</span><span><strong>{title}</strong><small>{description}</small></span><ArrowUpRight size={16} /></button>; }
