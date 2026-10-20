'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Sparkles, 
  KeyRound, 
  ShieldCheck, 
  BookOpen, 
  FolderGit2, 
  Check, 
  ChevronDown, 
  Plus, 
  Database, 
  Zap 
} from 'lucide-react';
import { ProjectItem } from '../lib/types';

export type TabType = 'overview' | 'memories' | 'search' | 'keys' | 'gdpr' | 'docs';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  projects: ProjectItem[];
  selectedProject: ProjectItem | null;
  onSelectProject: (proj: ProjectItem) => void;
  onOpenNewProjectModal: () => void;
  backendStatus?: { online: boolean; latencyMs: number };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  projects,
  selectedProject,
  onSelectProject,
  onOpenNewProjectModal,
  backendStatus
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'memories' as TabType, label: 'Memory Explorer', icon: BrainCircuit, badge: 'Live' },
    { id: 'search' as TabType, label: 'Search Playground', icon: Sparkles },
    { id: 'keys' as TabType, label: 'API Keys', icon: KeyRound },
    { id: 'gdpr' as TabType, label: 'GDPR & Privacy', icon: ShieldCheck },
    { id: 'docs' as TabType, label: 'SDKs & API Docs', icon: BookOpen },
  ];

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <BrainCircuit size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Remora
              </span>
              <span className="badge badge-indigo" style={{ fontSize: '10px' }}>v1.0</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Memory Engine</p>
          </div>
        </div>
      </div>

      {/* Project Selector */}
      <div style={{ padding: '16px 20px 10px', position: 'relative' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Active Project
        </p>
        <button
          onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <FolderGit2 size={16} color="var(--accent-indigo)" />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {selectedProject?.name || (projects.length === 0 ? 'Create a Project' : 'Select Project')}
            </span>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>

        {projectDropdownOpen && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: '74px',
            left: '20px',
            right: '20px',
            zIndex: 50,
            padding: '6px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            {projects.length === 0 && (
              <div style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                No projects yet
              </div>
            )}
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj);
                  setProjectDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  backgroundColor: proj.id === selectedProject?.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: proj.id === selectedProject?.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                <span>{proj.name}</span>
                {proj.id === selectedProject?.id && <Check size={14} color="var(--accent-indigo)" />}
              </div>
            ))}
            <div
              onClick={() => {
                setProjectDropdownOpen(false);
                onOpenNewProjectModal();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                marginTop: '4px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '12px',
                color: 'var(--accent-indigo)',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              <span>Create New Project</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? 'var(--accent-indigo)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '1px 5px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Infrastructure Telemetry Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
          INFRASTRUCTURE STATUS
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Database size={13} color="var(--accent-cyan)" />
              pgvector (Neon)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-emerald)', fontSize: '11px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }}></span>
              Connected
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Zap size={13} color="var(--accent-amber)" />
              Redis 7 Cache
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-emerald)', fontSize: '11px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }}></span>
              Healthy
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: backendStatus?.online ? 'var(--accent-emerald)' : 'var(--accent-amber)'
              }}></span>
              Backend API
            </span>
            <span style={{
              color: backendStatus?.online ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              {backendStatus?.online ? `Online (${backendStatus.latencyMs}ms)` : 'Offline (Local)'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
