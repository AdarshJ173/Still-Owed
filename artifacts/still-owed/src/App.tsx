import { useEffect, useState, type ReactNode } from 'react';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { ArrowRight, BookOpen, Check, ChevronRight, Clipboard, Download, FileImage, FileText, Home as HomeIcon, LockKeyhole, Menu, Plus, Printer, RotateCcw, Settings as SettingsIcon, Shield, Trash2, Upload } from 'lucide-react';

type PromiseRecord = { id: string; wording: string; date: string; sourceId?: string; condition?: string; revisionOf?: string; relationship?: string };
type Source = { id: string; title: string; kind: 'note' | 'image'; date: string; note?: string; preview?: string; lines: string[]; processing?: boolean };
type UpdateRecord = { id: string; date: string; text: string; linkedPromiseId?: string };
type CaseRecord = {
  id: string; store: string; item: string; amount: string; opened: string; status: 'active' | 'closed';
  question: string; currentState: string; fictional?: boolean; promises: PromiseRecord[]; sources: Source[]; updates: UpdateRecord[];
  outcome?: string;
};
type AppState = { cases: CaseRecord[] };

const STORE_KEY = 'still-owed-state-v1';
const seedState: AppState = {
  cases: [{
    id: 'demo-001', store: 'Demo Store', item: 'A fictional kitchen appliance', amount: '₹3,499',
    opened: '12 Sep 2026', status: 'active', fictional: true,
    question: 'When will the refund be issued after the return is received?',
    currentState: 'Waiting for warehouse receipt confirmation',
    promises: [
      { id: 'promise-1', wording: 'We will issue the refund within 48 hours after warehouse receipt.', date: '12 Sep 2026', sourceId: 'source-1' },
      { id: 'promise-2', wording: 'Please allow five working days after warehouse receipt.', date: '15 Sep 2026', sourceId: 'source-2', condition: 'Later support wording' },
    ],
    sources: [
      { id: 'source-1', title: 'Chat transcript · 12 Sep 2026', kind: 'note', date: '12 Sep 2026', note: 'Fictional Demo Store chat transcript. The agent wrote: We will issue the refund within 48 hours after warehouse receipt.', lines: ['We will issue the refund within 48 hours after warehouse receipt.'] },
      { id: 'source-2', title: 'Chat transcript · 15 Sep 2026', kind: 'note', date: '15 Sep 2026', note: 'Fictional Demo Store chat transcript. The agent wrote: Please allow five working days after warehouse receipt.', lines: ['Please allow five working days after warehouse receipt.'] },
    ],
    updates: [{ id: 'update-1', date: '15 Sep 2026', text: 'Support changed the timeframe in a later conversation.', linkedPromiseId: 'promise-2' }],
  }],
};

function useCasebook() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      return saved ? JSON.parse(saved) as AppState : seedState;
    } catch { return seedState; }
  });
  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }, [state]);
  return { state, setState };
}

function Logo() {
  return <Link href="/" className="wordmark" data-testid="link-logo"><span className="mark">S</span><span>Still Owed</span></Link>;
}

function PublicHeader() {
  return <header className="site-header"><Logo /><nav className="header-nav" aria-label="Public navigation">
    <Link href="/privacy" data-testid="link-privacy">Privacy</Link>
    <Link href="/sign-in" className="button button-primary button-small" data-testid="link-sign-in">Open casebook</Link>
  </nav></header>;
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <div className="app-shell">
    <aside className="app-sidebar">
      <Logo />
      <p className="sidebar-tag">A private casebook for return conversations that keep changing.</p>
      <nav className="side-nav" aria-label="Casebook navigation">
        <Link className={location === '/cases' ? 'active' : ''} href="/cases" data-testid="link-cases"><BookOpen size={16} aria-hidden="true" /> Cases</Link>
        <Link className={location === '/settings' ? 'active' : ''} href="/settings" data-testid="link-settings"><SettingsIcon size={16} aria-hidden="true" /> Settings</Link>
      </nav>
      <div className="side-bottom">
        <div className="notice"><LockKeyhole size={15} aria-hidden="true" /> Your casebook stays in this browser.</div>
        <Link href="/" className="button button-quiet button-small" data-testid="link-back-home">Back to public page</Link>
      </div>
    </aside>
    <main className="main-area">
      <div className="mobile-bar"><Logo /><Link href="/cases" aria-label="Open cases" data-testid="link-mobile-cases"><Menu size={21} aria-hidden="true" /></Link></div>
      {children}
    </main>
  </div>;
}

