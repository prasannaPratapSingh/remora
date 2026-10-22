'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cooperBt } from './fonts';
import { Navbar } from '../components/Navbar';
import { HeroMemoryFlow } from '../components/HeroMemoryFlow';
import { WhyRemoraShowcase } from '../components/WhyRemoraShowcase';
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

const subheadingLine1 = "Self-evolving long-term memory for LLMs and autonomous fleets";
const subheadingLine2 = "with sub-15ms pgvector retrieval.";

let runningSubheadingCharIndex = 0;
const parsedSubheadingLine1 = subheadingLine1.split(' ').map((word) => {
  const chars = word.split('').map((char) => ({
    char,
    index: runningSubheadingCharIndex++
  }));
  runningSubheadingCharIndex++;
  return { word, chars };
});

const parsedSubheadingLine2 = subheadingLine2.split(' ').map((word) => {
  const chars = word.split('').map((char) => ({
    char,
    index: runningSubheadingCharIndex++
  }));
  runningSubheadingCharIndex++;
  return { word, chars };
});

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
          padding: '140px 24px 104px',
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

            {/* Subheading: Refined character-by-character staggered reveal */}
            <p
              style={{
                fontSize: 'clamp(17.5px, 1.45vw, 20px)',
                color: '#1e293b',
                fontWeight: 450,
                maxWidth: '680px',
                lineHeight: '1.6',
                marginBottom: '38px',
                textAlign: 'center'
              }}
            >
              <span style={{ display: 'inline' }}>
                {parsedSubheadingLine1.map((item, wordIdx) => (
                  <span
                    key={`s1-w-${wordIdx}`}
                    style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                  >
                    {item.chars.map((c) => (
                      <motion.span
                        key={`s1-c-${c.index}`}
                        initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                          duration: 0.28,
                          delay: 0.95 + c.index * 0.011,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        style={{ display: 'inline-block' }}
                      >
                        {c.char}
                      </motion.span>
                    ))}
                    {wordIdx < parsedSubheadingLine1.length - 1 && (
                      <span style={{ display: 'inline-block' }}>&nbsp;</span>
                    )}
                  </span>
                ))}
              </span>
              <br />
              <span style={{ display: 'inline' }}>
                {parsedSubheadingLine2.map((item, wordIdx) => (
                  <span
                    key={`s2-w-${wordIdx}`}
                    style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                  >
                    {item.chars.map((c) => (
                      <motion.span
                        key={`s2-c-${c.index}`}
                        initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                          duration: 0.28,
                          delay: 0.95 + c.index * 0.011,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        style={{ display: 'inline-block' }}
                      >
                        {c.char}
                      </motion.span>
                    ))}
                    {wordIdx < parsedSubheadingLine2.length - 1 && (
                      <span style={{ display: 'inline-block' }}>&nbsp;</span>
                    )}
                  </span>
                ))}
              </span>
            </p>

            {/* Focused CTAs: Staggered sequential entrance one-by-one */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: '48px'
              }}
            >
              {/* CTA 1: See How it Works */}
              <motion.div
                initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.75, delay: 1.85, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-flex' }}
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
              </motion.div>

              {/* CTA 2: Access Memory Console */}
              <motion.div
                initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.75, delay: 2.08, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-flex' }}
              >
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
          </div>

          {/* Big Rectangular Design: Why Remora Showcase (partially visible in hero fold) */}
          <WhyRemoraShowcase />
        </section>
      </div>

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
      </section>      {/* Features Bento Grid */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: '96px 24px 80px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#2563eb',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            padding: '5px 14px',
            borderRadius: '9999px',
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            Cognitive Capabilities
          </span>
          <h2 className={`editorial-title ${cooperBt.className}`} style={{ fontSize: 'clamp(30px, 3.2vw, 44px)', color: '#0f172a', marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Everything your AI agents need to remember forever
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            No ad-hoc database tables. No dual-database desync. A managed cognitive memory substrate with sub-15ms vector retrieval.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="remora-bento-grid">
          {/* Card 1: Large Bento (Span 2) - Cognitive Taxonomy */}
          <div className="remora-bento-card remora-bento-span-2">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={22} color="#2563eb" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: '3px 10px', borderRadius: '9999px' }}>
                  Structured Intelligence
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                Strict Cognitive Taxonomy
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '22px' }}>
                Raw chat logs cause context collapse. Remora automatically distills conversational turns into four typed cognitive classes with independent decay half-lives.
              </p>

              {/* Taxonomy Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', fontFamily: 'var(--font-mono)' }}>PROFILE</span>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>~138d half-life</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: 500 }}>
                    Alex • Principal Architect in Bangalore
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', fontFamily: 'var(--font-mono)' }}>PREFERENCE</span>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>~35d half-life</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: 500 }}>
                    Strictly TypeScript & Next.js App Router
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', fontFamily: 'var(--font-mono)' }}>FACT</span>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Permanent</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: 500 }}>
                    Production DB is PostgreSQL 16 on Neon
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>PROJECT_CONTEXT</span>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>~14d half-life</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: 500 }}>
                    HNSW cosine index with 1536-dim vectors
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Span 1 - Auto Deduplication */}
          <div className="remora-bento-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={22} color="#059669" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '3px 10px', borderRadius: '9999px' }}>
                  sim &gt; 0.93
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                Auto Deduplication
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.6', marginBottom: '18px' }}>
                Users repeat preferences across dozens of sessions. Remora calculates cosine similarity and boosts confidence instead of duplicating rows.
              </p>

              {/* Progress Box */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Confidence Rating</span>
                  <strong style={{ color: '#059669' }}>95% (+0.05 / repeat)</strong>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '95%', height: '100%', backgroundColor: '#10b981', borderRadius: '9999px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                  <span>5 mentions detected</span>
                  <span>0 DB rows created</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Span 1 - Ebbinghaus Time Decay */}
          <div className="remora-bento-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={22} color="#d97706" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '3px 10px', borderRadius: '9999px', fontFamily: 'var(--font-mono)' }}>
                  R = e^(-λ·Δt)
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                Ebbinghaus Decay Curve
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                Avoids surfacing 6-month-old obsolete plans over yesterday's updates. Semantic score is exponentially weighted with elapsed time.
              </p>

              {/* Decay visualization */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Yesterday</span>
                  <strong style={{ color: '#059669' }}>98% retention</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>30 Days</span>
                  <strong style={{ color: '#d97706' }}>54% retention</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>180 Days</span>
                  <strong style={{ color: '#ef4444' }}>12% decayed</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Span 2 - Unified Neon Architecture */}
          <div className="remora-bento-card remora-bento-span-2">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={22} color="#0891b2" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0891b2', backgroundColor: 'rgba(6, 182, 212, 0.08)', padding: '3px 10px', borderRadius: '9999px' }}>
                  Single ACID Database
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                Unified Neon pgvector Architecture
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '18px' }}>
                Splitting vectors into Pinecone and metadata into PostgreSQL causes orphan embeddings, dual billing, and race conditions. Remora stores 1536-dim vectors, JSON audits, and metadata in one PostgreSQL table.
              </p>

              {/* Comparison visual */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                  <div style={{ color: '#be123c', fontWeight: 700, marginBottom: '4px' }}>✕ Traditional Naive Setup</div>
                  <div style={{ color: '#881337', lineHeight: '1.4' }}>Pinecone + Postgres sync bugs, race conditions, and prompt token bloat.</div>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                  <div style={{ color: '#15803d', fontWeight: 700, marginBottom: '4px' }}>✓ Remora Unified Substrate</div>
                  <div style={{ color: '#166534', lineHeight: '1.4' }}>Atomic Neon pgvector transactions with sub-15ms p95 vector retrieval.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Span 1 - Async BullMQ */}
          <div className="remora-bento-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={22} color="#7c3aed" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', backgroundColor: 'rgba(168, 85, 247, 0.08)', padding: '3px 10px', borderRadius: '9999px' }}>
                  HTTP 202
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                Async BullMQ Pipeline
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                Synchronous extraction adds 2–3s to chatbot turns. Remora returns an immediate <code>202 Accepted</code>, offloading extraction to worker queues.
              </p>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed', letterSpacing: '-0.02em' }}>~ 0 ms</div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Added chat latency</div>
              </div>
            </div>
          </div>

          {/* Card 6: Span 2 - Multi-Tenant Security & GDPR */}
          <div className="remora-bento-card remora-bento-span-2">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} color="#0f172a" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: '9999px' }}>
                  Enterprise Isolation
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                Multi-Tenant Scoping & GDPR Article 17
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '18px' }}>
                Composite SQL scoping guarantees zero vector leakage across organizations. Built-in compliance endpoints execute complete cryptographic cascade purges in milliseconds.
              </p>

              {/* Scoping Tags */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', color: '#334155' }}>
                  org_enterprise_id
                </span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', color: '#334155' }}>
                  project_fleet_id
                </span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', color: '#334155' }}>
                  external_user_id
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px' }}>
                  ✓ GDPR Forget User Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

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
