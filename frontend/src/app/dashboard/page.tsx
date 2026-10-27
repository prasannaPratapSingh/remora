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
import { ApiUsageSummary, Memory, ApiKeyItem, ProjectItem } from '../../lib/types';
import { authService, AuthUser } from '../../lib/auth';
import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import { X, Plus, FolderGit2, LogOut, User, Building2, ShieldCheck } from 'lucide-react';

export default function DashboardConsolePage() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [usage, setUsage] = useState<ApiUsageSummary | null>(null);

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
          apiService.setSessionToken(await getToken());
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
  }, [isClerkLoaded, isSignedIn, clerkUser, router, getToken]);

  // Backend Health and Data Sync. The summary endpoint keeps this to one
  // dashboard request instead of polling metrics, keys, and memories separately.
  useEffect(() => {
    let isMounted = true;

    const checkHealthAndSync = async () => {
      setIsSyncing(true);
      apiService.setSessionToken(await getToken());
      const status = await apiService.checkHealth();
      if (!isMounted) return;
      setBackendStatus(status);

      if (!status.online) {
        setSyncError('Backend unavailable. Showing the last synced workspace state.');
        setIsSyncing(false);
        return;
      }

      if (!selectedProject?.id) {
        setIsSyncing(false);
        return;
      }

      const [summary, liveUsage] = await Promise.all([
        apiService.fetchDashboardSummary(selectedProject.id),
        apiService.fetchProjectUsage(selectedProject.id, 30)
      ]);
      if (!isMounted) return;

      if (summary) {
        setMetrics(summary.metrics);
        setApiKeys(summary.apiKeys);
        setMemories(summary.memories);
        setUsage(liveUsage);
        setLastSyncedAt(new Date().toISOString());
        setSyncError(null);
      } else {
        setSyncError('Could not refresh project data. Retrying automatically.');
      }
      setIsSyncing(false);
    };

    checkHealthAndSync();
    const interval = setInterval(checkHealthAndSync, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedProject?.id, getToken]);

  // Memory Handlers (Real PostgreSQL DB Persistence)
  const handleAddMemory = async (newMemoryData: Partial<Memory>) => {
    if (!selectedProject?.id) return;
    const defaultUid = user?.email ? user.email.split('@')[0] : 'developer';
    const payload = {
      externalUserId: newMemoryData.externalUserId || `user-${defaultUid}`,
      namespace: newMemoryData.namespace || 'default',
      content: newMemoryData.content || '',
      type: newMemoryData.type || 'FACT',
      importance: newMemoryData.importance ?? 0.85,
      confidence: newMemoryData.confidence ?? 0.95
    };

    const savedMem = await apiService.createMemory(selectedProject.id, payload);
    if (!savedMem) {
      setSyncError('Memory could not be saved. Check the backend connection and try again.');
      return;
    }

    setMemories(prev => [savedMem, ...prev]);

    const updatedMetrics = await apiService.fetchProjectMetrics(selectedProject.id);
    setMetrics(updatedMetrics);
  };

  const handleDeleteMemory = async (id: string) => {
    if (!selectedProject?.id) return;
    const deleted = await apiService.deleteMemory(selectedProject.id, id);
    if (!deleted) return;
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
  const handleForgetUserData = async (userId: string) => {
    if (!selectedProject?.id) return false;
    const deleted = await apiService.deleteUserMemories(selectedProject.id, userId);
    if (!deleted) return false;
    const purgedCount = memories.filter(m => m.externalUserId === userId).length;
    setMemories(prev => prev.filter(m => m.externalUserId !== userId));
    setMetrics(prev => ({
      ...prev,
      totalMemories: Math.max(0, prev.totalMemories - purgedCount),
      activeUsers: Math.max(0, prev.activeUsers - 1)
    }));
    return true;
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
    return <div className="dashboard-loading"><div className="dashboard-loading-mark">R</div><span>Preparing your workspace…</span></div>;
  }

  return (
    <div className="dashboard-shell" style={{ display: 'flex', minHeight: '100vh' }}>
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
      <div className="dashboard-main">
        {/* Top User Bar */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-workspace"><span className="dashboard-kicker">Workspace</span><strong><Building2 size={14} />{user?.organizationName || 'Primary Workspace'}</strong><span className="dashboard-role">{user?.role || 'Owner'}</span></div>
          <div className="dashboard-topbar-actions"><div className="dashboard-sync-status"><span className={backendStatus.online ? 'dashboard-status-dot is-online' : 'dashboard-status-dot'} /><span>{isSyncing ? 'Syncing' : backendStatus.online ? 'Live' : 'Offline'}</span></div><div className="dashboard-user">
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt={user?.name || 'User'}
                   className="dashboard-avatar"
                />
              ) : (
                <div className="dashboard-avatar dashboard-avatar-fallback">
                  {user?.name?.[0] || 'U'}
                </div>
              )}
              <span className="dashboard-user-name">{user?.name || 'Developer'}</span></div><button
              onClick={handleSignOut}
               className="dashboard-button dashboard-button-ghost dashboard-button-small"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Tab Views */}
        <main className="dashboard-content">
          {syncError && (
            <div className="dashboard-sync-banner" role="status">
              <span>{syncError}</span>
              {lastSyncedAt && <span>Last synced {new Date(lastSyncedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>}
            </div>
          )}
          {currentTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              selectedProject={selectedProject}
              onNavigate={setCurrentTab}
              onOpenAddMemory={() => setIsAddMemoryOpen(true)}
              onOpenCreateKey={() => setIsCreateKeyOpen(true)}
              backendStatus={backendStatus}
              isSyncing={isSyncing}
              lastSyncedAt={lastSyncedAt}
              usage={usage}
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
              projectId={selectedProject?.id}
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
        <div className="dashboard-modal-backdrop"><div className="dashboard-modal">
             <div className="dashboard-modal-heading"><div><span className="dashboard-eyebrow">Workspace setup</span><h2><FolderGit2 /> Create a project</h2></div><button className="dashboard-icon-button" onClick={() => setIsNewProjectOpen(false)}><X size={18} /></button></div>
             <form onSubmit={handleCreateProject}>
               <label className="dashboard-field-label">Project name
                 <input
                  type="text"
                  required
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                   className="dashboard-field-input"
                  placeholder="e.g. Mobile Copilot Agent"
                 /></label>
               <div className="dashboard-modal-actions"><button type="button" onClick={() => setIsNewProjectOpen(false)} className="dashboard-button dashboard-button-ghost">
                  Cancel
                </button>
                 <button type="submit" className="dashboard-button dashboard-button-primary">
                  <Plus size={15} />
                  <span>Create Project</span>
                </button>
               </div></form></div></div>
      )}
    </div>
  );
}