function Home() {
  return <><PublicHeader /><main className="public-main">
    <section className="hero">
      <div>
        <span className="eyebrow">A private return casebook</span>
        <h1>Keep what they promised.</h1>
        <p className="hero-copy">Still Owed helps you keep the paper trail when an online-shopping return turns into a repeated support conversation. See what was said, when it changed, and what you can calmly ask next.</p>
        <div className="hero-actions"><Link href="/sign-in" className="button button-primary" data-testid="button-start-casebook">Start a casebook <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/cases/demo-001" className="button button-secondary" data-testid="link-view-demo">See the fictional demo</Link></div>
      </div>
      <div>
        <span className="fiction-label"><span aria-hidden="true">◆</span> Clearly fictional · Demo Store</span>
        <div className="promise-paper" aria-label="Demo Store source-linked promise example">
          <div className="eyebrow">Promise · 12 Sep 2026</div>
          <blockquote>“We will issue the refund within 48 hours after warehouse receipt.”</blockquote>
          <div className="paper-rule" /><div className="paper-meta"><span>Source 01 · chat note</span><span>Saved, not sent</span></div>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="section-heading"><span className="eyebrow">A clearer record</span><h2>New wording joins the history. It does not erase it.</h2><p>Keep exact source lines beside the promise they support. Mark a later change without deciding the outcome for you.</p></div>
      <div className="story-grid"><article className="story-card"><span className="eyebrow">01 · collect</span><h3>Put the receipts in one place.</h3><p>Add an image or a manual note. Choose the lines that matter, and record the date as known or not known.</p></article><article className="story-card"><span className="eyebrow">02 · follow through</span><h3>Ask with the record in hand.</h3><p>Prepare factual follow-up wording, choose what to export, and keep the copy ready. Still Owed never sends a message for you.</p></article></div>
    </section>
    <section className="section">
      <div className="section-heading"><span className="eyebrow">Quiet by design</span><h2>No predictions. No pressure. Just a better desk.</h2><p>Built for adults in India handling the slow, tiring part of a return: repeating what happened while the wording keeps moving.</p></div>
      <div className="action-row"><Link href="/privacy" className="button button-quiet" data-testid="link-home-privacy">Read the privacy note</Link><Link href="/offline" className="button button-quiet" data-testid="link-home-offline">How offline storage works</Link></div>
    </section>
    <PublicFooter />
  </main></>;
}

function PublicFooter() {
  return <footer className="footer"><span>Still Owed · a quiet casebook</span><nav><Link href="/terms" data-testid="link-terms">Terms</Link><Link href="/privacy" data-testid="link-footer-privacy">Privacy</Link><Link href="/offline" data-testid="link-footer-offline">Offline use</Link></nav></footer>;
}

function SignIn() {
  const [, setLocation] = useLocation();
  return <><PublicHeader /><main className="public-main"><section className="login-card">
    <span className="eyebrow">Sign in, or use the demo</span><h1>Keep your desk private.</h1>
    <p className="hero-copy">This first release stores your casebook in this browser. There is no password to forget here, and no support conversation leaves your device unless you choose to export it.</p>
    <div className="form-grid" style={{ marginTop: '2rem' }}><div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@example.com" data-testid="input-email" /></div><button className="button button-primary" onClick={() => setLocation('/cases')} data-testid="button-sign-in">Continue to casebook <ArrowRight size={17} aria-hidden="true" /></button><button className="button button-secondary" onClick={() => setLocation('/cases/demo-001')} data-testid="button-demo-access">Use fictional Demo Store case</button></div>
    <p className="hint" style={{ marginTop: '1.4rem' }}>Demo access does not create an account or contact a store.</p>
  </section></main></>;
}

function CasesPage() {
  const { state } = useCasebook();
  return <AppShell><Cases state={state} /></AppShell>;
}
function Cases({ state }: { state: AppState }) {
  const active = state.cases.filter(c => c.status === 'active');
  const closed = state.cases.filter(c => c.status === 'closed');
  return <div className="page-wrap"><div className="page-top"><div><span className="eyebrow">Your desk</span><h1>Cases</h1><p>One clear record for each return conversation. Nothing here is a legal verdict.</p></div><Link href="/cases/new" className="button button-primary" data-testid="button-new-case"><Plus size={17} aria-hidden="true" /> New case</Link></div>
    {active.length > 0 && <><div className="section-label"><h2>Open</h2><span className="status-line"><span className="status-dot" /> {active.length} active</span></div><div className="case-list">{active.map(c => <CaseCard key={c.id} item={c} />)}</div></>}
    {closed.length > 0 && <><div className="section-label"><h2>Closed</h2><span className="status-line"><span className="status-dot closed" /> {closed.length} closed</span></div><div className="case-list">{closed.map(c => <CaseCard key={c.id} item={c} />)}</div></>}
    {state.cases.length === 0 && <div className="empty-state"><h2>A clear desk, for now.</h2><p>Start a case when a return becomes a repeated support conversation. You can add the source later.</p><Link href="/cases/new" className="button button-primary" data-testid="button-empty-new-case"><Plus size={17} aria-hidden="true" /> New case</Link></div>}
  </div>;
}
function CaseCard({ item }: { item: CaseRecord }) {
  return <Link href={`/cases/${item.id}`} className={`case-card ${item.status === 'closed' ? 'closed' : ''}`} data-testid={`card-case-${item.id}`}><span className="case-stripe" aria-hidden="true" /><span><span className="status-line"><span className={`status-dot ${item.status === 'closed' ? 'closed' : ''}`} /> {item.status === 'closed' ? 'Closed' : 'Active'}{item.fictional ? ' · Fictional demo' : ''}</span><h2>{item.store}</h2><p>{item.item} · {item.amount}</p><p className="hint">{item.currentState}</p></span><ChevronRight className="case-arrow" size={19} aria-hidden="true" /></Link>;
}

