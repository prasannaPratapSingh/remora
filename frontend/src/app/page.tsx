'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { 
  BrainCircuit, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  Database, 
  ShieldCheck, 
  KeyRound, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Zap,
  Clock,
  Code2
} from 'lucide-react';

export default function LandingPage() {
  const [activeCodeTab, setActiveCodeTab] = useState<'ts' | 'py'>('ts');
  const [copiedCode, setCopiedCode] = useState(false);

  const tsCode = `import { RemoraClient } from "@remora/sdk";

const remora = new RemoraClient({
  apiKey: process.env.REMORA_API_KEY!
});

// 1. Ingest conversational turn (auto-deduplicated & embedded)
await remora.add({
  externalUserId: "user_alex",
  content: "User strictly prefers Tailwind and TypeScript for web projects.",
  type: "SEMANTIC",
  importance: 0.95
});

// 2. Retrieve formatted context for your LLM system prompt
const context = await remora.context("user_alex");
// Injects: <user_context>[User: user_alex] 1. ...</user_context>`;

  const pyCode = `from remora import RemoraClient

remora = RemoraClient(api_key="rl_live_your_key_here")

# 1. Ingest memory
mem = remora.add(
    external_user_id="user_alex",
    content="User is a senior backend engineer using Bun and PostgreSQL.",
    namespace="preferences",
    importance=0.95
)

# 2. Hybrid search with recency decay
results = remora.search(
    query="developer preferred tech stack",
    external_user_id="user_alex"
)

# 3. Compact context injection
prompt_ctx = remora.context("user_alex")`;

  const copyCode = () => {
    navigator.clipboard.writeText(activeCodeTab === 'ts' ? tsCode : pyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 60px',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Release Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '28px'
        }}>
          <Sparkles size={14} color="var(--accent-indigo)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#c7d2fe' }}>
            Remora v1.0 — Enterprise AI Memory Infrastructure
          </span>
          <span style={{ color: 'var(--accent-cyan)', fontSize: '12px' }}>→</span>
        </div>

        {/* Editorial Serif Main Headline */}
        <h1 className="editorial-title" style={{
          fontSize: 'clamp(40px, 6vw, 68px)',
          color: '#ffffff',
          maxWidth: '920px',
          marginBottom: '20px',
          lineHeight: '1.1'
        }}>
          Give your AI agents <span className="font-serif-italic" style={{ color: '#a5b4fc' }}>persistent</span>, self-evolving memory.
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 19px)',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          lineHeight: '1.6',
          marginBottom: '36px'
        }}>
          The long-term memory layer for LLM applications. Automatically extract, vector-index, deduplicate, and recall structured user knowledge across sessions with zero added chat latency.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
          <Link href="/auth/signup" className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>
            <span>Create Developer Workspace</span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard" className="btn-secondary" style={{ padding: '12px 20px', fontSize: '15px' }}>
            <span>Open Live Console Demo</span>
          </Link>
          <Link href="/docs" className="btn-secondary" style={{ padding: '12px 20px', fontSize: '15px' }}>
            <span>Read Docs</span>
          </Link>
        </div>

        {/* Interactive Code & Architecture Terminal Card */}
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '860px',
          textAlign: 'left',
          overflow: 'hidden',
          boxShadow: '0 20px 50px -10px rgba(0,0,0,0.7), 0 0 30px rgba(99, 102, 241, 0.15)'
        }}>
          {/* Window Header */}
          <div style={{
            padding: '12px 18px',
            backgroundColor: 'rgba(13, 18, 29, 0.95)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
                remora-agent-integration.{activeCodeTab}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setActiveCodeTab('ts')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: activeCodeTab === 'ts' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: activeCodeTab === 'ts' ? '#c7d2fe' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                TypeScript
              </button>
              <button
                onClick={() => setActiveCodeTab('py')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: activeCodeTab === 'py' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                  color: activeCodeTab === 'py' ? '#a5f3fc' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Python
              </button>
              <button
                onClick={copyCode}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px', marginLeft: '6px' }}
                title="Copy code"
              >
                {copiedCode ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Code Window */}
          <pre style={{
            padding: '24px',
            backgroundColor: 'rgba(7, 9, 14, 0.95)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            color: activeCodeTab === 'ts' ? '#e0e7ff' : '#cffafe',
            lineHeight: '1.65',
            overflowX: 'auto'
          }}>
            {activeCodeTab === 'ts' ? tsCode : pyCode}
          </pre>
        </div>
      </section>

      {/* Social Proof & Metrics Strip */}
      <section style={{
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(13, 18, 29, 0.4)',
        padding: '28px 24px'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>1536-dim</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>HNSW Vector pgvector Index</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-emerald)' }}>42 ms</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>p95 Semantic Retrieval</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-indigo)' }}>0.93 sim</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Auto-Deduplication & Merge</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-cyan)' }}>0 ms</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Added Chat Latency (BullMQ)</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>Capabilities</span>
          <h2 className="editorial-title" style={{ fontSize: '38px', color: '#ffffff', marginBottom: '12px' }}>
            Built for mission-critical AI applications
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
            Everything needed to manage persistent agent state, tenant isolation, and prompt context.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Layers size={22} color="var(--accent-indigo)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              4-Tier Knowledge Distillation
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Memories are classified into Semantic (traits), Facts (specifications), Procedural (workflows), and Episodic (events), preventing context pollution.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Sparkles size={22} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Adaptive Hybrid Ranker
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Cosine similarity is weighted with importance scores, confidence ratings, and exponential recency decay so critical facts never get lost.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Zap size={22} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Non-Blocking 202 Ingestion
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Offload extraction and embedding creation to background BullMQ workers. Your chatbot responds instantly while memories index in background.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <ShieldCheck size={22} color="var(--accent-amber)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              GDPR & Privacy Compliance
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Built-in Article 17 "Forget User" cascade deletion and Article 20 JSON data portability export endpoints ready for enterprise audits.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <KeyRound size={22} color="var(--accent-purple)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Two-Tier Auth & Key Hashing
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Developers manage workspaces via session auth, while AI agents communicate statelessly via SHA-256 hashed Bearer keys (<code style={{ color: '#c7d2fe' }}>rl_live_*</code>).
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Database size={22} color="var(--accent-rose)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Strict Multi-Tenant Scoping
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Composite SQL scoping by Organization, Project, and External User ID guarantees that zero cross-tenant vector leakage ever occurs.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '80px 24px',
        backgroundColor: 'rgba(13, 18, 29, 0.4)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '10px' }}>Simple Pricing</span>
          <h2 className="editorial-title" style={{ fontSize: '38px', color: '#ffffff', marginBottom: '12px' }}>
            Start free, scale seamlessly
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '48px' }}>
            Transparent developer pricing designed to grow with your agent traffic.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', textAlign: 'left' }}>
            {/* Free Tier */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Developer</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>For prototypes and side projects.</p>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>$0 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ forever</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Up to 100,000 vector memories</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Full TypeScript & Python SDKs</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Interactive Search Playground</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Community Discord Support</li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary" style={{ width: '100%', padding: '10px', textAlign: 'center' }}>
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="glass-panel" style={{ padding: '32px', borderColor: 'var(--border-highlight)', backgroundColor: 'rgba(22, 32, 53, 0.85)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Production</h3>
                <span className="badge badge-indigo">Most Popular</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>For production AI agents and apps.</p>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>$49 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ month</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> 2,000,000 vector memories</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Asynchronous BullMQ Ingestion</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Hot Redis 7 Context Caching</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Automated TTL Expiration Cron</li>
              </ul>
              <Link href="/auth/signup" className="btn-primary" style={{ width: '100%', padding: '10px', textAlign: 'center' }}>
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Enterprise</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>For large scale fleets & VPCs.</p>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>Custom</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Unlimited memories & projects</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> Dedicated Neon pgvector VPC</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> 99.99% Uptime SLA & BAA</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="var(--accent-emerald)" /> SAML SSO & Dedicated Architect</li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary" style={{ width: '100%', padding: '10px', textAlign: 'center' }}>
                Contact Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 24px 40px',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BrainCircuit size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Remora</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: '1.5' }}>
              Open-core AI memory infrastructure layer for production agents and LLMs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', fontSize: '13px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <strong style={{ color: '#ffffff' }}>Product</strong>
              <Link href="/#features" style={{ color: 'var(--text-secondary)' }}>Features</Link>
              <Link href="/docs" style={{ color: 'var(--text-secondary)' }}>Documentation</Link>
              <Link href="/#pricing" style={{ color: 'var(--text-secondary)' }}>Pricing</Link>
              <Link href="/dashboard" style={{ color: 'var(--text-secondary)' }}>Console</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <strong style={{ color: '#ffffff' }}>SDKs</strong>
              <Link href="/docs" style={{ color: 'var(--text-secondary)' }}>TypeScript (@remora/sdk)</Link>
              <Link href="/docs" style={{ color: 'var(--text-secondary)' }}>Python (remora-ai)</Link>
              <a href="http://localhost:4000/docs" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>
                OpenAPI Reference
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <strong style={{ color: '#ffffff' }}>Legal</strong>
              <Link href="/docs" style={{ color: 'var(--text-secondary)' }}>GDPR Compliance</Link>
              <Link href="/docs" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
              <Link href="/docs" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <span>© 2026 Remora AI Inc. All rights reserved.</span>
          <span>Crafted with Neon pgvector, Redis, and Next.js.</span>
        </div>
      </footer>
    </div>
  );
}
