'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TextMorph } from 'torph/react';
import { cooperBt } from '../app/fonts';
import {
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
  GitMerge,
  Activity,
  ArrowRight,
  Server,
  Network,
  Sparkles,
  Sliders,
  Filter,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';

const dimPresets = [
  {
    dim: 1536,
    provider: 'OpenAI text-3-large',
    short: 'OpenAI',
    m: 'm=16',
    ef: 'ef=64',
    metric: 'cosine',
    sampleCoords: '[+0.041, -0.198, +0.882, ...]',
    vectorCount: '1.4M vectors'
  },
  {
    dim: 3072,
    provider: 'Gemini 004 Embed',
    short: 'Gemini',
    m: 'm=32',
    ef: 'ef=96',
    metric: 'cosine',
    sampleCoords: '[+0.712, +0.334, -0.521, ...]',
    vectorCount: '850K vectors'
  },
  {
    dim: 768,
    provider: 'MiniLM Sentence-BERT',
    short: 'Open source',
    m: 'm=12',
    ef: 'ef=32',
    metric: 'cosine',
    sampleCoords: '[-0.245, +0.912, +0.108, ...]',
    vectorCount: '3.1M vectors'
  }
];

const hnswNodes = [
  // Layer 2: Sparse Entry Layer
  { id: 0, layer: 2, x: 45, y: 16, label: 'L2: Entry', dist: '0.142' },
  { id: 1, layer: 2, x: 205, y: 16, label: 'L2: Peer', dist: '0.489' },
  // Layer 1: Navigation Routing Layer
  { id: 2, layer: 1, x: 30, y: 52, label: 'L1: Node A', dist: '0.291' },
  { id: 3, layer: 1, x: 125, y: 50, label: 'L1: Greedy Hop', dist: '0.078' },
  { id: 4, layer: 1, x: 220, y: 52, label: 'L1: Node C', dist: '0.364' },
  // Layer 0: Dense Base Vector Layer
  { id: 5, layer: 0, x: 20, y: 92, label: 'L0: mem_04', dist: '0.241' },
  { id: 6, layer: 0, x: 75, y: 92, label: 'L0: mem_19', dist: '0.118' },
  { id: 7, layer: 0, x: 135, y: 88, label: 'L0: Target Hit', dist: '0.019' },
  { id: 8, layer: 0, x: 195, y: 92, label: 'L0: mem_42', dist: '0.187' },
  { id: 9, layer: 0, x: 245, y: 92, label: 'L0: mem_88', dist: '0.332' }
];

const hnswEdges: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 3],
  [3, 4],
  [2, 5],
  [2, 6],
  [3, 6],
  [3, 7],
  [4, 7],
  [4, 8],
  [4, 9],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9]
];

const whyRemoraSubheading = "Remora helps your AI remember what matters, find it quickly, and stay responsive.";

let runningWhyCharIndex = 0;
const parsedWhySubheading = whyRemoraSubheading.split(' ').map((word) => {
  const chars = word.split('').map((char) => ({
    char,
    index: runningWhyCharIndex++
  }));
  runningWhyCharIndex++;
  return { word, chars };
});

