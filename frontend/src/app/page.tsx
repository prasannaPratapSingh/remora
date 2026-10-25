'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
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

  const codePreview = activeCodeTab === 'ts'
    ? `import { RemoraClient } from "@remora/sdk";

const remora = new RemoraClient({ apiKey });

await remora.add({ userId, content });
const context = await remora.context({ userId, query });`
    : `from remora import RemoraClient

remora = RemoraClient(api_key)

remora.add(user_id, content)
context = remora.context(user_id, query)`;

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

      {/* Developer Experience Section */}
      <section style={{ padding: '96px 24px 80px', maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Developer Experience
          </span>
        </div>

        <div className="developer-experience-card" style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 0.92fr)',
          gap: '56px',
          alignItems: 'center',
          padding: '56px 58px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 62%, #eef2ff 100%)',
          border: '1px solid rgba(15, 23, 42, 0.1)',
          boxShadow: '0 24px 70px -30px rgba(15, 23, 42, 0.28)'
        }}>
          <div style={{ position: 'absolute', width: '360px', height: '360px', right: '-90px', bottom: '-170px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.14)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '18px', color: '#3074FE', fontSize: '12px', fontWeight: 600 }}>
              <Code2 size={15} />
              <span>Small surface area. Full memory lifecycle.</span>
            </div>
            <h2 className={`editorial-title ${cooperBt.className}`} style={{ fontSize: 'clamp(32px, 4vw, 52px)', maxWidth: '520px', color: '#0f172a', marginBottom: '18px', letterSpacing: '-0.03em' }}>
              Add memory without rebuilding your stack.
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', maxWidth: '510px', lineHeight: '1.7', marginBottom: '26px' }}>
              Write a meaningful fact, retrieve ranked context before a response, and let Remora handle extraction, deduplication, decay, and history behind the API.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/docs" className="remora-cta-btn" style={{ height: '42px', padding: '0 16px', fontSize: '13px' }}>
                Read the integration guide
                <ArrowRight size={15} />
              </Link>
              <span style={{ fontSize: '12px', color: '#64748b' }}>TypeScript · Python</span>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
            <div style={{
              overflow: 'hidden',
              borderRadius: '14px',
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 22px 45px -20px rgba(15, 23, 42, 0.55)'
            }}>
              <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#1f2937' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fb7185' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button onClick={() => setActiveCodeTab('ts')} style={{ position: 'relative', padding: '4px 8px', border: 0, borderRadius: '5px', background: 'transparent', color: activeCodeTab === 'ts' ? '#ffffff' : '#9ca3af', fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s ease' }}>
                    {activeCodeTab === 'ts' && <motion.span layoutId="active-language-tab" transition={{ type: 'spring', stiffness: 420, damping: 30 }} style={{ position: 'absolute', inset: 0, borderRadius: '5px', background: '#374151' }} />}
                    <span style={{ position: 'relative', zIndex: 1 }}>TypeScript</span>
                  </button>
                  <button onClick={() => setActiveCodeTab('py')} style={{ position: 'relative', padding: '4px 8px', border: 0, borderRadius: '5px', background: 'transparent', color: activeCodeTab === 'py' ? '#ffffff' : '#9ca3af', fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s ease' }}>
                    {activeCodeTab === 'py' && <motion.span layoutId="active-language-tab" transition={{ type: 'spring', stiffness: 420, damping: 30 }} style={{ position: 'absolute', inset: 0, borderRadius: '5px', background: '#374151' }} />}
                    <span style={{ position: 'relative', zIndex: 1 }}>Python</span>
                  </button>
                  <button onClick={copyCode} title="Copy full integration" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '5px', marginLeft: '3px', border: 0, borderRadius: '5px', background: '#374151', color: '#ffffff', cursor: 'pointer' }}>
                    {copiedCode ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div style={{ position: 'relative', minHeight: '250px', overflow: 'hidden', background: '#111827' }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.pre
                    key={activeCodeTab}
                    initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    style={{ minHeight: '250px', margin: 0, padding: '24px 22px', overflowX: 'auto', background: '#111827', color: activeCodeTab === 'ts' ? '#dbeafe' : '#cffafe', fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: '1.75' }}
                  >
                    {codePreview}
                  </motion.pre>
                </AnimatePresence>
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', color: '#9ca3af', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                context returned as &lt;user_context&gt;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: '72px 24px 72px', maxWidth: '1180px', margin: '0 auto', width: '100%' }}
      >
        <div className="remora-capabilities-shell">
          <div className="remora-capabilities-heading" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.82fr) minmax(0, 1.18fr)', gap: '64px', alignItems: 'center', marginBottom: '42px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Cognitive capabilities
              </span>
              <h2 className={`editorial-title ${cooperBt.className}`} style={{ fontSize: 'clamp(30px, 3.4vw, 44px)', color: '#0f172a', margin: '10px 0 0', letterSpacing: '-0.03em' }}>
                Memory with structure, not just storage.
              </h2>
            </div>
            <p className="remora-capabilities-description" style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', maxWidth: '520px', margin: 0 }}>
              Remora turns conversational signals into typed, ranked, and auditable memory. Each capability exists to keep context useful as an application grows.
            </p>
          </div>

          <div className="remora-capabilities-grid">
          <div className="remora-capability-card remora-capability-card-primary">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: '#e8efff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={21} color="#3074FE" />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>memory.type</span>
            </div>
            <h3 style={{ fontSize: '23px', fontWeight: 700, color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.02em' }}>
              Typed memory
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.65', marginBottom: '28px', maxWidth: '500px' }}>
              Facts, preferences, profiles, project context, instructions, goals, and decisions are stored as distinct records—not undifferentiated chat history.
            </p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.55 }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
            >
              {['FACT', 'PREFERENCE', 'PROFILE', 'PROJECT_CONTEXT', 'GOAL', 'DECISION'].map((type) => (
                <motion.span
                  key={type}
                  variants={{
                    hidden: { opacity: 0, y: 7, scale: 0.96 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -2, borderColor: '#9bb9ef', backgroundColor: '#eef5ff' }}
                  style={{ padding: '6px 9px', borderRadius: '6px', border: '1px solid #dbe4f5', background: '#f8fbff', color: '#35558b', fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'default' }}
                >
                  {type}
                </motion.span>
              ))}
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5edf8' }}>
              {[
                { value: '06', label: 'core types' },
                { value: '01', label: 'shared record' },
                { value: '∞', label: 'across sessions' }
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ color: '#0f172a', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.03em' }}>{stat.value}</div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="remora-capability-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="#059669" />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>confidence</span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Deduplication</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
              Repeated statements reinforce an existing memory instead of creating another row.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: '#e2e8f0', overflow: 'hidden' }}>
                <div style={{ width: '93%', height: '100%', borderRadius: '99px', background: '#10b981' }} />
              </div>
              <span style={{ color: '#059669', fontSize: '12px', fontWeight: 700 }}>0.93</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#94a3b8', fontSize: '11px' }}>
              <span>similarity threshold</span>
              <span>confidence +0.05</span>
            </div>
          </div>

          <div className="remora-capability-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#d97706" />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>recency</span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Time-aware ranking</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '18px' }}>
              Relevance is balanced with importance, confidence, and the age of a memory before it reaches the prompt.
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '42px', padding: '0 4px' }}>
              {[92, 78, 61, 48, 36, 26].map((height, index) => (
                <div key={height} style={{ flex: 1, height: `${height}%`, borderRadius: '4px 4px 2px 2px', background: index < 2 ? '#f59e0b' : '#fed7aa' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '7px', color: '#94a3b8', fontSize: '11px' }}>
              <span>newer context</span>
              <span>older context</span>
            </div>
          </div>

          <div className="remora-capability-card remora-capability-card-wide">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(230px, 0.8fr)', gap: '30px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={18} color="#0284c7" />
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>single substrate</span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>One record, one source of truth</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                  Vectors, metadata, and version history stay together in PostgreSQL. No second system to synchronize or reconcile.
                </p>
              </div>
              <div style={{ padding: '15px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#475569', lineHeight: '1.9' }}>
                <div><span style={{ color: '#0284c7' }}>memory</span> <span style={{ color: '#94a3b8' }}>→</span> content</div>
                <div><span style={{ color: '#0284c7' }}>memory</span> <span style={{ color: '#94a3b8' }}>→</span> embedding</div>
                <div><span style={{ color: '#0284c7' }}>memory</span> <span style={{ color: '#94a3b8' }}>→</span> versions[]</div>
              </div>
            </div>
          </div>

          <div className="remora-capability-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#7c3aed" />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>ingestion</span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Async by default</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '18px' }}>
              Conversation ingestion returns <code style={{ color: '#7c3aed' }}>202 Accepted</code>. Extraction and embedding continue off the request path.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#7c3aed', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a78bfa' }} />
              worker queue active
            </div>
          </div>

          <div className="remora-capability-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} color="#334155" />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>scope</span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Tenant-aware by design</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '18px' }}>
              Every read and write is scoped to the organization, project, and external user.
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['org_id', 'project_id', 'user_id'].map((scope) => (
                <span key={scope} style={{ padding: '5px 7px', borderRadius: '5px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{scope}</span>
              ))}
            </div>
          </div>
          </div>
        </div>
      </motion.section>

      {/* Deployment Section */}
      <section id="pricing" style={{
        padding: '104px 24px 112px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ maxWidth: '680px', marginBottom: '44px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              Deployment options
            </span>
            <h2 className={`editorial-title ${cooperBt.className}`} style={{ fontSize: 'clamp(30px, 3.4vw, 46px)', color: '#0f172a', margin: '12px 0 14px', letterSpacing: '-0.02em' }}>
              One memory layer, from prototype to production.
            </h2>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.65', margin: 0 }}>
              Start with the same API and move to stronger isolation, higher limits, and operational support when your application requires it.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'stretch' }}>
            {/* Developer plan */}
            <motion.div className="remora-deployment-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid rgba(15, 23, 42, 0.1)', display: 'flex', flexDirection: 'column' }}>
              <motion.div className="remora-deployment-check" initial={{ bottom: '-72px', opacity: 1 }} whileInView={{ bottom: '40%', opacity: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }} aria-hidden="true">
                <Check size={24} strokeWidth={2.5} />
              </motion.div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Developer</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>For evaluation</span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.55', minHeight: '42px', margin: '10px 0 18px' }}>
                Build and test memory-backed features without changing your application architecture.
              </p>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '22px' }}>
                $0 <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>/ forever</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px', color: '#475569', padding: 0, margin: '0 0 28px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Up to 100,000 memories</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> TypeScript and Python SDKs</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Search Playground access</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Community support</li>
              </ul>
              <Link href="/auth/signup" style={{ display: 'block', width: '100%', padding: '11px', textAlign: 'center', backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
                Create an account
              </Link>
            </motion.div>

            {/* Production plan */}
            <motion.div className="remora-deployment-card remora-deployment-card-featured" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }} style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid rgba(15, 23, 42, 0.18)', display: 'flex', flexDirection: 'column' }}>
              <motion.div className="remora-deployment-check" initial={{ bottom: '-72px', opacity: 1 }} whileInView={{ bottom: '40%', opacity: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }} aria-hidden="true">
                <Check size={24} strokeWidth={2.5} />
              </motion.div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Production</h3>
                <span style={{ fontSize: '12px', color: '#3074FE' }}>For live applications</span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.55', minHeight: '42px', margin: '10px 0 18px' }}>
                Keep ingestion off the request path and serve context from a managed, low-latency memory layer.
              </p>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '22px' }}>
                $49 <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px', color: '#475569', padding: 0, margin: '0 0 28px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Up to 2,000,000 memories</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Asynchronous conversation ingestion</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Redis context caching</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> TTL and lifecycle controls</li>
              </ul>
              <Link href="/auth/signup" style={{ display: 'block', width: '100%', padding: '11px', textAlign: 'center', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
                Start with Production
              </Link>
            </motion.div>

            {/* Enterprise plan */}
            <motion.div className="remora-deployment-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }} style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid rgba(15, 23, 42, 0.1)', display: 'flex', flexDirection: 'column' }}>
              <motion.div className="remora-deployment-check" initial={{ bottom: '-72px', opacity: 1 }} whileInView={{ bottom: '40%', opacity: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }} aria-hidden="true">
                <Check size={24} strokeWidth={2.5} />
              </motion.div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Enterprise</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>For governed deployments</span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.55', minHeight: '42px', margin: '10px 0 18px' }}>
                Apply organization-level controls across projects, users, data retention, and access policies.
              </p>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '22px' }}>Custom</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px', color: '#475569', padding: 0, margin: '0 0 28px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Multiple projects and namespaces</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Dedicated database isolation</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Tenant-scoped access and key management</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={15} color="#3074FE" style={{ marginTop: '1px', flexShrink: 0 }} /> Purge and export workflows</li>
              </ul>
              <Link href="/auth/signup" style={{ display: 'block', width: '100%', padding: '11px', textAlign: 'center', backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
                Talk to Remora
              </Link>
            </motion.div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px', color: '#64748b', fontSize: '12px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3074FE', flexShrink: 0 }} />
            All plans use the same memory model, retrieval API, and prompt-context contract.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="remora-site-footer">
        <div className="remora-site-footer-inner">
          <div className="remora-site-footer-top">
            <Link href="/" className="remora-footer-brand">Remora</Link>

            <div className="remora-footer-nav">
              <div className="remora-footer-column">
                <span className="remora-footer-heading">Products</span>
                <Link href="/#pricing">Pricing</Link>
                <Link href="/dashboard">Console</Link>
                <Link href="/docs">API</Link>
                <Link href="/docs">SDKs</Link>
              </div>

              <div className="remora-footer-column">
                <span className="remora-footer-heading">Resources</span>
                <Link href="/docs">Documentation</Link>
                <Link href="/docs">Quickstart</Link>
                <Link href="/#features">Capabilities</Link>
                <Link href="/docs">Glossary</Link>
              </div>

              <div className="remora-footer-column">
                <span className="remora-footer-heading">Company</span>
                <Link href="/#why-remora">About Remora</Link>
                <Link href="/docs">Security</Link>
                <Link href="/docs">Contact us</Link>
                <Link href="/docs">Help center</Link>
              </div>
            </div>
          </div>

          <div className="remora-site-footer-bottom">
            <span>© 2026 Remora. All rights reserved.</span>
            <div className="remora-footer-bottom-right">
              <div className="remora-footer-legal">
                <Link href="/docs">Privacy</Link>
                <Link href="/docs">Terms</Link>
                <Link href="/docs">Copyright</Link>
              </div>
              <span className="remora-footer-divider" aria-hidden="true" />
              <div className="remora-footer-socials" aria-label="Social links">
                <span aria-label="YouTube">▶</span>
                <span aria-label="X">𝕏</span>
                <span aria-label="LinkedIn">in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="remora-footer-ascii" aria-hidden="true">REMORA</div>
      </footer>
    </div>
  );
}