function NewCase() {
  const { setState } = useCasebook();
  const [, setLocation] = useLocation();
  const [store, setStore] = useState(''); const [item, setItem] = useState(''); const [amount, setAmount] = useState(''); const [question, setQuestion] = useState('');
  const save = () => { if (!store.trim() || !item.trim()) return; const id = `case-${Date.now()}`; setState(s => ({ cases: [...s.cases, { id, store: store.trim(), item: item.trim(), amount: amount.trim() || 'Amount not recorded', opened: 'Date not known', status: 'active', question: question.trim() || 'What is the next clear step?', currentState: 'Case opened; source still to be added', promises: [], sources: [], updates: [] }] })); setLocation(`/cases/${id}`); };
  return <AppShell><div className="page-wrap"><div className="page-top"><div><span className="eyebrow">New record</span><h1>Start a case.</h1><p>Write down the basics without trying to solve the whole conversation yet.</p></div></div><div className="form-grid"><div className="field"><label htmlFor="store">Store or marketplace</label><input id="store" value={store} onChange={e => setStore(e.target.value)} placeholder="Example: a marketplace name" data-testid="input-store" /></div><div className="field"><label htmlFor="item">What did you buy?</label><input id="item" value={item} onChange={e => setItem(e.target.value)} placeholder="Short item description" data-testid="input-item" /></div><div className="field"><label htmlFor="amount">Amount requested</label><input id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹0.00 or not recorded" data-testid="input-amount" /></div><div className="field"><label htmlFor="question">Open question <span className="hint">(optional)</span></label><textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="What do you still need the store to clarify?" data-testid="input-question" /></div><div className="action-row"><button className="button button-primary" onClick={save} disabled={!store.trim() || !item.trim()} data-testid="button-create-case">Create case <ArrowRight size={17} aria-hidden="true" /></button><Link href="/cases" className="button button-quiet" data-testid="button-cancel-case">Cancel</Link></div></div></div></AppShell>;
}

