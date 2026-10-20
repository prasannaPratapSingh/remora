'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { BrainCircuit, ShieldCheck } from 'lucide-react';

function SignInContent() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px 24px',
      position: 'relative'
    }}>
      {/* Brand Icon */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}>
          <BrainCircuit size={22} color="#ffffff" />
        </div>
        <span style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>Remora</span>
      </Link>

      {/* Clerk Real SignIn Component */}
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'center' }}>
        <SignIn
          routing="path"
          path="/auth/signin"
          signUpUrl="/auth/signup"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
        />
      </div>

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <ShieldCheck size={14} color="var(--accent-emerald)" />
        <span>Secured by Clerk OAuth (Google, GitHub, Email)</span>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        Loading authentication...
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
