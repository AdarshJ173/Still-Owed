# Still Owed

> **A quiet casebook for the return that became a second job.**

Still Owed helps someone dealing with a disputed online-shopping return preserve what support said, see what changed, and prepare their next communication without having to reconstruct the entire story from scratch.

---

## 🌟 Key Product Capabilities

1. **Source-Linked Promises**: Upload support screenshots or notes. Amazon Textract detects text lines with normalized geometry. Selecting a sentence highlights the exact passage on the image.
2. **Conditional Duration Logic**: When support says *"Within 48 hours after warehouse receipt"*, the app tracks the missing trigger event rather than falsely declaring an overdue refund.
3. **Preserved Revisions**: When a later message changes the timeframe or explanation (e.g. *"Please allow 5 working days"*), the new commitment joins the history—it never erases what came before.
4. **Exportable Case Packet**: Generates a clean, print-ready chronology and supporting excerpts with generation timestamps for personal records or escalation.
5. **Data Ownership & Deletion**: Strict user-level data isolation, machine-readable JSON account export, and complete data deletion.

---

## 🏛️ System Architecture

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS (`artifacts/still-owed`)
- **Backend API**: Express 5 + Node 24 + TypeScript (`artifacts/api-server`)
- **Database**: PostgreSQL with Drizzle ORM (`lib/db`) — 13 specification tables
- **AWS Cloud Integration**: AWS SDK v3 `@aws-sdk/client-textract` (`DetectDocumentText`)
- **API Contracts**: OpenAPI 3.1 (`lib/api-spec`) and Zod validation (`lib/api-zod`)

---

## 📁 Repository Structure

```
.
├── docs/                               # Complete Product & Event Specifications
│   ├── 01-idea-and-research.md         # Problem, evidence, competition
│   ├── 02-product-requirements.md      # Full PRD, states, and flows
│   ├── 03-technical-and-aws.md         # Technical spec, AWS Textract, data model
│   ├── 04-design-and-experience.md     # Design tokens, screen UX, accessibility
│   ├── 05-engineering-and-release.md   # Release plan & test guidelines
│   ├── 06-demo-and-submission.md       # First Commit demo script & submission
│   └── README.md                       # Project overview
├── artifacts/
│   ├── api-server/                     # Express 5 REST backend
│   │   └── src/
│   │       ├── lib/textract.ts         # Amazon Textract OCR integration
│   │       ├── middlewares/auth.ts     # User identity & profile middleware
│   │       └── routes/                 # Cases, sources, account, maintenance
│   └── still-owed/                     # Production React frontend
│       └── src/
│           ├── lib/api.ts              # Typed API client
│           └── App.tsx                 # Casebook screens and signature interactions
├── lib/
│   ├── db/                             # Drizzle ORM schema & Postgres client
│   ├── api-spec/                       # OpenAPI 3.1 specification
│   └── api-zod/                        # Shared Zod schemas
└── tests/
    └── e2e.test.mjs                    # End-to-end automated integration tests
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js 22+ (tested on Node 24)
- pnpm 10+
- PostgreSQL (or Docker)

### 1. Start the Database
```bash
# Start local PostgreSQL container (or use Supabase DATABASE_URL)
docker run -d --name still-owed-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=still_owed postgres:16-alpine

# Apply schema migrations
pnpm --filter @workspace/db run push
```

### 2. Environment Variables (`.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/still_owed
PORT=5000
NODE_ENV=development
TEXTRACT_REGION=ap-south-1
MAINTENANCE_AUTH_SECRET=still-owed-dev-maintenance-secret-2026

# Optional: Live AWS credentials for Textract (falls back to synthetic OCR fixture if omitted)
# AWS_ACCESS_KEY_ID=your_key_id
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_REGION=ap-south-1
```

### 3. Run the Backend API Server
```bash
pnpm --filter @workspace/api-server run dev
# Starts API server on http://localhost:5000
```

### 4. Run the Frontend
```bash
pnpm --filter @workspace/still-owed run dev
# Starts frontend on http://localhost:5173
```

### 5. Run Verification Tests
```bash
node --test tests/e2e.test.mjs
```

---

## ☁️ AWS Textract Integration

The service at `artifacts/api-server/src/lib/textract.ts` calls `DetectDocumentTextCommand`:
- Takes raw screenshot image bytes (PNG/JPEG, max 3 MiB).
- Normalizes `LINE` blocks, confidence scores, and bounding box coordinates `(left, top, width, height)`.
- The frontend renders amber overlays directly over the screenshot image, allowing the user to click bounding boxes to select passages.
- Includes high-fidelity deterministic fixtures for seamless local development and testing when live credentials are not set.

---

## 🛡️ Competition Alignment (First Commit)

Built for **First Commit** (WeMakeDevs × AWS Tour), targeting **Ship It** and **Best UI**:
- Real cloud architecture using **Amazon Textract** and **PostgreSQL**.
- Strict privacy boundary: OCR only, no generative LLM hallucinating facts or legal rights.
- Tested and verified end-to-end.