function CaseDetail() {
  const params = useParams<{ caseId: string }>(); const { state, setState } = useCasebook(); const [, setLocation] = useLocation();
  const [toast, setToast] = useState(''); const [note, setNote] = useState(''); const [isLater, setIsLater] = useState(false); const [outcome, setOutcome] = useState('');
  const item = state.cases.find(c => c.id === params.caseId);
  if (!item) return <AppShell><div className="page-wrap"><div className="empty-state"><h2>Case not found.</h2><Link href="/cases" className="button button-primary">Return to cases</Link></div></div></AppShell>;
  const copyFollowup = async () => { const text = `Hello, I am following up on my return for ${item.item}. Amount requested: ${item.amount}. Support said: ${item.promises[0]?.wording || 'No promise has been reviewed yet.'} Current state: ${item.currentState}. Please confirm the next step and expected timeframe.`; try { await navigator.clipboard.writeText(text); setToast('Follow-up copied to your clipboard. Prepared, not sent.'); } catch { setToast('Follow-up is ready below. Prepared, not sent.'); } window.setTimeout(() => setToast(''), 3000); };
  const addUpdate = () => { if (!note.trim()) return; const update: UpdateRecord = { id: `update-${Date.now()}`, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), text: note.trim(), linkedPromiseId: isLater ? item.promises[item.promises.length - 1]?.id : undefined }; setState(s => ({ cases: s.cases.map(c => c.id === item.id ? { ...c, updates: [...c.updates, update], currentState: note.trim() } : c) })); setNote(''); setIsLater(false); setToast('Update added to the case.'); window.setTimeout(() => setToast(''), 2200); };
  const recordOutcome = () => { if (!outcome) return; setState(s => ({ cases: s.cases.map(c => c.id === item.id ? { ...c, status: 'closed', outcome } : c) })); setOutcome(''); };
  const reopen = () => setState(s => ({ cases: s.cases.map(c => c.id === item.id ? { ...c, status: 'active', outcome: undefined } : c) }));
  const deleteCase = () => { if (window.confirm('Delete this case and its local records? This cannot be undone.')) { setState(s => ({ cases: s.cases.filter(c => c.id !== item.id) })); setLocation('/cases'); } };
  return <AppShell><div className="page-wrap"><div className="case-overview"><div><span className="eyebrow">{item.fictional ? 'Clearly fictional · Demo Store' : 'Private case record'}</span><h1>{item.store}</h1><p className="case-meta">{item.item} · Amount requested: {item.amount} · Opened {item.opened}</p></div><div className="action-row no-print">{item.status === 'active' ? <button className="button button-quiet button-small" onClick={() => { setOutcome(''); document.getElementById('outcome')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); document.getElementById('outcome')?.focus(); }} data-testid="button-record-outcome">Record outcome</button> : <button className="button button-quiet button-small" onClick={reopen} data-testid="button-reopen-case"><RotateCcw size={15} aria-hidden="true" /> Reopen</button>}<Link href={`/cases/${item.id}/export`} className="button button-secondary button-small" data-testid="button-export-case"><Download size={15} aria-hidden="true" /> Export</Link></div></div>
     {item.fictional && <div className="notice" style={{ marginTop: '1rem' }}><Shield size={15} aria-hidden="true" /> This is a fictional Demo Store case. It is included to show how the casebook works.</div>}
     <div className="dossier"><div className="main-column"><section className="question-box"><span className="eyebrow">Open question</span><h2>{item.question}</h2></section>
      <div className="section-label"><h2>Promise history</h2><Link href={`/cases/${item.id}/sources/new`} className="button button-primary button-small no-print" data-testid="button-add-source"><Plus size={15} aria-hidden="true" /> Add source</Link></div>
      {item.promises.length ? <div className="history">{item.promises.map((p, index) => <div className="history-item" key={p.id}><div className="date-rail">{p.date}</div><div className="promise-entry"><blockquote>{p.wording}</blockquote><Link href={`/cases/${item.id}/review/${p.sourceId || ''}`} className="source-ref" data-testid={`link-promise-source-${p.id}`}><FileText size={14} aria-hidden="true" /> Source {index + 1} · {p.condition || 'Reviewed promise'}</Link>{index > 0 && <div className="later-change">Later wording. It is connected to the history, not a replacement for what came before.</div>}</div></div>)}</div> : <div className="empty-state"><h2>No promise reviewed yet.</h2><p>Add a source, select the exact support line, and save it as a promise.</p><Link href={`/cases/${item.id}/sources/new`} className="button button-primary" data-testid="button-first-source"><Plus size={15} aria-hidden="true" /> Add first source</Link></div>}
       <div className="section-label"><h2>Sources</h2></div>{item.sources.length ? <div className="source-list">{item.sources.map(source => <div className="source-card" key={source.id} data-testid={`source-card-${source.id}`}><div><h3>{source.title}</h3><p>{source.kind === 'image' ? 'Image attachment with manual transcription available' : source.note}</p></div><Link href={`/cases/${item.id}/review/${source.id}`} className="button button-secondary button-small" data-testid={`button-review-${source.id}`}>Review source <ArrowRight size={14} aria-hidden="true" /></Link></div>)}</div> : <p className="hint">No screenshots or notes saved yet.</p>}
      <div className="section-label"><h2>Updates</h2></div>{item.updates.length > 0 && <div className="source-list">{item.updates.map(u => <div className="source-card" key={u.id}><div><h3>{u.date}</h3><p>{u.text}</p></div>{u.linkedPromiseId && <span className="source-ref"><Check size={14} aria-hidden="true" /> Linked change</span>}</div>)}</div>}
      <div className="form-grid no-print" style={{ marginTop: '1rem' }}><div className="field"><label htmlFor="new-update">Add update</label><textarea id="new-update" value={note} onChange={e => setNote(e.target.value)} placeholder="What happened in the latest conversation?" data-testid="input-add-update" /></div><label className="checkbox-row"><input type="checkbox" checked={isLater} onChange={e => setIsLater(e.target.checked)} data-testid="checkbox-later-change" /><span>Connect this update as a later change to the promise history.</span></label><button className="button button-secondary button-small" onClick={addUpdate} disabled={!note.trim()} data-testid="button-add-update"><Plus size={15} aria-hidden="true" /> Add update</button></div>
       </div><aside className="sidebar-card no-print"><h2>Next, if useful</h2><p>Keep the language factual and ask for the missing confirmation. Still Owed will not decide whether a refund is owed.</p><div className="notice" style={{ marginBottom: '1rem' }}><strong>You recorded:</strong> {item.currentState}<br /><span className="hint">If your recorded window has elapsed, ask for confirmation rather than guessing what happened.</span></div><button className="button button-primary" onClick={copyFollowup} data-testid="button-copy-followup"><Clipboard size={15} aria-hidden="true" /> Copy factual follow-up</button><div className="followup" style={{ marginTop: '1rem' }}>Prepared, not sent.<p>Hello, I am following up on this return. Please confirm the next step and expected timeframe. Window has elapsed? Please tell me the current status and next date.</p></div><hr className="divider" /><div className="field"><label htmlFor="outcome">Record outcome</label><select id="outcome" value={outcome} onChange={e => setOutcome(e.target.value)} data-testid="select-outcome"><option value="">Choose an outcome</option><option value="Full refund received">Full refund received</option><option value="Partial refund received">Partial refund received</option><option value="Other outcome recorded">Other outcome recorded</option></select><button className="button button-secondary button-small" style={{ marginTop: '.6rem' }} onClick={recordOutcome} disabled={!outcome} data-testid="button-save-outcome">Save outcome</button></div>{item.outcome && <p className="notice" style={{ marginTop: '1rem' }}>Outcome: {item.outcome}</p>}<hr className="divider" /><button className="button button-danger button-small" onClick={deleteCase} data-testid="button-delete-case"><Trash2 size={15} aria-hidden="true" /> Delete case</button></aside></div></div>{toast && <div className="toast" role="status" data-testid="status-toast">{toast}</div>}</AppShell>;
}

