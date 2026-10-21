'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, LayoutDashboard } from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';

interface NavbarProps {
  theme?: 'light' | 'dark';
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { isSignedIn } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Morph between full-width at top (<= 20px) and floating pill (> 20px)
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    // Automatically close mobile menu if viewport widens to desktop (where hamburger is hidden)
    const mediaQuery = window.matchMedia('(min-width: 1025px)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setMobileMenuOpen(false);
      }
    };

    // Outside click dismisses menu
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.remora-liquid-header')) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleDocumentClick);

    if (mediaQuery.matches) {
      setMobileMenuOpen(false);
    }
    mediaQuery.addEventListener('change', handleMediaChange);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleDocumentClick);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return (
    <header className={`remora-liquid-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="remora-navbar">
        <div className="remora-navbar-inner">
          {/* Left: Bold "R" Brand Logo */}
          <Link href="/" className="remora-logo-link" aria-label="Remora Home">
            <div className="remora-logo-mark">
              R
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="remora-nav-links" aria-label="Main Navigation">
            <Link href="/#features" className="remora-nav-link">
              Features
            </Link>
            <Link href="/#architecture" className="remora-nav-link">
              Architecture
            </Link>
            <Link href="/docs" className="remora-nav-link">
              Documentation
            </Link>
            <Link href="/#pricing" className="remora-nav-link">
              Pricing
            </Link>
          </nav>

          {/* Right: Authentication & CTA Actions + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isSignedIn ? (
              /* Signed In State: Exactly ONE Profile avatar + Console button */
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link 
                  href="/dashboard" 
                  className="remora-cta-secondary remora-desktop-cta"
                  style={{ height: '36px', padding: '0 14px' }}
                  id="nav-console-btn"
                >
                  <LayoutDashboard size={14} />
                  <span>Console</span>
                </Link>

                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                    background: '#ffffff',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.15s ease-out'
                  }}
                  id="nav-profile-container"
                >
                  <UserButton
                    userProfileMode="modal"
                    appearance={{
                      elements: {
                        avatarBox: {
                          width: '32px',
                          height: '32px',
                          borderRadius: '9999px',
                          border: '1px solid rgba(15, 23, 42, 0.15)',
                          transition: 'transform 0.15s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        },
                        userButtonTrigger: {
                          borderRadius: '9999px',
                          padding: '0',
                          '&:focus': {
                            boxShadow: '0 0 0 2px #3074FE',
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Signed Out State: Login & Sign Up buttons (hidden on mobile via remora-desktop-cta) */
              <div className="remora-desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link 
                  href="/auth/signin" 
                  className="remora-cta-secondary"
                  id="nav-login-btn"
                >
                  <span>Login</span>
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="remora-cta-btn"
                  id="nav-signup-btn"
                >
                  <span>Sign Up</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            )}

            {/* Pikaicons Hamburger Button with Smooth Morph to X */}
            <button
              type="button"
              className={`remora-burger-btn ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none"
                className="remora-burger-svg"
              >
                {/* Top Line: center is (12, 6) */}
                <path 
                  className="remora-burger-line remora-burger-line-top"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M4 6L20 6" 
                  style={{ transformOrigin: '12px 6px' }}
                />
                {/* Middle Line: center is (12, 12) */}
                <path 
                  className="remora-burger-line remora-burger-line-middle"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M4 12L20 12" 
                  style={{ transformOrigin: '12px 12px' }}
                />
                {/* Bottom Line: center is (12, 18) */}
                <path 
                  className="remora-burger-line remora-burger-line-bottom"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M4 18L20 18" 
                  style={{ transformOrigin: '12px 18px' }}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Liquid Glass Mobile Drawer Dropdown */}
      <div className={`remora-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link 
          href="/#features" 
          className="remora-mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>Features</span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>→</span>
        </Link>
        <Link 
          href="/#architecture" 
          className="remora-mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>Architecture</span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>→</span>
        </Link>
        <Link 
          href="/docs" 
          className="remora-mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>Documentation</span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>→</span>
        </Link>
        <Link 
          href="/#pricing" 
          className="remora-mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>Pricing</span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>→</span>
        </Link>

        <div className="remora-mobile-actions">
          {isSignedIn ? (
            <Link 
              href="/dashboard" 
              className="remora-cta-btn" 
              style={{ justifyContent: 'center', height: '42px' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard size={15} />
              <span>Console Workspace</span>
            </Link>
          ) : (
            <>
              <Link 
                href="/auth/signin" 
                className="remora-cta-secondary"
                style={{ justifyContent: 'center', height: '40px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Login</span>
              </Link>
              <Link 
                href="/auth/signup" 
                className="remora-cta-btn"
                style={{ justifyContent: 'center', height: '42px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Sign Up Free</span>
                <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
