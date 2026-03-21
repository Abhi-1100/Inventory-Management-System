'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#e6edf3',
        padding: '24px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated background blobs */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(88, 166, 255, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(63, 185, 80, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 8s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(48, 54, 61, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(48, 54, 61, 0.25) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          maxWidth: '560px',
          width: '100%',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* 404 big number */}
        <div
          style={{
            fontSize: 'clamp(100px, 20vw, 160px)',
            fontWeight: '700',
            lineHeight: '1',
            background: 'linear-gradient(135deg, #58a6ff 0%, #3fb950 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            letterSpacing: '-4px',
            userSelect: 'none',
          }}
        >
          404
        </div>

        {/* Icon / divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, #30363d)' }} />
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#58a6ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, #30363d)' }} />
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: '600',
            color: '#e6edf3',
            marginBottom: '12px',
            letterSpacing: '-0.5px',
          }}
        >
          Page Not Found
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: '15px',
            color: '#8b949e',
            lineHeight: '1.7',
            marginBottom: '40px',
            maxWidth: '400px',
            margin: '0 auto 40px',
          }}
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Please check the URL or head back to a safe place.
        </p>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Go to Dashboard */}
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              background: 'linear-gradient(135deg, #238636, #2ea043)',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              border: '1px solid rgba(63, 185, 80, 0.4)',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 0 0 rgba(63, 185, 80, 0)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(63, 185, 80, 0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 0 0 rgba(63, 185, 80, 0)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Go to Dashboard
          </Link>

          {/* Go Back */}
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              background: 'transparent',
              color: '#8b949e',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '14px',
              border: '1px solid #30363d',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#58a6ff';
              e.currentTarget.style.color = '#58a6ff';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#30363d';
              e.currentTarget.style.color = '#8b949e';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Bottom hint */}
        <p
          style={{
            marginTop: '48px',
            fontSize: '12px',
            color: '#484f58',
            letterSpacing: '0.5px',
          }}
        >
          COREINVENTORY &nbsp;·&nbsp; ERROR 404
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