function NewSource() {
  const params = useParams<{ caseId: string }>(); const { state, setState } = useCasebook(); const [, setLocation] = useLocation();
  const [title, setTitle] = useState(''); const [note, setNote] = useState(''); const [preview, setPreview] = useState(''); const [fileName, setFileName] = useState(''); const [processing, setProcessing] = useState(false); const [mode, setMode] = useState<'note' | 'image'>('note');
  const save = () => { if (!note.trim() && !preview) return; const id = `source-${Date.now()}`; const source: Source = { id, title: title.trim() || (mode === 'image' ? fileName || 'Image attachment' : 'Manual note'), kind: mode, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), note: note.trim(), preview, lines: note.trim() ? note.split(/\n+/).filter(Boolean) : ['Manual transcription needed — select this line after reviewing the image.'], processing: false }; setState(s => ({ cases: s.cases.map(c => c.id === params.caseId ? { ...c, sources: [...c.sources, source] } : c) })); setLocation(`/cases/${params.caseId}/review/${id}`); };
  const chooseFile = (file?: File) => { if (!file) return; setMode('image'); setFileName(file.name); setProcessing(true); const reader = new FileReader(); reader.onload = () => { setPreview(String(reader.result)); setProcessing(false); }; reader.readAsDataURL(file); };
  return <AppShell><div className="page-wrap"><div className="page-top"><div><span className="eyebrow">Add source</span><h1>Keep the original nearby.</h1><p>Upload a screenshot for your own reference, or write a manual note. Local preview is not OCR.</p></div></div><div className="review-grid"><div className="form-grid"><div className="action-row"><button className={`button ${mode === 'note' ? 'button-primary' : 'button-quiet'}`} onClick={() => setMode('note')} data-testid="button-source-note"><FileText size={16} aria-hidden="true" /> Add note</button><label className={`button ${mode === 'image' ? 'button-primary' : 'button-quiet'}`} htmlFor="source-file" data-testid="button-source-image"><Upload size={16} aria-hidden="true" /> Upload image<input id="source-file" type="file" accept="image/*" hidden onChange={e => chooseFile(e.target.files?.[0])} /></label></div><div className="field"><label htmlFor="source-title">Source title</label><input id="source-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Chat transcript · 18 Sep 2026" data-testid="input-source-title" /></div><div className="field"><label htmlFor="source-note">Manual transcription or context</label><textarea id="source-note" value={note} onChange={e => setNote(e.target.value)} placeholder="Paste or type the exact support wording here. Put separate selectable lines on separate rows." data-testid="input-source-note" /><small>Still Owed does not claim to have read your image. A manual transcription is honest and reviewable.</small></div><div className="action-row"><button className="button button-primary" onClick={save} disabled={!note.trim() && !preview} data-testid="button-save-source">Save source <ArrowRight size={16} aria-hidden="true" /></button><Link href={`/cases/${params.caseId}`} className="button button-quiet" data-testid="button-cancel-source">Cancel</Link></div></div><div><div className="eyebrow">Preview</div><div className="preview-box" style={{ marginTop: '.6rem' }}>{processing ? <div className="processing" role="status" data-testid="status-processing">Processing local image preview…</div> : preview ? <img src={preview} alt={`Preview of ${fileName || 'uploaded source'}`} data-testid="img-source-preview" /> : <div className="hint"><FileImage size={24} aria-hidden="true" /><p>No image selected. Manual note fallback is ready.</p></div>}</div>{mode === 'image' && <p className="hint" style={{ marginTop: '.7rem' }}>The browser only creates a local preview. It does not perform or imply OCR.</p>}</div></div></div></AppShell>;
}

