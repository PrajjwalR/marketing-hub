'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  MessageSquareReply, Plus, Trash2, Pencil, Sparkles, Power, PowerOff,
  Tag, ShieldAlert, Clock, BarChart3, Activity, ChevronDown,
  Bot, MessageCircle, Ban, AlertTriangle, Instagram, Search,
  Check, Globe
} from 'lucide-react';
import { XIcon } from '@/components/dashboard/social-brand-icons';

// Rename Lucide's X (close icon) to XClose to avoid collision with XIcon
import { X as XClose } from 'lucide-react';

// ─── Platform Helpers ────────────────────────────────────────────────────────

const SUPPORTED_PLATFORMS = ['instagram', 'x'];

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'x':
    case 'twitter':
      return <XIcon className={className} />;
    default:
      return <Globe className={className} />;
  }
}

function platformLabel(platform: string): string {
  switch (platform) {
    case 'instagram': return 'Instagram';
    case 'x': case 'twitter': return 'X (Twitter)';
    default: return platform;
  }
}

function platformGradient(platform: string): string {
  switch (platform) {
    case 'instagram': return 'from-purple-500 via-pink-500 to-orange-400';
    case 'x': case 'twitter': return 'from-zinc-700 to-zinc-900';
    default: return 'from-gray-500 to-gray-700';
  }
}

