"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Lead = {
  id: string;
  contactName: string;
  companyName: string;
  email: string;
  phone?: string;
  pipelineStage: string;
  driveDocUrl?: string;
  driveDocId?: string;
  createdAt: string;
  documents?: Document[];
};

type Document = {
  id: string;
  title: string;
  type: string;
  entityType?: string;
  entityId?: string;
  driveUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  notes?: string;
  createdAt: string;
  uploadedBy: { email: string };
};

const STAGE_COLORS: Record<string, string> = {
  NEW_LEAD:       'border-accent-2 text-accent-2 bg-accent-2/10',
  QUALIFYING:     'border-accent-5 text-accent-5 bg-accent-5/10',
  QUALIFIED:      'border-accent-3 text-accent-3 bg-accent-3/10',
  PROPOSAL_SENT:  'border-accent-4 text-accent-4 bg-accent-4/10',
  NEGOTIATION:    'border-yellow-400 text-yellow-400 bg-yellow-400/10',
  WON_ONBOARDING: 'border-green-400 text-green-400 bg-green-400/10',
  ACTIVE_CLIENT:  'border-green-500 text-green-500 bg-green-500/10',
  CHURNED:        'border-red-500 text-red-500 bg-red-500/10',
  DISQUALIFIED:   'border-white/20 text-white/30 bg-white/5',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  MEETING_NOTES: '📝 Meeting Notes',
  CONTRACT:      '📋 Contract',
  PROPOSAL:      '📄 Proposal',
  ID_DOCUMENT:   '🪪 ID Document',
  REPORT:        '📊 Report',
  OTHER:         '📁 Other',
};