function ReviewSource() {
  const params = useParams<{ caseId: string; sourceId: string }>(); const { state, setState } = useCasebook(); const [, setLocation] = useLocation(); const item = state.cases.find(c => c.id === params.caseId); const source = item?.sources.find(s => s.id === params.sourceId);
  const [selected, setSelected] = useState<number[]>([]); const [wording, setWording] = useState(''); const [date, setDate] = useState(''); const [condition, setCondition] = useState(''); const [dateKnown, setDateKnown] = useState(true); const [revisionOf, setRevisionOf] = useState(''); const [relationship, setRelationship] = useState('');
  useEffect(() => { if (source && !wording) setWording(source.lines.join(' ')); }, [source, wording]);
  if (!item || !source) return <AppShell><div className="page-wrap"><div className="empty-state"><h2>Source not found.</h2><Link href={`/cases/${params.caseId}`} className="button button-primary">Return to case</Link></div></div></AppShell>;
  const save = () => { if (!wording.trim()) return; const id = `promise-${Date.now()}`; const promise: PromiseRecord = { id, wording: wording.trim(), date: dateKnown ? (date || 'Date not known') : 'Date not known', sourceId: source.id, condition: condition.trim() || undefined, revisionOf: revisionOf || undefined, relationship: relationship || undefined }; setState(s => ({ cases: s.cases.map(c => c.id === item.id ? { ...c, promises: [...c.promises, promise], updates: revisionOf ? [...c.updates, { id: `update-${Date.now()}`, date: dateKnown ? (date || 'Date not known') : 'Date not known', text: `Connected this statement as ${relationship || 'additional information'}.`, linkedPromiseId: id }] : c.updates } : c) })); setLocation(`/cases/${item.id}`); };
  const toggleLine = (index: number) => setSelected(a => a.includes(index) ? a.filter(i => i !== index) : [...a, index]);
  return <AppShell><div className="page-wrap"><div className="page-top"><div><span className="eyebrow">Review source · {source.title}</span><h1>Choose the promise.</h1><p>Save your wording with its source. A newer sentence can become a later promise without rewriting earlier history.</p></div></div><div className="review-grid"><section><div className="eyebrow">Accessible source lines</div><div className="line-picker" style={{ marginTop: '.6rem' }}>{source.lines.map((line, i) => <label className="line-option" key={`${line}-${i}`}><input type="checkbox" checked={selected.includes(i)} onChange={() => toggleLine(i)} data-testid={`checkbox-source-line-${i}`} /><span>{line}</span></label>)}</div>{source.preview && <div className="preview-box" style={{ marginTop: '1rem' }}><img src={source.preview} alt="Source image preview; wording must be checked against the image" /></div>}</section><section className="form-grid"><div className="field"><label htmlFor="promise-wording">Support said</label><textarea id="promise-wording" value={wording} onChange={e => setWording(e.target.value)} data-testid="input-promise-wording" /><small>Use the exact wording you can support from the selected source lines.</small></div><div className="field"><label htmlFor="promise-date">Date</label><input id="promise-date" value={date} onChange={e => setDate(e.target.value)} placeholder="12 Sep 2026" data-testid="input-promise-date" /><label className="checkbox-row"><input type="checkbox" checked={!dateKnown} onChange={e => setDateKnown(!e.target.checked)} data-testid="checkbox-date-unknown" /><span>Date not known</span></label><small>Check date you selected before saving.</small></div><div className="field"><label htmlFor="promise-condition">Condition or context <span className="hint">(optional)</span></label><input id="promise-condition" value={condition} onChange={e => setCondition(e.target.value)} placeholder="Later support wording, if relevant" data-testid="input-promise-condition" /></div><div className="field"><label htmlFor="promise-revision">Does this update an earlier promise? <span className="hint">(optional)</span></label><select id="promise-revision" value={revisionOf} onChange={e => setRevisionOf(e.target.value)} data-testid="select-promise-revision"><option value="">No earlier promise selected</option>{item.promises.map(p => <option key={p.id} value={p.id}>{p.date} · {p.wording.slice(0, 56)}{p.wording.length > 56 ? '…' : ''}</option>)}</select></div>{revisionOf && <div className="field"><label htmlFor="promise-relationship">What changed?</label><select id="promise-relationship" value={relationship} onChange={e => setRelationship(e.target.value)} data-testid="select-promise-relationship"><option value="">Choose a relationship</option><option value="changed date">Changed date</option><option value="changed explanation">Changed explanation</option><option value="confirmed condition">Confirmed condition</option><option value="additional information">Additional information</option></select></div>}<div className="action-row"><button className="button button-primary" onClick={save} disabled={!wording.trim() || (revisionOf !== '' && relationship === '')} data-testid="button-save-promise"><Check size={16} aria-hidden="true" /> Save reviewed promise</button><Link href={`/cases/${item.id}`} className="button button-quiet" data-testid="button-cancel-review">Cancel</Link></div></section></div></div></AppShell>;
}

