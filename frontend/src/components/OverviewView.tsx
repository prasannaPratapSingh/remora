'use client';

import React from 'react';
import { 
  BrainCircuit, 
  Users, 
  Cpu, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Plus, 
  KeyRound, 
  Layers, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { MetricsSummary, ProjectItem } from '../lib/types';
import { TabType } from './Sidebar';

interface OverviewViewProps {
  metrics: MetricsSummary;
  selectedProject: ProjectItem | null;
  onNavigate: (tab: TabType) => void;
  onOpenAddMemory: () => void;
  onOpenCreateKey: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  selectedProject,
  onNavigate,
  onOpenAddMemory,
  onOpenCreateKey
}) => {
  const totalTypes = Object.values(metrics.typeDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(22, 30, 48, 0.8) 0%, rgba(13, 18, 29, 0.9) 100%)',
        border: '1px solid var(--border-highlight)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Project: {selectedProject?.name || 'No Project Selected'}
            </h1>
            <span className="badge badge-indigo">HNSW pgvector</span>
            <span className="badge badge-emerald">Online</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px' }}>
            Persistent, searchable, evolving memory layer for your AI agents. Real-time hybrid retrieval with cosine similarity and exponential recency decay.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onOpenAddMemory} className="btn-primary" id="btn-overview-add-memory">
            <Plus size={16} />
            <span>Add Memory</span>
          </button>
          <button onClick={() => onNavigate('search')} className="btn-secondary" id="btn-overview-playground">
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span>Search Playground</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Memories */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Memories</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)' }}>
              <BrainCircuit size={18} color="var(--accent-indigo)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            {metrics.totalMemories.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-emerald)' }}>
            <ArrowUpRight size={14} />
            <span>+14.2% from last week</span>
          </div>
        </div>

        {/* Active Tracked Users */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Tracked End-Users</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
              <Users size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            {metrics.activeUsers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-emerald)' }}>
            <ArrowUpRight size={14} />
            <span>Multi-tenant isolated</span>
          </div>
        </div>

        {/* Ingested Tokens & Cache */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Ingested Tokens</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
              <Cpu size={18} color="var(--accent-purple)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            {(metrics.ingestedTokens / 1000).toFixed(1)}k
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Redis hit rate:</span>
            <strong style={{ color: 'var(--accent-amber)' }}>{metrics.cacheHitRatePercent}%</strong>
          </div>
        </div>

        {/* p95 Latency */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>p95 Search Latency</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
              <Clock size={18} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            {metrics.p95LatencyMs} ms
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={14} />
            <span>Optimal vector performance</span>
          </div>
        </div>
      </div>

      {/* Memory Types & Visual Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Type Distribution Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
            Memory Type Breakdown
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Classified across semantic facts, procedural steps, and user episodic events.
          </p>

          {/* Combined Progress Bar */}
          <div style={{
            height: '12px',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '9999px',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: '20px'
          }}>
            <div style={{ width: `${(metrics.typeDistribution.SEMANTIC / totalTypes) * 100}%`, backgroundColor: '#6366f1' }} title="Semantic" />
            <div style={{ width: `${(metrics.typeDistribution.FACT / totalTypes) * 100}%`, backgroundColor: '#06b6d4' }} title="Fact" />
            <div style={{ width: `${(metrics.typeDistribution.PROCEDURAL / totalTypes) * 100}%`, backgroundColor: '#10b981' }} title="Procedural" />
            <div style={{ width: `${(metrics.typeDistribution.EPISODIC / totalTypes) * 100}%`, backgroundColor: '#a855f7' }} title="Episodic" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6366f1' }}></span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Semantic</span>
              </div>
              <strong style={{ fontSize: '14px', color: '#ffffff' }}>{metrics.typeDistribution.SEMANTIC}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4' }}></span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Facts</span>
              </div>
              <strong style={{ fontSize: '14px', color: '#ffffff' }}>{metrics.typeDistribution.FACT}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Procedural</span>
              </div>
              <strong style={{ fontSize: '14px', color: '#ffffff' }}>{metrics.typeDistribution.PROCEDURAL}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#a855f7' }}></span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Episodic</span>
              </div>
              <strong style={{ fontSize: '14px', color: '#ffffff' }}>{metrics.typeDistribution.EPISODIC}</strong>
            </div>
          </div>
        </div>

        {/* Quick Launch & SDK Architecture */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
              SDK & Integration Shortcuts
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Connect your AI agent in under 2 minutes using our official multi-language clients.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>TypeScript SDK</div>
                  <code style={{ fontSize: '12px', color: 'var(--accent-indigo)' }}>bun add @remora/sdk</code>
                </div>
                <button onClick={() => onNavigate('docs')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Docs
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Python SDK</div>
                  <code style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>pip install remora-ai</code>
                </div>
                <button onClick={() => onNavigate('docs')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Docs
                </button>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button onClick={onOpenCreateKey} className="btn-secondary" style={{ fontSize: '13px' }}>
              <KeyRound size={15} />
              <span>Create API Key</span>
            </button>
            <button onClick={() => onNavigate('gdpr')} className="btn-secondary" style={{ fontSize: '13px' }}>
              <ShieldCheck size={15} color="var(--accent-emerald)" />
              <span>GDPR Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