async function apiFetch(token: string, path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}/api/v1/documents${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export default function DocumentVaultPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'crm' | 'docs' | 'import'>('crm');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [driveConfigured, setDriveConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add lead form
  const [addForm, setAddForm] = useState({ contactName: '', companyName: '', email: '', phone: '', notes: '' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // CSV import
  const [csvText, setCsvText] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importDone, setImportDone] = useState<{ imported: number; total: number } | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Upload doc form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('OTHER');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const getToken = async () => {
    const { getAuth } = await import('firebase/auth');
    return getAuth().currentUser?.getIdToken() || '';
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const [leadsData, docsData, driveData] = await Promise.all([
        apiFetch(token, '/leads'),
        apiFetch(token, ''),
        apiFetch(token, '/drive-status'),
      ]);
      setLeads(leadsData.leads || []);
      setDocs(docsData.documents || []);
      setDriveConfigured(driveData.configured || false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleAddLead = async () => {
    setAddError('');
    if (!addForm.contactName || !addForm.companyName || !addForm.email) {
      setAddError('Name, company and email are required.');
      return;
    }
    setAddLoading(true);
    try {
      const token = await getToken();
      await apiFetch(token, '/leads', {
        method: 'POST',
        body: JSON.stringify({ ...addForm, autoCreateDoc: true }),
      });
      setAddForm({ contactName: '', companyName: '', email: '', phone: '', notes: '' });
      await loadData();
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Delete this lead and its Google Doc?')) return;
    const token = await getToken();
    await apiFetch(token, `/leads/${id}`, { method: 'DELETE' });
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    const token = await getToken();
    await apiFetch(token, `/${id}`, { method: 'DELETE' });
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUploadDoc = async () => {
    if (!uploadTitle) return;
    setUploadLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('type', uploadType);
      if (uploadFile) formData.append('file', uploadFile);

      const res = await fetch(`${API}/api/v1/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Upload failed');
      setDocs((prev) => [json.data, ...prev]);
      setUploadTitle(''); setUploadType('OTHER'); setUploadFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCSVImport = async () => {
    const lines = csvText.split('\n').filter((l) => l.trim());
    if (!lines.length) return;

    const rows = lines.map((line) => {
      const [name = '', company = '', email = '', phone = ''] = line.split(',').map((s) => s.trim());
      return { name, company, email, phone };
    }).filter((r) => r.name && r.company && r.email);

    if (!rows.length) { alert('No valid rows found. Format: Name, Company, Email, Phone'); return; }

    setImportLoading(true);
    setImportProgress(0);
    setImportTotal(rows.length);
    setImportDone(null);

    try {
      const token = await getToken();
      let done = 0;
      for (const row of rows) {
        await apiFetch(token, '/leads', { method: 'POST', body: JSON.stringify({ ...row, contactName: row.name, companyName: row.company, autoCreateDoc: driveConfigured }) });
        done++;
        setImportProgress(done);
      }
      setImportDone({ imported: done, total: rows.length });
      setCsvText('');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImportLoading(false);
    }
  };

  const filteredLeads = leads.filter((l) =>
    !search || [l.contactName, l.companyName, l.email].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const metrics = {
    total: leads.length,
    newLeads: leads.filter((l) => l.pipelineStage === 'NEW_LEAD').length,
    active: leads.filter((l) => l.pipelineStage === 'ACTIVE_CLIENT').length,
    withDocs: leads.filter((l) => l.driveDocUrl).length,
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background p-6 md:p-10 animate-pulse space-y-4">
      <div className="h-8 bg-white/5 rounded-xl w-1/3" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl" />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-3">CRM / Document Vault</p>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <h1 className="text-5xl font-black uppercase headline-shadow">Document Vault</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-xs font-black uppercase tracking-widest ${driveConfigured ? 'border-accent-2 text-accent-2 bg-accent-2/10' : 'border-white/20 text-white/30 bg-white/5'}`}>
              <span className={`w-2 h-2 rounded-full ${driveConfigured ? 'bg-accent-2' : 'bg-white/20'}`} />
              {driveConfigured ? 'Google Drive Connected' : 'Drive Not Configured'}
            </div>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Contacts', value: metrics.total, color: 'accent-1' },
            { label: 'New Leads', value: metrics.newLeads, color: 'accent-2' },
            { label: 'Active Clients', value: metrics.active, color: 'accent-3' },
            { label: 'With Drive Docs', value: metrics.withDocs, color: 'accent-5' },
          ].map((m) => (
            <div key={m.label} className={`max-section border-${m.color}/30 p-5`}>
              <p className={`text-[10px] font-black uppercase tracking-widest text-${m.color}/60 mb-1`}>{m.label}</p>
              <p className={`text-3xl font-black text-${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b-2 border-white/10">
          {(['crm', 'docs', 'import'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-4 -mb-0.5 ${tab === t ? 'border-accent-1 text-accent-1' : 'border-transparent text-white/40 hover:text-white/70'}`}>
              {t === 'crm' ? '👥 CRM Leads' : t === 'docs' ? '📁 Documents' : '📥 CSV Import'}
            </button>
          ))}
        </div>

        {/* ─── CRM Tab ─── */}
        {tab === 'crm' && (
          <div className="space-y-6">
            {/* Add Lead Form */}
            <div className="max-section border-accent-5/40 p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-accent-5">Add New Contact</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input value={addForm.contactName} onChange={(e) => setAddForm((p) => ({ ...p, contactName: e.target.value }))}
                  placeholder="Contact Name *" className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent-5" />
                <input value={addForm.companyName} onChange={(e) => setAddForm((p) => ({ ...p, companyName: e.target.value }))}
                  placeholder="Company *" className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent-5" />
                <input value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email *" className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent-5" />
                <input value={addForm.phone} onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone" className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent-5" />
              </div>
              {addError && <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{addError}</p>}
              <button onClick={handleAddLead} disabled={addLoading}
                className="max-button text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {addLoading ? 'Creating...' : `➕ Add Contact${driveConfigured ? ' + Create Drive Doc' : ''}`}
              </button>
            </div>

            {/* Search */}
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company or email..." className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-accent-1" />

            {/* Leads Table */}
            <div className="max-section border-accent-1/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b-4 border-white/10 bg-white/5">
                      {['Contact', 'Company', 'Email', 'Stage', 'Drive Doc', 'Added', ''].map((h) => (
                        <th key={h} className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-white/30 text-xs font-bold uppercase">No contacts yet — add one above</td></tr>
                    )}
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="p-4 font-black text-white uppercase tracking-tight">{lead.contactName}</td>
                        <td className="p-4 text-white/70 font-bold">{lead.companyName}</td>
                        <td className="p-4 text-white/50 font-mono text-xs">{lead.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${STAGE_COLORS[lead.pipelineStage] || 'border-white/20 text-white/30'}`}>
                            {lead.pipelineStage.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          {lead.driveDocUrl
                            ? <a href={lead.driveDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-accent-2 uppercase tracking-widest hover:underline">Open Doc ↗</a>
                            : <span className="text-white/20 text-xs">—</span>}
                        </td>
                        <td className="p-4 text-white/30 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <button onClick={() => handleDeleteLead(lead.id)} className="text-white/20 hover:text-red-400 transition-colors text-xs font-black">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── Documents Tab ─── */}
        {tab === 'docs' && (
          <div className="space-y-6">
            {/* Upload Form */}
            <div className="max-section border-accent-3/40 p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-accent-3">Upload or Link Document</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title *" className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent-3" />
                <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}
                  className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent-3">
                  {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-background">{v}</option>)}
                </select>
              </div>
              <input ref={fileRef} type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-accent-3 file:text-white hover:file:bg-accent-3/80 cursor-pointer" />
              {!driveConfigured && <p className="text-xs text-white/30">⚠️ Google Drive not configured — file will be linked by URL only. Add GOOGLE_SERVICE_ACCOUNT_JSON to Railway to enable auto-upload.</p>}
              <button onClick={handleUploadDoc} disabled={uploadLoading || !uploadTitle}
                className="max-button text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {uploadLoading ? 'Uploading...' : '📤 Upload Document'}
              </button>
            </div>

            {/* Documents Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.length === 0 && (
                <div className="col-span-3 p-8 text-center text-white/30 text-xs font-bold uppercase border-2 border-dashed border-white/10 rounded-2xl">No documents yet</div>
              )}
              {docs.map((doc) => (
                <div key={doc.id} className="max-card border-white/10 hover:border-accent-3/40 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg">{DOC_TYPE_LABELS[doc.type]?.split(' ')[0] || '📁'}</span>
                    <button onClick={() => handleDeleteDoc(doc.id)} className="text-white/20 hover:text-red-400 text-xs font-black">✕</button>
                  </div>
                  <p className="font-black uppercase tracking-tight text-sm text-white leading-tight">{doc.title}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{DOC_TYPE_LABELS[doc.type] || doc.type}</p>
                  {doc.driveUrl
                    ? <a href={doc.driveUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] font-black uppercase tracking-widest text-accent-2 hover:underline">Open in Drive ↗</a>
                    : null}
                  <p className="text-[10px] text-white/20">{doc.uploadedBy.email} · {new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CSV Import Tab ─── */}
        {tab === 'import' && (
          <div className="max-w-2xl space-y-6">
            <div className="max-section border-accent-4/40 p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-accent-4">Bulk CSV Import</h3>
              <p className="text-xs text-white/40 font-bold">One row per line. Format: <span className="font-mono text-white/60">Name, Company, Email, Phone (optional)</span></p>
              <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={10}
                placeholder={"John Smith, Acme Corp, john@acme.com, +27821234567\nJane Doe, Beta Ltd, jane@beta.co.za"}
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 outline-none focus:border-accent-4 resize-y" />

              {importLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/40">
                    <span>Importing...</span>
                    <span>{importProgress} / {importTotal}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-4 rounded-full transition-all duration-300"
                      style={{ width: importTotal > 0 ? `${(importProgress / importTotal) * 100}%` : '0%' }} />
                  </div>
                </div>
              )}

              {importDone && (
                <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                  <p className="text-sm font-black text-green-400 uppercase tracking-tight">
                    ✅ Imported {importDone.imported} of {importDone.total} contacts
                    {driveConfigured ? ' — Google Docs created for each.' : '.'}
                  </p>
                </div>
              )}

              <button onClick={handleCSVImport} disabled={importLoading || !csvText.trim()}
                className="max-button text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {importLoading ? 'Importing...' : `📥 Import Contacts${driveConfigured ? ' + Create Docs' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