export const WhyRemoraShowcase: React.FC = () => {
  // 1. TextMorph cycling states
  // Fast recall states stay paired so the metric and explanation never drift apart.
  const recallStates = [
    { metric: 'Under 15 ms', label: 'Finds the right context' },
    { metric: '3 memories', label: 'Searches your memory' },
    { metric: 'Under 15 ms', label: 'Ready when your AI needs it' }
  ];
  const [recallIdx, setRecallIdx] = useState(0);

  // Auto-deduplication
  const dedupStates = ['Similar memories merged', 'Repeated details combined', 'Clean context for your AI'];
  const [dedupIdx, setDedupIdx] = useState(0);

  // Background work
  const latencyClaims = ['Works in the background', 'No wait while memories save', 'Keeps your chat moving'];
  const latencySub = ['Your response stays uninterrupted', 'New memories are saved quietly', 'Remora handles the busywork'];
  const [claimIdx, setClaimIdx] = useState(0);

  // AI Agent state
  const agentModes = ['ALWAYS READY', 'CONTEXT SYNCED', 'MEMORY ACTIVE'];
  const [agentIdx, setAgentIdx] = useState(0);

  // Hover states for interactive micro-interactions
  const [isHoveredAgent, setIsHoveredAgent] = useState(false);
  const [isHoveredRadar, setIsHoveredRadar] = useState(false);
  const [isHoveredDedup, setIsHoveredDedup] = useState(false);
  const [isHoveredDim, setIsHoveredDim] = useState(false);
  const [isHoveredBull, setIsHoveredBull] = useState(false);

  // Interactive micro-interaction states for sim block (deduplication)
  const [selectedThreshold, setSelectedThreshold] = useState<number>(0.93);
  const [isSimCollisionTriggered, setIsSimCollisionTriggered] = useState<boolean>(false);

  // Interactive micro-interaction states for dim block (vector geometry)
  const [selectedDim, setSelectedDim] = useState<number>(1536);
  const [activeVectorNode, setActiveVectorNode] = useState<number>(3);

  // Dynamic dimension titles matching the active selectedDim preset
  const activeDimPreset = dimPresets.find((p) => p.dim === selectedDim) || dimPresets[0];
  const dimTitles = [
    'Works with your AI model',
    'Keeps your memory flexible',
    `${activeDimPreset.short} compatible`
  ];
  const [dimIdx, setDimIdx] = useState(0);

  // Auto cycle intervals for continuous subtle rhythm (increased reading duration)
  useEffect(() => {
    const timer = setInterval(() => {
      setRecallIdx((prev) => (prev + 1) % recallStates.length);
      setDedupIdx((prev) => (prev + 1) % dedupStates.length);
      setDimIdx((prev) => (prev + 1) % 3);
      setClaimIdx((prev) => (prev + 1) % latencyClaims.length);
      setAgentIdx((prev) => (prev + 1) % agentModes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.95,
        delay: 2.15,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="why-remora-outer-wrapper"
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Atmospheric Ambient Glow behind Frame for 3D Depth */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '4%',
          right: '4%',
          bottom: '-10px',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(48, 116, 254, 0.09) 0%, rgba(15, 23, 42, 0.08) 45%, transparent 72%)',
          filter: 'blur(45px)',
          zIndex: -1,
          pointerEvents: 'none',
          borderRadius: '32px'
        }}
      />

      {/* Outer Enclosure Frame (Hardware Bezel with Pronounced Multi-Layer Elevation) */}
      <div
        style={{
          borderRadius: '26px',
          padding: '12px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 246, 249, 0.92) 100%)',
          border: '1.5px solid rgba(15, 23, 42, 0.1)',
          boxShadow: `
            0 40px 80px -18px rgba(15, 23, 42, 0.16),
            0 20px 40px -10px rgba(15, 23, 42, 0.1),
            0 8px 16px -4px rgba(15, 23, 42, 0.06),
            0 1px 3px rgba(15, 23, 42, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 1),
            inset 0 -1px 2px rgba(15, 23, 42, 0.04)
          `,
          backdropFilter: 'blur(28px)',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
        }}
      >
        {/* Inner Main Card Container (Floating Raised Surface) */}
        <div
          style={{
            borderRadius: '18px',
            background: '#ffffff',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '36px 32px 36px',
            boxShadow: `
              0 8px 24px -4px rgba(15, 23, 42, 0.06),
              0 2px 6px rgba(15, 23, 42, 0.03),
              inset 0 1px 1px rgba(255, 255, 255, 0.9)
            `,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Grid Canvas Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
              opacity: 0.7
            }}
          />

          {/* Section Header: "Why Remora" with Cooper BT typography */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '32px',
              position: 'relative',
              zIndex: 2
            }}
          >
            {/* 1. Architecture & Benchmarks Badge with smooth entrance on reload */}
            <motion.div
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.65, delay: 2.30, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#3074FE',
                  boxShadow: '0 0 6px rgba(48, 116, 254, 0.6)',
                  display: 'inline-block'
                }}
              />
              A clearer way to add memory
            </motion.div>

            {/* 2. Main Title: "Why Remora" with Word-by-Word Stagger on reload */}
            <h2
              className={`hero-cooper-title ${cooperBt.className}`}
              style={{
                fontFamily: `${cooperBt.style.fontFamily}, 'Cooper BT', Georgia, serif`,
                fontSize: 'clamp(26px, 2.5vw, 36px)',
                fontWeight: 400,
                color: '#0f172a',
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.75, delay: 2.40, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-block', marginRight: '0.28em' }}
              >
                Why
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.75, delay: 2.50, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-block' }}
              >
                Remora
              </motion.span>
            </h2>

            {/* 3. Subheading: Character-by-Character Staggered Wave on reload */}
            <p
              style={{
                fontSize: '14.5px',
                color: '#64748b',
                marginTop: '6px',
                maxWidth: '520px',
                lineHeight: '1.5',
                textAlign: 'center'
              }}
            >
              {parsedWhySubheading.map((item, wordIdx) => (
                <span
                  key={`why-w-${wordIdx}`}
                  style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                >
                  {item.chars.map((c) => (
                    <motion.span
                      key={`why-c-${c.index}`}
                      initial={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{
                        duration: 0.26,
                        delay: 2.58 + c.index * 0.008,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      style={{ display: 'inline-block' }}
                    >
                      {c.char}
                    </motion.span>
                  ))}
                  {wordIdx < parsedWhySubheading.length - 1 && (
                    <span style={{ display: 'inline-block' }}>&nbsp;</span>
                  )}
                </span>
              ))}
            </p>
          </div>

          {/* Bento Grid layout matching the wireframe */}
          <div
            className="why-remora-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '16px',
              position: 'relative',
              zIndex: 2
            }}
          >
            {/* ------------------------------------------------------------- */}
            {/* BOX 1: Isometric Design of AI Agent (Top Row, Col 1-3)        */}
            {/* ------------------------------------------------------------- */}
            <div
              onMouseEnter={() => setIsHoveredAgent(true)}
              onMouseLeave={() => setIsHoveredAgent(false)}
              className="why-remora-card"
              style={{
                gridColumn: 'span 3',
                borderRadius: '16px',
                border: isHoveredAgent ? '1px solid rgba(48, 116, 254, 0.4)' : '1px solid rgba(15, 23, 42, 0.08)',
                background: isHoveredAgent
                  ? 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                padding: '20px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isHoveredAgent
                  ? '0 12px 28px -6px rgba(48, 116, 254, 0.1)'
                  : '0 2px 6px rgba(15, 23, 42, 0.03)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '270px'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
                  AI MEMORY
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: isHoveredAgent ? 'rgba(48, 116, 254, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                    color: isHoveredAgent ? '#3074FE' : '#475569',
                    border: isHoveredAgent ? '1px solid rgba(48, 116, 254, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TextMorph duration={650}>{agentModes[agentIdx]}</TextMorph>
                </span>
              </div>

              {/* Isometric AI Agent 3D SVG Visualization (Disciplined Monochrome + Royal Blue) */}
              <div
                style={{
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  perspective: '600px'
                }}
              >
                <motion.div
                  animate={{
                    y: isHoveredAgent ? [-3, 3, -3] : [-2, 2, -2],
                    rotateX: isHoveredAgent ? 12 : 8,
                    rotateY: isHoveredAgent ? -16 : -10
                  }}
                  transition={{
                    y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                    rotateX: { duration: 0.3 },
                    rotateY: { duration: 0.3 }
                  }}
                  style={{
                    width: '100px',
                    height: '110px',
                    transformStyle: 'preserve-3d',
                    position: 'relative'
                  }}
                >
                  <svg width="100" height="110" viewBox="0 0 100 110" fill="none">
                    {/* Shadow Ground */}
                    <ellipse
                      cx="50"
                      cy="95"
                      rx="38"
                      ry="12"
                      fill="rgba(15, 23, 42, 0.06)"
                      filter="blur(4px)"
                    />

                    {/* Bottom Layer: Storage Cylinder (Deep Slate) */}
                    <path
                      d="M20 72 L50 87 L80 72 L80 82 L50 97 L20 82 Z"
                      fill="#0f172a"
                      opacity="0.95"
                    />
                    <path
                      d="M20 72 L50 87 L50 97 L20 82 Z"
                      fill="#1e293b"
                    />
                    <path
                      d="M50 87 L80 72 L80 82 L50 97 Z"
                      fill="#334155"
                    />
                    {/* Glowing rim */}
                    <path
                      d="M20 72 L50 87 L80 72 L50 57 Z"
                      fill={isHoveredAgent ? '#3074FE' : '#475569'}
                      opacity={isHoveredAgent ? 0.35 : 0.15}
                    />

                    {/* Middle Layer: Synchronizer Hex Plate */}
                    <path
                      d="M25 48 L50 61 L75 48 L50 35 Z"
                      fill={isHoveredAgent ? '#3074FE' : '#1e293b'}
                      opacity="0.9"
                    />
                    <path
                      d="M25 48 L50 61 L50 66 L25 53 Z"
                      fill="#0f172a"
                    />
                    <path
                      d="M50 61 L75 48 L75 53 L50 66 Z"
                      fill="#1e293b"
                    />

                    {/* Top Tier: AI Agent Core Cube (Clean Royal Blue Highlight) */}
                    <path
                      d="M32 24 L50 34 L68 24 L50 14 Z"
                      fill={isHoveredAgent ? '#3074FE' : '#3b82f6'}
                    />
                    <path
                      d="M32 24 L50 34 L50 45 L32 35 Z"
                      fill={isHoveredAgent ? '#1d4ed8' : '#2563eb'}
                    />
                    <path
                      d="M50 34 L68 24 L68 35 L50 45 Z"
                      fill={isHoveredAgent ? '#1e40af' : '#1d4ed8'}
                    />

                    {/* Glowing Brain / Neural Pulse Dot */}
                    <circle
                      cx="50"
                      cy="24"
                      r={isHoveredAgent ? 3.5 : 2.8}
                      fill="#ffffff"
                      filter="drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))"
                    />

                    {/* Ascending Data Particle */}
                    <motion.circle
                      animate={{ cy: [70, 25], opacity: [0.8, 0], r: [2, 3.5] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      cx="50"
                      cy="70"
                      fill="#3074FE"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Card Footer Caption */}
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                  Your AI remembers
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Useful context across every conversation.
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* BOX 2: < 15 ms p95 Semantic Retrieval (Top Row, Col 4-8)      */}
            {/* ------------------------------------------------------------- */}
            <div
              onMouseEnter={() => setIsHoveredRadar(true)}
              onMouseLeave={() => setIsHoveredRadar(false)}
              className="why-remora-card"
              style={{
                gridColumn: 'span 5',
                borderRadius: '16px',
                border: isHoveredRadar ? '1px solid rgba(48, 116, 254, 0.4)' : '1px solid rgba(15, 23, 42, 0.08)',
                background: isHoveredRadar
                  ? 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isHoveredRadar
                  ? '0 12px 28px -6px rgba(48, 116, 254, 0.1)'
                  : '0 2px 6px rgba(15, 23, 42, 0.03)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '270px'
              }}
            >
              {/* Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
                  FAST RECALL
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: isHoveredRadar ? 'rgba(48, 116, 254, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                    color: isHoveredRadar ? '#3074FE' : '#475569',
                    border: isHoveredRadar ? '1px solid rgba(48, 116, 254, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Zap size={11} />
                  Quick responses
                </span>
              </div>

              {/* Big Metric Display with TextMorph */}
              <div style={{ margin: '8px 0' }}>
                <div
                  style={{
                    fontSize: 'clamp(32px, 3.4vw, 42px)',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.1',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                   <TextMorph duration={650}>{recallStates[recallIdx].metric}</TextMorph>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
                   <TextMorph duration={650}>{recallStates[recallIdx].label}</TextMorph>
                </div>
              </div>

              {/* Simple memory recall preview */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  padding: '12px 14px 10px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Recall preview header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3074FE', boxShadow: '0 0 6px rgba(48, 116, 254, 0.6)' }} />
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f172a' }}>
                      searching your memory
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      padding: '1.5px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(48, 116, 254, 0.08)',
                      color: '#3074FE',
                      fontWeight: 600
                    }}
                  >
                    3 relevant memories
                  </span>
                </div>

                {/* Simple recall animation: one question in, one calm stack of memories out. */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1.35fr)',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: '92px'
                  }}
                >
                  <motion.div
                    animate={{ y: isHoveredRadar ? -2 : 0, scale: isHoveredRadar ? 1.02 : 1 }}
                    transition={{ duration: 0.25 }}
                    style={{ textAlign: 'center', minWidth: 0 }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        maxWidth: '100%',
                        padding: '7px 10px',
                        borderRadius: '9px',
                        background: 'rgba(48, 116, 254, 0.07)',
                        border: '1px solid rgba(48, 116, 254, 0.3)',
                        color: '#0f172a',
                        fontSize: '10px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Sparkles size={12} color="#3074FE" />
                      Your question
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '5px' }}>
                      What your user needs
                    </div>
                  </motion.div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                    {[
                      { key: 'Preferences', sim: 'Best match' },
                      { key: 'Your role', sim: 'Strong match' },
                      { key: 'Past context', sim: 'Related' }
                    ].map((item, idx) => (
                      <motion.div
                        key={item.key}
                        animate={{ opacity: [0.72, 1, 0.72], x: [3, 0, 3] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.18 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          minWidth: 0,
                          padding: '5px 8px',
                          borderRadius: '7px',
                          background: '#ffffff',
                          border: '1px solid rgba(15, 23, 42, 0.1)',
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                        }}
                      >
                        <span style={{ fontSize: '9px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.key}
                        </span>
                        <span style={{ fontSize: '8px', color: '#3074FE', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {item.sim}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* BOX 3: 0.93 sim Auto-Deduplication (Top Row, Col 9-12)        */}
            {/* ------------------------------------------------------------- */}
            <div
              onMouseEnter={() => setIsHoveredDedup(true)}
              onMouseLeave={() => setIsHoveredDedup(false)}
              className="why-remora-card"
              style={{
                gridColumn: 'span 4',
                borderRadius: '16px',
                border: isHoveredDedup ? '1px solid rgba(48, 116, 254, 0.4)' : '1px solid rgba(15, 23, 42, 0.08)',
                background: isHoveredDedup
                  ? 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                padding: '20px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isHoveredDedup
                  ? '0 12px 28px -6px rgba(48, 116, 254, 0.1)'
                  : '0 2px 6px rgba(15, 23, 42, 0.03)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '270px'
              }}
            >
              {/* Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
                  CLEAN CONTEXT
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSimCollisionTriggered(true);
                    setTimeout(() => setIsSimCollisionTriggered(false), 850);
                  }}
                  title="Click to replay auto-deduplication"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: isHoveredDedup ? 'rgba(48, 116, 254, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                    color: isHoveredDedup ? '#3074FE' : '#475569',
                    border: isHoveredDedup ? '1px solid rgba(48, 116, 254, 0.2)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <GitMerge size={11} />
                  Keeps it tidy
                </button>
              </div>

              {/* Big Stat Display with TextMorph */}
              <div style={{ margin: '6px 0 2px 0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      fontSize: 'clamp(30px, 3.2vw, 40px)',
                      fontWeight: 700,
                      color: '#0f172a',
                      letterSpacing: '-0.03em',
                      lineHeight: '1.1'
                    }}
                  >
                    Clean context
                  </div>
                  {/* Interactive Threshold Preset Selector */}
                  <div style={{ display: 'inline-flex', gap: '3px', background: 'rgba(15, 23, 42, 0.04)', padding: '2px', borderRadius: '8px' }}>
                    {[0.90, 0.93, 0.96].map((th) => {
                      const isActive = selectedThreshold === th;
                      return (
                        <button
                          key={th}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedThreshold(th);
                            setIsSimCollisionTriggered(true);
                            setTimeout(() => setIsSimCollisionTriggered(false), 850);
                          }}
                          style={{
                            border: isActive ? '1px solid rgba(48, 116, 254, 0.3)' : '1px solid transparent',
                            backgroundColor: isActive ? '#ffffff' : 'transparent',
                            color: isActive ? '#3074FE' : '#64748b',
                            fontSize: '10px',
                            fontWeight: isActive ? 700 : 500,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.06)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {th === 0.9 ? 'Flexible' : th === 0.93 ? 'Balanced' : 'Strict'}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                  <TextMorph duration={650}>{dedupStates[dedupIdx]}</TextMorph>
                </div>
              </div>

              {/* Deduplication Threshold Micro-interaction / Visual */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid rgba(15, 23, 42, 0.07)',
                  padding: '10px 12px',
                  boxShadow: '0 2px 5px rgba(15, 23, 42, 0.02)'
                }}
              >
                {/* Distance Metric & Comparison */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sliders size={11} color="#64748b" />
                    Similarity check
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 0.954 >= selectedThreshold ? '#3074FE' : '#64748b',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {0.954 >= selectedThreshold ? 'Likely the same detail' : 'Looks different'}
                  </span>
                </div>

                {/* Interactive Dynamic Progress Bar with Needle Marker */}
                <div
                  style={{
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(15, 23, 42, 0.08)',
                    position: 'relative',
                    overflow: 'visible',
                    margin: '8px 0 10px 0'
                  }}
                >
                  {/* Actual Similarity Value Fill Bar */}
                  <motion.div
                    animate={{ width: isSimCollisionTriggered ? '95.4%' : '95.4%' }}
                    style={{
                      height: '100%',
                      borderRadius: '9999px',
                      backgroundColor: 0.954 >= selectedThreshold ? '#3074FE' : '#94a3b8'
                    }}
                  />
                  {/* Dynamic Threshold Needle Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      bottom: '-4px',
                      left: `${selectedThreshold * 100}%`,
                      width: '2px',
                      backgroundColor: '#0f172a',
                      borderRadius: '1px',
                      transform: 'translateX(-50%)',
                      transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: 3
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-13px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#0f172a',
                        backgroundColor: '#ffffff',
                        padding: '0 2px',
                        borderRadius: '2px',
                        border: '1px solid rgba(15, 23, 42, 0.1)',
                        lineHeight: '1'
                      }}
                    >
                      {selectedThreshold}
                    </div>
                  </div>
                </div>

                {/* Animated Memory Ingestion / Collision Pill Simulation */}
                <div
                  onClick={() => {
                    setIsSimCollisionTriggered(true);
                    setTimeout(() => setIsSimCollisionTriggered(false), 850);
                  }}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.02)',
                    border: '1px dashed rgba(15, 23, 42, 0.12)',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    marginTop: '6px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <div
                      style={{
                        fontSize: '9.5px',
                        fontFamily: 'var(--font-mono)',
                        color: '#475569',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '120px'
                      }}
                    >
                      Prefers TypeScript
                    </div>
                    <motion.div
                      animate={
                        isSimCollisionTriggered
                          ? { scale: [1, 1.35, 1], rotate: [0, 180, 360] }
                          : { scale: 1, rotate: 0 }
                      }
                      transition={{ duration: 0.55 }}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 0.954 >= selectedThreshold ? '#3074FE' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0,
                        boxShadow: 0.954 >= selectedThreshold ? '0 0 10px rgba(48, 116, 254, 0.4)' : 'none'
                      }}
                    >
                      <GitMerge size={10} />
                    </motion.div>
                    <div
                      style={{
                        fontSize: '9.5px',
                        fontFamily: 'var(--font-mono)',
                        color: '#475569',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '120px'
                      }}
                    >
                      Uses Next.js
                    </div>
                  </div>

                  {/* Collision outcome banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      marginTop: '6px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      color: 0.954 >= selectedThreshold ? '#1e40af' : '#475569'
                    }}
                  >
                    {0.954 >= selectedThreshold ? (
                      <>
                        <CheckCircle2 size={11} color="#3074FE" />
                        <span>Merged into one useful memory</span>
                      </>
                    ) : (
                      <>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                        <span>Kept separate so both details stay clear</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* BOX 4: 1536-dim Neon pgvector HNSW Index (Bottom, Col 1-8)     */}
            {/* ------------------------------------------------------------- */}
            <div
              onMouseEnter={() => setIsHoveredDim(true)}
              onMouseLeave={() => setIsHoveredDim(false)}
              className="why-remora-card"
              style={{
                gridColumn: 'span 8',
                borderRadius: '16px',
                border: isHoveredDim ? '1px solid rgba(48, 116, 254, 0.4)' : '1px solid rgba(15, 23, 42, 0.08)',
                background: isHoveredDim
                  ? 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isHoveredDim
                  ? '0 12px 28px -6px rgba(48, 116, 254, 0.1)'
                  : '0 2px 6px rgba(15, 23, 42, 0.03)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '210px'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(240px, 1fr) minmax(280px, 1.2fr)',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                {/* Left Column: Stat, Dimension Selector, Specs */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', textAlign: 'left' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
                      FLEXIBLE SETUP
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(15, 23, 42, 0.05)',
                        color: '#475569'
                      }}
                    >
                      Works with your stack
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 'clamp(32px, 3.4vw, 42px)',
                      fontWeight: 700,
                      color: '#0f172a',
                      letterSpacing: '-0.03em',
                      lineHeight: '1.1',
                      textAlign: 'left'
                    }}
                  >
                    Fits your model
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: 500,
                      marginTop: '2px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <TextMorph duration={650}>{dimTitles[dimIdx % dimTitles.length]}</TextMorph>
                  </div>

                  {/* Interactive Dimension Model Selector Tabs */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap', textAlign: 'left' }}>
                    {dimPresets.map((preset) => {
                      const isActive = selectedDim === preset.dim;
                      return (
                        <button
                          key={preset.dim}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDim(preset.dim);
                            setDimIdx(1); // Immediately displays `${preset.dim}-dim Hyperplane`
                          }}
                          style={{
                            border: isActive ? '1px solid #3074FE' : '1px solid rgba(15, 23, 42, 0.08)',
                            backgroundColor: isActive ? 'rgba(48, 116, 254, 0.08)' : '#ffffff',
                            color: isActive ? '#3074FE' : '#475569',
                            fontSize: '11px',
                            fontWeight: isActive ? 600 : 500,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {preset.short}
                        </button>
                      );
                    })}
                  </div>

                  {/* Parameters Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      Easy to adapt · quick to search
                    </span>
                  </div>
                </div>

                {/* Right Column: Interactive Multi-Layer HNSW Constellation Graph */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    position: 'relative',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Network size={13} color="#3074FE" />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a' }}>
                        How Remora finds a memory
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontFamily: 'var(--font-mono)',
                        color: '#3074FE',
                        backgroundColor: 'rgba(48, 116, 254, 0.08)',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      Explore the path
                    </span>
                  </div>

                  {/* SVG HNSW Graph */}
                  <div style={{ position: 'relative', width: '100%', height: '96px' }}>
                    <svg
                      viewBox="0 0 280 105"
                      style={{ width: '100%', height: '100%', overflow: 'visible' }}
                    >
                      {/* Layer demarcation labels */}
                      <text x="2" y="19" fontSize="8" fill="#94a3b8" fontFamily="monospace">L2</text>
                      <text x="2" y="55" fontSize="8" fill="#94a3b8" fontFamily="monospace">L1</text>
                      <text x="2" y="95" fontSize="8" fill="#94a3b8" fontFamily="monospace">L0</text>

                      {/* Layer horizontal guidelines */}
                      <line x1="16" y1="16" x2="275" y2="16" stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="2,2" />
                      <line x1="16" y1="52" x2="275" y2="52" stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="2,2" />
                      <line x1="16" y1="92" x2="275" y2="92" stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="2,2" />

                      {/* Background Graph Edges */}
                      {hnswEdges.map(([fromId, toId], idx) => {
                        const fromNode = hnswNodes[fromId];
                        const toNode = hnswNodes[toId];
                        const isTraversed =
                          (fromId === 0 && toId === 3) ||
                          (fromId === 3 && toId === 7);
                        return (
                          <line
                            key={`edge-${idx}`}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke={isTraversed ? '#3074FE' : 'rgba(15, 23, 42, 0.12)'}
                            strokeWidth={isTraversed ? 1.6 : 1}
                            strokeDasharray={isTraversed ? 'none' : '2,2'}
                          />
                        );
                      })}

                      {/* Traveling Beam Packet along Greedy Traversal (0 -> 3 -> 7) */}
                      <motion.circle
                        r="3.5"
                        fill="#3074FE"
                        filter="drop-shadow(0 0 4px #3074FE)"
                        animate={{
                          cx: [45, 125, 135, 135],
                          cy: [16, 50, 88, 88],
                          opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />

                      {/* Graph Nodes */}
                      {hnswNodes.map((node) => {
                        const isSelected = activeVectorNode === node.id;
                        const isGreedyTarget = node.id === 7;
                        return (
                          <g
                            key={`node-${node.id}`}
                            onClick={() => setActiveVectorNode(node.id)}
                            onMouseEnter={() => setActiveVectorNode(node.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Selected / Target Halo Pulse */}
                            {(isSelected || isGreedyTarget) && (
                              <motion.circle
                                cx={node.x}
                                cy={node.y}
                                r={isSelected ? 8 : 7}
                                fill="none"
                                stroke="#3074FE"
                                strokeWidth="1.2"
                                animate={{ r: [6, 10, 6], opacity: [0.8, 0.2, 0.8] }}
                                transition={{ duration: 1.8, repeat: Infinity }}
                              />
                            )}

                            {/* Node Core */}
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={isGreedyTarget ? 4.5 : 3.5}
                              fill={isSelected || isGreedyTarget ? '#3074FE' : '#ffffff'}
                              stroke={isSelected || isGreedyTarget ? '#ffffff' : '#64748b'}
                              strokeWidth="1.5"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Active Node Inspector Readout */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(15, 23, 42, 0.06)',
                      paddingTop: '6px',
                      marginTop: '4px'
                    }}
                  >
                    <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
                      Memory path step {activeVectorNode + 1}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#3074FE', fontFamily: 'var(--font-mono)' }}>
                      {activeVectorNode === 7 ? 'Best match found' : 'Following related context'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Spec Footer: Neon Serverless Postgres with Coordinate preview */}
              <div
                style={{
                  marginTop: '14px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3074FE' }} />
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                    Your memories stay together
                  </span>
                </div>

                <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  Works with popular AI models and databases
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* BOX 5: 0 ms Added Chat Latency BullMQ (Bottom, Col 9-12)      */}
            {/* ------------------------------------------------------------- */}
            <div
              onMouseEnter={() => setIsHoveredBull(true)}
              onMouseLeave={() => setIsHoveredBull(false)}
              className="why-remora-card"
              style={{
                gridColumn: 'span 4',
                borderRadius: '16px',
                border: isHoveredBull ? '1px solid rgba(48, 116, 254, 0.4)' : '1px solid rgba(15, 23, 42, 0.08)',
                background: isHoveredBull
                  ? 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isHoveredBull
                  ? '0 12px 28px -6px rgba(48, 116, 254, 0.1)'
                  : '0 2px 6px rgba(15, 23, 42, 0.03)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '190px'
              }}
            >
              {/* Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
                  BACKGROUND WORK
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: isHoveredBull ? 'rgba(48, 116, 254, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                    color: isHoveredBull ? '#3074FE' : '#475569',
                    border: isHoveredBull ? '1px solid rgba(48, 116, 254, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Activity size={11} />
                  No interruption
                </span>
              </div>

              {/* Big Stat Display with TextMorph */}
              <div style={{ margin: '8px 0' }}>
                <div
                  style={{
                    fontSize: 'clamp(32px, 3.4vw, 42px)',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.1'
                  }}
                >
                  No slowdown
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
                  <TextMorph duration={650}>{latencyClaims[claimIdx]}</TextMorph>
                </div>
              </div>

              {/* Token Streaming Animation: AI Agent -> User Computer */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid rgba(15, 23, 42, 0.07)',
                  padding: '10px 12px 8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Simulated Token Stream Track Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10.5px', color: '#64748b' }}>While you chat:</span>
                  <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    KEEP TALKING
                  </span>
                </div>

                {/* AI Agent to Computer Token Transfer Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    height: '34px',
                    margin: '2px 0 6px'
                  }}
                >
                  {/* Left: AI Agent Icon */}
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(48, 116, 254, 0.08)',
                      border: '1px solid rgba(48, 116, 254, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3074FE',
                      flexShrink: 0,
                      zIndex: 3
                    }}
                    title="AI Agent"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path transform="translate(3 2)" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 11C5 10.45 5.45 10 6 10C6.55 10 7 10.45 7 11C7 11.55 6.55 12 6 12C5.45 12 5 11.55 5 11Z"/>
                      <path transform="translate(3 2)" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M11 11C11 10.45 11.45 10 12 10C12.55 10 13 10.45 13 11C13 11.55 12.55 12 12 12C11.45 12 11 11.55 11 11Z"/>
                      <path transform="translate(3 2)" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M0 12C0 10.14 0 9.21 0.24 8.45C0.74 6.93 1.93 5.74 3.45 5.24C4.21 5 5.14 5 7 5L9 5L11 5C12.86 5 13.79 5 14.55 5.24C16.07 5.74 17.26 6.93 17.76 8.45C18 9.21 18 10.14 18 12C18 13.86 18 14.79 17.76 15.55C17.26 17.07 16.07 18.26 14.55 18.76C13.79 19 12.86 19 11 19L7 19C5.14 19 4.21 19 3.45 18.76C1.93 18.26 0.74 17.07 0.24 15.55C0 14.79 0 13.86 0 12Z"/>
                      <path transform="translate(3 2)" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 0L9 5"/>
                    </svg>
                  </div>

                  {/* Token Streaming Pathway */}
                  <div
                    style={{
                      flex: 1,
                      position: 'relative',
                      height: '100%',
                      margin: '0 8px',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Subtle Dashed Connection Track */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        borderTop: '1px dashed rgba(15, 23, 42, 0.15)',
                        zIndex: 1
                      }}
                    />

                    {/* Staggered Streaming Tokens */}
                    {[0, 0.65, 1.3].map((delay, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ left: '0%', opacity: 0 }}
                        animate={{
                          left: ['0%', '100%'],
                          opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                          duration: 1.9,
                          repeat: Infinity,
                          delay,
                          ease: 'easeInOut'
                        }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 2,
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <span
                          style={{
                            padding: '1.5px 5px',
                            borderRadius: '4px',
                            backgroundColor: '#3074FE',
                            color: '#ffffff',
                            fontSize: '8px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                            boxShadow: '0 1px 4px rgba(48, 116, 254, 0.3)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          tok
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Right: Computer / Laptop Icon */}
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.05)',
                      border: '1px solid rgba(15, 23, 42, 0.09)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f172a',
                      flexShrink: 0,
                      zIndex: 3
                    }}
                    title="User Computer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path transform="translate(2 4)" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M20 13C20 14.66 18.66 16 17 16L3 16C1.34 16 0 14.66 0 13C0 12.45 0.45 12 1 12L19 12C19.55 12 20 12.45 20 13Z"/>
                      <path transform="translate(2 4)" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 12L19 4.8C19 3.12 19 2.28 18.67 1.64C18.39 1.07 17.93 0.61 17.36 0.33C16.72 0 15.88 0 14.2 0L5.8 0C4.12 0 3.28 0 2.64 0.33C2.07 0.61 1.61 1.07 1.33 1.64C1 2.28 1 3.12 1 4.8L1 12"/>
                    </svg>
                  </div>
                </div>

                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px' }}>
                  <TextMorph duration={650}>{latencySub[claimIdx]}</TextMorph>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
