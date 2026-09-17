import { useEffect, useState, useRef, type ReactNode } from "react";
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from "wouter";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clipboard,
  Download,
  FileImage,
  FileText,
  Home as HomeIcon,
  Info,
  LockKeyhole,
  Menu,
  Plus,
  Printer,
  RotateCcw,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Upload,
  WifiOff,
  AlertCircle,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  Search,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  api,
  type CaseItem,
  type CaseDetailResponse,
  type SourceItem,
  type RecordItem,
  type ExtractionLine,
  type SnapshotResponse,
} from "./lib/api";
import { supabase, signInWithGoogle, signOut } from "./lib/supabase";
import { ConfirmDialog } from "./components/confirm-dialog";

// Helper: format paise to INR currency string
function formatPaise(paise?: number | null): string {
  if (paise == null || isNaN(paise)) return "Amount not recorded";
  const rupees = (paise / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
  });
  return `₹${rupees}`;
}

// Helper: parse date to readable string
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Date not known";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}


function Logo() {
  return (
    <Link href="/" className="wordmark" data-testid="link-logo">
      <span className="mark">S</span>
      <span>Still Owed</span>
    </Link>
  );
}

function PublicHeader() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      if (res.data?.session?.user?.email) {
        setCurrentUser(res.data.session.user.email);
      }
    });
  }, []);

  return (
    <header className="site-header">
      <Logo />
      <nav className="header-nav" aria-label="Public navigation">
        <Link href="/onboarding" data-testid="link-nav-onboarding">
          How it works & Guided tour
        </Link>
        <Link href="/privacy" data-testid="link-privacy">
          Privacy
        </Link>
        {currentUser ? (
          <div className="action-row" style={{ gap: ".5rem" }}>
            <Link href="/cases" className="button button-primary button-small" data-testid="link-nav-cases">
              Open cases ({currentUser.split("@")[0]})
            </Link>
            <button
              className="button button-quiet button-small"
              onClick={async () => {
                await signOut();
                setCurrentUser(null);
                window.location.href = "/";
              }}
              data-testid="button-nav-signout"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="action-row" style={{ gap: ".6rem" }}>
            <Link href="/sign-in" className="button button-quiet button-small" data-testid="link-sign-in">
              Sign in
            </Link>
            <button
              className="button button-primary button-small"
              onClick={() => signInWithGoogle()}
              data-testid="header-google-signin"
              style={{ display: "inline-flex", alignItems: "center", gap: ".45rem" }}
            >
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="footer">
      <span>Still Owed · a quiet casebook</span>
      <nav>
        <Link href="/terms" data-testid="link-terms">
          Terms
        </Link>
        <Link href="/privacy" data-testid="link-footer-privacy">
          Privacy
        </Link>
        <Link href="/offline" data-testid="link-footer-offline">
          Offline use
        </Link>
      </nav>
    </footer>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("Adarsh Jagannath");

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      if (res.data?.session?.user?.email) {
        setUserEmail(res.data.session.user.email);
      }
    });
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const displayName = userEmail.includes("@") ? userEmail.split("@")[0] : userEmail;
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AJ";

  return (
    <div className={`app-shell ${isCollapsed ? "collapsed" : ""}`}>
      <aside className="app-sidebar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem" }}>
          {!isCollapsed && <Logo />}
          <button
            className="button button-quiet button-small"
            style={{ minHeight: "2rem", padding: ".3rem .5rem", borderRadius: "var(--radius)" }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            data-testid="toggle-sidebar"
          >
            {isCollapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
          </button>
        </div>

        {!isCollapsed && (
          <p className="sidebar-tag">A private casebook for return conversations that keep changing.</p>
        )}

        <nav className="side-nav" aria-label="Casebook navigation">
          <Link
            className={location.startsWith("/cases") ? "active" : ""}
            href="/cases"
            title={isCollapsed ? "Cases" : undefined}
            data-testid="link-cases"
          >
            <BookOpen size={17} aria-hidden="true" /> {!isCollapsed && <span>Cases</span>}
          </Link>
          <Link
            className={location === "/settings" ? "active" : ""}
            href="/settings"
            title={isCollapsed ? "Settings" : undefined}
            data-testid="link-settings"
          >
            <SettingsIcon size={17} aria-hidden="true" /> {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        {/* User Profile & Logout at bottom of sidebar */}
        <div className="side-bottom">
          <div
            className="sidebar-user-card"
            style={{
              padding: isCollapsed ? ".4rem 0" : ".65rem .75rem",
              background: "var(--white)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "space-between",
              gap: ".65rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", minWidth: 0 }}>
              <div
                style={{
                  width: "2.1rem",
                  height: "2.1rem",
                  borderRadius: "50%",
                  background: "var(--blue)",
                  color: "var(--white)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: ".82rem",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              {!isCollapsed && (
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayName}
                  </div>
                  <div
                    style={{
                      color: "var(--ink-soft)",
                      fontSize: ".75rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Active session
                  </div>
                </div>
              )}
            </div>

            <button
              className="button button-quiet button-small"
              style={{ minHeight: "1.9rem", padding: ".25rem .45rem", color: "var(--danger)" }}
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
              title="Sign out of casebook"
              data-testid="sidebar-logout"
            >
              <LogOut size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <div className="mobile-bar">
          <Logo />
          <Link href="/cases" aria-label="Open cases" data-testid="link-mobile-cases">
            <Menu size={21} aria-hidden="true" />
          </Link>
        </div>
        {isOffline && (
          <div className="offline-banner" role="status">
            <WifiOff size={16} aria-hidden="true" /> You are currently offline. Connect to open or update private cases.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

// ============================================================================
// 1. HOME SCREEN
// ============================================================================
function Home() {
  return (
    <>
      <PublicHeader />
      <main className="public-main">
        <section className="hero">
          <div>
            <span className="eyebrow">A private return casebook</span>
            <h1>Keep what they promised.</h1>
            <p className="hero-copy">
              Still Owed helps you preserve support commitments when an online-shopping return becomes a repeated
              dispute. See what was said, when it changed, and what you can calmly ask next.
            </p>

            {/* Quick Access & Sign In Card */}
            <div
              className="hero-auth-card"
              style={{
                marginTop: "1.75rem",
                padding: "1.5rem",
                background: "var(--white)",
                border: "1px solid var(--line)",
                boxShadow: "6px 6px 0 var(--paper-deep)",
                borderRadius: "var(--radius)",
                maxWidth: "520px",
              }}
            >
              <span className="eyebrow" style={{ display: "block", marginBottom: ".4rem" }}>
                Instant Access · No passwords
              </span>
              <div style={{ display: "grid", gap: ".65rem" }}>
                <button
                  className="button button-primary"
                  onClick={() => signInWithGoogle()}
                  data-testid="hero-google-signin"
                  style={{ width: "100%", justifyContent: "center", gap: ".6rem" }}
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".65rem" }}>
                  <Link
                    href="/sign-in"
                    className="button button-secondary button-small"
                    style={{ justifyContent: "center" }}
                    data-testid="hero-start-onboarding"
                  >
                    Sign In / Guided Tour <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/cases"
                    className="button button-quiet button-small"
                    style={{ justifyContent: "center" }}
                    data-testid="hero-open-cases"
                  >
                    Open Desk / Demo
                  </Link>
                </div>
              </div>
              <div className="notice" style={{ marginTop: ".9rem", fontSize: ".82rem", padding: ".55rem .8rem" }}>
                <Shield size={14} aria-hidden="true" />
                <span>Private row-level storage & Amazon Textract OCR. Free & confidential.</span>
              </div>
            </div>
          </div>

          <div>
            <span className="fiction-label">
              <span aria-hidden="true">◆</span> Clearly fictional · Demo Store
            </span>
            <div className="promise-paper" aria-label="Demo Store source-linked promise example">
              <div className="eyebrow">Promise · 12 Sep 2026</div>
              <blockquote>“We will issue the refund within 48 hours after warehouse receipt.”</blockquote>
              <div className="paper-rule" />
              <div className="paper-meta">
                <span>Source 01 · Support Chat</span>
                <span>Saved, not sent</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Marquee Ticker Strip: Major Indian Online Marketplaces */}
      <div className="marquee-container" aria-label="Supported Indian marketplaces">
        <div className="marquee-content">
          {[
            "Amazon India",
            "Flipkart",
            "Myntra",
            "Meesho",
            "Tata CliQ",
            "Ajio",
            "Croma",
            "Nykaa",
            "Reliance Digital",
            "Demo Store",
            "Amazon India",
            "Flipkart",
            "Myntra",
            "Meesho",
            "Tata CliQ",
            "Ajio",
          ].map((m, idx) => (
            <span key={idx} className="marquee-item">
              <span style={{ color: "var(--saffron)" }}>◆</span> {m}
            </span>
          ))}
        </div>
      </div>

      <main className="public-main">
        {/* Bento Grid Showcase */}
        <section className="section">
          <div className="section-heading">
            <span className="eyebrow">The Casebook Advantage</span>
            <h2>Evidence that preserves every promise.</h2>
            <p>
              Designed for the exhausting reality of disputed online returns. The evidence stays connected to what they
              committed.
            </p>
          </div>

          <div className="bento-grid">
            {/* Bento 1: Scanner simulation */}
            <div className="bento-card col-8">
              <div>
                <span className="eyebrow">Amazon Textract Integration</span>
                <h3>Interactive Coordinate OCR</h3>
                <p>
                  Uploaded screenshots are converted into selectable lines linked to their image coordinates. Hover or tap
                  any line to inspect the exact commitment.
                </p>
              </div>
              <div className="scanner-frame">
                <div className="scanner-beam" />
                <div
                  style={{
                    padding: "1.2rem 1.4rem",
                    width: "88%",
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    position: "relative",
                  }}
                >
                  <div style={{ fontSize: ".72rem", color: "var(--ink-soft)", marginBottom: ".25rem", letterSpacing: ".08em" }}>
                    SUPPORT AGENT CHAT · 12 SEP
                  </div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      border: "2px dashed var(--saffron)",
                      padding: ".35rem .6rem",
                      background: "rgba(201, 140, 54, 0.15)",
                    }}
                  >
                    “We will issue the refund within 48 hours after warehouse receipt.”
                  </div>
                  <div style={{ marginTop: ".5rem", fontSize: ".75rem", color: "var(--green)", fontWeight: 600 }}>
                    ✓ 99.4% OCR confidence • Spatial geometry mapped
                  </div>
                </div>
              </div>
            </div>

            {/* Bento 2: Conditional Timeline */}
            <div className="bento-card col-4">
              <div>
                <span className="eyebrow">Condition Logic</span>
                <h3>No False Countdowns</h3>
                <p>
                  Still Owed never invents an overdue deadline when waiting on warehouse receipt. It tracks the missing
                  trigger event explicitly.
                </p>
              </div>
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1.1rem",
                  background: "var(--paper-deep)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div style={{ fontSize: ".8rem", color: "var(--danger)", textDecoration: "line-through", marginBottom: ".4rem" }}>
                  Overdue since 14 Sep
                </div>
                <div style={{ fontSize: ".92rem", fontWeight: 600, color: "var(--blue)" }}>
                  Waiting for warehouse receipt confirmation
                </div>
              </div>
            </div>

            {/* Bento 3: Preserved Revisions */}
            <div className="bento-card col-6">
              <div>
                <span className="eyebrow">Revision Graph</span>
                <h3>Later Words Don't Erase History</h3>
                <p>
                  When support moves the goalpost from 48 hours to 5 working days, both commitments remain visible with an
                  explicit connector.
                </p>
              </div>
              <div style={{ marginTop: "1.5rem", display: "grid", gap: ".65rem" }}>
                <div
                  style={{
                    padding: ".85rem",
                    background: "var(--paper-deep)",
                    border: "1px solid var(--line)",
                    fontSize: ".9rem",
                  }}
                >
                  <strong>12 Sep:</strong> “Within 48 hours after warehouse receipt”
                </div>
                <div
                  style={{
                    padding: ".65rem .85rem",
                    background: "var(--saffron-pale)",
                    borderLeft: "3px solid var(--saffron)",
                    fontSize: ".85rem",
                  }}
                >
                  ↳ Changed timeframe: “Allow 5 working days” (15 Sep)
                </div>
              </div>
            </div>

            {/* Bento 4: Case Packet PDF */}
            <div className="bento-card col-6">
              <div>
                <span className="eyebrow">Printable Chronology</span>
                <h3>Court-Ready Case Packet</h3>
                <p>
                  One-click browser print or Save as PDF formats a clean, black-on-white document with source references,
                  generation timestamps, and SHA-256 hashes.
                </p>
              </div>
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1.1rem",
                  background: "#ffffff",
                  border: "1px solid var(--line-dark)",
                  fontFamily: "var(--font-serif)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div style={{ fontSize: "1.15rem", fontWeight: 600 }}>Case Packet · Still Owed</div>
                <div style={{ fontSize: ".82rem", color: "#555" }}>Demo Store · ₹4,800 · Prepared, not sent.</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <Link href="/sign-in" className="button button-primary" data-testid="button-section-start">
              Get Started with Guided Tour <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="eyebrow">Quiet by design</span>
            <h2>No predictions. No pressure. Just a better desk.</h2>
            <p>
              Built for adults in India handling the slow, tiring part of an online-shopping return: repeating what
              happened while the explanations keep moving.
            </p>
          </div>
          <div className="action-row">
            <Link href="/privacy" className="button button-quiet" data-testid="link-home-privacy">
              Read the privacy note
            </Link>
            <Link href="/offline" className="button button-quiet" data-testid="link-home-offline">
              How offline storage works
            </Link>
          </div>
        </section>
        <PublicFooter />
      </main>
    </>
  );
}

// ============================================================================
// 2. GUIDED ONBOARDING FLOW
// ============================================================================
function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [store, setStore] = useState("Demo Store");
  const [item, setItem] = useState("Noise-Cancelling Headphones");
  const [amount, setAmount] = useState("4800");
  const [orderRef, setOrderRef] = useState("DEMO-104");
  const [adultAttested, setAdultAttested] = useState(true);
  const [creating, setCreating] = useState(false);

  async function handleFinish() {
    setCreating(true);
    try {
      const parsedAmount = amount.trim() ? Math.round(parseFloat(amount.replace(/[^0-9.]/g, "")) * 100) : undefined;
      const created = await api.createCase({
        merchantLabel: store.trim() || "Demo Store",
        itemLabel: item.trim() || "Returned Purchase",
        orderReference: orderRef.trim() || undefined,
        requestedAmountPaise: parsedAmount,
      });
      setLocation(`/cases/${created.id}`);
    } catch {
      setLocation("/cases");
    }
  }

  return (
    <>
      <PublicHeader />
      <main className="public-main" style={{ maxWidth: "800px", padding: "3rem 1.5rem 6rem" }}>
        <div className="onboarding-stepper" style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { num: 1, label: "Identity & Consent" },
            { num: 2, label: "Your Return" },
            { num: 3, label: "Evidence & OCR" },
          ].map((s) => (
            <div
              key={s.num}
              style={{
                flex: 1,
                padding: ".75rem 1rem",
                background: step === s.num ? "var(--blue)" : step > s.num ? "var(--green)" : "var(--paper-deep)",
                color: step === s.num || step > s.num ? "var(--white)" : "var(--ink-soft)",
                borderRadius: "var(--radius)",
                fontSize: ".88rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
              }}
            >
              <span
                style={{
                  width: "1.4rem",
                  height: "1.4rem",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: ".75rem",
                }}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <section className="login-card" style={{ maxWidth: "100%", margin: 0 }}>
            <span className="eyebrow">Step 1 of 3 · Identity & Privacy</span>
            <h1 style={{ fontSize: "2.4rem", margin: ".5rem 0 1rem" }}>Welcome to Still Owed.</h1>
            <p className="hero-copy" style={{ fontSize: "1.05rem" }}>
              Still Owed gives you a private casebook to organize support commitments for disputed online returns.
              Before we begin, confirm your identity and read our privacy commitment.
            </p>

            <div className="form-grid" style={{ marginTop: "1.5rem" }}>
              <div className="notice">
                <Shield size={18} aria-hidden="true" />
                <div>
                  <strong>Row-Level Privacy:</strong> Your screenshots and promises are encrypted and accessible only by
                  you. Reading uses Amazon Textract for optical character recognition only.
                </div>
              </div>

              <label className="checkbox-row" style={{ marginTop: ".5rem" }}>
                <input
                  type="checkbox"
                  checked={adultAttested}
                  onChange={(e) => setAdultAttested(e.target.checked)}
                  data-testid="checkbox-onboarding-adult"
                />
                <span>I confirm I am an adult (18+) managing an online shopping return dispute.</span>
              </label>

              <div className="action-row" style={{ marginTop: "1.2rem" }}>
                <button
                  className="button button-primary"
                  onClick={() => signInWithGoogle()}
                  disabled={!adultAttested}
                  data-testid="onboarding-google-signin"
                >
                  <GoogleIcon />
                  <span>Sign in with Google</span>
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => setStep(2)}
                  disabled={!adultAttested}
                  data-testid="onboarding-step1-next"
                >
                  Continue to Return Details <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="login-card" style={{ maxWidth: "100%", margin: 0 }}>
            <span className="eyebrow">Step 2 of 3 · Your Return</span>
            <h1 style={{ fontSize: "2.4rem", margin: ".5rem 0 1rem" }}>What return is stuck?</h1>
            <p className="hero-copy" style={{ fontSize: "1.05rem" }}>
              Enter the merchant and item details, or click below to use the fictional Demo Store example.
            </p>

            <div className="action-row" style={{ marginBottom: "1.5rem" }}>
              <button
                className="button button-quiet button-small"
                onClick={() => {
                  setStore("Demo Store");
                  setItem("Noise-Cancelling Headphones");
                  setAmount("4800");
                  setOrderRef("DEMO-104");
                }}
                data-testid="onboarding-prefill-demo"
              >
                Pre-fill with Demo Store example (₹4,800)
              </button>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="ob-store">Store or Marketplace name *</label>
                <input
                  id="ob-store"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  placeholder="e.g. Amazon, Flipkart, Demo Store"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="ob-item">What item did you return? *</label>
                <input
                  id="ob-item"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="e.g. Noise-Cancelling Headphones"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="ob-amount">Amount requested (₹)</label>
                <input
                  id="ob-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 4800"
                />
              </div>
              <div className="field">
                <label htmlFor="ob-ref">Order reference (optional)</label>
                <input
                  id="ob-ref"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  placeholder="e.g. DEMO-104"
                />
              </div>

              <div className="action-row" style={{ marginTop: "1.5rem" }}>
                <button
                  className="button button-primary"
                  onClick={() => setStep(3)}
                  disabled={!store.trim() || !item.trim()}
                  data-testid="onboarding-step2-next"
                >
                  Next: See Evidence & OCR <ArrowRight size={16} aria-hidden="true" />
                </button>
                <button className="button button-quiet" onClick={() => setStep(1)}>
                  Back
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="login-card" style={{ maxWidth: "100%", margin: 0 }}>
            <span className="eyebrow">Step 3 of 3 · Evidence & Amazon Textract OCR</span>
            <h1 style={{ fontSize: "2.4rem", margin: ".5rem 0 1rem" }}>How commitments are verified.</h1>
            <p className="hero-copy" style={{ fontSize: "1.05rem" }}>
              When you upload a support screenshot, Amazon Textract reads text lines with exact spatial coordinates.
              You select the promise, and Still Owed tracks conditions instead of inventing false deadlines.
            </p>

            <div
              style={{
                padding: "1.5rem",
                background: "var(--paper-deep)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                margin: "1.5rem 0",
              }}
            >
              <div className="fiction-label" style={{ marginBottom: ".5rem" }}>
                Interactive Preview
              </div>
              <div style={{ background: "var(--white)", padding: "1.2rem", border: "1px solid var(--line)" }}>
                <span className="status-line">
                  <span className="status-dot" /> Extracted via Amazon Textract (99.4% confidence)
                </span>
                <blockquote style={{ margin: ".75rem 0", fontFamily: "var(--font-serif)", fontSize: "1.3rem" }}>
                  “We will issue the refund within 48 hours after warehouse receipt.”
                </blockquote>
                <div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    flexWrap: "wrap",
                    fontSize: ".82rem",
                    color: "var(--ink-soft)",
                  }}
                >
                  <span style={{ padding: ".2rem .5rem", background: "var(--blue-pale)", borderRadius: "2px" }}>
                    Condition: Warehouse receipt confirmation
                  </span>
                  <span style={{ padding: ".2rem .5rem", background: "var(--saffron-pale)", borderRadius: "2px" }}>
                    Window: 48 hours
                  </span>
                </div>
              </div>
            </div>

            <div className="action-row" style={{ marginTop: "2rem" }}>
              <button
                className="button button-primary"
                onClick={handleFinish}
                disabled={creating}
                data-testid="onboarding-finish"
              >
                {creating ? "Creating case..." : "Launch my casebook now"} <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button className="button button-quiet" onClick={() => setStep(2)}>
                Back
              </button>
            </div>
          </section>
        )}
      </main>
      <PublicFooter />
    </>
  );
}

