# TrustScore System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  Login/Signup  →  Upload  →  Analyzing  →  Score  →  Dashboard │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  /api/trust-score/calculate  │  /api/trust-score/get           │
│  /api/dashboard/data         │  /api/auth/*                    │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Trust Score Service (Orchestrator)               │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
│         ┌───────────┼───────────┐                              │
│         ▼           ▼           ▼                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │ Feature  │ │  Gemini  │ │   Loan   │                       │
│  │Extraction│ │ Scoring  │ │Eligibility│                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│                     │                                           │
│                     ├─── Gemini API (AI Scoring)               │
│                     └─── Fallback (Deterministic)              │
│                                                                 │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Supabase)                      │
├─────────────────────────────────────────────────────────────────┤
│  profiles  │  utility_bills  │  upi_transactions               │
│  location_data  │  social_trust  │  score_history              │
│  trust_score_calculations  │  loans                            │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER DATA INGESTION                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Upload Page     │
                    │  - Bills         │
                    │  - UPI Data      │
                    │  - Location      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Data Seeding    │
                    │  (if no data)    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Supabase DB     │
                    │  - utility_bills │
                    │  - upi_trans     │
                    │  - location      │
                    │  - social        │
                    └────────┬─────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: FEATURE EXTRACTION (Deterministic)                     │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Feature Extraction Service  │
              └──────────────┬───────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
    ┌─────────┐        ┌─────────┐        ┌─────────┐
    │ Utility │        │   UPI   │        │Location │
    │Features │        │Features │        │Features │
    └────┬────┘        └────┬────┘        └────┬────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Feature Object  │
                   │ {               │
                   │   utility: {...}│
                   │   upi: {...}    │
                   │   location:{...}│
                   │   social: {...} │
                   │ }               │
                   └────────┬────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: AI SCORING (with Fallback)                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Gemini Scoring  │
                   │    Service      │
                   └────────┬────────┘
                            │
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
            ┌──────────────┐  ┌──────────────┐
            │ Gemini API   │  │  Fallback    │
            │ (AI Scoring) │  │(Deterministic)│
            └──────┬───────┘  └──────┬───────┘
                   │                 │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Trust Score     │
                   │ Result          │
                   │ {               │
                   │   score: 742    │
                   │   sub_scores    │
                   │   explanations  │
                   │ }               │
                   └────────┬────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: LOAN ELIGIBILITY CALCULATION                           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Eligibility     │
                   │ Calculator      │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Loan Range      │
                   │ {               │
                   │   min: 10000    │
                   │   max: 50000    │
                   │   rate: 15%     │
                   │ }               │
                   └────────┬────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: DATABASE PERSISTENCE                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Save to Supabase       │
              └─────────┬───────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Update       │ │ Add to       │ │ Log          │
│ Profile      │ │ Score        │ │ Calculation  │
│ - trust_score│ │ History      │ │ - features   │
│ - breakdown  │ │              │ │ - gemini_used│
│ - eligibility│ │              │ │ - timestamp  │
└──────────────┘ └──────────────┘ └──────────────┘
                        │
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: DISPLAY TO USER                                        │
└─────────────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Score Page   │ │ Dashboard    │ │ Loan Page    │
│ - Trust Score│ │ - History    │ │ - Apply      │
│ - Breakdown  │ │ - Active     │ │ - Eligibility│
│ - Explain    │ │   Loans      │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Feature Extraction Details

```
┌─────────────────────────────────────────────────────────────────┐
│                    UTILITY BILL ANALYSIS                        │
└─────────────────────────────────────────────────────────────────┘

Input: utility_bills table
  ├─ bill_type (electricity, water, gas)
  ├─ amount
  ├─ due_date
  ├─ paid_date
  └─ status (paid, late, missed)

Processing:
  ├─ Calculate on_time_ratio = paid_on_time / total_bills
  ├─ Count missed_payments
  ├─ Calculate months_tracked (unique months)
  └─ Calculate avg_payment_amount

Output:
  {
    on_time_ratio: 0.91,
    missed_payments: 1,
    months_tracked: 6,
    avg_payment_amount: 1200
  }

┌─────────────────────────────────────────────────────────────────┐
│                    UPI TRANSACTION ANALYSIS                     │
└─────────────────────────────────────────────────────────────────┘

Input: upi_transactions table
  ├─ transaction_type (credit, debit)
  ├─ amount
  ├─ category
  └─ transaction_date

Processing:
  ├─ Calculate avg_transactions_per_day
  ├─ Group by month for income/expense
  ├─ Calculate standard deviation
  ├─ Determine variance level (low/medium/high)
  └─ Determine consistency level (low/medium/high)

Output:
  {
    avg_transactions_per_day: 6.8,
    transaction_variance: "low",
    income_consistency: "high",
    avg_monthly_income: 35000,
    avg_monthly_expense: 22000
  }

┌─────────────────────────────────────────────────────────────────┐
│                    LOCATION STABILITY                           │
└─────────────────────────────────────────────────────────────────┘

Input: location_data table
  ├─ city
  ├─ state
  ├─ months_at_location
  └─ stability_score

Output:
  {
    stability_score: 0.87,
    months_at_location: 18
  }

┌─────────────────────────────────────────────────────────────────┐
│                    SOCIAL TRUST METRICS                         │
└─────────────────────────────────────────────────────────────────┘

Input: social_trust table
  ├─ network_strength (low/medium/high)
  ├─ referrals_count
  └─ trust_connections

Output:
  {
    network_strength: "high",
    referrals_count: 3,
    trust_connections: 12
  }
```

## Scoring Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                    GEMINI AI SCORING                            │
└─────────────────────────────────────────────────────────────────┘

Input: Extracted Features (JSON)

Prompt Engineering:
  ├─ Role: "Financial risk assessment engine"
  ├─ Task: Generate trust score + sub-scores + explanations
  ├─ Rules: Conservative, penalize volatility, reward consistency
  └─ Format: Strict JSON output

Gemini Processing:
  ├─ Analyzes feature patterns
  ├─ Applies conservative evaluation
  ├─ Generates nuanced scores
  └─ Creates human-readable explanations

Output Validation:
  ├─ Check trust_score (300-900)
  ├─ Check sub_scores (0-1)
  ├─ Validate explanations exist
  └─ Parse JSON correctly

If Success:
  └─ Return Gemini result

If Failure:
  └─ Fallback to deterministic scoring

┌─────────────────────────────────────────────────────────────────┐
│                  DETERMINISTIC FALLBACK                         │
└─────────────────────────────────────────────────────────────────┘

Utility Score (0-1):
  = on_time_ratio * 0.7
  - missed_payments * 0.1
  + history_bonus (0.1-0.2)

UPI Score (0-1):
  = activity_score (0-0.4)
  + consistency_bonus (0.1-0.3)
  - variance_penalty (0-0.2)
  + cash_flow_bonus (0-0.1)

Location Score (0-1):
  = stability_score
  + duration_bonus (0-0.1)

Social Score (0-1):
  = network_base (0.2-0.6)
  + referrals * 0.05
  + connections * 0.02

Trust Score (300-900):
  weighted = utility*0.35 + upi*0.35 + location*0.20 + social*0.10
  trust_score = 300 + (weighted * 600)
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                         │
└─────────────────────────────────────────────────────────────────┘

Frontend (Browser):
  ├─ No API keys exposed
  ├─ Authentication tokens only
  └─ Read-only data display

API Layer (Next.js Server):
  ├─ Server-side authentication check
  ├─ User ID validation
  ├─ API key stored in env (server-only)
  └─ No raw data sent to external APIs

Business Logic:
  ├─ Feature extraction (deterministic)
  ├─ Only features sent to Gemini (not raw data)
  ├─ Validation of all inputs/outputs
  └─ Logging for audit trail

Database (Supabase):
  ├─ Row-level security (RLS)
  ├─ Users can only access own data
  ├─ Automatic user ID filtering
  └─ Encrypted at rest

External APIs:
  └─ Gemini: Only receives feature JSON (no PII)
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING                             │
└─────────────────────────────────────────────────────────────────┘

User Action
    │
    ▼
API Call
    │
    ├─ Auth Error → Redirect to Login
    │
    ├─ No Data → Seed Demo Data → Continue
    │
    ├─ Feature Extraction Error → Log + Use Defaults
    │
    ├─ Gemini API Error → Log + Use Fallback
    │
    ├─ Database Error → Log + Return Error Message
    │
    └─ Success → Continue to Next Step

All Errors:
  ├─ Logged to console
  ├─ User-friendly message shown
  ├─ Graceful degradation
  └─ Never crash the flow
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                              │
└─────────────────────────────────────────────────────────────────┘

Frontend + API:
  ├─ Vercel (Next.js hosting)
  ├─ Edge functions for API routes
  └─ Environment variables (secure)

Database:
  ├─ Supabase (PostgreSQL)
  ├─ Automatic backups
  └─ Row-level security

External Services:
  ├─ Gemini API (Google AI)
  └─ Rate limiting + error handling

Monitoring:
  ├─ Vercel Analytics
  ├─ Console logs
  └─ Error tracking (optional: Sentry)
```

This architecture ensures:
- ✅ Scalability
- ✅ Security
- ✅ Reliability
- ✅ Explainability
- ✅ Auditability
- ✅ Performance
