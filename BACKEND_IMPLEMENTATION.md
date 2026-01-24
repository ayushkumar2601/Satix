# TrustScore Backend Implementation Guide

## Overview

This document describes the complete backend implementation of the TrustScore fintech application, featuring a Gemini AI-powered trust scoring engine with deterministic feature extraction and full database integration.

## Architecture

```
┌─────────────────┐
│   User Data     │
│  (Upload/Mock)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Feature Extraction (Server)    │
│  - Utility bill analysis         │
│  - UPI transaction patterns      │
│  - Location stability            │
│  - Social trust metrics          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Gemini AI Scoring Engine      │
│   (with Fallback)                │
│   - Conservative evaluation      │
│   - Explainable outputs          │
│   - JSON validation              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Trust Score (300-900)         │
│   + Sub-scores                   │
│   + Explanations                 │
│   + Loan Eligibility             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Supabase Database             │
│   - Profiles                     │
│   - Score History                │
│   - Calculation Logs             │
└─────────────────────────────────┘
```

## Database Schema

### Core Tables

1. **profiles** - User profiles with trust scores
2. **utility_bills** - Utility payment history
3. **upi_transactions** - UPI transaction data
4. **location_data** - Residential stability
5. **social_trust** - Social network metrics
6. **trust_score_calculations** - Calculation logs
7. **score_history** - Historical scores
8. **loans** - Loan records

Run `supabase-schema.sql` in your Supabase SQL Editor to create all tables.

## Environment Setup

Add to `.env.local`:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Optional
DEMO_MODE=false
```

Get Gemini API key: https://aistudio.google.com/app/apikey

## Data Flow

### Step 1: Data Ingestion

Users upload or system seeds demo data:
- Utility bills (electricity, water, gas)
- UPI transactions (credits/debits)
- Location information
- Social trust data

### Step 2: Feature Extraction (Deterministic)

`lib/services/feature-extraction.ts` computes:

```typescript
{
  utility: {
    on_time_ratio: 0.91,
    missed_payments: 1,
    months_tracked: 6,
    avg_payment_amount: 1200
  },
  upi: {
    avg_transactions_per_day: 6.8,
    transaction_variance: "low",
    income_consistency: "high",
    avg_monthly_income: 35000,
    avg_monthly_expense: 22000
  },
  location: {
    stability_score: 0.87,
    months_at_location: 18
  },
  social: {
    network_strength: "high",
    referrals_count: 3,
    trust_connections: 12
  }
}
```

### Step 3: Gemini AI Scoring

`lib/services/gemini-scoring.ts` sends features to Gemini with structured prompt:

**Prompt Template:**
```
You are a financial risk assessment engine.
Given behavioral financial signals, evaluate creditworthiness conservatively.

Tasks:
- Generate Trust Score (300-900)
- Generate sub-scores (0-1) for utility, UPI, location, social
- Provide explanations (max 15 words each)

Rules:
- Be conservative
- Penalize volatility
- Reward consistency
- Do NOT hallucinate

Input: [features JSON]
```

**Expected Response:**
```json
{
  "trust_score": 742,
  "utility_score": 0.88,
  "upi_score": 0.72,
  "location_score": 0.90,
  "social_score": 0.79,
  "explanations": {
    "utility": "Consistent on-time utility bill payments",
    "upi": "Stable transaction activity with moderate variance",
    "location": "Strong residential stability over time",
    "social": "Connected to a long-standing trusted network"
  }
}
```

### Step 4: Fallback Scoring

If Gemini fails or API key missing, deterministic fallback activates:

```typescript
// Weighted scoring
utilityScore = on_time_ratio * 0.7 - missed_penalty
upiScore = activity + consistency - variance
locationScore = stability + duration_bonus
socialScore = network_strength + connections