function platformAccent(platform: string): string {
  switch (platform) {
    case 'instagram': return 'text-pink-500';
    case 'x': case 'twitter': return 'text-zinc-900';
    default: return 'text-gray-500';
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReplyTemplate {
  id: string;
  connection_id: string;
  name: string;
  keywords: string[];
  reply_text: string | null;
  ai_enabled: boolean;
  ai_guidelines: string | null;
  priority: number;
  is_fallback: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface AutoReplySettings {
  id: string;
  connection_id: string;
  enabled: boolean;
  polling_interval_minutes: number;
  max_replies_per_day: number;
  min_delay_seconds: number;
  max_delay_seconds: number;
  blacklist_keywords: string[];
  monitor_all_posts: boolean;
  ai_provider: string;
  social_connections?: {
    id: string;
    platform: string;
    profile_name: string;
    profile_image: string;
    internal_id: string;
  };
}

interface SocialConnection {
  id: string;
  platform: string;
  profile_name: string;
  profile_image: string;
  internal_id: string;
  status?: string;
}

interface LogEntry {
  id: string;
  action: string;
  post_id: string | null;
  comment_id: string | null;
  comment_text: string | null;
  reply_text: string | null;
  template_name: string | null;
  ai_used: boolean;
  error_message: string | null;
  metadata: { commenter_username?: string; reason?: string } | null;
  created_at: string;
  social_connections?: { profile_name: string; profile_image: string };
}

interface Stats {
  repliesToday: number;
  totalReplies: number;
  totalSkipped: number;
  errorsToday: number;
}

// ─── Helper: Auth fetch ──────────────────────────────────────────────────────

async function authFetch(url: string, options: RequestInit = {}) {
  const { getIdToken } = await import('firebase/auth');
  const { getAuth } = await import('firebase/auth');
  const { app } = await import('@/lib/firebase');
  const auth = getAuth(app);
  const user = auth.currentUser;
  const token = user ? await getIdToken(user) : null;
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Account Selector Dropdown ───────────────────────────────────────────────

function AccountSelector({
  connections,
  selectedId,
  onSelect,
}: {
  connections: SocialConnection[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = connections.find((c) => c.id === selectedId);

  return (
    <div className="relative" ref={ref}>
      <button
        id="auto-reply-account-selector"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all cursor-pointer min-w-[220px]"
      >
        {/* Platform icon */}
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${platformGradient(selected?.platform || 'instagram')} shadow-sm`}>
          <PlatformIcon platform={selected?.platform || 'instagram'} className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Account info */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {selected?.profile_name ? `@${selected.profile_name}` : 'Select account'}
          </p>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            {platformLabel(selected?.platform || '')}
          </p>
        </div>

        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-[280px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1.5">
            {/* Group by platform */}
            {['instagram', 'x'].map((platform) => {
              const platformConns = connections.filter(
                (c) => c.platform === platform || (platform === 'x' && c.platform === 'twitter')
              );
              if (platformConns.length === 0) return null;

              return (
                <div key={platform}>
                  <div className="px-3 py-1.5 flex items-center gap-1.5">
                    <PlatformIcon platform={platform} className={`h-3 w-3 ${platformAccent(platform)}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {platformLabel(platform)}
                    </span>
                  </div>

                  {platformConns.map((conn) => {
                    const isSelected = conn.id === selectedId;
                    return (
                      <button
                        key={conn.id}
                        onClick={() => { onSelect(conn.id); setOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border border-purple-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Avatar */}
                        {conn.profile_image ? (
                          <img
                            src={conn.profile_image}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br ${platformGradient(conn.platform)}`}>
                            <PlatformIcon platform={conn.platform} className="h-4 w-4 text-white" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            @{conn.profile_name}
                          </p>
                        </div>

                        {isSelected && (
                          <Check className="h-4 w-4 text-purple-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AutoReplyPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'logs'>('templates');
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch connections for supported platforms
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/api/settings/social');
        if (res.ok) {
          const json = await res.json();
          const allConns = Array.isArray(json) ? json : (json.data || []);
          const supported = allConns.filter((c: any) =>
            SUPPORTED_PLATFORMS.includes(c.platform) || c.platform === 'twitter'
          );
          setConnections(supported);
          if (supported.length > 0 && !selectedConnection) {
            setSelectedConnection(supported[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedConn = connections.find((c) => c.id === selectedConnection);

  const tabs = [
    { key: 'templates' as const, label: 'Templates', icon: MessageSquareReply },
    { key: 'settings' as const, label: 'Account Settings', icon: Activity },
    { key: 'logs' as const, label: 'Activity Logs', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Auto Reply</h1>
            <p className="text-sm text-gray-500">Automatically reply to comments on Instagram &amp; X</p>
          </div>
        </div>

        {/* Account Selector - Only for settings and logs */}
        {activeTab !== 'templates' && connections.length > 0 && (
          <AccountSelector
            connections={connections}
            selectedId={selectedConnection}
            onSelect={setSelectedConnection}
          />
        )}
      </div>

      {connections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100">
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Supported Accounts Connected</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Connect an Instagram Business or X (Twitter) account in Settings to get started with auto-replies.
          </p>
          <a
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            Go to Settings
          </a>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  id={`auto-reply-tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'templates' && (
            <TemplatesTab connections={connections} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab connectionId={selectedConnection} connections={connections} />
          )}
          {activeTab === 'logs' && (
            <LogsTab connectionId={selectedConnection} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Tab 1: Templates ────────────────────────────────────────────────────────

function TemplatesTab({ connections }: { connections: SocialConnection[] }) {
  const [templates, setTemplates] = useState<ReplyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ReplyTemplate | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/auto-reply/templates`);
      const json = await res.json();
      setTemplates(json.data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await authFetch(`/api/auto-reply/templates?id=${id}`, { method: 'DELETE' });
    fetchTemplates();
  };

  const handleToggle = async (template: ReplyTemplate) => {
    await authFetch('/api/auto-reply/templates', {
      method: 'PUT',
      body: JSON.stringify({ id: template.id, active: !template.active }),
    });
    fetchTemplates();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 flex justify-center shadow-sm">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareReply className="h-4 w-4 text-gray-400" />
          <p className="text-sm text-gray-500">
            {templates.length} template{templates.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          id="auto-reply-create-template-btn"
          onClick={() => { setEditTemplate(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <MessageSquareReply className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No templates yet</h3>
          <p className="text-xs text-gray-400 mb-4">Create your first reply template to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {templates.map(t => (
                <tr 
                  key={t.id} 
                  onClick={() => { setEditTemplate(t); setShowModal(true); }}
                  className="hover:bg-zinc-50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900">{t.name}</span>
                        {t.is_fallback && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold uppercase rounded border border-amber-200">Fallback</span>}
                        {t.ai_enabled && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-bold uppercase rounded border border-purple-200 flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5"/> AI</span>}
                      </div>
                      {/* keywords */}
                      {t.keywords && t.keywords.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {t.keywords.map((kw, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] rounded font-medium">{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                      {(() => {
                        const conn = connections.find(c => c.id === t.connection_id);
                        if (!conn) return null;
                        return (
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={conn.platform} className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-600">@{conn.profile_name}</span>
                          </div>
                        );
                      })()}
                  </td>
                  <td className="px-6 py-4 align-top">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${t.active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                        {t.active ? 'Active' : 'Inactive'}
                      </span>
                  </td>
                  <td className="px-6 py-4 align-top max-w-[200px]">
                      {t.reply_text && <p className="text-xs text-zinc-500 line-clamp-2">💬 {t.reply_text}</p>}
                      {t.ai_guidelines && <p className="text-[11px] text-purple-500 mt-1 line-clamp-1">🧠 {t.ai_guidelines}</p>}
                  </td>
                  <td className="px-6 py-4 align-top text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[10px] font-mono text-zinc-400 mr-2">P{t.priority}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleToggle(t); }} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${t.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-zinc-400 hover:bg-zinc-100'}`} title={t.active ? 'Disable' : 'Enable'}>
                        {t.active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditTemplate(t); setShowModal(true); }} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <TemplateModal
          connections={connections}
          template={editTemplate}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchTemplates(); }}
        />
      )}
    </div>
  );
}

// ─── Template Modal ──────────────────────────────────────────────────────────

function TemplateModal({
  connections,
  template,
  onClose,
  onSaved,
}: {
  connections: SocialConnection[];
  template: ReplyTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>(
    template?.connection_id || (connections.length > 0 ? connections[0].id : '')
  );
  
  const selectedConn = connections.find(c => c.id === selectedConnectionId);
  const platform = selectedConn?.platform || 'instagram';

  const [name, setName] = useState(template?.name || '');
  const [keywords, setKeywords] = useState<string[]>(template?.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [replyText, setReplyText] = useState(template?.reply_text || '');
  const [aiEnabled, setAiEnabled] = useState(template?.ai_enabled || false);
  const [aiGuidelines, setAiGuidelines] = useState(template?.ai_guidelines || '');
  const [priority, setPriority] = useState(template?.priority || 0);
  const [isFallback, setIsFallback] = useState(template?.is_fallback || false);
  const [saving, setSaving] = useState(false);

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    try {
      if (template) {
        await authFetch('/api/auto-reply/templates', {
          method: 'PUT',
          body: JSON.stringify({
            id: template.id,
            name,
            keywords,
            replyText: replyText || null,
            aiEnabled,
            aiGuidelines: aiGuidelines || null,
            priority,
            isFallback,
          }),
        });
      } else {
        await authFetch('/api/auto-reply/templates', {
          method: 'POST',
          body: JSON.stringify({
            connectionId: selectedConnectionId,
            name,
            keywords,
            replyText: replyText || null,
            aiEnabled,
            aiGuidelines: aiGuidelines || null,
            priority,
            isFallback,
          }),
        });
      }
      onSaved();
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSaving(false);
    }
  };

  const platformHint = platform === 'x' || platform === 'twitter'
    ? 'X/Twitter reply — keep it concise and witty'
    : 'Instagram reply — warm and engaging';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${platformGradient(platform)} shadow-sm`}>
              <PlatformIcon platform={platform} className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {template ? 'Edit Template' : 'Create Template'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
            <XClose className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Platform hint */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <PlatformIcon platform={platform} className={`h-3.5 w-3.5 ${platformAccent(platform)}`} />
            <span className="text-xs text-gray-500">{platformHint}</span>
          </div>

          {/* Account Selection */}
          <div className={`${template ? 'opacity-60 pointer-events-none' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Apply to Account *</label>
            <AccountSelector
              connections={connections}
              selectedId={selectedConnectionId}
              onSelect={setSelectedConnectionId}
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1.5">Template Name *</label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Positive Feedback Reply"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
            />
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="template-keywords" className="block text-sm font-medium text-gray-700 mb-1.5">
              Trigger Keywords
              {isFallback && <span className="text-xs text-gray-400 ml-1">(ignored for fallback templates)</span>}
            </label>
            <div className="flex gap-2">
              <input
                id="template-keywords"
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addKeyword(); }
                }}
                placeholder="Type keyword and press Enter"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                disabled={isFallback}
              />
              <button
                onClick={addKeyword}
                disabled={isFallback}
                className="px-3 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-100"
                  >
                    {kw}
                    <button onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors cursor-pointer">
                      <XClose className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reply Text */}
          <div>
            <label htmlFor="template-reply-text" className="block text-sm font-medium text-gray-700 mb-1.5">
              Reply Text {aiEnabled ? '(used as AI tone reference)' : '(static reply)'}
            </label>
            <textarea
              id="template-reply-text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              placeholder={aiEnabled ? "e.g. Thank you! We're glad you liked it 🙌" : "The exact reply that will be posted"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none"
            />
          </div>

          {/* AI Toggle */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-900">AI-Powered Replies</span>
              </div>
              <button
                id="template-ai-toggle"
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  aiEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    aiEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {aiEnabled && (
              <div className="mt-3">
                <label htmlFor="template-ai-guidelines" className="block text-xs font-medium text-gray-600 mb-1">AI Guidelines (optional)</label>
                <textarea
                  id="template-ai-guidelines"
                  value={aiGuidelines}
                  onChange={(e) => setAiGuidelines(e.target.value)}
                  rows={2}
                  placeholder="e.g. Keep it casual, mention our new product launch, always invite them to DM us"
                  className="w-full px-3 py-2 rounded-lg border border-purple-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none"
                />
              </div>
            )}
          </div>

          {/* Priority & Fallback */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="template-priority" className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <input
                id="template-priority"
                type="number"
                min={0}
                max={100}
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">Higher = checked first</p>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <button
                  id="template-fallback-toggle"
                  onClick={() => setIsFallback(!isFallback)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    isFallback ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      isFallback ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">Fallback Template</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Used when no keywords match</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="template-save-btn"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Account Settings ─────────────────────────────────────────────────

function SettingsTab({ connectionId, connections }: { connectionId: string; connections: SocialConnection[] }) {
  const [settings, setSettings] = useState<AutoReplySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blacklistInput, setBlacklistInput] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);

  // Local form state
  const [enabled, setEnabled] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(10);
  const [maxReplies, setMaxReplies] = useState(30);
  const [minDelay, setMinDelay] = useState(2);
  const [maxDelay, setMaxDelay] = useState(12);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [monitorAll, setMonitorAll] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!connectionId) return;
    setLoading(true);
    try {
      const [settingsRes, statsRes] = await Promise.all([
        authFetch(`/api/auto-reply/settings?connectionId=${connectionId}`),
        authFetch(`/api/auto-reply/stats?connectionId=${connectionId}`),
      ]);

      const settingsJson = await settingsRes.json();
      const statsJson = await statsRes.json();

      const s = (settingsJson.data || [])[0] || null;
      setSettings(s);
      if (s) {
        setEnabled(s.enabled);
        setPollingInterval(s.polling_interval_minutes);
        setMaxReplies(s.max_replies_per_day);
        setMinDelay(s.min_delay_seconds);
        setMaxDelay(s.max_delay_seconds);
        setBlacklist(s.blacklist_keywords || []);
        setMonitorAll(s.monitor_all_posts);
      } else {
        // Reset to defaults for new connections
        setEnabled(false);
        setPollingInterval(10);
        setMaxReplies(30);
        setMinDelay(2);
        setMaxDelay(12);
        setBlacklist([]);
        setMonitorAll(true);
      }

      setStats(statsJson.data || null);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authFetch('/api/auto-reply/settings', {
        method: 'POST',
        body: JSON.stringify({
          connectionId,
          enabled,
          pollingIntervalMinutes: pollingInterval,
          maxRepliesPerDay: maxReplies,
          minDelaySeconds: minDelay,
          maxDelaySeconds: maxDelay,
          blacklistKeywords: blacklist,
          monitorAllPosts: monitorAll,
        }),
      });
      fetchSettings();
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const addBlacklistWord = () => {
    const word = blacklistInput.trim().toLowerCase();
    if (word && !blacklist.includes(word)) {
      setBlacklist([...blacklist, word]);
    }
    setBlacklistInput('');
  };

  const conn = connections.find((c) => c.id === connectionId);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 flex justify-center shadow-sm">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Replies Today', value: stats.repliesToday, icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Replies', value: stats.totalReplies, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Skipped', value: stats.totalSkipped, icon: Ban, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: 'Errors Today', value: stats.errorsToday, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Account Header */}
        <div className={`px-6 py-4 border-b border-gray-100 ${
          conn?.platform === 'x' || conn?.platform === 'twitter'
            ? 'bg-gradient-to-r from-zinc-50 via-zinc-50 to-gray-50'
            : 'bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {conn?.profile_image ? (
                <img src={conn.profile_image} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
              ) : (
                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br ${platformGradient(conn?.platform || 'instagram')}`}>
                  <PlatformIcon platform={conn?.platform || 'instagram'} className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-gray-900">@{conn?.profile_name}</h3>
                <p className="text-xs text-gray-500">{platformLabel(conn?.platform || '')} Account</p>
              </div>
            </div>

            {/* Master Toggle */}
            <button
              id="auto-reply-master-toggle"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors cursor-pointer shadow-inner ${
                enabled ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  enabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {enabled && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-700">Monitoring active</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Rate Limit Progress */}
          {stats && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-600">Daily Usage</span>
                <span className="text-xs font-mono text-gray-400">{stats.repliesToday} / {maxReplies}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${Math.min((stats.repliesToday / maxReplies) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Polling Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Polling Interval</label>
            <div className="flex gap-2">
              {[5, 10, 15, 30].map((val) => (
                <button
                  key={val}
                  onClick={() => setPollingInterval(val)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    pollingInterval === val
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {val}min
                </button>
              ))}
            </div>
          </div>

          {/* Max Replies */}
          <div>
            <label htmlFor="settings-max-replies" className="block text-sm font-medium text-gray-700 mb-2">Max Replies / Day</label>
            <input
              id="settings-max-replies"
              type="range"
              min={5}
              max={100}
              value={maxReplies}
              onChange={(e) => setMaxReplies(parseInt(e.target.value))}
              className="w-full accent-purple-600"
            />
            <p className="text-xs text-gray-400 text-center mt-1 font-mono">{maxReplies} replies/day</p>
          </div>

          {/* Delay Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-min-delay" className="block text-sm font-medium text-gray-700 mb-1.5">Min Delay (sec)</label>
              <input
                id="settings-min-delay"
                type="number"
                min={1}
                max={30}
                value={minDelay}
                onChange={(e) => setMinDelay(parseInt(e.target.value) || 2)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
              />
            </div>
            <div>
              <label htmlFor="settings-max-delay" className="block text-sm font-medium text-gray-700 mb-1.5">Max Delay (sec)</label>
              <input
                id="settings-max-delay"
                type="number"
                min={1}
                max={60}
                value={maxDelay}
                onChange={(e) => setMaxDelay(parseInt(e.target.value) || 12)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
              />
            </div>
          </div>

          {/* Monitor All Posts Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-700">Monitor All Posts</p>
              <p className="text-xs text-gray-400">When off, only selected posts are monitored</p>
            </div>
            <button
              onClick={() => setMonitorAll(!monitorAll)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                monitorAll ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                monitorAll ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Blacklist */}
          <div>
            <label htmlFor="settings-blacklist" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              Blacklist Keywords
            </label>
            <div className="flex gap-2">
              <input
                id="settings-blacklist"
                type="text"
                value={blacklistInput}
                onChange={(e) => setBlacklistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addBlacklistWord(); }
                }}
                placeholder="Type word and press Enter"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              />
              <button
                onClick={addBlacklistWord}
                className="px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {blacklist.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {blacklist.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100"
                  >
                    {word}
                    <button
                      onClick={() => setBlacklist(blacklist.filter((w) => w !== word))}
                      className="hover:text-red-800 transition-colors cursor-pointer"
                    >
                      <XClose className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            id="auto-reply-save-settings-btn"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Activity Logs ────────────────────────────────────────────────────

function LogsTab({ connectionId }: { connectionId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!connectionId) return;
    setLoading(true);
    try {
      let url = `/api/auto-reply/logs?connectionId=${connectionId}&limit=50`;
      if (actionFilter) url += `&action=${actionFilter}`;
      const res = await authFetch(url);
      const json = await res.json();
      setLogs(json.data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, [connectionId, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actionBadge = (action: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      reply_sent: { label: 'Replied', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      comment_skipped: { label: 'Skipped', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
      error: { label: 'Error', cls: 'bg-red-50 text-red-700 border-red-200' },
      rate_limited: { label: 'Rate Limited', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
      polling_run: { label: 'Poll', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    };
    const badge = map[action] || { label: action, cls: 'bg-gray-50 text-gray-600 border-gray-200' };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${badge.cls}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <select
          id="logs-action-filter"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 cursor-pointer"
        >
          <option value="">All Actions</option>
          <option value="reply_sent">Replied</option>
          <option value="comment_skipped">Skipped</option>
          <option value="error">Errors</option>
          <option value="rate_limited">Rate Limited</option>
          <option value="polling_run">Polling Runs</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex justify-center shadow-sm">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <Activity className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No activity yet</h3>
          <p className="text-xs text-gray-400">Logs will appear here once auto-reply starts running</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-32">Time</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-32">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-zinc-50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-6 py-4 align-top">
                    <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1.5 items-start">
                      {actionBadge(log.action)}
                      {log.ai_used && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-purple-600">
                          <Sparkles className="h-3 w-3" /> AI Used
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {log.template_name && <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Template: {log.template_name}</p>}
                      {log.comment_text && (
                        <p className="text-[13px] text-zinc-700 leading-snug">
                          <span className="font-semibold text-purple-600/70 mr-1">@{log.metadata?.commenter_username || 'user'}:</span> 
                          {log.comment_text}
                        </p>
                      )}
                      {log.reply_text && <p className="text-[13px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg leading-snug"><span className="font-semibold text-emerald-400 mr-1">↪</span> {log.reply_text}</p>}
                      {log.error_message && <p className="text-[13px] text-red-600 bg-red-50 px-3 py-2 rounded-lg leading-snug"><span className="font-semibold text-red-400 mr-1">⚠</span> {log.error_message}</p>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedLog && <LogModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}

// ─── Log Modal ───────────────────────────────────────────────────────────────

function LogModal({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  if (!log) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Log Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <XClose className="h-5 w-5"/>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm font-medium text-gray-900">{log.action}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Time</p>
              <p className="text-sm font-medium text-gray-900">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          </div>
          {log.metadata?.commenter_username && (
             <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Commenter</p>
               <p className="text-sm font-medium text-purple-600 bg-purple-50 px-2.5 py-1 inline-flex rounded-lg border border-purple-100">@{log.metadata.commenter_username}</p>
             </div>
          )}
          {log.comment_text && (
             <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Original Comment</p>
               <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm text-gray-700 leading-relaxed">{log.comment_text}</div>
             </div>
          )}
          {log.reply_text && (
             <div>
               <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Auto-Reply Sent</p>
               <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-sm text-emerald-800 leading-relaxed flex gap-2"><span className="text-emerald-500">↪</span>{log.reply_text}</div>
             </div>
          )}
          {log.error_message && (
             <div>
               <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1.5">Error Details</p>
               <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl text-sm text-red-800 leading-relaxed font-mono">{log.error_message}</div>
             </div>
          )}
          {log.template_name && (
             <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 text-center">Template Used</p>
                 <p className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md inline-block">{log.template_name}</p>
               </div>
               {log.ai_used && (
                 <div className="flex flex-col items-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 text-center">AI Generation</p>
                   <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-md border border-purple-200">
                     <Sparkles className="h-3 w-3" /> Yes
                   </span>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
