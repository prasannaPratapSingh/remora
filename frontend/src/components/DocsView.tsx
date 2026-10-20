'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Check, 
  Code2, 
  Terminal, 
  Layers, 
  FileCode 
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeSdkTab, setActiveSdkTab] = useState<'ts' | 'py'>('ts');
  const [copiedTs, setCopiedTs] = useState(false);
  const [copiedPy, setCopiedPy] = useState(false);

  const tsCode = `import { RemoraClient } from "@remora/sdk";

const remora = new RemoraClient({
  apiKey: process.env.REMORA_API_KEY!,
  baseUrl: "http://localhost:4000" // or production URL
});

// 1. Ingest a memory
const memory = await remora.add({
  externalUserId: "user-prasanna",
  namespace: "preferences",
  content: "User prefers Next.js with Vanilla CSS and strict TypeScript.",
  type: "SEMANTIC",
  importance: 0.95
});

// 2. Perform hybrid vector search
const results = await remora.search({
  query: "What frontend styling does user prefer?",
  externalUserId: "user-prasanna",
  limit: 5
});

// 3. Inject formatted context directly into your LLM prompt
const context = await remora.context("user-prasanna", "preferences");
// Injects: <user_context>[User: user-prasanna] 1. ...</user_context>`;

  const pyCode = `from remora import RemoraClient

remora = RemoraClient(
    api_key="rl_live_your_api_key_here",
    base_url="http://localhost:4000"
)

# 1. Ingest a memory
mem = remora.add(
    external_user_id="user-prasanna",
    content="Neon pgvector is configured with 1536-dimensional HNSW index.",
    namespace="architecture",
    importance=0.9
)

# 2. Perform semantic search
results = remora.search(
    query="database vector index configuration",
    external_user_id="user-prasanna",
    limit=5
)

# 3. Retrieve compact context
ctx = remora.context(external_user_id="user-prasanna")
print(ctx)`;

  const copyToClipboard = (text: string, isTs: boolean) => {
    navigator.clipboard.writeText(text);
    if (isTs) {
      setCopiedTs(true);
      setTimeout(() => setCopiedTs(false), 2000);
    } else {
      setCopiedPy(true);
      setTimeout(() => setCopiedPy(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={22} color="var(--accent-indigo)" />
            Developer SDKs & OpenAPI Documentation
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Official clients, interactive OpenAPI specifications, and endpoints reference.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="http://localhost:4000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={15} />
            <span>Open Scalar API Docs (/docs)</span>
          </a>
          <a
            href="http://localhost:4000/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Code2 size={15} />
            <span>OpenAPI 3.0 JSON</span>
          </a>
        </div>
      </div>

      {/* Code Snippets Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveSdkTab('ts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeSdkTab === 'ts' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeSdkTab === 'ts' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <FileCode size={14} color="var(--accent-indigo)" />
              <span>TypeScript (@remora/sdk)</span>
            </button>

            <button
              onClick={() => setActiveSdkTab('py')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeSdkTab === 'py' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: activeSdkTab === 'py' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Terminal size={14} color="var(--accent-cyan)" />
              <span>Python (remora-ai)</span>
            </button>
          </div>

          <button
            onClick={() => copyToClipboard(activeSdkTab === 'ts' ? tsCode : pyCode, activeSdkTab === 'ts')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {(activeSdkTab === 'ts' ? copiedTs : copiedPy) ? (
              <Check size={14} color="var(--accent-emerald)" />
            ) : (
              <Copy size={14} />
            )}
            <span>{(activeSdkTab === 'ts' ? copiedTs : copiedPy) ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          color: activeSdkTab === 'ts' ? '#c7d2fe' : '#a5f3fc',
          lineHeight: '1.6',
          overflowX: 'auto'
        }}>
          {activeSdkTab === 'ts' ? tsCode : pyCode}
        </pre>
      </div>

      {/* Endpoints Reference Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '14px' }}>
          REST API Core Endpoints Reference
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          {[
            { method: 'POST', path: '/v1/memories', desc: 'Ingest memory synchronously (with duplicate merging)' },
            { method: 'POST', path: '/v1/memories/ingest', desc: 'Asynchronous ingestion (202 Accepted via BullMQ worker)' },
            { method: 'POST', path: '/v1/memories/search', desc: 'Hybrid semantic vector search with recency decay' },
            { method: 'POST', path: '/v1/memories/context', desc: 'Generate compact system prompt context for LLMs' },
            { method: 'GET', path: '/v1/memories', desc: 'List paginated memories for an end-user' },
            { method: 'DELETE', path: '/v1/memories/users/:userId', desc: 'GDPR Right to Be Forgotten user wipe' },
            { method: 'GET', path: '/v1/memories/users/:userId/export', desc: 'GDPR data portability JSON archive export' },
          ].map((ep, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${ep.method === 'POST' ? 'badge-indigo' : ep.method === 'GET' ? 'badge-emerald' : 'badge-rose'}`} style={{ width: '56px', textAlign: 'center' }}>
                  {ep.method}
                </span>
                <code style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{ep.path}</code>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
