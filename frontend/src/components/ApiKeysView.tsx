'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Clock, 
  CheckCircle2,
  X 
} from 'lucide-react';
import { ApiKeyItem } from '../lib/types';

interface ApiKeysViewProps {
  apiKeys: ApiKeyItem[];
  onCreateKey: (name: string, isLive: boolean) => Promise<string> | string;
  onRevokeKey: (id: string) => void;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onOpenCreateModal: () => void;
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({
  apiKeys,
  onCreateKey,
  onRevokeKey,
  isCreateModalOpen,
  onCloseCreateModal,
  onOpenCreateModal
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [isLiveKey, setIsLiveKey] = useState(true);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const rawKey = await onCreateKey(newKeyName.trim(), isLiveKey);
    setGeneratedKey(rawKey);
    setNewKeyName('');
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const formatRelativeTime = (isoString?: string | null) => {
    if (!isoString) return 'Never';
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
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={22} color="var(--accent-indigo)" />
            API Key Credentials
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Stateless Bearer authentication tokens for your AI agents and backend services. Keys are SHA-256 hashed at rest.
          </p>
        </div>

        <button onClick={onOpenCreateModal} className="btn-primary" id="btn-create-key">
          <Plus size={16} />
          <span>Generate New Key</span>
        </button>
      </div>

      {/* Keys Table Container */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>NAME</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>KEY PREFIX</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>LAST USED</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>CREATED</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <KeyRound size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                  <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: 600, marginBottom: '6px' }}>
                    No API keys created yet
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Generate a live or test key to authenticate Remora SDKs and REST API requests.
                  </div>
                  <button
                    onClick={onOpenCreateModal}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px', margin: '0 auto' }}
                  >
                    <Plus size={14} />
                    <span>Create Your First API Key</span>
                  </button>
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#ffffff' }}>
                    {key.name}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <code style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: key.prefix.startsWith('rl_live') ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {key.prefix}...
                    </code>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {key.revokedAt ? (
                      <span className="badge badge-rose">Revoked</span>
                    ) : (
                      <span className="badge badge-emerald">Active</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} color="var(--text-muted)" />
                      {formatRelativeTime(key.lastUsedAt)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => onRevokeKey(key.id)}
                      className="btn-danger"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      title="Revoke Key"
                      id={`btn-revoke-${key.id}`}
                    >
                      <Trash2 size={13} />
                      <span>Revoke</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Key Modal */}
      {isCreateModalOpen && (
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
            maxWidth: '480px',
            padding: '24px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-highlight)'
          }}>
            {!generatedKey ? (
              <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>Create Remora API Key</h3>
                  <button type="button" onClick={onCloseCreateModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Key Description / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Next.js Agent"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="input-base"
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Key Environment
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsLiveKey(true)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: isLiveKey ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                        backgroundColor: isLiveKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: isLiveKey ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      Live (rl_live_*)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLiveKey(false)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: !isLiveKey ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                        backgroundColor: !isLiveKey ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: !isLiveKey ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      Test (rl_test_*)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={onCloseCreateModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" id="btn-submit-generate-key">
                    Generate Secret Key
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={24} color="var(--accent-emerald)" />
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>API Key Generated</h3>
                </div>

                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  fontSize: '12px',
                  color: '#fcd34d'
                }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    Copy this secret key now. Remora hashes keys using SHA-256 for security and cannot show it to you again.
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedKey}
                    className="input-base"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--accent-emerald)',
                      paddingRight: '45px'
                    }}
                  />
                  <button
                    onClick={handleCopy}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: copiedKey ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                    }}
                    title="Copy API Key"
                  >
                    {copiedKey ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    onClick={() => {
                      setGeneratedKey(null);
                      onCloseCreateModal();
                    }}
                    className="btn-primary"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