function ExportCase() {
  const params = useParams<{ caseId: string }>(); const { state } = useCasebook(); const item = state.cases.find(c => c.id === params.caseId); const [includeSources, setIncludeSources] = useState(true); const [includeUpdates, setIncludeUpdates] = useState(true); const [includePromises, setIncludePromises] = useState(true);
  if (!item) return <AppShell><div className="page-wrap"><div className="empty-state"><h2>Case not found.</h2><Link href="/cases" className="button button-primary">Return to cases</Link></div></div></AppShell>;
  return <AppShell><div className="page-wrap"><div className="page-top"><div><span className="eyebrow">Export case</span><h1>Choose the record.</h1><p>Make a print-ready copy for your own records. This does not send anything to the store.</p></div><button className="button button-primary no-print" onClick={() => window.print()} data-testid="button-print-export"><Printer size={16} aria-hidden="true" /> Print / save PDF</button></div><div className="export-grid"><section className="no-print"><div className="eyebrow">Include</div><div className="check-list" style={{ marginTop: '.75rem' }}><label className="checkbox-row"><input type="checkbox" checked={includePromises} onChange={e => setIncludePromises(e.target.checked)} data-testid="checkbox-export-promises" /><span>Promise history</span></label><label className="checkbox-row"><input type="checkbox" checked={includeSources} onChange={e => setIncludeSources(e.target.checked)} data-testid="checkbox-export-sources" /><span>Source references and notes</span></label><label className="checkbox-row"><input type="checkbox" checked={includeUpdates} onChange={e => setIncludeUpdates(e.target.checked)} data-testid="checkbox-export-updates" /><span>Updates</span></label></div><div className="notice" style={{ marginTop: '1.5rem' }}>Print preview includes plain adjacent text for every source. Images stay in this browser unless you choose to print them.</div></section><article className="export-preview" data-testid="export-preview"><span className="eyebrow">{item.fictional ? 'Clearly fictional · Demo Store' : 'Private case record'}</span><h2>{item.store}</h2><p>{item.item} · Amount requested: {item.amount}</p><p><strong>Current state:</strong> {item.currentState}</p><p><strong>Open question:</strong> {item.question}</p>{includePromises && <><hr className="divider" /><h3>Promise history</h3>{item.promises.map(p => <div key={p.id}><small>{p.date}</small><blockquote>{p.wording}</blockquote><p className="hint">Source reference: {item.sources.find(s => s.id === p.sourceId)?.title || 'Source not connected'}</p></div>)}</>}{includeSources && <><hr className="divider" /><h3>Sources</h3>{item.sources.map(s => <div key={s.id}><p><strong>{s.title}</strong></p><p className="hint">{s.note || 'Image attachment; review wording against the original.'}</p></div>)}</>}{includeUpdates && <><hr className="divider" /><h3>Updates</h3>{item.updates.map(u => <p key={u.id}><strong>{u.date}:</strong> {u.text}</p>)}</>}<hr className="divider" /><p className="hint">Prepared by Still Owed. Prepared, not sent.</p></article></div></div></AppShell>;
}

