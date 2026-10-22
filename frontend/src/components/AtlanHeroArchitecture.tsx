'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Database, 
  Sparkles, 
  Layers, 
  GitCompare, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity,
  Bot,
  Zap,
  RefreshCw
} from 'lucide-react';

type ScenarioKey = 'contradiction' | 'dedup' | 'decay';

interface Scenario {
  id: ScenarioKey;
  tabLabel: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  incomingPrompt: string;
  agentSource: string;
  taxonomy: string;
  analysisSteps: {
    label: string;
    detail: string;
    status: 'pass' | 'update' | 'resolve';
    metric?: string;
  }[];
  telemetry: {
    latency: string;
    similarity: string;
    dbAction: string;
    engineStatus: string;
  };
  contextPayload: string;
  tokenSavings: string;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  contradiction: {
    id: 'contradiction',
    tabLabel: '1. Contradiction Resolution',
    badge: 'State Evolution',
    badgeColor: '#3b82f6',
    title: 'Resolves Changing Facts & State',
    subtitle: 'Supersedes outdated records automatically without hallucinating multiple conflicting truths.',
    incomingPrompt: '"I just relocated from South Delhi to Indiranagar, Bangalore for my new role."',
    agentSource: 'OpenAI GPT-4o Agent / LangChain',
    taxonomy: 'PROFILE & FACT',
    analysisSteps: [
      {
        label: 'Vector Cosine Search',
        detail: 'Matched existing profile fact (mem_8412: "Lives in South Delhi")',
        status: 'pass',
        metric: 'sim = 0.88'
      },
      {
        label: 'Contradiction Classifier',
        detail: 'Location transition detected: [South Delhi] → [Indiranagar, Bangalore]',
        status: 'resolve',
        metric: 'Conflict: TRUE'
      },
      {
        label: 'Atomic State Transition',
        detail: 'mem_8412 marked SUPERSEDED; mem_9104 inserted into Neon pgvector',
        status: 'update',
        metric: 'ACID Lineage'
      }
    ],
    telemetry: {
      latency: '11.4 ms',
      similarity: '0.88 Cosine',
      dbAction: 'Neon HNSW Index Updated',
      engineStatus: '1 Memory Superseded • 1 Created'
    },
    contextPayload: `<user_context>
  <profile user_id="user_alex">
    <location status="active">Indiranagar, Bangalore</location>
    <relocation_date>2026-10-22</relocation_date>
    <superseded_audit>
      <previous_location id="mem_8412">South Delhi</previous_location>
    </superseded_audit>
  </profile>
</user_context>`,
    tokenSavings: '94% token savings vs raw chat logs'
  },
  dedup: {
    id: 'dedup',
    tabLabel: '2. Auto-Deduplication (>0.93)',
    badge: 'Zero Bloat',
    badgeColor: '#10b981',
    title: 'Reinforces Confidence, Skips Duplicate Rows',
    subtitle: 'When users repeat preferences, Remora strengthens weight without bloating the database with identical vector rows.',
    incomingPrompt: '"As always, I strictly write TypeScript with Next.js App Router and Vanilla CSS."',
    agentSource: 'Claude 3.5 Sonnet / Custom Agent',
    taxonomy: 'PREFERENCE & DEV_STACK',
    analysisSteps: [
      {
        label: 'Deterministic Bloom Filter',
        detail: 'Candidate key matches active preference domain: dev_preferences',
        status: 'pass',
        metric: 'Cache hit'
      },
      {
        label: 'HNSW Semantic Comparison',
        detail: 'Similarity to mem_4210 exceeds deduplication threshold (0.93)',
        status: 'pass',
        metric: 'sim = 0.96 > 0.93'
      },
      {
        label: 'Confidence Reinforcement',
        detail: 'Zero row duplicate inserted; confidence score incremented +0.05',
        status: 'update',
        metric: '0.75 → 0.95'
      }
    ],
    telemetry: {
      latency: '4.8 ms',
      similarity: '0.96 (Duplicate)',
      dbAction: 'Skipped Row • Boosted Weight',
      engineStatus: 'Reinforced 6x • Confidence: 95%'
    },
    contextPayload: `<user_context>
  <preference user_id="user_alex" category="stack">
    <primary_tech confidence="0.95" reinforced_count="6">
      TypeScript, Next.js (App Router), Vanilla CSS
    </primary_tech>
    <anti_patterns>TailwindCSS (avoid unless requested)</anti_patterns>
  </preference>
</user_context>`,
    tokenSavings: 'Zero duplicate rows • 1ms Redis hot retrieval'
  },
  decay: {
    id: 'decay',
    tabLabel: '3. Ebbinghaus Time Decay',
    badge: 'Recency Weighted',
    badgeColor: '#f59e0b',
    title: 'Blends Cosine Similarity with Elapsed Time',
    subtitle: 'Applies exponential forgetting curves so recent facts rank higher than stale memories from 6 months ago.',
    incomingPrompt: '"Recommend a quiet cafe nearby with fast WiFi for deep coding this afternoon."',
    agentSource: 'Autonomous Assistant / BullMQ Pipeline',
    taxonomy: 'HYBRID_RETRIEVAL',
    analysisSteps: [
      {
        label: 'Candidate A (7 Months Ago)',
        detail: '"Liked cafe in Connaught Place, Delhi" — Half-life discount (0.14x)',
        status: 'resolve',
        metric: 'Score: 0.12 (Dropped)'
      },
      {
        label: 'Candidate B (Yesterday)',
        detail: '"Working out of Indiranagar, Bangalore" — Recency multiplier (0.98x)',
        status: 'pass',
        metric: 'Score: 0.94 (Rank #1)'
      },
      {
        label: 'Dynamic Ebbinghaus Formula',
        detail: 'Score = CosineSim(0.92) × e^(-λ·Δt) × Importance(1.0)',
        status: 'update',
        metric: 'Top-1 Retained'
      }
    ],
    telemetry: {
      latency: '8.2 ms',
      similarity: 'Hybrid Re-ranked',
      dbAction: 'Sub-15ms pgvector HNSW Query',
      engineStatus: '1 Relevant Injected • 1 Decayed'
    },
    contextPayload: `<user_context>
  <memory_retrieval query="quiet cafe fast wifi" p95_latency="8.2ms">
    <active_context rank="1" score="0.94">
      Current Location: Indiranagar, Bangalore. Prefers quiet specialty coffee roasters with outlets and high-speed fiber.
    </active_context>
  </memory_retrieval>
</user_context>`,
    tokenSavings: 'Filtered 8 stale memories • Injected top-1 compact chunk'
  }
};

