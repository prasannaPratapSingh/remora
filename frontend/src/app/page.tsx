'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cooperBt } from './fonts';
import { Navbar } from '../components/Navbar';
import { HeroMemoryFlow } from '../components/HeroMemoryFlow';
import { AtlanHeroArchitecture } from '../components/AtlanHeroArchitecture';
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

const headlineLine2 = [
  { text: 'Give' },
  { text: 'your' },
  { text: 'AI' },
  { text: 'agents' },
];

const headlineLine3 = [
  { text: 'continuous' },
  { text: 'memory.' },
];

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
  type: "PREFERENCE",
  importance: 0.95
});

// 2. Retrieve formatted context for your LLM system prompt
const context = await remora.context({
  userId: "user_alex",
  query: "recommend a frontend framework"
});
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
prompt_ctx = remora.context(user_id="user_alex", query="tech stack")`;

  const copyCode = () => {
    navigator.clipboard.writeText(activeCodeTab === 'ts' ? tsCode : pyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%',
      backgroundColor: '#FAFAF9', 
      color: '#0f172a', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* Sticky Glassmorphic Navbar */}
      <Navbar theme="light" />

      {/* Hero Section Container with Dithered Cloudscape & Editorial Background */}
      <div className="remora-hero-wrapper">
        {/* Dithered Cloudscape Background Layer */}
        <div className="remora-hero-bg-clouds" />

        {/* Subtle Matrix Grid Overlay */}
        <div className="remora-hero-grid-overlay" />

        {/* Soft Ambient Text Glow */}
        <div className="remora-hero-glow" />

        <section style={{
          padding: '116px 24px 0',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Top Hero Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '820px', width: '100%', paddingTop: '8px' }}>
            {/* Main Headline: Cooper BT with Word-by-Word Staggering */}
            <h1 
              className={`hero-cooper-title ${cooperBt.className}`}
              style={{
                fontFamily: `${cooperBt.style.fontFamily}, 'Cooper BT', Georgia, serif`,
                fontSize: 'clamp(28px, 3.6vw, 48px)',
                fontWeight: 400,
                color: '#0f172a',
                marginBottom: '18px',
                lineHeight: '1.36',
                letterSpacing: '-0.02em'
              }}
            >
              <span style={{ display: 'inline-block' }}>
                <motion.span
                  initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'inline-block', marginRight: '0.28em' }}
                >
                  Stop
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.85, delay: 0.20, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'inline-block', marginRight: '0.28em' }}
                >
                  building
                </motion.span>
                {/* user_memories and tables. guaranteed in the same line */}
                <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      marginRight: '0.28em',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.84em',
                      fontWeight: 600,
                      lineHeight: '1.25',
                      verticalAlign: 'baseline'
                    }}
                  >
                    {/* Base text layer: floats in cleanly with the headline */}
                    <motion.span
                      initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        color: '#1e293b'
                      }}
                    >
                      user_memories
                    </motion.span>

                    {/* Overlay layer: Blue box + crisp white text sweeping left-to-right via clipPath */}
                    <motion.span
                      initial={{ clipPath: 'inset(0 100% 0 0 round 5px)' }}
                      animate={{ clipPath: 'inset(0 0% 0 0 round 5px)' }}
                      transition={{ duration: 0.65, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        padding: '2px 10px',
                        borderRadius: '5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(37, 99, 235, 0.35)',
                        pointerEvents: 'none',
                        zIndex: 2
                      }}
                    >
                      user_memories
                    </motion.span>
                  </span>
                  <motion.span
                    initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.85, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: 'inline-block' }}
                  >
                    tables.
                  </motion.span>
                </span>
              </span>
              <br />
              {/* Line 2: Give your AI agents */}
              <span style={{ display: 'inline-block' }}>
                {headlineLine2.map((item, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.85,
                      delay: 0.48 + idx * 0.08,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    style={{
                      display: 'inline-block',
                      marginRight: '0.28em'
                    }}
                  >
                    {item.text}
                  </motion.span>
                ))}
              </span>
              <br />
              {/* Line 3: continuous memory. */}
              <span style={{ display: 'inline-block', fontSize: 'calc(1em - 5px)' }}>
                {headlineLine3.map((item, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.85,
                      delay: 0.80 + idx * 0.08,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className={`font-cooper-italic ${cooperBt.className}`}
                    style={{
                      display: 'inline-block',
                      marginRight: idx === 0 ? '0.28em' : '0',
                      fontFamily: `${cooperBt.style.fontFamily}, 'Cooper BT', Georgia, serif`,
                      fontStyle: 'italic',
                      color: '#3074FE',
                      fontWeight: 400
                    }}
                  >
                    {item.text}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Subheading: Single concise line with balanced whitespace */}
            <motion.p 
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(17.5px, 1.45vw, 20px)',
                color: '#1e293b',
                fontWeight: 450,
                maxWidth: '680px',
                lineHeight: '1.6',
                marginBottom: '38px'
              }}
            >
              Self-evolving long-term memory for LLMs and autonomous fleets <br /> with sub-15ms pgvector retrieval.
            </motion.p>

            {/* Focused CTAs using Unified Decided System */}
            <motion.div 
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}
            >
              <Link 
                href="/docs" 
                style={{
                  color: '#0f172a',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '2px solid rgba(15, 23, 42, 0.25)',
                  paddingBottom: '2px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <span>See How it Works</span>
                <span style={{ color: '#3074FE' }}>→</span>
              </Link>

              <Link 
                href="/dashboard" 
                className="remora-cta-btn"
                style={{ height: '44px', paddingLeft: '22px', paddingRight: '16px', fontSize: '14.5px' }}
              >
                <span>Access Memory Console</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Bottom: Centered Architecture Visualizer Card */}
          <motion.div
            initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.0, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%' }}
          >
            <AtlanHeroArchitecture />
          </motion.div>
        </section>
      </div>

      {/* Metrics Strip */}
      <section style={{
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: '#ffffff',
        padding: '36px 24px',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)'
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
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>1536-dim</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Neon pgvector HNSW Index</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#059669', letterSpacing: '-0.02em' }}>&lt; 15 ms</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>p95 Semantic Retrieval</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#4f46e5', letterSpacing: '-0.02em' }}>0.93 sim</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Auto-Deduplication Threshold</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#0891b2', letterSpacing: '-0.02em' }}>0 ms</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Added Chat Latency (BullMQ)</div>
          </div>
        </div>
      </section>

      {/* Live SDK Integration Section */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1080px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#4f46e5',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          padding: '4px 12px',
          borderRadius: '9999px',
          display: 'inline-block',
          marginBottom: '14px'
        }}>
          Developer Experience
        </span>
        <h2 className="editorial-title" style={{ fontSize: '36px', color: '#0f172a', marginBottom: '12px' }}>
          Three lines of code to remember everything
        </h2>
        <p style={{ fontSize: '15px', color: '#475569', maxWidth: '580px', margin: '0 auto 36px', lineHeight: '1.6' }}>
          Integrates cleanly with OpenAI, Anthropic, LangChain, or raw Next.js Server Actions.
        </p>

        {/* Terminal Card */}
        <div style={{
          width: '100%',
          maxWidth: '860px',
          margin: '0 auto',
          textAlign: 'left',
          overflow: 'hidden',
          borderRadius: '16px',
          backgroundColor: '#0f172a',
          boxShadow: '0 24px 60px -15px rgba(15, 23, 42, 0.25), 0 0 1px 1px rgba(255, 255, 255, 0.1)'
        }}>
          {/* Window Header */}
          <div style={{
            padding: '12px 18px',
            backgroundColor: '#1e293b',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
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
                  backgroundColor: activeCodeTab === 'ts' ? '#334155' : 'transparent',
                  color: activeCodeTab === 'ts' ? '#ffffff' : '#94a3b8',
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
                  backgroundColor: activeCodeTab === 'py' ? '#334155' : 'transparent',
                  color: activeCodeTab === 'py' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                Python
              </button>
              <button
                onClick={copyCode}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  marginLeft: '6px',
                  backgroundColor: '#334155',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Copy code"
              >
                {copiedCode ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Code Window */}
          <pre style={{
            padding: '24px',
            backgroundColor: '#0f172a',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            color: activeCodeTab === 'ts' ? '#e2e8f0' : '#cffafe',
            lineHeight: '1.65',
            overflowX: 'auto',
            margin: 0
          }}>
            {activeCodeTab === 'ts' ? tsCode : pyCode}
          </pre>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#4f46e5',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            padding: '4px 12px',
            borderRadius: '9999px',
            display: 'inline-block',
            marginBottom: '10px'
          }}>
            Capabilities
          </span>
          <h2 className="editorial-title" style={{ fontSize: '38px', color: '#0f172a', marginBottom: '12px' }}>
            Built for mission-critical AI applications
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', maxWidth: '580px', margin: '0 auto' }}>
            Everything needed to manage persistent agent state, tenant isolation, and prompt context.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Layers size={22} color="#4f46e5" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              4-Tier Knowledge Distillation
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Memories are classified into Semantic (traits), Facts (specs), Procedural (rules), and Episodic (events), preventing context pollution.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Sparkles size={22} color="#0891b2" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Adaptive Hybrid Ranker
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Cosine similarity is weighted with importance scores, confidence ratings, and exponential recency decay so critical facts never get lost.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Zap size={22} color="#059669" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Non-Blocking 202 Ingestion
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Offload extraction and embedding creation to background BullMQ workers. Your chatbot responds instantly while memories index in background.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <ShieldCheck size={22} color="#d97706" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              GDPR & Privacy Compliance
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Built-in Article 17 "Forget User" cascade deletion and Article 20 JSON data portability export endpoints ready for enterprise audits.
            </p>
          </div>

          {/* Card 5 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <KeyRound size={22} color="#7c3aed" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Two-Tier Auth & Key Hashing
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Developers manage workspaces via session auth, while AI agents communicate statelessly via SHA-256 hashed Bearer keys (<code style={{ color: '#4f46e5' }}>rl_live_*</code>).
            </p>
          </div>

          {/* Card 6 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Database size={22} color="#e11d48" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Strict Multi-Tenant Scoping
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Composite SQL scoping by Organization, Project, and External User ID guarantees that zero cross-tenant vector leakage ever occurs.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '80px 24px',
        backgroundColor: '#f1f5f9',
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#059669',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            padding: '4px 12px',
            borderRadius: '9999px',
            display: 'inline-block',
            marginBottom: '10px'
          }}>
            Simple Pricing
          </span>
          <h2 className="editorial-title" style={{ fontSize: '38px', color: '#0f172a', marginBottom: '12px' }}>
            Start free, scale seamlessly
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', marginBottom: '48px' }}>
            Transparent developer pricing designed to grow with your agent traffic.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', textAlign: 'left' }}>
            {/* Free Tier */}
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Developer</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>For prototypes and side projects.</p>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>$0 <span style={{ fontSize: '14px', color: '#64748b' }}>/ forever</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569', marginBottom: '28px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Up to 100,000 vector memories</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Full TypeScript & Python SDKs</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Interactive Search Playground</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Community Support</li>
              </ul>
              <Link 
                href="/auth/signup" 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '11px', 
                  textAlign: 'center', 
                  backgroundColor: '#f1f5f9', 
                  color: '#0f172a', 
                  borderRadius: '8px', 
                  fontWeight: 500, 
                  textDecoration: 'none' 
                }}
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '2px solid #4f46e5', boxShadow: '0 8px 30px rgba(79, 70, 229, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Production</h3>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#4f46e5', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '9999px' }}>Most Popular</span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>For production AI agents and apps.</p>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>$49 <span style={{ fontSize: '14px', color: '#64748b' }}>/ month</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569', marginBottom: '28px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> 2,000,000 vector memories</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Asynchronous BullMQ Ingestion</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Hot Redis 7 Context Caching</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Automated TTL Expiration Cron</li>
              </ul>
              <Link 
                href="/auth/signup" 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '11px', 
                  textAlign: 'center', 
                  backgroundColor: '#0f172a', 
                  color: '#ffffff', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  textDecoration: 'none' 
                }}
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Enterprise</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>For large scale fleets & VPCs.</p>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Custom</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569', marginBottom: '28px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Unlimited memories & projects</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Dedicated Neon pgvector VPC</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> 99.99% Uptime SLA & BAA</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> SAML SSO & Dedicated Architect</li>
              </ul>
              <Link 
                href="/auth/signup" 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '11px', 
                  textAlign: 'center', 
                  backgroundColor: '#f1f5f9', 
                  color: '#0f172a', 
                  borderRadius: '8px', 
                  fontWeight: 500, 
                  textDecoration: 'none' 
                }}
              >
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
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Remora</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '280px', lineHeight: '1.5' }}>
              Open-core AI memory infrastructure layer for production agents and LLMs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', fontSize: '13px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <strong style={{ color: '#0f172a' }}>Product</strong>
              <Link href="/#features" style={{ color: '#64748b', textDecoration: 'none' }}>Features</Link>
              <Link href="/docs" style={{ color: '#64748b', textDecoration: 'none' }}>Documentation</Link>
              <Link href="/#pricing" style={{ color: '#64748b', textDecoration: 'none' }}>Pricing</Link>
              <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>Console</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <strong style={{ color: '#0f172a' }}>SDKs</strong>
              <Link href="/docs" style={{ color: '#64748b', textDecoration: 'none' }}>TypeScript (@remora/sdk)</Link>
              <Link href="/docs" style={{ color: '#64748b', textDecoration: 'none' }}>Python (remora-ai)</Link>
              <a href="http://localhost:4000/docs" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>
                OpenAPI Reference
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <strong style={{ color: '#0f172a' }}>Legal</strong>
              <Link href="/docs" style={{ color: '#64748b', textDecoration: 'none' }}>GDPR Compliance</Link>
              <Link href="/docs" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link href="/docs" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</Link>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <span>© 2026 Remora AI Inc. All rights reserved.</span>
          <span>Crafted with Neon pgvector, Redis, and Next.js.</span>
        </div>
      </footer>
    </div>
  );
}
