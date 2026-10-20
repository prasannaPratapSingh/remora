'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Sliders, 
  Search, 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers, 
  Cpu 
} from 'lucide-react';
import { Memory } from '../lib/types';
import { apiService } from '../lib/api';

interface SearchPlaygroundViewProps {
  memories: Memory[];
  projectId?: string;
}

export const SearchPlaygroundView: React.FC<SearchPlaygroundViewProps> = ({ memories, projectId }) => {
  const availableUsers = Array.from(new Set(memories.map(m => m.externalUserId)));
  const [query, setQuery] = useState('');
  const [wSim, setWSim] = useState(0.55);
  const [wImp, setWImp] = useState(0.20);
  const [wConf, setWConf] = useState(0.15);
  const [wRec, setWRec] = useState(0.10);
  const [selectedUser, setSelectedUser] = useState(availableUsers[0] || 'default-user');
  const [activeTab, setActiveTab] = useState<'ranking' | 'context'>('ranking');
  const [copiedContext, setCopiedContext] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLatency, setSearchLatency] = useState<number | null>(null);
  const [liveBackendResults, setLiveBackendResults] = useState<any[] | null>(null);

  const handleExecuteSearch = async () => {
    if (!projectId || !query.trim() || !selectedUser) return;
    setIsSearching(true);
    try {
      const data = await apiService.searchProjectMemories(projectId, query.trim(), selectedUser);
      setLiveBackendResults(data.results || []);
      setSearchLatency(data.latencyMs ?? null);
    } catch (err) {
      console.error('Vector search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Compute live scores based on user query and weights
  const sourceList = liveBackendResults !== null 
    ? liveBackendResults 
    : memories.filter(m => m.externalUserId === selectedUser);

  const results = sourceList
    .map(m => {
      // Use real pgvector cosine similarity if returned by backend, else approximate
      let rawSim = 0.5;
      if (typeof m.similarity === 'number') {
        rawSim = Math.max(0, Math.min(1, m.similarity));
      } else {
        const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
        let matchCount = 0;
        queryWords.forEach(w => {
          if (m.content.toLowerCase().includes(w) || (m.namespace && m.namespace.toLowerCase().includes(w))) matchCount++;
        });
        rawSim = Math.min(0.98, Math.max(0.45, 0.45 + (matchCount / Math.max(1, queryWords.length)) * 0.5));
      }

      // Exponential recency decay based on lastAccessedAt or createdAt
      const refTime = m.lastAccessedAt || m.createdAt || new Date().toISOString();
      const hoursAgo = Math.max(0, (Date.now() - new Date(refTime).getTime()) / (1000 * 60 * 60));
      const decay = Math.exp(-0.01 * hoursAgo);

      // Composite Hybrid Score
      const finalScore = (wSim * rawSim) + (wImp * (m.importance ?? 0.8)) + (wConf * (m.confidence ?? 0.9)) + (wRec * decay);

      return {
        ...m,
        similarity: rawSim,
        decayFactor: decay,
        combinedScore: finalScore
      };
    })
    .sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));

  // Compact Prompt Context generation simulation
  const generatedPromptContext = `<user_context>
[User: ${selectedUser}]
${results.slice(0, 3).map((r, i) => `${i + 1}. [${r.type}] ${r.content} (importance: ${r.importance})`).join('\n')}
</user_context>`;

  const handleCopyContext = () => {
    navigator.clipboard.writeText(generatedPromptContext);
    setCopiedContext(true);
    setTimeout(() => setCopiedContext(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={22} color="var(--accent-indigo)" />
          Hybrid Search Playground
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Tune hybrid ranking coefficients in real time: Score = (w_s × sim) + (w_i × imp) + (w_c × conf) + (w_r × rec)
        </p>
      </div>

      {/* Main Grid: Query + Weights Sidebar and Results Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px' }}>
        {/* Controls Column */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={16} color="var(--accent-indigo)" />
            Query & Weights Tuning
          </h2>

          {/* Search Query Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Search Prompt / Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleExecuteSearch();
                }
              }}
              rows={3}
              className="input-base"
              style={{ resize: 'vertical', fontSize: '13px' }}
              placeholder="Enter search phrase or question... (Cmd+Enter to run)"
              id="input-playground-query"
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleExecuteSearch}
                disabled={isSearching || !query.trim() || !projectId}
                className="btn btn-primary"
                style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Search size={14} />
                {isSearching ? 'Querying pgvector...' : 'Run Vector Search'}
              </button>
              {searchLatency !== null && (
                <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                  pgvector: {searchLatency}ms
                </span>
              )}
            </div>
          </div>

          {/* User ID Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Scoped User ID
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input-base"
            >
              {availableUsers.length === 0 ? (
                <option value="">No users with memories yet</option>
              ) : (
                availableUsers.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))
              )}
            </select>
          </div>

          {/* Weight Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)' }}>Semantic Similarity (w_sim)</span>
                <strong style={{ color: 'var(--accent-indigo)' }}>{wSim.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={wSim}
                onChange={(e) => setWSim(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)' }}>Importance Weight (w_imp)</span>
                <strong style={{ color: 'var(--accent-amber)' }}>{wImp.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={wImp}
                onChange={(e) => setWImp(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)' }}>Confidence Weight (w_conf)</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>{wConf.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={wConf}
                onChange={(e) => setWConf(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)' }}>Recency Decay (w_rec)</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{wRec.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={wRec}
                onChange={(e) => setWRec(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              setWSim(0.55);
              setWImp(0.20);
              setWConf(0.15);
              setWRec(0.10);
            }}
            className="btn-secondary"
            style={{ fontSize: '12px', marginTop: '4px' }}
          >
            Reset to Recommended PRD Defaults
          </button>
        </div>

        {/* Results Canvas */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('ranking')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'ranking' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: activeTab === 'ranking' ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Ranked Retrieval ({results.length})
              </button>
              <button
                onClick={() => setActiveTab('context')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'context' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: activeTab === 'context' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Prompt Injection Preview (/v1/memories/context)
              </button>
            </div>
          </div>

          {activeTab === 'ranking' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Sparkles size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: 600, marginBottom: '6px' }}>
                    No memories to rank
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {memories.length === 0
                      ? 'No memories stored in this project yet. Ingest memories to test hybrid retrieval.'
                      : `No memories found matching "${selectedUser}".`}
                  </div>
                </div>
              ) : (
                results.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '10px',
                    backgroundColor: idx === 0 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: idx === 0 ? '1px solid var(--border-highlight)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: idx === 0 ? 'var(--accent-indigo)' : 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#ffffff'
                      }}>
                        {idx + 1}
                      </span>
                      <span className="badge badge-indigo">{item.type}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.namespace}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Composite Score:</span>
                      <strong style={{ fontSize: '15px', color: 'var(--accent-emerald)' }}>
                        {(item.combinedScore || 0).toFixed(3)}
                      </strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: '#f8fafc', lineHeight: '1.4' }}>
                    {item.content}
                  </p>

                  {/* Math Breakdown Bar */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Cosine Sim: </span>
                      <strong style={{ color: 'var(--accent-indigo)' }}>{item.similarity?.toFixed(3)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Importance: </span>
                      <strong style={{ color: 'var(--accent-amber)' }}>{item.importance.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Confidence: </span>
                      <strong style={{ color: 'var(--accent-emerald)' }}>{item.confidence.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Recency Decay: </span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{item.decayFactor?.toFixed(3)}</strong>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  This formatted payload is what your AI Agent directly injects into the LLM system prompt.
                </span>
                <button onClick={handleCopyContext} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  {copiedContext ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  <span>{copiedContext ? 'Copied' : 'Copy Context'}</span>
                </button>
              </div>

              <pre style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '13px',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}>
                {generatedPromptContext}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
