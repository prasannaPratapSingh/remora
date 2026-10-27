'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  FolderGit2,
  KeyRound,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ProjectItem } from '../lib/types';

export type TabType = 'overview' | 'memories' | 'search' | 'keys' | 'gdpr' | 'docs';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  projects: ProjectItem[];
  selectedProject: ProjectItem | null;
  onSelectProject: (project: ProjectItem) => void;
  onOpenNewProjectModal: () => void;
  backendStatus?: { online: boolean; latencyMs: number };
}

const navItems = [
  { id: 'overview' as TabType, label: 'Overview', hint: 'Workspace pulse', icon: LayoutDashboard },
  { id: 'memories' as TabType, label: 'Memory explorer', hint: 'Inspect knowledge', icon: BrainCircuit },
  { id: 'search' as TabType, label: 'Search playground', hint: 'Test retrieval', icon: Search },
  { id: 'keys' as TabType, label: 'API keys', hint: 'Connect agents', icon: KeyRound },
  { id: 'gdpr' as TabType, label: 'Privacy & GDPR', hint: 'Manage user data', icon: ShieldCheck },
  { id: 'docs' as TabType, label: 'SDKs & docs', hint: 'Ship faster', icon: BookOpen }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  projects,
  selectedProject,
  onSelectProject,
  onOpenNewProjectModal,
  backendStatus
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = React.useState(false);

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-brand">
        <div className="dashboard-brand-mark">R</div>
        <div className="dashboard-brand-copy">
          <strong>Remora</strong>
          <span>Memory infrastructure</span>
        </div>
        <span className="dashboard-brand-version">1.0</span>
      </div>

      <div className="dashboard-project-picker">
        <span className="dashboard-label">Active project</span>
        <button className="dashboard-project-button" onClick={() => setProjectMenuOpen((open) => !open)} aria-expanded={projectMenuOpen}>
          <span className="dashboard-project-name"><FolderGit2 size={16} />{selectedProject?.name || (projects.length ? 'Choose a project' : 'Create a project')}</span>
          <ChevronDown size={15} className={projectMenuOpen ? 'is-rotated' : ''} />
        </button>
        <AnimatePresence>
          {projectMenuOpen && (
            <motion.div className="dashboard-project-menu" initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .98 }}>
              {projects.map((project) => (
                <button key={project.id} className={project.id === selectedProject?.id ? 'is-selected' : ''} onClick={() => { onSelectProject(project); setProjectMenuOpen(false); }}>
                  <span>{project.name}</span>{project.id === selectedProject?.id && <Check size={14} />}
                </button>
              ))}
              <button className="dashboard-project-create" onClick={() => { setProjectMenuOpen(false); onOpenNewProjectModal(); }}><Plus size={14} /> New project</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <span className="dashboard-label">Workspace</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button key={item.id} className={`dashboard-nav-item ${active ? 'is-active' : ''}`} onClick={() => onSelectTab(item.id)}>
              <span className="dashboard-nav-icon"><Icon size={17} /></span>
              <span className="dashboard-nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>
              {active && <motion.span className="dashboard-nav-active-dot" layoutId="dashboard-active-dot" />}
            </button>
          );
        })}
      </nav>

      <div className="dashboard-sidebar-bottom">
        <div className="dashboard-sidebar-note">
          <span className={`dashboard-status-dot ${backendStatus?.online ? 'is-online' : ''}`} />
          <div><strong>{backendStatus?.online ? 'Systems live' : 'Offline mode'}</strong><span>{backendStatus?.online ? `API · ${backendStatus.latencyMs}ms` : 'Showing local state'}</span></div>
          <Activity size={15} />
        </div>
        <div className="dashboard-sidebar-footer">Built for agents that remember what matters.</div>
      </div>
    </aside>
  );
};
