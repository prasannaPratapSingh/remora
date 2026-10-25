'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Memory } from '../lib/types';
import { apiService } from '../lib/api';

interface GdprViewProps {
  memories: Memory[];
  projectId?: string;
  onForgetUserData: (userId: string) => Promise<boolean> | boolean;
}

export const GdprView: React.FC<GdprViewProps> = ({ memories, projectId, onForgetUserData }) => {
  const [exportUserId, setExportUserId] = useState('');
  const [forgetUserId, setForgetUserId] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [forgetSuccess, setForgetSuccess] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!exportUserId.trim()) return;
    setIsWorking(true);
    setError(null);
    const remoteExport = projectId ? await apiService.exportUserMemories(projectId, exportUserId.trim()) : null;
    if (projectId && !remoteExport) {
      setError('The backend could not prepare the export. Please retry when the project is online.');
      setIsWorking(false);
      return;
    }
    const userMemories = remoteExport?.memories || memories.filter(m => m.externalUserId === exportUserId.trim());
    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      compliance: 'GDPR / CCPA Data Portability (Article 20)',
      targetUser: exportUserId.trim(),
      memoryCount: userMemories.length,
      memories: userMemories
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remora-memory-export-${exportUserId.trim()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setIsWorking(false);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleConfirmForget = async () => {
    if (!forgetUserId) return;
    setIsWorking(true);
    setError(null);
    const deleted = await onForgetUserData(forgetUserId.trim());
    setIsWorking(false);
    if (!deleted) {
      setError('The backend could not complete this request. No local data was removed.');
      return;
    }
    setShowConfirmModal(false);
    setForgetUserId('');
    setForgetSuccess(true);
    setTimeout(() => setForgetSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={22} color="var(--accent-emerald)" />
          GDPR, CCPA & Privacy Compliance
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Built-in data subject rights management: Data Portability (Article 20) and Right to Be Forgotten (Article 17).
        </p>
      </div>

      {error && <div className="dashboard-sync-banner dashboard-sync-banner-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Data Portability Exporter */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
              <Download size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Data Portability Exporter</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Endpoint: GET /v1/memories/users/:userId/export</p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Export all stored semantic memories, raw vectors, version history, and audit logs for a given end-user into a standardized JSON bundle.
          </p>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Target External User ID
            </label>
            <input
              type="text"
              value={exportUserId}
              onChange={(e) => setExportUserId(e.target.value)}
              className="input-base"
              placeholder="e.g. user-123"
            />
          </div>

          <button onClick={handleExport} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Download size={15} />
            <span>{isWorking ? 'Preparing export…' : 'Generate & Download Archive JSON'}</span>
          </button>

          {exportSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={15} />
              <span>Export downloaded successfully.</span>
            </div>
          )}
        </div>

        {/* Right to Be Forgotten Tool */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.15)' }}>
              <Trash2 size={20} color="var(--accent-rose)" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Right to Be Forgotten</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Endpoint: DELETE /v1/memories/users/:userId</p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Permanently delete all active, archived, and historical memory versions associated with an end-user across the entire organization.
          </p>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              User ID to Purge
            </label>
            <input
              type="text"
              value={forgetUserId}
              onChange={(e) => setForgetUserId(e.target.value)}
              className="input-base"
              placeholder="Enter User ID to delete..."
            />
          </div>

          <button
            onClick={() => {
              if (!forgetUserId.trim()) return;
              setShowConfirmModal(true);
            }}
            disabled={!forgetUserId.trim()}
            className="btn-danger"
            style={{ alignSelf: 'flex-start' }}
          >
            <Trash2 size={15} />
            <span>Permanently Purge User Memories</span>
          </button>

          {forgetSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-rose)' }}>
              <CheckCircle2 size={15} />
              <span>User memories have been permanently expunged.</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
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
            maxWidth: '440px',
            padding: '24px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid rgba(244, 63, 94, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--accent-rose)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>Confirm Data Purge</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              Are you sure you want to permanently delete all memory records for user <strong style={{ color: '#ffffff' }}>{forgetUserId}</strong>? This action is irreversible.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowConfirmModal(false)} className="btn-secondary">
                Cancel
              </button>
                <button onClick={handleConfirmForget} className="btn-danger" disabled={isWorking}>
                  Yes, Purge User Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
