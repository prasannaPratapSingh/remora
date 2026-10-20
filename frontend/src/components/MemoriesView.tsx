'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Eye, 
  Clock, 
  Tag, 
  History, 
  User, 
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { Memory, MemoryType, MemoryStatus } from '../lib/types';

interface MemoriesViewProps {
  memories: Memory[];
  onAddMemory: (newMem: Partial<Memory>) => void;
  onDeleteMemory: (id: string) => void;
  onOpenAddModal: () => void;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onOpenAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeInspectorMemory, setActiveInspectorMemory] = useState<Memory | null>(null);

  // Extract unique namespaces
  const namespaces = ['all', ...Array.from(new Set(memories.map(m => m.namespace)))];

  const filteredMemories = memories.filter(m => {
    const matchesSearch = 
      m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.externalUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.namespace.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNamespace = selectedNamespace === 'all' || m.namespace === selectedNamespace;
    const matchesType = selectedType === 'all' || m.type === selectedType;

    return matchesSearch && matchesNamespace && matchesType;
  });

  const getTypeBadgeClass = (type: MemoryType) => {
    switch (type) {
      case 'PREFERENCE':
      case 'SEMANTIC': return 'badge-indigo';
      case 'FACT': return 'badge-cyan';
      case 'INSTRUCTION':
      case 'PROCEDURAL': return 'badge-emerald';
      case 'PROJECT_CONTEXT':
      case 'EPISODIC': return 'badge-purple';
      case 'GOAL': return 'badge-amber';
      case 'DECISION': return 'badge-rose';
      default: return 'badge-indigo';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>Memory Explorer</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Inspect, filter, and audit all persistent knowledge vectors across users and namespaces.
          </p>
        </div>

        <button onClick={onOpenAddModal} className="btn-primary" id="btn-add-memory-top">
          <Plus size={16} />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by content, user ID, or namespace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base"
              style={{ paddingLeft: '38px' }}
              id="input-memory-search"
            />
          </div>

          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-base"
            style={{ width: 'auto', minWidth: '150px' }}
            id="select-memory-type"
          >
            <option value="all">All Types</option>
            <option value="FACT">Fact</option>
            <option value="PREFERENCE">Preference</option>
            <option value="PROFILE">Profile</option>
            <option value="PROJECT_CONTEXT">Project Context</option>
            <option value="INSTRUCTION">Instruction</option>
            <option value="GOAL">Goal</option>
            <option value="DECISION">Decision</option>
          </select>
        </div>

        {/* Namespace Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Namespace:</span>
          {namespaces.map((ns) => (
            <button
              key={ns}
              onClick={() => setSelectedNamespace(ns)}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedNamespace === ns ? 'var(--accent-indigo)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedNamespace === ns ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {ns}
            </button>
          ))}
        </div>
      </div>

      {/* Memory List Table / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredMemories.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>No memories match your query</p>
            <p style={{ fontSize: '13px' }}>Try adjusting your search criteria or add a new memory vector.</p>
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1 }}>
                {/* Meta Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge ${getTypeBadgeClass(mem.type)}`}>
                    {mem.type}
                  </span>
                  <span className="badge badge-emerald">
                    {mem.status}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: 'var(--accent-cyan)',
                    backgroundColor: 'rgba(6, 182, 212, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    <User size={12} />
                    {mem.externalUserId}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={12} />
                    {mem.namespace}
                  </span>
                  {mem.versions && mem.versions.length > 1 && (
                    <span className="badge badge-amber" style={{ fontSize: '10px' }}>
                      <History size={10} />
                      v{mem.versions.length}
                    </span>
                  )}
                </div>

                {/* Content */}
                <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#f1f5f9', marginBottom: '10px' }}>
                  {mem.content}
                </p>

                {/* Footer Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div>
                    <span>Importance: </span>
                    <strong style={{ color: 'var(--accent-amber)' }}>{(mem.importance * 100).toFixed(0)}%</strong>
                  </div>
                  <div>
                    <span>Confidence: </span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>{(mem.confidence * 100).toFixed(0)}%</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>Accessed {formatRelativeTime(mem.lastAccessedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setActiveInspectorMemory(mem)}
                  className="btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  title="Inspect raw details and version history"
                >
                  <Eye size={14} />
                  <span>Inspect</span>
                </button>
                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="btn-danger"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  title="Delete memory"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail / Version History Drawer */}
      {activeInspectorMemory && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '480px',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-highlight)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.6)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="var(--accent-indigo)" />
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>Memory Inspector</h2>
            </div>
            <button
              onClick={() => setActiveInspectorMemory(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Memory ID</label>
              <div style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '2px' }}>{activeInspectorMemory.id}</div>
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content</label>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', color: '#f8fafc', marginTop: '4px', lineHeight: '1.5' }}>
                {activeInspectorMemory.content}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Target User</label>
                <div style={{ color: '#ffffff', fontWeight: 500 }}>{activeInspectorMemory.externalUserId}</div>
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Namespace</label>
                <div style={{ color: '#ffffff', fontWeight: 500 }}>{activeInspectorMemory.namespace}</div>
              </div>
            </div>

            {/* Metadata JSON */}
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metadata (JSONB)</label>
              <pre style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#38bdf8',
                marginTop: '4px',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto'
              }}>
                {JSON.stringify(activeInspectorMemory.metadata || {}, null, 2)}
              </pre>
            </div>

            {/* Version History */}
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={13} color="var(--accent-amber)" />
                Audit Trail & Version History
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {activeInspectorMemory.versions && activeInspectorMemory.versions.length > 0 ? (
                  activeInspectorMemory.versions.map((ver, idx) => (
                    <div key={ver.id} style={{
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderLeft: '3px solid var(--accent-indigo)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>Revision #{idx + 1}</span>
                        <span>{new Date(ver.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#e2e8f0' }}>{ver.content}</p>
                      {ver.reason && (
                        <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                          Reason: {ver.reason}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    No prior superseded versions (initial revision).
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
