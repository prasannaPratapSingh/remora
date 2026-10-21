'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Cpu, 
  Database, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Zap, 
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

interface Stage {
  id: number;
  name: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  color: string;
  bgLight: string;
  borderColor: string;
  title: string;
  description: string;
  codeSnippet: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    name: 'Conversation Input',
    badge: 'Step 1: Ingest',
    icon: MessageSquare,
    color: '#3b82f6',
    bgLight: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    title: 'Natural Conversation',
    description: 'Raw conversational turn arrives from your application via SDK or API.',
    codeSnippet: 'remora.add({ externalUserId: "user_alex", content: "I strictly prefer Next.js App Router and Vanilla CSS." })'
  },
  {
    id: 2,
    name: 'Cognitive Engine',
    badge: 'Step 2: Distill & Deduplicate',
    icon: Cpu,
    color: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.25)',
    title: 'Distillation & Decay',
    description: 'Noise filtering, atomic fact extraction, and similarity check (>0.93 deduplication).',
    codeSnippet: 'Extract: [PREFERENCE] | Importance: 0.95 | Decay: λ=0.02 (~35d half-life) | Duplicate: False'
  },
  {
    id: 3,
    name: 'Neon pgvector',
    badge: 'Step 3: Index',
    icon: Database,
    color: '#06b6d4',
    bgLight: 'rgba(6, 182, 212, 0.08)',
    borderColor: 'rgba(6, 182, 212, 0.25)',
    title: 'HNSW Vector Storage',
    description: '1536-dimensional embeddings indexed inside Neon PostgreSQL in one unified ACID table.',
    codeSnippet: 'INSERT INTO memories ... embedding = [0.012, -0.045, ...]::vector | HNSW index updated'
  },
  {
    id: 4,
    name: 'Context Injection',
    badge: 'Step 4: Recall (Sub-15ms)',
    icon: Sparkles,
    color: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    title: 'Structured Prompt Recall',
    description: 'Hybrid score combines similarity, importance, and recency into concise prompt context.',
    codeSnippet: '<user_context>\n• User strictly prefers Next.js App Router and Vanilla CSS\n</user_context>'
  }
];

export const HeroMemoryFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Auto-play through stages
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev >= 4 ? 1 : prev + 1));
    }, 3800);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentStage = STAGES[activeStep - 1];

  return (
    <div style={{ width: '100%', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Outer Card with subtle glass and shadow */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(15, 23, 42, 0.09)',
          boxShadow: '0 24px 60px -15px rgba(15, 23, 42, 0.08), 0 4px 16px -2px rgba(15, 23, 42, 0.03)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Top Header / Bar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
          backgroundColor: '#fafbfc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left: Window Dots & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
            </div>
            <div style={{ height: '14px', width: '1px', backgroundColor: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Remora Memory Persistence Pipeline
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                fontWeight: 600
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                Active HNSW Index
              </span>
            </div>
          </div>

          {/* Right: Controls & Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.1)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#475569',
                cursor: 'pointer'
              }}
              title={isAutoPlaying ? 'Pause interactive playback' : 'Play interactive animation'}
            >
              {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isAutoPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Avg Latency: <strong style={{ color: '#0f172a' }}>14ms</strong>
            </span>
          </div>
        </div>

        {/* 4 Stage Interactive Node Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
          backgroundColor: '#ffffff'
        }}>
          {STAGES.map((stage) => {
            const isActive = activeStep === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  setActiveStep(stage.id);
                  setIsAutoPlaying(false);
                }}
                style={{
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  border: 'none',
                  background: isActive ? '#f8fafc' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  borderRight: stage.id < 4 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {/* Active Indicator Top Line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: stage.color
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? stage.bgLight : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? stage.color : '#64748b'
                  }}>
                    <Icon size={15} />
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isActive ? stage.color : '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    Stage 0{stage.id}
                  </span>
                </div>

                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#0f172a' : '#64748b'
                }}>
                  {stage.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Flow Visualizer Canvas */}
        <div style={{ padding: '28px 24px', backgroundColor: '#fafbfc' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                alignItems: 'stretch'
              }}
            >
              {/* Left Column: Conceptual Flow Explanation */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                borderRadius: '14px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: currentStage.bgLight,
                      color: currentStage.color
                    }}>
                      {currentStage.badge}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: '8px',
                    letterSpacing: '-0.02em'
                  }}>
                    {currentStage.title}
                  </h3>

                  <p style={{
                    fontSize: '13.5px',
                    color: '#475569',
                    lineHeight: '1.6',
                    marginBottom: '16px'
                  }}>
                    {currentStage.description}
                  </p>
                </div>

                {/* Sub-features list */}
                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(15, 23, 42, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  {activeStep === 1 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#3b82f6" />
                        <span>Captures user messages from any LLM conversation</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#3b82f6" />
                        <span>Phatic filter ignores chitchat ("hi", "thanks", "ok")</span>
                      </div>
                    </>
                  )}
                  {activeStep === 2 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#8b5cf6" />
                        <span>Near-duplicate reinforcement if similarity &gt; 0.93</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#8b5cf6" />
                        <span>Adaptive Ebbinghaus time decay per cognitive category</span>
                      </div>
                    </>
                  )}
                  {activeStep === 3 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#06b6d4" />
                        <span>Neon Serverless pgvector with HNSW index</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#06b6d4" />
                        <span>Zero separate Pinecone or Chroma databases needed</span>
                      </div>
                    </>
                  )}
                  {activeStep === 4 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#10b981" />
                        <span>Injected as &lt;user_context&gt; with zero prompt bloat</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#10b981" />
                        <span>Redis 60-second hot context cache for sub-1ms hits</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Code / Data Terminal Preview */}
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: '14px',
                padding: '20px',
                color: '#f8fafc',
                fontFamily: 'var(--font-mono, monospace)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingBottom: '10px'
                  }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentStage.color }} />
                      Terminal Output
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>JSON / SQL Payload</span>
                  </div>

                  <pre style={{
                    fontSize: '12px',
                    lineHeight: '1.6',
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0
                  }}>
                    {currentStage.codeSnippet}
                  </pre>
                </div>

                <div style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  <span>Status: <strong>200 OK</strong></span>
                  <span style={{ color: '#10b981' }}>Verified Production Ready</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Flow Ribbon: Visual Line showing Step 1 -> Step 2 -> Step 3 -> Step 4 */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(15, 23, 42, 0.06)',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Pipeline:</span>
            <span>Raw Chat</span>
            <ArrowRight size={13} color="#94a3b8" />
            <span>LLM Extraction</span>
            <ArrowRight size={13} color="#94a3b8" />
            <span>pgvector HNSW</span>
            <ArrowRight size={13} color="#94a3b8" />
            <span style={{ color: '#10b981', fontWeight: 600 }}>Injected Context</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => {
                  setActiveStep(num);
                  setIsAutoPlaying(false);
                }}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: activeStep === num ? '#0f172a' : '#f1f5f9',
                  color: activeStep === num ? '#ffffff' : '#64748b',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
