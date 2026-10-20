'use client';

import React, { useState } from 'react';
import { X, Plus, BrainCircuit } from 'lucide-react';
import { Memory, MemoryType } from '../lib/types';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newMemory: Partial<Memory>) => void;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [userId, setUserId] = useState('');
  const [namespace, setNamespace] = useState('default');
  const [type, setType] = useState<MemoryType>('SEMANTIC');
  const [content, setContent] = useState('');
  const [importance, setImportance] = useState(0.85);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userId.trim()) return;

    onAdd({
      externalUserId: userId.trim(),
      namespace: namespace.trim() || 'default',
      type,
      content: content.trim(),
      importance,
      confidence: 0.95,
      status: 'ACTIVE',
      sourceType: 'DASHBOARD_CONSOLE',
      metadata: { addedFrom: 'Dashboard UI' }
    });

    setContent('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-highlight)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrainCircuit size={18} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>Add New Memory Vector</h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                External User ID *
              </label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="input-base"
                placeholder="e.g. user-123"
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Namespace
              </label>
              <input
                type="text"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                className="input-base"
                placeholder="e.g. preferences"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Memory Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MemoryType)}
              className="input-base"
            >
              <option value="FACT">FACT (Static knowledge, specs, details)</option>
              <option value="PREFERENCE">PREFERENCE (User style, preferences, favorites)</option>
              <option value="PROFILE">PROFILE (Identity traits, bio, role)</option>
              <option value="PROJECT_CONTEXT">PROJECT_CONTEXT (Repo context, architecture)</option>
              <option value="INSTRUCTION">INSTRUCTION (Guidelines, rules, workflows)</option>
              <option value="GOAL">GOAL (Active objectives, targets)</option>
              <option value="DECISION">DECISION (Key architectural or design choices)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Memory Content *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-base"
              style={{ resize: 'vertical' }}
              placeholder="Enter full text content to embed into 1536-dimensional pgvector..."
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Importance Score</span>
              <strong style={{ color: 'var(--accent-amber)' }}>{(importance * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={importance}
              onChange={(e) => setImportance(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="btn-submit-new-memory">
              <Plus size={15} />
              <span>Embed & Save Memory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