export const AtlanHeroArchitecture: React.FC = () => {
  const [activeKey, setActiveKey] = useState<ScenarioKey>('contradiction');
  const [copied, setCopied] = useState(false);
  const current = SCENARIOS[activeKey];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.contextPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', position: 'relative' }}>
      {/* Outer Glassmorphic Frame with Clean Editorial Border & Inset Specular Bevel */}
      <div style={{
        borderRadius: '24px 24px 0 0',
        padding: '10px 10px 0 10px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.82) 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderBottom: 'none',
        boxShadow: '0 -16px 40px -10px rgba(15, 23, 42, 0.05), 0 20px 45px rgba(0, 0, 0, 0.03), inset 0 1.5px 0 rgba(255, 255, 255, 0.95)'
      }}>
        {/* Main Canvas Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px 16px 0 0',
          padding: '28px 28px 24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Top Header & Scenario Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid rgba(15, 23, 42, 0.07)',
            paddingBottom: '20px'
          }}>
            {/* Left Title Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)'
              }}>
                <Cpu size={19} color="#38bdf8" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                    Remora Cognitive Visualizer
                  </h3>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'rgba(48, 116, 254, 0.1)',
                    color: '#2563eb',
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    Live Architecture
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Simulate memory extraction, auto-deduplication, and sub-15ms pgvector context injection
                </p>
              </div>
            </div>

            {/* Right Scenario Switcher Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '9999px',
              gap: '4px',
              border: '1px solid rgba(15, 23, 42, 0.06)'
            }}>
              {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
                const item = SCENARIOS[key];
                const isActive = activeKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveKey(key)}
                    style={{
                      position: 'relative',
                      border: 'none',
                      background: 'transparent',
                      padding: '7px 16px',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#0f172a' : '#64748b',
                      transition: 'color 0.15s ease',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeScenarioPill"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: '#ffffff',
                          borderRadius: '9999px',
                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                          zIndex: 0
                        }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {key === 'contradiction' && <GitCompare size={13} color={isActive ? '#2563eb' : '#94a3b8'} />}
                      {key === 'dedup' && <Layers size={13} color={isActive ? '#10b981' : '#94a3b8'} />}
                      {key === 'decay' && <Clock size={13} color={isActive ? '#f59e0b' : '#94a3b8'} />}
                      {item.tabLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Stage Pipeline Interactive Canvas */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="remora-visualizer-grid"
            >
              {/* STAGE 1: Incoming Turn & Agent Interface */}
              <div style={{
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                position: 'relative'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Input • Step 01
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                      Session #4182
                    </span>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', marginBottom: '8px' }}>
                    Incoming Conversational Turn
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px', lineHeight: '1.5' }}>
                    Raw agent exchange streamed from client application.
                  </p>

                  {/* Speech Bubble */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    fontSize: '13.5px',
                    color: '#1e293b',
                    lineHeight: '1.55',
                    fontStyle: 'italic',
                    position: 'relative'
                  }}>
                    {current.incomingPrompt}
                  </div>
                </div>

                {/* Source & Taxonomy Metadata */}
                <div style={{
                  paddingTop: '14px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '11.5px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Agent Framework:</span>
                    <strong style={{ color: '#0f172a', fontWeight: 600 }}>{current.agentSource}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Extracted Category:</span>
                    <span style={{
                      backgroundColor: 'rgba(48, 116, 254, 0.1)',
                      color: '#2563eb',
                      fontWeight: 600,
                      padding: '1px 8px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10.5px'
                    }}>
                      {current.taxonomy}
                    </span>
                  </div>
                </div>
              </div>

              {/* STAGE 2: Remora Cognitive Engine (The Core Instrument) */}
              <div style={{
                borderRadius: '14px',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 16px 36px -10px rgba(15, 23, 42, 0.35)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Ambient Glow */}
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '180px',
                  height: '180px',
                  background: 'radial-gradient(circle, rgba(48, 116, 254, 0.25) 0%, transparent 70%)',
                  filter: 'blur(35px)',
                  pointerEvents: 'none'
                }} />

                <div>
                  {/* Stage Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Remora Cognitive Core • Step 02
                      </span>
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#7dd3fc',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: 600
                    }}>
                      {current.telemetry.engineStatus}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '15.5px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', marginBottom: '4px' }}>
                    {current.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '16px' }}>
                    {current.subtitle}
                  </p>

                  {/* Execution Steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {current.analysisSteps.map((step, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: step.status === 'resolve' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: step.status === 'resolve' ? '#f87171' : '#34d399',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            flexShrink: 0,
                            marginTop: '1px'
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>
                              {step.label}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: '1.4' }}>
                              {step.detail}
                            </div>
                          </div>
                        </div>

                        {step.metric && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            color: step.status === 'resolve' ? '#fca5a5' : '#86efac',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap'
                          }}>
                            {step.metric}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div style={{
                  paddingTop: '16px',
                  marginTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                    <Zap size={13} color="#38bdf8" />
                    <span>p95 Latency: <strong style={{ color: '#38bdf8' }}>{current.telemetry.latency}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                    <Database size={13} color="#34d399" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      DB: <strong style={{ color: '#34d399' }}>Neon pgvector</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* STAGE 3: Injected Prompt Payload (<user_context>) */}
              <div style={{
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Output • Step 03
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        color: copied ? '#10b981' : '#64748b',
                        fontWeight: 500,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', marginBottom: '4px' }}>
                    Injected &lt;user_context&gt;
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>
                    Compact XML payload passed straight into the LLM system prompt.
                  </p>

                  {/* Code Box */}
                  <pre style={{
                    backgroundColor: '#0f172a',
                    color: '#e2e8f0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    lineHeight: '1.6',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    overflowX: 'auto',
                    margin: 0,
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(15, 23, 42, 0.12)'
                  }}>
                    <code>{current.contextPayload}</code>
                  </pre>
                </div>

                {/* Efficiency Proof Metric */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: '11.5px',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600
                }}>
                  <ShieldCheck size={15} color="#16a34a" />
                  <span>{current.tokenSavings}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Trust Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(15, 23, 42, 0.07)',
            fontSize: '12px',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#10b981" /> No <code>user_memories</code> tables needed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#10b981" /> Single ACID table (vectors + metadata)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#10b981" /> Sub-15ms pgvector HNSW retrieval
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0f172a' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              Production Enterprise Architecture
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