// ============================================================================
// 3. SIGN IN SCREEN
// ============================================================================
function SignIn() {
  const [, setLocation] = useLocation();
  const [adultAttested, setAdultAttested] = useState(true);

  return (
    <>
      <PublicHeader />
      <main className="public-main">
        <section className="login-card">
          <span className="eyebrow">Private access</span>
          <h1>Keep your desk private.</h1>
          <p className="hero-copy">
            Still Owed stores your return cases securely with row-level ownership. Sign in with Google to preserve your
            cases across all devices.
          </p>
          <div className="form-grid" style={{ marginTop: "2rem" }}>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={adultAttested}
                onChange={(e) => setAdultAttested(e.target.checked)}
                data-testid="checkbox-adult"
              />
              <span>I confirm I am an adult (18+) managing an online-shopping return dispute.</span>
            </label>
            <div style={{ display: "grid", gap: ".75rem", marginTop: ".5rem" }}>
              <button
                className="button button-primary"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch {
                    setLocation("/onboarding");
                  }
                }}
                disabled={!adultAttested}
                data-testid="button-google-sign-in"
                style={{ justifyContent: "center", gap: ".6rem" }}
              >
                <GoogleIcon />
                <span>Sign in with Google</span>
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
                <button
                  className="button button-secondary button-small"
                  onClick={() => setLocation("/onboarding")}
                  disabled={!adultAttested}
                  data-testid="button-demo-sign-in"
                  style={{ justifyContent: "center" }}
                >
                  Continue to Onboarding
                </button>
                <Link
                  href="/cases"
                  className="button button-quiet button-small"
                  style={{ justifyContent: "center" }}
                  data-testid="button-skip-to-cases"
                >
                  Skip to Cases Desk
                </Link>
              </div>
            </div>
          </div>
          <p className="hint" style={{ marginTop: "1.4rem" }}>
            Privacy first: reading uses Amazon Textract for optical character recognition only. No generative AI
            evaluates your claims.
          </p>
        </section>
      </main>
    </>
  );
}

