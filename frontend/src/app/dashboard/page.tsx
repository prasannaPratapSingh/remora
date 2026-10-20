'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, TabType } from '../../components/Sidebar';
import { OverviewView } from '../../components/OverviewView';
import { MemoriesView } from '../../components/MemoriesView';
import { SearchPlaygroundView } from '../../components/SearchPlaygroundView';
import { ApiKeysView } from '../../components/ApiKeysView';
import { GdprView } from '../../components/GdprView';
import { DocsView } from '../../components/DocsView';
import { AddMemoryModal } from '../../components/AddMemoryModal';
import { 
  INITIAL_MEMORIES, 
  INITIAL_API_KEYS, 
  INITIAL_PROJECTS, 
  INITIAL_METRICS,
  apiService 
} from '../../lib/api';
import { Memory, ApiKeyItem, ProjectItem } from '../../lib/types';
import { authService, AuthUser } from '../../lib/auth';
import { useUser, useClerk } from '@clerk/nextjs';
import { X, Plus, FolderGit2, LogOut, User, Building2, ShieldCheck } from 'lucide-react';

export default function DashboardConsolePage() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Console State
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; latencyMs: number }>({ online: false, latencyMs: 0 });

  // Modals
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Authentication Guard & User Sync
  useEffect(() => {
    let isMounted = true;

    async function initUser() {
      if (isClerkLoaded) {
        if (isSignedIn && clerkUser) {
          const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || 'developer@remora.ai';
          const displayName = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Developer';
          
          // Persist and sync user & organization directly into PostgreSQL
          const syncResult = await apiService.syncUserSession(clerkUser.id, primaryEmail, displayName);
          if (!isMounted) return;

          const orgId = syncResult?.organization?.id || `org_${clerkUser.id.slice(-8)}`;
          const orgName = syncResult?.organization?.name || (clerkUser.fullName ? `${clerkUser.fullName}'s Workspace` : 'Primary Workspace');

          setUser({
            id: syncResult?.user?.id || clerkUser.id,
            name: displayName,
            email: primaryEmail,
            organizationId: orgId,
            organizationName: orgName,
            role: 'owner',
            avatarUrl: clerkUser.imageUrl,
            createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString()
          });

          if (syncResult?.projects && syncResult.projects.length > 0) {
            setProjects(syncResult.projects);
            setSelectedProject(syncResult.projects[0]);
          }
        } else {
          router.push('/auth/signin');
          return;
        }
        setLoadingAuth(false);
      }
    }

    initUser();
    return () => {
      isMounted = false;
    };
  }, [isClerkLoaded, isSignedIn, clerkUser, router]);

  // Backend Health and Data Sync
  useEffect(() => {
    let isMounted = true;

    const checkHealthAndSync = async () => {
      const status = await apiService.checkHealth();
      if (!isMounted) return;
      setBackendStatus(status);

      if (status.online) {
        try {
          const liveProjects = await apiService.fetchProjects(user?.organizationId);
          if (liveProjects && liveProjects.length > 0) {
            setProjects(liveProjects);
            if (!selectedProject) {
              setSelectedProject(liveProjects[0]);
            }
          }
          if (selectedProject?.id) {
            const liveMetrics = await apiService.fetchProjectMetrics(selectedProject.id);
            setMetrics(liveMetrics);
            const liveKeys = await apiService.fetchApiKeys(selectedProject.id);
            setApiKeys(liveKeys);
            const liveMems = await apiService.fetchMemories(selectedProject.id);
            if (liveMems && liveMems.length > 0) {
              setMemories(liveMems);
            }
          }
        } catch (e) {
          console.warn('Error syncing live backend data', e);
        }
      }
    };

    checkHealthAndSync();
    const interval = setInterval(checkHealthAndSync, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedProject?.id, user?.organizationId]);

  // Memory Handlers (Real PostgreSQL DB Persistence)
  const handleAddMemory = async (newMemoryData: Partial<Memory>) => {
    if (!selectedProject?.id) return;
    const defaultUid = user?.email ? user.email.split('@')[0] : 'developer';
    const payload = {
      externalUserId: newMemoryData.externalUserId || `user-${defaultUid}`,
      namespace: newMemoryData.namespace || 'default',
      content: newMemoryData.content || '',
      type: newMemoryData.type || 'PREFERENCE',
      importance: newMemoryData.importance ?? 0.85,
      confidence: newMemoryData.confidence ?? 0.95
    };

    const savedMem = await apiService.createMemory(selectedProject.id, payload);
    if (savedMem) {
      setMemories(prev => [savedMem, ...prev]);
    } else {
      const localMem: Memory = {
        id: `mem-${Date.now().toString().slice(-4)}`,
        organizationId: selectedProject.organizationId,
        projectId: selectedProject.id,
        externalUserId: payload.externalUserId,
        namespace: payload.namespace,
        content: payload.content,
        type: payload.type as any,
        status: 'ACTIVE',
        importance: payload.importance,
        confidence: payload.confidence,
        sourceType: 'DASHBOARD',
        metadata: {},
        lastAccessedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMemories(prev => [localMem, ...prev]);
    }

    const updatedMetrics = await apiService.fetchProjectMetrics(selectedProject.id);
    setMetrics(updatedMetrics);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    setMetrics(prev => ({
      ...prev,
      totalMemories: Math.max(0, prev.totalMemories - 1)
    }));
  };

  // API Key Handlers (Real PostgreSQL DB Persistence)
  const handleCreateKey = async (name: string, isLive: boolean): Promise<string> => {
    if (!selectedProject?.id) return '';
    const res = await apiService.createApiKey(selectedProject.id, name, isLive);
    if (res) {
      setApiKeys(prev => [res.key, ...prev]);
      return res.rawKey;
    }
    return '';
  };

  const handleRevokeKey = async (id: string) => {
    await apiService.revokeApiKey(id);
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k));
  };

  // GDPR Forget User Handler
  const handleForgetUserData = (userId: string) => {
    const purgedCount = memories.filter(m => m.externalUserId === userId).length;
    setMemories(prev => prev.filter(m => m.externalUserId !== userId));
    setMetrics(prev => ({
      ...prev,
      totalMemories: Math.max(0, prev.totalMemories - purgedCount),
      activeUsers: Math.max(0, prev.activeUsers - 1)
    }));
  };

  // Project Creation (Real PostgreSQL DB Persistence)
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !user?.organizationId) return;

    const saved = await apiService.createProject(user.organizationId, newProjectName.trim());
    if (saved) {
      setProjects(prev => [saved, ...prev]);
      setSelectedProject(saved);
    }
    setNewProjectName('');
    setIsNewProjectOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Clerk signOut error', e);
    }
    authService.logout();
    router.push('/auth/signin');
  };

  if (loadingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        Authenticating developer workspace...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onOpenNewProjectModal={() => setIsNewProjectOpen(true)}
        backendStatus={backendStatus}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top User Bar */}
        <header style={{
          height: '60px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(13, 18, 29, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Workspace:</span>
            <strong style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} color="var(--accent-indigo)" />
              {user?.organizationName || 'Acme AI Systems'}
            </strong>
            <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
              {user?.role || 'Owner'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt={user?.name || 'User'}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-indigo)',
                  fontWeight: 600,
                  fontSize: '12px'
                }}>
                  {user?.name?.[0] || 'U'}
                </div>
              )}
              <span>{user?.name || 'Developer'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({user?.email})</span>
            </div>

            <button
              onClick={handleSignOut}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', gap: '6px' }}
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Tab Views */}
        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', maxWidth: '1440px', width: '100%' }}>
          {currentTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              selectedProject={selectedProject}
              onNavigate={setCurrentTab}
              onOpenAddMemory={() => setIsAddMemoryOpen(true)}
              onOpenCreateKey={() => setIsCreateKeyOpen(true)}
            />
          )}

          {currentTab === 'memories' && (
            <MemoriesView
              memories={memories}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
              onOpenAddModal={() => setIsAddMemoryOpen(true)}
            />
          )}

          {currentTab === 'search' && (
            <SearchPlaygroundView memories={memories} projectId={selectedProject?.id} />
          )}

          {currentTab === 'keys' && (
            <ApiKeysView
              apiKeys={apiKeys}
              onCreateKey={handleCreateKey}
              onRevokeKey={handleRevokeKey}
              isCreateModalOpen={isCreateKeyOpen}
              onCloseCreateModal={() => setIsCreateKeyOpen(false)}
              onOpenCreateModal={() => setIsCreateKeyOpen(true)}
            />
          )}

          {currentTab === 'gdpr' && (
            <GdprView
              memories={memories}
              onForgetUserData={handleForgetUserData}
            />
          )}

          {currentTab === 'docs' && (
            <DocsView />
          )}
        </main>
      </div>

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={isAddMemoryOpen}
        onClose={() => setIsAddMemoryOpen(false)}
        onAdd={handleAddMemory}
      />

      {/* New Project Modal */}
      {isNewProjectOpen && (
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
            border: '1px solid var(--border-highlight)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderGit2 size={18} color="var(--accent-indigo)" />
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>Create New Project</h3>
              </div>
              <button onClick={() => setIsNewProjectOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="input-base"
                  placeholder="e.g. Mobile Copilot Agent"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsNewProjectOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={15} />
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