function Settings() {
  const { setState } = useCasebook(); const [, setLocation] = useLocation(); const [message, setMessage] = useState('');
  const download = () => { const blob = new Blob([localStorage.getItem(STORE_KEY) || '{}'], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'still-owed-casebook.json'; a.click(); URL.revokeObjectURL(url); setMessage('A copy of your local casebook is ready to download.'); };
  const deleteAccount = () => { if (window.confirm('Delete all local casebook data from this browser?')) { localStorage.removeItem(STORE_KEY); setState({ cases: [] }); setMessage('Local casebook data deleted.'); } };
  return <AppShell><div className="page-wrap"><div className="page-top"><div><span className="eyebrow">Your desk</span><h1>Settings</h1><p>Privacy controls and simple ways to move or remove the records kept in this browser.</p></div></div><div className="source-list" style={{ maxWidth: '720px' }}><div className="source-card"><div><h3><Shield size={16} aria-hidden="true" /> Privacy first</h3><p>Your records are stored in localStorage in this browser. Still Owed does not upload them in this release.</p></div><Link href="/privacy" className="source-ref" data-testid="link-settings-privacy">Read privacy <ArrowRight size={14} aria-hidden="true" /></Link></div><div className="source-card"><div><h3><Download size={16} aria-hidden="true" /> Download your data</h3><p>Save a JSON copy of every case, source note, and promise.</p></div><button className="button button-secondary button-small" onClick={download} data-testid="button-download-data">Download</button></div><div className="source-card"><div><h3><HomeIcon size={16} aria-hidden="true" /> Install help</h3><p>On your phone, use your browser’s “Add to Home Screen” option. The casebook remains browser-local.</p></div><span className="hint">No app store needed</span></div><div className="source-card"><div><h3>Sign out</h3><p>Return to the public explanation. Local data stays until you remove it.</p></div><button className="button button-quiet button-small" onClick={() => setLocation('/')} data-testid="button-logout">Log out</button></div><div className="source-card"><div><h3 style={{ color: 'var(--danger)' }}>Delete local account data</h3><p>This removes the casebook from this browser. Download first if you want a backup.</p></div><button className="button button-danger button-small" onClick={deleteAccount} data-testid="button-delete-account"><Trash2 size={15} aria-hidden="true" /> Delete</button></div></div>{message && <div className="toast" role="status" data-testid="status-settings">{message}</div>}</div></AppShell>;
}

function PlainPage({ page }: { page: 'privacy' | 'terms' | 'offline' }) {
  const content = {
    privacy: { eyebrow: 'Privacy, in plain language', title: 'Your papers stay on your desk.', blocks: [['What is stored', 'Still Owed stores the casebook you create in this browser’s local storage. In this release, there is no server account and no upload of your records.'], ['What you choose to share', 'If you print, save a PDF, download JSON, or copy follow-up wording, that action is yours. Still Owed does not send a message to a store.'], ['A careful note', 'Browser storage is not a vault. Keep your device and browser profile private, and download or delete your records when you need to.']] },
    terms: { eyebrow: 'A small, honest agreement', title: 'A casebook, not a verdict.', blocks: [['What Still Owed does', 'It helps you organize support wording, dates, source notes, and your own updates. It can prepare a factual follow-up for you to review.'], ['What it does not do', 'It does not give legal advice, decide whether a refund is owed, predict an outcome, contact a store, or verify a store’s claims.'], ['Your records', 'You decide what to add, edit as a new record, print, download, or delete.']] },
    offline: { eyebrow: 'Offline use', title: 'A quiet tool for a patchy connection.', blocks: [['What works here', 'Once this page has loaded, the casebook’s records are stored locally in your browser. Creating cases, adding notes, and reviewing promises can continue without a network request.'], ['What needs care', 'An image preview uses your browser’s FileReader. It is not OCR. Printing and downloading use browser features and may vary by device.'], ['Before you clear data', 'Download your casebook from Settings before clearing browser storage or changing profiles.']] },
  }[page];
  return <><PublicHeader /><main className="plain-page"><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1>{content.blocks.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}<div className="action-row" style={{ marginTop: '3rem' }}><Link href="/sign-in" className="button button-primary" data-testid={`button-${page}-start`}>Open the casebook <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/" className="button button-quiet" data-testid={`button-${page}-home`}>Home</Link></div></main></>;
}

function NotFound() {
  return <><PublicHeader /><main className="plain-page"><span className="eyebrow">404 · Empty folder</span><h1>That page is not in this casebook.</h1><p>Return to your desk and choose a page from there.</p><Link href="/" className="button button-primary" data-testid="button-not-found-home">Return home</Link></main></>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) { return <>{children}</>; }

function Router() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={Home} /><Route path="/sign-in" component={SignIn} /><Route path="/cases" component={CasesPage} /><Route path="/cases/new" component={NewCase} /><Route path="/cases/:caseId/sources/new" component={NewSource} /><Route path="/cases/:caseId/review/:sourceId" component={ReviewSource} /><Route path="/cases/:caseId/export" component={ExportCase} /><Route path="/cases/:caseId" component={CaseDetail} /><Route path="/settings" component={Settings} /><Route path="/privacy">{() => <PlainPage page="privacy" />}</Route><Route path="/terms">{() => <PlainPage page="terms" />}</Route><Route path="/offline">{() => <PlainPage page="offline" />}</Route><Route component={NotFound} />
  </Switch></RoutedErrorBoundary>;
}

function App() { return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>; }

export default App;