// ============================================================================
// 3. CASES LIST SCREEN
// ============================================================================
function CasesPage() {
  const [, setLocation] = useLocation();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [closedCases, setClosedCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "closed">("all");

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listCases();
      setCases(data.active);
      setClosedCases(data.closed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load cases");
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedDemo() {
    setSeeding(true);
    setError(null);
    try {
      const res = await api.seedDemoCase();
      await loadCases();
      setLocation(`/cases/${res.caseId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load demo case");
    } finally {
      setSeeding(false);
    }
  }

  const matchesSearch = (c: CaseItem) =>
    !searchQuery.trim() ||
    c.merchantLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.itemLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.orderReference && c.orderReference.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayActive = cases.filter(matchesSearch);
  const displayClosed = closedCases.filter(matchesSearch);
  const totalCount = cases.length + closedCases.length;

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-top">
          <div>
            <span className="eyebrow">Your desk</span>
            <h1>Cases</h1>
            <p>One clear record for each return conversation. Nothing here is a legal verdict.</p>
          </div>
          <div className="action-row">
            <button
              className="button button-secondary"
              onClick={handleSeedDemo}
              disabled={seeding}
              data-testid="button-load-demo-top"
            >
              <Sparkles size={16} aria-hidden="true" />
              <span>{seeding ? "Loading demo..." : "Load Demo Store Case (₹4,800)"}</span>
            </button>
            <Link href="/cases/new" className="button button-primary" data-testid="button-new-case">
              <Plus size={17} aria-hidden="true" /> New case
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-box" role="alert">
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </div>
        )}

        {/* Filter Tabs & Search Bar */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "1.5rem 0 2rem",
            paddingBottom: "1.2rem",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", gap: ".45rem" }}>
            <button
              className={`button button-small ${filterTab === "all" ? "button-primary" : "button-quiet"}`}
              onClick={() => setFilterTab("all")}
              data-testid="tab-all-cases"
            >
              All ({totalCount})
            </button>
            <button
              className={`button button-small ${filterTab === "active" ? "button-primary" : "button-quiet"}`}
              onClick={() => setFilterTab("active")}
              data-testid="tab-active-cases"
            >
              Active ({cases.length})
            </button>
            <button
              className={`button button-small ${filterTab === "closed" ? "button-primary" : "button-quiet"}`}
              onClick={() => setFilterTab("closed")}
              data-testid="tab-closed-cases"
            >
              Closed ({closedCases.length})
            </button>
          </div>

          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: ".85rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--ink-soft)",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store or item..."
              style={{
                paddingLeft: "2.3rem",
                height: "2.4rem",
                fontSize: ".9rem",
                background: "var(--white)",
                border: "1px solid var(--line-dark)",
                borderRadius: "var(--radius)",
                width: "100%",
              }}
              data-testid="input-search-cases"
            />
          </div>
        </div>

        {loading && <p className="hint">Loading your desk...</p>}

        {!loading && (filterTab === "all" || filterTab === "active") && displayActive.length > 0 && (
          <>
            <div className="section-label">
              <h2>Open Returns</h2>
              <span className="status-line">
                <span className="status-dot" /> {displayActive.length} active
              </span>
            </div>
            <div className="case-list">
              {displayActive.map((c) => (
                <CaseCard key={c.id} item={c} />
              ))}
            </div>
          </>
        )}

        {!loading && (filterTab === "all" || filterTab === "closed") && displayClosed.length > 0 && (
          <>
            <div className="section-label" style={{ marginTop: "2.5rem" }}>
              <h2>Closed Returns</h2>
              <span className="status-line">
                <span className="status-dot closed" /> {displayClosed.length} closed
              </span>
            </div>
            <div className="case-list">
              {displayClosed.map((c) => (
                <CaseCard key={c.id} item={c} />
              ))}
            </div>
          </>
        )}

        {!loading && totalCount === 0 && (
          <div className="empty-state">
            <h2>A clear desk, for now.</h2>
            <p>
              Start a case when a return becomes a repeated dispute, or load the fictional Demo Store return to explore
              the complete flow.
            </p>
            <div className="action-row" style={{ justifyContent: "center", gap: ".85rem" }}>
              <button
                className="button button-primary"
                onClick={handleSeedDemo}
                disabled={seeding}
                data-testid="button-empty-seed-demo"
              >
                <Sparkles size={16} aria-hidden="true" />
                <span>{seeding ? "Loading demo..." : "Load Fictional Demo Store Return (₹4,800)"}</span>
              </button>
              <Link href="/cases/new" className="button button-secondary" data-testid="button-empty-new-case">
                <Plus size={17} aria-hidden="true" /> Start new case
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CaseCard({ item }: { item: CaseItem }) {
  const isClosed = item.lifecycle !== "active";
  return (
    <Link
      href={`/cases/${item.id}`}
      className={`case-card ${isClosed ? "closed" : ""}`}
      data-testid={`card-case-${item.id}`}
    >
      <span className="case-stripe" aria-hidden="true" />
      <span>
        <span className="status-line">
          <span className={`status-dot ${isClosed ? "closed" : ""}`} />{" "}
          {isClosed ? "Closed" : "Active"}
          {item.merchantLabel === "Demo Store" ? " · Fictional demo" : ""}
        </span>
        <h2>{item.merchantLabel}</h2>
        <p>
          {item.itemLabel} · {formatPaise(item.requestedAmountPaise)}
        </p>
        <p className="hint">Last updated {formatDate(item.updatedAt)}</p>
      </span>
      <ChevronRight className="case-arrow" size={19} aria-hidden="true" />
    </Link>
  );
}

// ============================================================================
// 4. NEW CASE SCREEN
// ============================================================================
function NewCase() {
  const [, setLocation] = useLocation();
  const [store, setStore] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!store.trim() || !item.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const parsedAmount = amount.trim() ? Math.round(parseFloat(amount.replace(/[^0-9.]/g, "")) * 100) : undefined;
      const created = await api.createCase({
        merchantLabel: store.trim(),
        itemLabel: item.trim(),
        orderReference: orderRef.trim() || undefined,
        requestedAmountPaise: parsedAmount && !isNaN(parsedAmount) ? parsedAmount : undefined,
      });
      setLocation(`/cases/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create case");
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-top">
          <div>
            <span className="eyebrow">New record</span>
            <h1>Start a case.</h1>
            <p>Write down the basics without trying to solve the whole dispute yet.</p>
          </div>
        </div>

        {error && (
          <div className="error-box" role="alert">
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="store">Store or marketplace name *</label>
            <input
              id="store"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Example: Demo Store"
              data-testid="input-store"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="item">What did you return? *</label>
            <input
              id="item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Example: Noise-Cancelling Headphones"
              data-testid="input-item"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="amount">Amount requested (₹)</label>
            <input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Example: 4800"
              data-testid="input-amount"
            />
          </div>
          <div className="field">
            <label htmlFor="orderRef">Order reference or tracking ID (optional)</label>
            <input
              id="orderRef"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="Example: DEMO-104"
              data-testid="input-order-ref"
            />
          </div>
          <div className="action-row" style={{ marginTop: "1rem" }}>
            <button
              className="button button-primary"
              onClick={handleSave}
              disabled={saving || !store.trim() || !item.trim()}
              data-testid="button-save-case"
            >
              {saving ? "Saving..." : "Start case"} <ArrowRight size={17} aria-hidden="true" />
            </button>
            <Link href="/cases" className="button button-quiet">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ============================================================================
// 5. CASE DETAIL SCREEN
// ============================================================================
function CaseDetail() {
  const params = useParams<{ caseId: string }>();
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [newUpdate, setNewUpdate] = useState("");
  const [isLaterChange, setIsLaterChange] = useState(false);
  const [selectedEarlierRecordId, setSelectedEarlierRecordId] = useState("");
  const [outcomeKind, setOutcomeKind] = useState("full_refund");
  const [outcomeNote, setOutcomeNote] = useState("");
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    if (params.caseId) loadCaseDetail(params.caseId);
  }, [params.caseId]);

  async function loadCaseDetail(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCase(id);
      setData(res);
      if (res.records.length > 0) {
        setSelectedEarlierRecordId(res.records[0]!.id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load case");
    } finally {
      setLoading(false);
    }
  }

  async function copyFollowup() {
    if (!data) return;
    const latestPromise = data.records.find((r) => r.kind === "promise");
    const text = `Hello, I am following up on my return for ${data.case.itemLabel} (${data.case.merchantLabel}). Order reference: ${data.case.orderReference || "Not provided"}. Amount requested: ${formatPaise(data.case.requestedAmountPaise)}. Support commitment recorded: "${latestPromise?.verbatimText || "Pending review"}". Please confirm the status and expected timeline.`;
    try {
      await navigator.clipboard.writeText(text);
      setToast("Follow-up copied to clipboard. Prepared, not sent.");
    } catch {
      setToast("Follow-up prepared. Copy the text from the box below.");
    }
    setTimeout(() => setToast(""), 3500);
  }

  async function addUpdate() {
    if (!data || !newUpdate.trim()) return;
    try {
      const res = await api.confirmRecord(data.case.id, {
        kind: "statement",
        verbatimText: newUpdate.trim(),
        authorType: "user",
        reportedAt: new Date().toISOString(),
        precision: "exact",
      });

      if (isLaterChange && selectedEarlierRecordId) {
        await api.linkRecords(data.case.id, {
          earlierRecordId: selectedEarlierRecordId,
          laterRecordId: res.record.id,
          relation: "changed_date",
        });
      }

      setNewUpdate("");
      setIsLaterChange(false);
      setToast("Update added to the case history.");
      setTimeout(() => setToast(""), 2500);
      loadCaseDetail(data.case.id);
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "Failed to add update");
    }
  }

  async function recordOutcome() {
    if (!data) return;
    try {
      await api.recordOutcome(data.case.id, {
        kind: outcomeKind,
        note: outcomeNote.trim() || undefined,
      });
      setShowOutcomeForm(false);
      loadCaseDetail(data.case.id);
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "Failed to record outcome");
    }
  }

  async function handleDeleteConfirm() {
    if (!data) return;
    setIsDeleting(true);
    try {
      await api.deleteCase(data.case.id);
      setShowDeleteConfirm(false);
      setLocation("/cases");
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "Failed to delete case");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="page-wrap">
          <p className="hint">Loading case details...</p>
        </div>
      </AppShell>
    );
  }

  if (!data || error) {
    return (
      <AppShell>
        <div className="page-wrap">
          <div className="empty-state">
            <h2>Case not found</h2>
            <p>{error || "This case may have been removed or belongs to another user."}</p>
            <Link href="/cases" className="button button-primary">
              Return to cases
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const isClosed = data.case.lifecycle !== "active";
  const promises = data.records.filter((r) => r.kind === "promise");

  // Determine current key unresolved state
  let currentStateNotice = "Case opened; waiting for source review";
  if (promises.length > 0) {
    const latestP = promises[promises.length - 1];
    if (latestP?.promise?.conditionLabel) {
      currentStateNotice = `Waiting for ${latestP.promise.conditionLabel.toLowerCase()}. Support's stated window starts after that.`;
    } else {
      currentStateNotice = `Commitment: ${latestP?.verbatimText}`;
    }
  }

  return (
    <AppShell>
      <div className="page-wrap">
        {toast && (
          <div className="toast-banner" role="status">
            <Check size={16} aria-hidden="true" /> {toast}
          </div>
        )}

        <div className="case-overview">
          <div>
            <span className="eyebrow">
              {data.case.merchantLabel === "Demo Store" ? "Clearly fictional · Demo Store" : "Private case record"}
            </span>
            <h1>{data.case.merchantLabel}</h1>
            <p className="case-meta">
              {data.case.itemLabel} · Amount: {formatPaise(data.case.requestedAmountPaise)} · Opened{" "}
              {formatDate(data.case.createdAt)}
            </p>
          </div>
          <div className="action-row no-print">
            <Link href={`/cases/${data.case.id}/export`} className="button button-secondary button-small" data-testid="button-export-case">
              <Printer size={15} aria-hidden="true" /> Export packet
            </Link>
            {!isClosed ? (
              <button
                className="button button-quiet button-small"
                onClick={() => setShowOutcomeForm(true)}
                data-testid="button-record-outcome"
              >
                Record outcome
              </button>
            ) : (
              <button
                className="button button-quiet button-small"
                onClick={async () => {
                  await api.createCase({
                    merchantLabel: data.case.merchantLabel,
                    itemLabel: data.case.itemLabel,
                  });
                  loadCaseDetail(data.case.id);
                }}
              >
                Reopen
              </button>
            )}
            <button
              className="button button-danger button-small"
              onClick={() => setShowDeleteConfirm(true)}
              data-testid="button-delete-case"
            >
              <Trash2 size={15} aria-hidden="true" /> Delete
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title={`Delete case "${data.case.merchantLabel}"?`}
          description="This will immediately remove access to this case and schedule its uploaded screenshots and notes for permanent deletion. Downloaded exports remain on your device."
          confirmLabel="Permanently delete case"
          cancelLabel="Keep case"
          isDestructive
          loading={isDeleting}
          onConfirm={handleDeleteConfirm}
        />

        {showOutcomeForm && (
          <section className="login-card no-print" style={{ margin: "1.5rem 0", maxWidth: "100%" }}>
            <span className="eyebrow">Resolution</span>
            <h2>What happened?</h2>
            <div className="form-grid" style={{ marginTop: "1rem" }}>
              <div className="field">
                <label htmlFor="outcomeKind">Resolution outcome</label>
                <select
                  id="outcomeKind"
                  value={outcomeKind}
                  onChange={(e) => setOutcomeKind(e.target.value)}
                >
                  <option value="full_refund">Full refund received</option>
                  <option value="partial_refund">Partial refund received</option>
                  <option value="replacement_received">Replacement received</option>
                  <option value="closed_without_resolution">Closed without resolution</option>
                  <option value="withdrawn">Withdrawn by user</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="outcomeNote">Notes / reference (optional)</label>
                <input
                  id="outcomeNote"
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                  placeholder="e.g. Refund credited to original payment method"
                />
              </div>
              <div className="action-row">
                <button className="button button-primary button-small" onClick={recordOutcome}>
                  Confirm outcome
                </button>
                <button className="button button-quiet button-small" onClick={() => setShowOutcomeForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="dossier">
          <div className="main-column">
            <section className="question-box">
              <span className="eyebrow">Current status</span>
              <h2>{currentStateNotice}</h2>
            </section>

            <div className="section-label">
              <h2>Promise history</h2>
              <Link
                href={`/cases/${data.case.id}/sources/new`}
                className="button button-primary button-small no-print"
                data-testid="button-add-source"
              >
                <Plus size={15} aria-hidden="true" /> Add source
              </Link>
            </div>

            {promises.length > 0 ? (
              <div className="history">
                {promises.map((p, index) => (
                  <div className="history-item" key={p.id}>
                    <div className="date-rail">{formatDate(p.reportedAt)}</div>
                    <div className="promise-entry">
                      <blockquote>“{p.verbatimText}”</blockquote>
                      {p.sourceId && (
                        <Link
                          href={`/cases/${data.case.id}/review/${p.sourceId}`}
                          className="source-ref"
                          data-testid={`link-promise-source-${p.id}`}
                        >
                          <FileText size={14} aria-hidden="true" /> Source {index + 1} ·{" "}
                          {p.promise?.conditionLabel ? `Condition: ${p.promise.conditionLabel}` : "Reviewed commitment"}
                        </Link>
                      )}
                      {index > 0 && (
                        <div className="later-change">
                          Later wording. It joins the history without erasing earlier commitments.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h2>No promises confirmed yet.</h2>
                <p>Add a screenshot or support note, select the commitment, and save it as a promise.</p>
              </div>
            )}

            <div className="section-label">
              <h2>Sources & Evidence</h2>
            </div>
            {data.sources.length > 0 ? (
              <div className="source-list">
                {data.sources.map((source, idx) => (
                  <div className="source-card" key={source.id} data-testid={`source-card-${source.id}`}>
                    <div>
                      <h3>
                        Source {idx + 1} · {source.originalFilename || (source.kind === "image" ? "Screenshot" : "Note")}
                      </h3>
                      <p>
                        {source.kind === "image"
                          ? `Screenshot image · State: ${source.extractionState === "ready" ? "Text extracted" : "Uploaded"}`
                          : source.noteText}
                      </p>
                    </div>
                    <Link
                      href={`/cases/${data.case.id}/review/${source.id}`}
                      className="button button-secondary button-small"
                      data-testid={`button-review-${source.id}`}
                    >
                      Review source <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hint">No screenshots or support notes added yet.</p>
            )}

            <div className="section-label">
              <h2>Updates & Notes</h2>
            </div>
            {data.records
              .filter((r) => r.kind === "statement")
              .map((u) => (
                <div className="source-card" key={u.id} style={{ marginBottom: ".75rem" }}>
                  <div>
                    <h3>{formatDate(u.reportedAt)}</h3>
                    <p>{u.verbatimText}</p>
                  </div>
                </div>
              ))}

            <div className="form-grid no-print" style={{ marginTop: "1.5rem" }}>
              <div className="field">
                <label htmlFor="newUpdate">Record a new update</label>
                <textarea
                  id="newUpdate"
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="What did support say in your latest follow-up?"
                  data-testid="input-add-update"
                />
              </div>
              {promises.length > 0 && (
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={isLaterChange}
                    onChange={(e) => setIsLaterChange(e.target.checked)}
                    data-testid="checkbox-later-change"
                  />
                  <span>Connect this update as a later change to an earlier promise.</span>
                </label>
              )}
              <button
                className="button button-secondary button-small"
                onClick={addUpdate}
                disabled={!newUpdate.trim()}
                data-testid="button-add-update"
              >
                <Plus size={15} aria-hidden="true" /> Add update
              </button>
            </div>
          </div>

          <aside className="sidebar-card no-print">
            <h2>Next, if useful</h2>
            <p>Keep the language factual. Still Owed does not send messages on your behalf.</p>
            <div className="notice" style={{ marginBottom: "1rem" }}>
              <strong>Status:</strong> {currentStateNotice}
            </div>
            <button className="button button-primary" onClick={copyFollowup} data-testid="button-copy-followup">
              <Clipboard size={15} aria-hidden="true" /> Copy factual follow-up
            </button>
            <div className="followup" style={{ marginTop: "1rem" }}>
              Prepared, not sent.
              <p>
                Hello, I am following up on my return for {data.case.itemLabel}. Order:{" "}
                {data.case.orderReference || "DEMO-104"}. Amount: {formatPaise(data.case.requestedAmountPaise)}. Please
                confirm status.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

// ============================================================================
// 6. NEW SOURCE SCREEN
// ============================================================================
function NewSource() {
  const params = useParams<{ caseId: string }>();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"image" | "note">("image");
  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 3 * 1024 * 1024) {
      setError("File exceeds 3 MiB limit. Please choose a smaller image.");
      return;
    }
    setFile(selected);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleSave() {
    if (!params.caseId) return;
    setUploading(true);
    setError(null);

    try {
      // 1. Reserve slot
      const slot = await api.reserveUploadSlot(params.caseId, {
        kind: mode,
        originalFilename: file?.name || (title.trim() ? `${title.trim()}.txt` : undefined),
        mime: file?.type || (mode === "note" ? "text/plain" : "image/png"),
        noteText: mode === "note" ? noteText.trim() : undefined,
      });

      // 2. Upload content
      if (mode === "image" && preview) {
        await api.uploadSourceData(slot.source.id, {
          dataUrl: preview,
          originalFilename: file?.name,
          mime: file?.type,
        });

        // 3. Trigger OCR
        try {
          await api.triggerOcr(slot.source.id);
        } catch (ocrErr: unknown) {
          // OCR error does not fail upload; manual review remains available
        }
      }

      setLocation(`/cases/${params.caseId}/review/${slot.source.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add source");
      setUploading(false);
    }
  }

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-top">
          <div>
            <span className="eyebrow">Add source</span>
            <h1>Keep the original nearby.</h1>
            <p>Upload a support chat screenshot or write a manual note. Evidence remains private to this case.</p>
          </div>
        </div>

        {error && (
          <div className="error-box" role="alert">
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </div>
        )}

        <div className="review-grid">
          <div className="form-grid">
            <div className="action-row">
              <button
                className={`button ${mode === "image" ? "button-primary" : "button-quiet"}`}
                onClick={() => setMode("image")}
                data-testid="button-mode-image"
              >
                <FileImage size={16} aria-hidden="true" /> Upload screenshot
              </button>
              <button
                className={`button ${mode === "note" ? "button-primary" : "button-quiet"}`}
                onClick={() => setMode("note")}
                data-testid="button-mode-note"
              >
                <FileText size={16} aria-hidden="true" /> Add note
              </button>
            </div>

            {mode === "image" ? (
              <>
                <div className="notice">
                  <Shield size={15} aria-hidden="true" /> Check this image before reading. Remove bank details, identity
                  cards, or unrelated chats first.
                </div>
                <div className="field">
                  <label htmlFor="source-file">Screenshot image (PNG/JPEG, max 3 MiB)</label>
                  <input
                    id="source-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileSelected}
                    data-testid="input-source-file"
                  />
                </div>
                {preview && (
                  <div className="preview-box">
                    <img src={preview} alt="Selected screenshot preview" style={{ maxWidth: "100%", maxHeight: "300px" }} />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="noteTitle">Source description / Channel</label>
                  <input
                    id="noteTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Example: Phone conversation with merchant support"
                  />
                </div>
                <div className="field">
                  <label htmlFor="noteContent">What did they say? (Verbatim note)</label>
                  <textarea
                    id="noteContent"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Record exactly what the support representative stated..."
                    data-testid="input-source-note"
                  />
                </div>
              </>
            )}

            <div className="action-row" style={{ marginTop: "1.5rem" }}>
              <button
                className="button button-primary"
                onClick={handleSave}
                disabled={uploading || (mode === "image" && !file) || (mode === "note" && !noteText.trim())}
                data-testid="button-save-source"
              >
                {uploading ? "Processing..." : "Save source & Review"} <ArrowRight size={16} aria-hidden="true" />
              </button>
              <Link href={`/cases/${params.caseId}`} className="button button-quiet">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ============================================================================
// 7. REVIEW SOURCE SCREEN (Signature Interaction: OCR Selection & Highlight)
// ============================================================================
function ReviewSource() {
  const params = useParams<{ caseId: string; sourceId: string }>();
  const [, setLocation] = useLocation();
  const [source, setSource] = useState<SourceItem | null>(null);
  const [lines, setLines] = useState<ExtractionLine[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [wording, setWording] = useState("");
  const [condition, setCondition] = useState("");
  const [windowText, setWindowText] = useState("");
  const [isRevision, setIsRevision] = useState(false);
  const [earlierRecords, setEarlierRecords] = useState<RecordItem[]>([]);
  const [selectedEarlierId, setSelectedEarlierId] = useState("");
  const [relation, setRelation] = useState<"changed_date" | "changed_explanation">("changed_date");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedDraftStatus, setSavedDraftStatus] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  useEffect(() => {
    if (params.caseId && params.sourceId) {
      loadReviewData(params.caseId, params.sourceId);
    }
  }, [params.caseId, params.sourceId]);

  async function loadReviewData(caseId: string, sourceId: string) {
    setLoading(true);
    try {
      const caseDetail = await api.getCase(caseId);
      const src = caseDetail.sources.find((s) => s.id === sourceId);
      if (src) setSource(src);
      setEarlierRecords(caseDetail.records.filter((r) => r.kind === "promise"));

      // Try fetching OCR extraction
      try {
        const ext = await api.getExtraction(sourceId);
        setLines(ext.lines);
        if (ext.lines.length > 0 && !wording) {
          // Default to the first high-confidence promise sentence if detected
          const candidate = ext.lines.find(
            (l) =>
              l.text.toLowerCase().includes("refund") ||
              l.text.toLowerCase().includes("hours") ||
              l.text.toLowerCase().includes("days"),
          );
          if (candidate) {
            setWording(candidate.text);
            const idx = ext.lines.indexOf(candidate);
            setSelectedIndices([idx]);
          } else {
            setWording(ext.lines.map((l) => l.text).join(" "));
          }
        }
      } catch {
        // Fallback: use note text or split lines
        if (src?.noteText) {
          const fallbackLines: ExtractionLine[] = src.noteText
            .split(/\r?\n/)
            .filter((l) => l.trim().length > 0)
            .map((t, idx) => ({ id: `line-${idx + 1}`, text: t.trim(), confidence: 99 }));
          setLines(fallbackLines);
          if (!wording) setWording(src.noteText);
        }
      }

      // Check for saved draft
      try {
        const draftRes = await api.getDraft(sourceId);
        if (draftRes.draft) {
          const f = draftRes.draft.formFields;
          if (typeof f.wording === "string") setWording(f.wording);
          if (typeof f.condition === "string") setCondition(f.condition);
          if (typeof f.windowText === "string") setWindowText(f.windowText);
        }
      } catch {
        // Ignore draft fetch errors
      }
    } catch (err: unknown) {
      // Error loading review
    } finally {
      setLoading(false);
    }
  }

  function toggleLine(idx: number) {
    let nextSelected: number[];
    if (selectedIndices.includes(idx)) {
      nextSelected = selectedIndices.filter((i) => i !== idx);
    } else {
      nextSelected = [...selectedIndices, idx];
    }
    setSelectedIndices(nextSelected);

    const selectedTexts = nextSelected.sort((a, b) => a - b).map((i) => lines[i]?.text || "");
    if (selectedTexts.length > 0) {
      setWording(selectedTexts.join(" "));
    }

    // Autosave draft
    if (params.sourceId) {
      api
        .saveDraft(params.sourceId, {
          selectedLineIds: nextSelected.map((i) => lines[i]?.id || String(i)),
          formFields: { wording: selectedTexts.join(" "), condition, windowText },
        })
        .then(() => {
          setSavedDraftStatus("Draft autosaved");
          setTimeout(() => setSavedDraftStatus(""), 2000);
        })
        .catch(() => {});
    }
  }

  async function handleConfirmPromise() {
    if (!params.caseId || !wording.trim()) return;
    setSaving(true);
    try {
      const res = await api.confirmRecord(params.caseId, {
        kind: "promise",
        sourceId: params.sourceId,
        selectedLineIds: selectedIndices.map((i) => lines[i]?.id || String(i)),
        verbatimText: wording.trim(),
        authorType: "support",
        reportedAt: source?.reportedSourceAt || new Date().toISOString(),
        precision: "day",
        promise: {
          actionKind: "refund",
          conditionLabel: condition.trim() || undefined,
          rawWindow: windowText.trim() || undefined,
          dateBasis: "calendar",
          userDisposition: condition.trim() ? "condition_unmet" : "pending",
        },
      });

      // Link to earlier record if revision
      if (isRevision && selectedEarlierId) {
        await api.linkRecords(params.caseId, {
          earlierRecordId: selectedEarlierId,
          laterRecordId: res.record.id,
          relation,
        });
      }

      setLocation(`/cases/${params.caseId}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to confirm promise");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="page-wrap">
          <p className="hint">Loading source and reading text...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-top">
          <div>
            <span className="eyebrow">Review source · {source?.originalFilename || "Screenshot"}</span>
            <h1>Choose the promise.</h1>
            <p>
              Select the exact support statement. A newer message joins earlier commitments without overwriting history.
            </p>
          </div>
          {savedDraftStatus && <span className="status-line">{savedDraftStatus}</span>}
        </div>

        {errorMsg && (
          <div className="error-box" role="alert">
            <AlertCircle size={16} aria-hidden="true" /> {errorMsg}
          </div>
        )}
        <div className="review-grid">
          {/* Left Column: Image with interactive Bounding Box Highlights */}
          <section>
            <div className="eyebrow">Original evidence</div>
            <div
              className="screenshot-viewer"
              style={{
                position: "relative",
                marginTop: ".75rem",
                border: "1px solid var(--line)",
                background: "var(--paper-deep)",
                minHeight: "260px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {source?.storagePath ? (
                <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
                  <img
                    src={`/api/sources/${source.id}/file`}
                    alt="Evidence screenshot"
                    style={{ display: "block", maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }}
                  />
                  {/* Bounding Box Overlay */}
                  {lines.map((line, idx) => {
                    const isSelected = selectedIndices.includes(idx);
                    if (!line.boundingBox) return null;
                    const { left, top, width, height } = line.boundingBox;
                    return (
                      <div
                        key={line.id}
                        onClick={() => toggleLine(idx)}
                        title={`Select: "${line.text}"`}
                        style={{
                          position: "absolute",
                          left: `${left * 100}%`,
                          top: `${top * 100}%`,
                          width: `${width * 100}%`,
                          height: `${height * 100}%`,
                          border: isSelected ? "2px solid #c98c36" : "1px dashed rgba(40, 91, 114, 0.4)",
                          backgroundColor: isSelected ? "rgba(201, 140, 54, 0.28)" : "transparent",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="notice" style={{ margin: "2rem" }}>
                  <FileText size={20} aria-hidden="true" />
                  <span>Manual text note — select the lines below to confirm the commitment.</span>
                </div>
              )}
            </div>

            <div className="eyebrow" style={{ marginTop: "1.5rem" }}>
              Accessible OCR Lines
            </div>
            <div className="line-picker" style={{ marginTop: ".5rem" }}>
              {lines.map((line, i) => (
                <label
                  className={`line-option ${selectedIndices.includes(i) ? "selected" : ""}`}
                  key={`${line.id}-${i}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIndices.includes(i)}
                    onChange={() => toggleLine(i)}
                    data-testid={`checkbox-source-line-${i}`}
                  />
                  <span>{line.text}</span>
                  <span className="confidence-pill">{Math.round(line.confidence)}%</span>
                </label>
              ))}
            </div>
          </section>

          {/* Right Column: Confirmed Promise Form */}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="wording">Verbatim promise wording *</label>
              <textarea
                id="wording"
                value={wording}
                onChange={(e) => setWording(e.target.value)}
                placeholder="Select lines on the left or type exact support statement"
                data-testid="input-promise-wording"
                rows={3}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="condition">Condition (e.g. After warehouse receipt)</label>
              <input
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="What event must occur before the refund starts?"
                data-testid="input-promise-condition"
              />
            </div>

            <div className="field">
              <label htmlFor="windowText">Stated duration / time window</label>
              <input
                id="windowText"
                value={windowText}
                onChange={(e) => setWindowText(e.target.value)}
                placeholder="e.g. 48 hours, 5 working days"
                data-testid="input-promise-window"
              />
            </div>

            {earlierRecords.length > 0 && (
              <div className="revision-card" style={{ padding: "1rem", background: "var(--paper-deep)", border: "1px solid var(--line)" }}>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={isRevision}
                    onChange={(e) => {
                      setIsRevision(e.target.checked);
                      if (e.target.checked && !selectedEarlierId) {
                        setSelectedEarlierId(earlierRecords[0]?.id || "");
                      }
                    }}
                    data-testid="checkbox-is-revision"
                  />
                  <span>
                    <strong>This updates an earlier promise.</strong>
                  </span>
                </label>

                {isRevision && (
                  <div style={{ marginTop: "1rem" }}>
                    <div className="field">
                      <label htmlFor="earlierSelect">Which earlier promise does this update?</label>
                      <select
                        id="earlierSelect"
                        value={selectedEarlierId}
                        onChange={(e) => setSelectedEarlierId(e.target.value)}
                      >
                        {earlierRecords.map((r, i) => (
                          <option key={r.id} value={r.id}>
                            Promise {i + 1}: “{r.verbatimText.slice(0, 60)}...”
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field" style={{ marginTop: ".75rem" }}>
                      <label htmlFor="relationSelect">What changed?</label>
                      <select
                        id="relationSelect"
                        value={relation}
                        onChange={(e) => setRelation(e.target.value as "changed_date" | "changed_explanation")}
                      >
                        <option value="changed_date">Changed date / timeframe (e.g. 48 hours to 5 days)</option>
                        <option value="changed_explanation">Changed explanation or requirement</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="action-row" style={{ marginTop: "1.5rem" }}>
              <button
                className="button button-primary"
                onClick={handleConfirmPromise}
                disabled={saving || !wording.trim()}
                data-testid="button-save-promise"
              >
                {saving ? "Saving..." : "Save reviewed promise"} <ArrowRight size={16} aria-hidden="true" />
              </button>
              <Link href={`/cases/${params.caseId}`} className="button button-quiet">
                Back to case
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ============================================================================
// 8. EXPORT SCREEN
// ============================================================================
function ExportCase() {
  const params = useParams<{ caseId: string }>();
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [includeChronology, setIncludeChronology] = useState(true);

  useEffect(() => {
    if (params.caseId) {
      api
        .getSnapshot(params.caseId)
        .then((s) => setSnapshot(s))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params.caseId]);

  if (loading) {
    return (
      <AppShell>
        <div className="page-wrap">
          <p className="hint">Preparing export packet...</p>
        </div>
      </AppShell>
    );
  }

  if (!snapshot) {
    return (
      <AppShell>
        <div className="page-wrap">
          <div className="empty-state">
            <h2>Could not prepare export</h2>
            <Link href="/cases" className="button button-primary">
              Return to cases
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-top no-print">
          <div>
            <span className="eyebrow">Export packet</span>
            <h1>Prepared, not sent.</h1>
            <p>Make a clean, printable chronology of this return case for your own records or support escalation.</p>
          </div>
          <button className="button button-primary" onClick={() => window.print()} data-testid="button-print-export">
            <Printer size={16} aria-hidden="true" /> Print / Save as PDF
          </button>
        </div>

        <div className="export-grid">
          <section className="no-print">
            <div className="eyebrow">Include in packet</div>
            <div className="check-list" style={{ marginTop: ".75rem" }}>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={includeChronology}
                  onChange={(e) => setIncludeChronology(e.target.checked)}
                />
                <span>Chronology of promises and statements</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={includeSources}
                  onChange={(e) => setIncludeSources(e.target.checked)}
                />
                <span>Source screenshot references</span>
              </label>
            </div>
            <div className="notice" style={{ marginTop: "1.5rem" }}>
              <Info size={16} aria-hidden="true" /> This packet represents your reviewed records. Still Owed does not
              certify merchant conduct.
            </div>
          </section>

          <article className="packet-paper">
            <header className="packet-header">
              <div>
                <span className="eyebrow">Case Packet · Still Owed</span>
                <h1>{snapshot.case.merchantLabel}</h1>
                <p className="packet-meta">
                  Item: {snapshot.case.itemLabel} · Order: {snapshot.case.orderReference || "Not provided"} · Amount:{" "}
                  {formatPaise(snapshot.case.requestedAmountPaise)}
                </p>
                <p className="hint">
                  Packet generated {new Date(snapshot.generatedAt).toLocaleString("en-IN")} · Case version{" "}
                  {snapshot.case.version}
                </p>
              </div>
            </header>

            {includeChronology && (
              <section className="packet-section">
                <h2>Chronology of Statements & Promises</h2>
                {snapshot.chronology.map((r: RecordItem) => (
                  <div className="packet-record" key={r.id}>
                    <span className="packet-date">{formatDate(r.reportedAt)}</span>
                    <div>
                      <p className="packet-quote">“{r.verbatimText}”</p>
                      <p className="packet-author">
                        {r.authorType === "support" ? "Support representative" : "User"}
                        {r.promise?.conditionLabel ? ` · Condition: ${r.promise.conditionLabel}` : ""}
                        {r.promise?.rawWindow ? ` · Stated period: ${r.promise.rawWindow}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {includeSources && (
              <section className="packet-section">
                <h2>Source Attachments</h2>
                {snapshot.sources.map((s: SourceItem, idx: number) => (
                  <div className="packet-source-item" key={s.id}>
                    <h3>
                      Source 0{idx + 1} · {s.originalFilename || (s.kind === "image" ? "Screenshot" : "Note")}
                    </h3>
                    <p className="hint">
                      Recorded: {formatDate(s.reportedSourceAt)} · Channel: {s.channel} · SHA-256:{" "}
                      {s.sha256 ? `${s.sha256.slice(0, 16)}...` : "N/A"}
                    </p>
                    {s.noteText && <blockquote className="packet-note">“{s.noteText}”</blockquote>}
                  </div>
                ))}
              </section>
            )}

            <footer className="packet-footer">
              <span>Still Owed · Quiet casebook for stuck returns</span>
              <span>Page 1 of 1 · Prepared for personal records</span>
            </footer>
          </article>
        </div>
      </div>
    </AppShell>
  );
}

// ============================================================================
// ============================================================================
// 9. SETTINGS SCREEN
// ============================================================================
function Settings() {
  const [, setLocation] = useLocation();
  const [statusMsg, setStatusMsg] = useState("");
  const [userEmail, setUserEmail] = useState<string>("Adarsh Jagannath");
  const [seeding, setSeeding] = useState(false);
  const [showAccountDeleteConfirm, setShowAccountDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      if (res.data?.session?.user?.email) {
        setUserEmail(res.data.session.user.email);
      }
    });
  }, []);

  const displayName = userEmail.includes("@") ? userEmail.split("@")[0] : userEmail;
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AJ";

  async function handleSeedDemo() {
    setSeeding(true);
    setStatusMsg("");
    try {
      const res = await api.seedDemoCase();
      setStatusMsg("Fictional Demo Store case loaded into your casebook.");
      setTimeout(() => setLocation(`/cases/${res.caseId}`), 1200);
    } catch (err: unknown) {
      setStatusMsg(err instanceof Error ? err.message : "Failed to load demo case");
    } finally {
      setSeeding(false);
    }
  }

  async function handleExportData() {
    try {
      window.location.href = "/api/account/export";
      setStatusMsg("Structured JSON data export requested.");
    } catch {
      setStatusMsg("Could not initiate data export.");
    }
  }

  async function handleDeleteAccountConfirm() {
    setIsDeletingAccount(true);
    try {
      await api.deleteAccount();
      setShowAccountDeleteConfirm(false);
      setStatusMsg("All casebook records scheduled for deletion.");
      setTimeout(() => setLocation("/"), 2000);
    } catch (err: unknown) {
      setStatusMsg(err instanceof Error ? err.message : "Deletion request failed");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-top">
          <div>
            <span className="eyebrow">Your desk</span>
            <h1>Settings</h1>
            <p>User profile, authentication, cloud status, and data ownership controls.</p>
          </div>
        </div>

        {statusMsg && (
          <div className="notice" style={{ marginBottom: "1.5rem" }}>
            <Check size={16} aria-hidden="true" /> {statusMsg}
          </div>
        )}

        <div className="source-list" style={{ maxWidth: "760px", display: "grid", gap: "1.2rem" }}>
          {/* User Profile Card with Prominent Logout */}
          <div
            className="source-card"
            style={{
              padding: "1.5rem",
              background: "var(--white)",
              border: "1px solid var(--line)",
              boxShadow: "4px 4px 0 var(--paper-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
              <div
                style={{
                  width: "3.2rem",
                  height: "3.2rem",
                  borderRadius: "50%",
                  background: "var(--blue)",
                  color: "var(--white)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "var(--font-serif)" }}>{displayName}</h3>
                <p style={{ margin: ".2rem 0", color: "var(--ink-soft)", fontSize: ".9rem" }}>{userEmail}</p>
                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: ".4rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: ".72rem",
                      padding: ".15rem .45rem",
                      background: "var(--paper-deep)",
                      borderRadius: "2px",
                      color: "var(--ink-soft)",
                    }}
                  >
                    Timezone: Asia/Kolkata
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: ".72rem",
                      padding: ".15rem .45rem",
                      background: "var(--green-pale)",
                      borderRadius: "2px",
                      color: "var(--green)",
                      fontWeight: 600,
                    }}
                  >
                    ✓ Adult Attested
                  </span>
                </div>
              </div>
            </div>

            <button
              className="button button-danger button-small"
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
              data-testid="button-settings-logout"
              style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Sign out of account</span>
            </button>
          </div>

          {/* Seed / Reload Demo Store Case */}
          <div className="source-card">
            <div>
              <h3>
                <Sparkles size={16} style={{ color: "var(--saffron)", display: "inline", marginRight: ".4rem" }} aria-hidden="true" />
                Fictional Demo Store Return (₹4,800)
              </h3>
              <p>
                Reset or load the fictional Demo Store return case (Noise-Cancelling Headphones, order DEMO-104) with its 2
                chat screenshots, 48-hour promise, warehouse receipt condition, and 5-day revised commitment.
              </p>
            </div>
            <button
              className="button button-secondary button-small"
              onClick={handleSeedDemo}
              disabled={seeding}
              data-testid="button-settings-seed-demo"
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>{seeding ? "Loading..." : "Load Demo Case"}</span>
            </button>
          </div>

          {/* Cloud & Infrastructure Status */}
          <div className="source-card" style={{ display: "block" }}>
            <h3 style={{ marginBottom: ".8rem" }}>
              <Shield size={16} style={{ color: "var(--blue)", display: "inline", marginRight: ".4rem" }} aria-hidden="true" />
              Cloud Infrastructure Status
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: ".8rem" }}>
              <div style={{ padding: ".75rem", background: "var(--paper-deep)", borderRadius: "var(--radius)" }}>
                <div style={{ fontSize: ".72rem", color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  Database
                </div>
                <div style={{ fontSize: ".9rem", fontWeight: 600, marginTop: ".2rem" }}>Supabase PostgreSQL</div>
                <div style={{ fontSize: ".75rem", color: "var(--green)", marginTop: ".2rem" }}>● Connected (Tokyo pooler)</div>
              </div>
              <div style={{ padding: ".75rem", background: "var(--paper-deep)", borderRadius: "var(--radius)" }}>
                <div style={{ fontSize: ".72rem", color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  OCR Service
                </div>
                <div style={{ fontSize: ".9rem", fontWeight: 600, marginTop: ".2rem" }}>Amazon Textract</div>
                <div style={{ fontSize: ".75rem", color: "var(--green)", marginTop: ".2rem" }}>● Active (ap-south-1 Mumbai)</div>
              </div>
              <div style={{ padding: ".75rem", background: "var(--paper-deep)", borderRadius: "var(--radius)" }}>
                <div style={{ fontSize: ".72rem", color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  Private Storage
                </div>
                <div style={{ fontSize: ".9rem", fontWeight: 600, marginTop: ".2rem" }}>case-sources</div>
                <div style={{ fontSize: ".75rem", color: "var(--green)", marginTop: ".2rem" }}>● Row-level encrypted</div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="source-card">
            <div>
              <h3>
                <Shield size={16} aria-hidden="true" /> Privacy & Row-Level Isolation
              </h3>
              <p>Your cases and screenshots are isolated by authenticated user ID. No other user can list or read your records.</p>
            </div>
            <Link href="/privacy" className="source-ref" data-testid="link-settings-privacy">
              Read privacy <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {/* Download JSON Data */}
          <div className="source-card">
            <div>
              <h3>
                <Download size={16} aria-hidden="true" /> Download your data (JSON)
              </h3>
              <p>Download a machine-readable JSON archive containing your full case history, records, sources, and metadata.</p>
            </div>
            <button className="button button-secondary button-small" onClick={handleExportData} data-testid="button-download-json">
              Download JSON
            </button>
          </div>

          {/* Delete All Data */}
          <div className="source-card">
            <div>
              <h3 style={{ color: "var(--danger)" }}>
                <Trash2 size={16} aria-hidden="true" /> Delete casebook
              </h3>
              <p>Immediately removes access to all personal cases and schedules storage file deletion.</p>
            </div>
            <button
              className="button button-danger button-small"
              onClick={() => setShowAccountDeleteConfirm(true)}
              data-testid="button-delete-all"
            >
              Delete all data
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={showAccountDeleteConfirm}
          onOpenChange={setShowAccountDeleteConfirm}
          title="Delete entire casebook?"
          description="Permanently delete all your cases, screenshots, and account records? This removes access immediately and schedules complete storage cleanup. This action cannot be undone."
          confirmLabel="Permanently delete all data"
          cancelLabel="Cancel"
          isDestructive
          loading={isDeletingAccount}
          onConfirm={handleDeleteAccountConfirm}
        />
      </div>
    </AppShell>
  );
}

// ============================================================================
// 10. PLAIN STATIC PAGES (/privacy, /terms, /offline)
// ============================================================================
function PlainPage({ page }: { page: "privacy" | "terms" | "offline" }) {
  const content = {
    privacy: {
      eyebrow: "Privacy, in plain language",
      title: "Your papers stay on your desk.",
      blocks: [
        [
          "What is stored",
          "Still Owed stores the cases, screenshots, and notes you explicitly add. Each account has strict row-level isolation so no other user can access your records.",
        ],
        [
          "OCR and Textract",
          "When you choose to read a screenshot, only the selected image is sent to Amazon Textract to detect selectable text blocks. No generative AI models evaluate or judge your claims.",
        ],
        [
          "What you choose to share",
          "If you print, save a PDF, or copy follow-up wording, that action is strictly yours. Still Owed never sends a message to a merchant or third party.",
        ],
      ],
    },
    terms: {
      eyebrow: "A clear, honest agreement",
      title: "A casebook, not a legal verdict.",
      blocks: [
        [
          "What Still Owed does",
          "It helps you organize support statements, dates, source screenshots, and notes. It prepares factual follow-up text for you to review.",
        ],
        [
          "What it does not do",
          "It does not provide legal advice, guarantee a refund, contact a merchant, or verify a store's conduct.",
        ],
        [
          "Your records",
          "You retain complete ownership over what you add, edit, print, download, or delete.",
        ],
      ],
    },
    offline: {
      eyebrow: "Offline use",
      title: "A calm tool for a patchy connection.",
      blocks: [
        [
          "What works offline",
          "Once loaded, the public static shell and offline documentation remain accessible through the service worker.",
        ],
        [
          "Private cases require connection",
          "To preserve data isolation and verify identity, viewing and modifying private cases requires an active network connection.",
        ],
      ],
    },
  }[page];

  return (
    <>
      <PublicHeader />
      <main className="plain-page">
        <span className="eyebrow">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        {content.blocks.map(([heading, text]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </section>
        ))}
        <div className="action-row" style={{ marginTop: "3rem" }}>
          <Link href="/cases" className="button button-primary" data-testid={`button-${page}-start`}>
            Open the casebook <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/" className="button button-quiet" data-testid={`button-${page}-home`}>
            Home
          </Link>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="plain-page">
        <span className="eyebrow">404 · Empty folder</span>
        <h1>That page is not in this casebook.</h1>
        <p>Return to your desk and choose a page from there.</p>
        <Link href="/cases" className="button button-primary" data-testid="button-not-found-home">
          Return to cases
        </Link>
      </main>
      <PublicFooter />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/cases" component={CasesPage} />
      <Route path="/cases/new" component={NewCase} />
      <Route path="/cases/:caseId/sources/new" component={NewSource} />
      <Route path="/cases/:caseId/review/:sourceId" component={ReviewSource} />
      <Route path="/cases/:caseId/export" component={ExportCase} />
      <Route path="/cases/:caseId" component={CaseDetail} />
      <Route path="/settings" component={Settings} />
      <Route path="/privacy">{() => <PlainPage page="privacy" />}</Route>
      <Route path="/terms">{() => <PlainPage page="terms" />}</Route>
      <Route path="/offline">{() => <PlainPage page="offline" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  return (
    <WouterRouter base={basePath}>
      <Router />
    </WouterRouter>
  );
}