trustScore = 300 + (weighted_average * 600)
```

### Step 5: Loan Eligibility

Rule-based calculation:

| Trust Score | Min Loan | Max Loan | Interest Rate |
|-------------|----------|----------|---------------|
| ≥ 750       | ₹25,000  | ₹100,000 | 12%           |
| 650-749     | ₹10,000  | ₹50,000  | 15%           |
| 550-649     | ₹5,000   | ₹25,000  | 18%           |
| < 550       | ₹2,000   | ₹10,000  | 22%           |

### Step 6: Database Persistence

All results saved to Supabase:
- Profile updated with latest score
- Calculation logged with features used
- Score history entry created
- Loan eligibility stored

## API Endpoints

### POST /api/trust-score/calculate

Calculate trust score for current user.

**Request:**
```json
{
  "seed_demo_data": true  // Optional: seed demo data if none exists
}
```

**Response:**
```json
{
  "success": true,
  "trust_score": 742,
  "sub_scores": {
    "utility": 0.88,
    "upi": 0.72,
    "location": 0.90,
    "social": 0.79
  },
  "explanations": { ... },
  "eligibility": {
    "min_amount": 10000,
    "max_amount": 50000,
    "interest_rate": 15.0
  },
  "gemini_used": true,
  "fallback_used": false
}
```

### GET /api/trust-score/get

Get current trust score for user.

**Response:**
```json
{
  "success": true,
  "trust_score": 742,
  "score_breakdown": { ... },
  "loan_eligibility_min": 10000,
  "loan_eligibility_max": 50000,
  "interest_rate": 15.0,
  "explanations": { ... }
}
```

### GET /api/dashboard/data

Get all dashboard data for user.

**Response:**
```json
{
  "success": true,
  "profile": { ... },
  "score_history": [ ... ],
  "loans": [ ... ],
  "transactions": [ ... ],
  "bills": [ ... ]
}
```

## Key Features

### 1. Deterministic Feature Extraction
- All features computed from raw data
- Fully explainable and testable
- No black-box magic
- Logged for audit trail

### 2. AI-Powered Reasoning
- Gemini provides nuanced evaluation
- Conservative scoring approach
- Human-readable explanations
- Validates output strictly

### 3. Failsafe Design
- Automatic fallback if Gemini fails
- Demo mode for testing
- Graceful error handling
- Never crashes user flow

### 4. Explainability
- Every score has explanation
- Features used are logged
- Calculation method tracked
- Regulator-friendly

### 5. Security
- No raw data sent to Gemini (only features)
- API keys server-side only
- Row-level security in database
- User data isolated

## Demo Mode

Set `DEMO_MODE=true` to:
- Use fallback scoring always
- Seed demo data automatically
- Safe for judge demos
- No API costs

## Testing

### 1. Test Feature Extraction

```typescript
import { extractAllFeatures } from '@/lib/services/feature-extraction'

const features = await extractAllFeatures(userId)
console.log(features)
```

### 2. Test Gemini Scoring

```typescript
import { generateTrustScoreWithGemini } from '@/lib/services/gemini-scoring'

const { result, gemini_used } = await generateTrustScoreWithGemini(features)
console.log(result)
```

### 3. Test Full Flow

```typescript
import { calculateAndSaveTrustScore } from '@/lib/services/trust-score-service'

const result = await calculateAndSaveTrustScore(userId)
console.log(result)
```

## Judge Pitch

**"We use deterministic financial signals combined with an AI reasoning layer to generate an explainable Trust Score, without relying on traditional credit history."**

### Key Points:
1. **No Credit Bureau** - Works for unbanked/underbanked
2. **Explainable** - Every score has clear reasoning
3. **Conservative** - Penalizes risk, rewards stability
4. **AI-Enhanced** - Gemini provides nuanced evaluation
5. **Failsafe** - Falls back to deterministic if AI fails
6. **Auditable** - All calculations logged
7. **Secure** - No raw data to AI, only features

## Monitoring

Check logs for:
- `[Feature Extraction]` - Feature computation
- `[Gemini]` - AI API calls
- `[Fallback]` - Fallback activation
- `[Trust Score Service]` - Score calculation
- `[API]` - Endpoint calls

## Production Checklist

- [ ] Add real Gemini API key
- [ ] Run database schema in Supabase
- [ ] Test with real user data
- [ ] Monitor Gemini API usage
- [ ] Set up error alerting
- [ ] Configure rate limiting
- [ ] Add caching for scores
- [ ] Implement score refresh logic
- [ ] Add admin dashboard
- [ ] Set up backup scoring

## File Structure

```
lib/
├── services/
│   ├── feature-extraction.ts    # Deterministic features
│   ├── gemini-scoring.ts        # AI scoring + fallback
│   ├── trust-score-service.ts   # Main service
│   └── data-seeding.ts          # Demo data generation
├── auth/
│   └── actions.ts               # Auth actions
└── supabase/
    ├── client.ts                # Browser client
    └── server.ts                # Server client

app/
├── api/
│   ├── trust-score/
│   │   ├── calculate/route.ts   # Calculate score
│   │   └── get/route.ts         # Get score
│   └── dashboard/
│       └── data/route.ts        # Dashboard data
├── analyzing/page.tsx           # Calculation UI
├── score/page.tsx               # Score display
└── dashboard/page.tsx           # Dashboard

components/
└── score/
    └── breakdown.tsx            # Score breakdown UI
```

## Support

For issues:
1. Check console logs
2. Verify environment variables
3. Test with demo mode
4. Check Supabase connection
5. Verify Gemini API key

## License

Proprietary - TrustScore Fintech Application
