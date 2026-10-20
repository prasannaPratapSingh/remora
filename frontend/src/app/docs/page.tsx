'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { 
  BookOpen, 
  Terminal, 
  Code2, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function DocsPage() {
  const [activeTopic, setActiveTopic] = useState<'quickstart' | 'typescript' | 'python' | 'hybrid' | 'api' | 'gdpr'>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const navCategories = [
    {
      title: 'GETTING STARTED',
      items: [
        { id: 'quickstart' as const, label: 'Overview & Quickstart' },
        { id: 'hybrid' as const, label: 'Hybrid Ranking & Math' }
      ]
    },
    {
      title: 'OFFICIAL CLIENT SDKS',
      items: [
        { id: 'typescript' as const, label: 'TypeScript (@remora/sdk)' },
        { id: 'python' as const, label: 'Python (remora-ai)' }
      ]
    },
    {
      title: 'API & ENTERPRISE',
      items: [
        { id: 'api' as const, label: 'REST API Endpoints' },
        { id: 'gdpr' as const, label: 'GDPR & Data Subject Rights' }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
        {/* Left Docs Navigation */}
        <aside style={{
          width: '280px',
          borderRight: '1px solid var(--border-subtle)',
          padding: '32px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'sticky',
          top: '68px',
          height: 'calc(100vh - 68px)',
          overflowY: 'auto'
        }}>
          {navCategories.map((cat, idx) => (
            <div key={idx}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '10px' }}>
                {cat.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {cat.items.map(item => {
                  const isActive = activeTopic === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTopic(item.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{item.label}</span>
                      {isActive && <ChevronRight size={14} color="var(--accent-indigo)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{
            marginTop: 'auto',
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px'
          }}>
            <p style={{ color: '#ffffff', fontWeight: 600, marginBottom: '4px' }}>Need Live API Testing?</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Access interactive Scalar OpenAPI Explorer.</p>
            <a
              href="http://localhost:4000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '11px', width: '100%' }}
            >
              <ExternalLink size={12} />
              <span>Scalar UI (/docs)</span>
            </a>
          </div>
        </aside>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
          {activeTopic === 'quickstart' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>Getting Started</span>
                <h1 className="editorial-title" style={{ fontSize: '36px', color: '#ffffff', marginBottom: '12px' }}>
                  Remora Architecture & Quickstart
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Remora is a developer-first memory infrastructure layer that provides long-term, self-evolving memory for LLMs and AI Agents without requiring you to build custom vector pipelines, chunkers, or deduplicators.
                </p>
              </div>

              {/* Core Philosophy Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  Why Chat History is Not Memory
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                  Stuffing 50 raw turns into an LLM prompt inflates token bills, dilutes attention, and hits context limits. Remora continuously distills interactions into 4 structured knowledge types:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <strong style={{ color: '#a5b4fc', fontSize: '13px' }}>1. Semantic</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Preferences, personality traits, and user profiles.</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                    <strong style={{ color: '#67e8f9', fontSize: '13px' }}>2. Facts</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Immutable knowledge, medical allergies, specs.</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <strong style={{ color: '#6ee7b7', fontSize: '13px' }}>3. Procedural</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Step-by-step user workflows and coding conventions.</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <strong style={{ color: '#d8b4fe', fontSize: '13px' }}>4. Episodic</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Specific timestamped events and key conversation milestones.</p>
                  </div>
                </div>
              </div>

              {/* Flow diagram preview */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
                  The 3-Step Integration Flow
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>1</span>
                    <div>
                      <strong style={{ color: '#ffffff' }}>Ingest:</strong> Send raw conversation or facts to Remora. (Sync or 202 Accepted via Redis BullMQ).
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>2</span>
                    <div>
                      <strong style={{ color: '#ffffff' }}>Index & Deduplicate:</strong> Remora generates 1536-dim vector embeddings, detects semantic duplicates (&gt;0.93 similarity), merges, and version audits.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>3</span>
                    <div>
                      <strong style={{ color: '#ffffff' }}>Retrieve & Inject:</strong> Call <code style={{ color: 'var(--accent-emerald)' }}>remora.context(userId)</code> to get a compact formatted prompt block ready for your LLM.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'hybrid' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '10px' }}>Ranking Mathematics</span>
                <h1 className="editorial-title" style={{ fontSize: '36px', color: '#ffffff', marginBottom: '12px' }}>
                  Hybrid Retrieval & Recency Decay
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Why cosine similarity alone fails in production AI assistants, and how Remora's adaptive hybrid score works.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  The 4-Factor Hybrid Formula
                </h2>
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-highlight)',
                  fontSize: '15px',
                  color: '#67e8f9',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '16px'
                }}>
                  Score = (0.55 · sim) + (0.20 · imp) + (0.15 · conf) + (0.10 · recency)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div>
                    <strong style={{ color: '#ffffff' }}>• Cosine Similarity (sim):</strong> Distance of 1536-dim vector calculated in Neon pgvector via HNSW index: <code style={{ color: 'var(--accent-indigo)' }}>1 - (embedding &lt;=&gt; query_vector)</code>.
                  </div>
                  <div>
                    <strong style={{ color: '#ffffff' }}>• Importance Weight (imp):</strong> Critical facts (allergies, credit limits, system rules) are prioritized over casual chatter.
                  </div>
                  <div>
                    <strong style={{ color: '#ffffff' }}>• Confidence Score (conf):</strong> Extraction confidence rating (0.0 to 1.0).
                  </div>
                  <div>
                    <strong style={{ color: '#ffffff' }}>• Recency Decay Factor (recency):</strong> Exponential decay calculated as: <code style={{ color: 'var(--accent-cyan)' }}>exp(-lambda · delta_t)</code> where delta_t is hours since last memory access.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'typescript' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>npm package</span>
                <h1 className="editorial-title" style={{ fontSize: '36px', color: '#ffffff', marginBottom: '12px' }}>
                  TypeScript SDK (@remora/sdk)
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                  Fully typed TypeScript/JavaScript client built for Bun, Node.js, Next.js, and Cloudflare Workers.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>Installation</h2>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <pre style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '8px', color: '#c7d2fe', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                    bun add @remora/sdk  # or npm install @remora/sdk
                  </pre>
                  <button onClick={() => copy('bun add @remora/sdk', 'ts-install')} className="btn-secondary" style={{ position: 'absolute', right: '10px', top: '10px', padding: '4px 8px', fontSize: '11px' }}>
                    {copiedCode === 'ts-install' ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                  </button>
                </div>

                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>Example Usage</h2>
                <pre style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '18px', borderRadius: '8px', color: '#f8fafc', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6', overflowX: 'auto' }}>
{`import { RemoraClient } from "@remora/sdk";

const remora = new RemoraClient({
  apiKey: process.env.REMORA_API_KEY!,
  baseUrl: "http://localhost:4000"
});

// Add memory
const mem = await remora.add({
  externalUserId: "user_42",
  content: "User prefers vegetarian meals and dark mode interface.",
  namespace: "preferences",
  type: "SEMANTIC",
  importance: 0.95
});

// Search memories
const results = await remora.search({
  query: "What dietary options does the user like?",
  externalUserId: "user_42",
  limit: 5
});

// Format LLM System Prompt Context
const context = await remora.context("user_42");
console.log(context);`}
                </pre>
              </div>
            </div>
          )}

          {activeTopic === 'python' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '10px' }}>PyPI package</span>
                <h1 className="editorial-title" style={{ fontSize: '36px', color: '#ffffff', marginBottom: '12px' }}>
                  Python SDK (remora-ai)
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                  Zero-dependency standard-library Python client. Compatible with LangChain, CrewAI, LlamaIndex, and OpenAI.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>Installation</h2>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <pre style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '8px', color: '#a5f3fc', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                    pip install remora-ai
                  </pre>
                  <button onClick={() => copy('pip install remora-ai', 'py-install')} className="btn-secondary" style={{ position: 'absolute', right: '10px', top: '10px', padding: '4px 8px', fontSize: '11px' }}>
                    {copiedCode === 'py-install' ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                  </button>
                </div>

                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>Example Usage</h2>
                <pre style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '18px', borderRadius: '8px', color: '#f8fafc', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6', overflowX: 'auto' }}>
{`from remora import RemoraClient

remora = RemoraClient(
    api_key="rl_live_your_key_here",
    base_url="http://localhost:4000"
)

# Ingest memory
mem = remora.add(
    external_user_id="user_42",
    content="User is allergic to penicillin.",
    namespace="medical",
    importance=0.98
)

# Search
results = remora.search(
    query="prescriptions and allergy safety",
    external_user_id="user_42"
)

for item in results:
    print(f"[{item.combined_score:.3f}] {item.content}")`}
                </pre>
              </div>
            </div>
          )}

          {activeTopic === 'api' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '10px' }}>HTTP REST Specification</span>
                <h1 className="editorial-title" style={{ fontSize: '36px', color: '#ffffff', marginBottom: '12px' }}>
                  REST API Endpoints Reference
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                  All <code style={{ color: 'var(--accent-indigo)' }}>/v1/memories</code> endpoints require a Bearer API token: <code style={{ color: 'var(--accent-indigo)' }}>Authorization: Bearer rl_live_...</code>
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>METHOD</th>
                      <th style={{ padding: '12px' }}>ENDPOINT</th>
                      <th style={{ padding: '12px' }}>DESCRIPTION</th>
                      <th style={{ padding: '12px' }}>AUTH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { m: 'POST', p: '/v1/memories', d: 'Ingest and embed a new memory vector (with dedup)', a: 'Bearer Key' },
                      { m: 'POST', p: '/v1/memories/ingest', d: 'Async ingestion (202 Accepted via BullMQ worker)', a: 'Bearer Key' },
                      { m: 'POST', p: '/v1/memories/search', d: 'Hybrid semantic vector search with recency decay', a: 'Bearer Key' },
                      { m: 'POST', p: '/v1/memories/context', d: 'Generate compact system prompt context for LLMs', a: 'Bearer Key' },
                      { m: 'GET', p: '/v1/memories', d: 'List paginated memories for an end-user', a: 'Bearer Key' },
                      { m: 'DELETE', p: '/v1/memories/users/:userId', d: 'GDPR Right to Be Forgotten user wipe', a: 'Bearer Key' },
                      { m: 'GET', p: '/v1/memories/users/:userId/export', d: 'GDPR data portability JSON archive export', a: 'Bearer Key' },
                      { m: 'POST', p: '/api/keys', d: 'Developer platform: generate new API Key', a: 'Session' },
                      { m: 'GET', p: '/api/projects', d: 'Developer platform: list organization projects', a: 'Session' }
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${row.m === 'POST' ? 'badge-indigo' : row.m === 'GET' ? 'badge-emerald' : 'badge-rose'}`}>
                            {row.m}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                          {row.p}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          {row.d}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '11px' }}>
                          {row.a}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTopic === 'gdpr' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '10px' }}>Security & Legal</span>
                <h1 className="editorial-title" style={{ fontSize: '36px', color: '#ffffff', marginBottom: '12px' }}>
                  GDPR & CCPA Data Compliance
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                  Remora includes built-in endpoints complying with international privacy regulations.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Article 17: Right to Be Forgotten</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Executing <code style={{ color: 'var(--accent-rose)' }}>DELETE /v1/memories/users/:userId</code> permanently cascade deletes all memory vectors, version audit records, and cached context strings across the database and Redis instances for that end-user.
                </p>

                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginTop: '10px' }}>Article 20: Data Portability</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Calling <code style={{ color: 'var(--accent-cyan)' }}>GET /v1/memories/users/:userId/export</code> returns a standardized JSON archive containing all memories, metadata, timestamps, and revision histories for compliance requests.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
