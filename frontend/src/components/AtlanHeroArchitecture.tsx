'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, 
  Cpu, 
  Database, 
  Sparkles, 
  Zap, 
  Workflow, 
  Layers, 
  Code2, 
  Terminal, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AtlanHeroArchitecture: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', maxWidth: '1160px', margin: '0 auto', position: 'relative' }}>
      {/* Outer Glassmorphic Frame with Clean Slate/White Styling */}
      <div style={{
        borderRadius: '24px 24px 0 0',
        padding: '12px 12px 0 12px',
        background: 'linear-gradient(180deg, rgba(241, 245, 249, 0.95) 0%, rgba(248, 250, 252, 0.7) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderBottom: 'none',
        boxShadow: '0 -10px 40px -10px rgba(15, 23, 42, 0.06), 0 20px 40px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
      }}>
        {/* Main Inner Canvas (Clean White Architecture Card) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px 16px 0 0',
          padding: '36px 32px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative'
        }}>
          {/* Top Row: Category Title & Top Agent Chips */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            gap: '24px',
            alignItems: 'center'
          }}>
            {/* Left Label */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                Layer 01
              </span>
              <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                Interfaces & Agents
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Any LLM or framework
              </p>
            </div>

            {/* Right: 4 Modular Agent Boxes (Just like Atlan's top cards) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              {/* Box 1: Custom Agents */}
              <div 
                onMouseEnter={() => setHoveredCard('custom')}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: hoveredCard === 'custom' ? '#f0f7ff' : '#f8fafc',
                  border: hoveredCard === 'custom' ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Custom Agents
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={15} color="#3b82f6" />
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Workflow size={15} color="#6366f1" />
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={15} color="#f59e0b" />
                  </div>
                </div>
              </div>

              {/* Box 2: Frameworks */}
              <div 
                onMouseEnter={() => setHoveredCard('frameworks')}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: hoveredCard === 'frameworks' ? '#f0fdf4' : '#f8fafc',
                  border: hoveredCard === 'frameworks' ? '1px solid #86efac' : '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Frameworks
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>LangChain</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>CrewAI</span>
                </div>
              </div>

              {/* Box 3: General Purpose LLMs */}
              <div 
                onMouseEnter={() => setHoveredCard('llms')}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: hoveredCard === 'llms' ? '#fbf5ff' : '#f8fafc',
                  border: hoveredCard === 'llms' ? '1px solid #d8b4fe' : '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LLM Providers
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>OpenAI</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>Claude</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>Groq</span>
                </div>
              </div>

              {/* Box 4: Client SDKs */}
              <div 
                onMouseEnter={() => setHoveredCard('sdks')}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: hoveredCard === 'sdks' ? '#fff7ed' : '#f8fafc',
                  border: hoveredCard === 'sdks' ? '1px solid #fdba74' : '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Integration
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>TypeScript</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>REST API</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dotted / Animated Conduits Flowing to Middle Core */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24px', position: 'relative' }}>
            <div style={{ width: '80%', height: '1px', borderTop: '2px dashed #cbd5e1', position: 'absolute' }} />
            <motion.div 
              animate={{ y: [-4, 4, -4], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{
                zIndex: 2,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '2px 10px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
              }}
            >
              Unified Context Pipeline
            </motion.div>
          </div>

          {/* Middle Row: Remora Cognitive Engine (The Core Hero Layer) */}
          <div style={{
            borderRadius: '16px',
            backgroundColor: '#0f172a',
            padding: '24px',
            color: '#f8fafc',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ambient inner glow */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }} />

            {/* Core Feature 1 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Cpu size={18} color="#a5b4fc" />
              </div>
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  Atomic Fact Extraction
                </h5>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Filters conversational noise; distills turns into structured declarative knowledge.
                </p>
              </div>
            </div>

            {/* Core Feature 2 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Layers size={18} color="#67e8f9" />
              </div>
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  Auto Deduplication (&gt;0.93)
                </h5>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Repeated statements reinforce confidence instead of polluting the vector index.
                </p>
              </div>
            </div>

            {/* Core Feature 3 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={18} color="#6ee7b7" />
              </div>
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  Hybrid Ranking & Decay
                </h5>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Combines cosine similarity, importance, and Ebbinghaus exponential recency.
                </p>
              </div>
            </div>

            {/* Core Feature 4 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Database size={18} color="#fda4af" />
              </div>
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  Neon pgvector & Redis
                </h5>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Sub-15ms HNSW index in unified ACID PostgreSQL with 1ms hot Redis context cache.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px',
            fontSize: '12px',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={13} color="#10b981" /> No <code>user_memories</code> tables needed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={13} color="#10b981" /> Zero dual-database sync bugs
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={13} color="#10b981" /> Strict multi-tenant row isolation
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0f172a' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              Live Production Infrastructure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
