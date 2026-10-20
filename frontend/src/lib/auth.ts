'use client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'developer' | 'viewer';
  organizationId: string;
  organizationName: string;
  avatarUrl?: string;
  createdAt: string;
}

const STORAGE_KEY = 'remora_auth_session';

export const authService = {
  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem(STORAGE_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  login(email: string): AuthUser {
    const name = email.split('@')[0] || 'Developer';
    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'owner',
      organizationId: `org_${Date.now()}`,
      organizationName: `${name}'s Workspace`,
      createdAt: new Date().toISOString()
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  },

  signup(name: string, email: string, organizationName: string): AuthUser {
    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'owner',
      organizationId: `org_${Date.now()}`,
      organizationName: organizationName || `${name}'s Workspace`,
      createdAt: new Date().toISOString()
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  }
};
