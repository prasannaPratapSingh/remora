'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowRight, User, LogOut, LayoutDashboard } from 'lucide-react';
import { authService, AuthUser } from '../lib/auth';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(7, 9, 14, 0.75)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0 24px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <BrainCircuit size={19} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Remora
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '9px', padding: '1px 6px' }}>v1.0</span>
          </div>
        </Link>

        {/* Center Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px', fontWeight: 500 }}>
          <Link href="/#features" style={{ color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
            Features
          </Link>
          <Link href="/#architecture" style={{ color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
            Architecture
          </Link>
          <Link href="/docs" style={{ color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
            Documentation
          </Link>
          <Link href="/#pricing" style={{ color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
            Pricing
          </Link>
          <a
            href="http://localhost:4000/docs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', fontSize: '13px' }}
          >
            API Reference
          </a>
        </nav>

        {/* Right CTA / Auth Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/dashboard" className="btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>
                <LayoutDashboard size={15} />
                <span>Console</span>
              </Link>
              <button
                onClick={() => {
                  authService.logout();
                  setUser(null);
                  window.location.href = '/';
                }}
                className="btn-secondary"
                style={{ padding: '7px 10px', fontSize: '12px' }}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/auth/signin" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary" style={{ padding: '7px 16px', fontSize: '13px' }}>
                <span>Get Started Free</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
