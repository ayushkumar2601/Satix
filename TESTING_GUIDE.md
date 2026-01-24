# TrustScore Testing Guide

## Pre-Testing Setup

### 1. Verify Environment
```bash
# Check .env.local has:
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GEMINI_API_KEY=AIza... (or set DEMO_MODE=true)
```

### 2. Verify Database
- Go to Supabase Dashboard
- Check Table Editor shows all tables
- If not, run `supabase-schema.sql`

### 3. Start Application
```bash
npm run dev
# Should start on http://localhost:3000
```

## Test Suite

### Test 1: User Authentication ✅

**Sign Up Flow:**
1. Go to http://localhost:3000
2. Click "Get Started"
3. Toggle to "Sign Up" mode
4. Enter email: `test@example.com`
5. Enter password: `password123`
6. Click "Sign Up"

**Expected:**
- ✅ No errors in console
- ✅ Redirects to `/consent` page
- ✅ User created in Supabase Auth
- ✅ Profile created in `profiles` table

**Sign In Flow:**
1. Go to `/login`
2. Enter same credentials
3. Click "Sign In"

**Expected:**
- ✅ Redirects to `/dashboard`
- ✅ Session cookie set

**Check in Supabase:**
```sql
SELECT * FROM auth.users WHERE email = 'test@example.com';
SELECT * FROM profiles WHERE email = 'test@example.com';
```

---

### Test 2: Data Upload & Seeding ✅

1. After sign up, click through consent page
2. Arrive at `/upload` page
3. Click "Analyze My Data" (without uploading files)

**Expected:**
- ✅ Redirects to `/analyzing` page
- ✅ Progress animation shows
- ✅ Console shows:
  ```
  [Data Seeding] Seeding demo data for user: ...
  [Data Seeding] Seeded X utility bills
  [Data Seeding] Seeded X UPI transactions
  [Data Seeding] Seeded location data
  [Data Seeding] Seeded social trust data
  ```

**Check in Supabase:**
```sql
-- Should have data
SELECT COUNT(*) FROM utility_bills WHERE user_id = 'your-user-id';
SELECT COUNT(*) FROM upi_transactions WHERE user_id = 'your-user-id';
SELECT * FROM location_data WHERE user_id = 'your-user-id';
SELECT * FROM social_trust WHERE user_id = 'your-user-id';
```

---

### Test 3: Feature Extraction ✅

**During analyzing page, check console:**

**Expected logs:**
```
[Feature Extraction] Starting feature extraction for user: ...
[Feature Extraction] No utility bills found, using defaults
  OR
[Feature Extraction] Extracted features: {
  utility: { on_time_ratio: 0.9, ... },
  upi: { avg_transactions_per_day: 6.8, ... },
  location: { stability_score: 0.87, ... },
  social: { network_strength: "high", ... }
}
```

**Verify:**
- ✅ Features are computed
- ✅ No errors in extraction
- ✅ All four categories present

---

### Test 4: Gemini AI Scoring ✅

**Check console during calculation:**

**With Gemini API Key:**
```
[Gemini] Calling Gemini API for trust score generation
[Gemini] Raw response: { ... }
[Gemini] Successfully generated trust score: 742
```

**Without Gemini API Key (or DEMO_MODE=true):**
```
[Gemini] API key not configured or demo mode, using fallback scoring
[Fallback] Generating deterministic trust score
```

**Expected:**
- ✅ Either Gemini or fallback succeeds
- ✅ Trust score between 300-900
- ✅ Sub-scores between 0-1
- ✅ Explanations generated

---

### Test 5: Trust Score Calculation ✅

**Check console:**
```
[Trust Score Service] Starting calculation for user: ...
[Trust Score Service] Successfully calculated and saved trust score: 742
```

**Expected:**
- ✅ Score calculated
- ✅ Loan eligibility computed
- ✅ Data saved to database

**Check in Supabase:**
```sql
-- Profile updated
SELECT trust_score, loan_eligibility_min, loan_eligibility_max, interest_rate
FROM profiles WHERE id = 'your-user-id';

-- Calculation logged
SELECT * FROM trust_score_calculations 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC LIMIT 1;

-- History entry
SELECT * FROM score_history 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC LIMIT 1;
```

---

### Test 6: Score Display Page ✅

**After calculation, should redirect to `/score`:**

**Expected UI:**
- ✅ Trust score animates from 0 to actual score
- ✅ Circular progress bar fills
- ✅ Risk category shows (Excellent/Good/Fair/Building)
- ✅ Loan eligibility range displays
- ✅ Quick stats show (Score Trend, Risk Level, Approval)
- ✅ "✓ AI-powered scoring active" OR "Score calculated using deterministic model"
- ✅ Score breakdown section with 4 factors
- ✅ Each factor shows stars (1-5)
- ✅ Explanations display

**Test Interactions:**
- Click on breakdown factors → Should expand with details
- Click "Select Your Loan Amount" → Should go to `/loan`
- Click "Go to Dashboard Instead" → Should go to `/dashboard`

---

### Test 7: Dashboard Page ✅

**Navigate to `/dashboard`:**

**Expected UI:**
- ✅ Trust score displays (same as score page)
- ✅ Score history chart shows (if multiple scores)
- ✅ Score trend percentage shows
- ✅ Loan eligibility card OR active loan card
- ✅ Interest rate displays
- ✅ "Apply for New Loan" link shows max eligibility
- ✅ "Improve Your Score" link present

**If No Active Loan:**
- ✅ Shows "Loan Eligibility" card
- ✅ Shows maximum eligible amount
- ✅ Shows interest rate

**If Active Loan (after applying):**
- ✅ Shows "Active Loan" card
- ✅ Shows remaining amount
- ✅ Shows progress bar
- ✅ Shows EMI details
- ✅ Shows payment timeline

**Test Interactions:**
- Click bell icon → Should work (placeholder)
- Click settings icon → Should work (placeholder)
- Click logout icon → Should sign out and redirect to home
- Click "Apply for New Loan" → Should go to `/loan`
- Click "Improve Your Score" → Should go to `/upload`

---

### Test 8: API Endpoints ✅

**Test Calculate Endpoint:**
```bash
# In browser console (after login):
fetch('/api/trust-score/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ seed_demo_data: true })
}).then(r => r.json()).then(console.log)
```

**Expected Response:**
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

**Test Get Endpoint:**
```bash
fetch('/api/trust-score/get')
  .then(r => r.json())
  .then(console.log)
```

**Expected Response:**
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

**Test Dashboard Endpoint:**
```bash
fetch('/api/dashboard/data')
  .then(r => r.json())
  .then(console.log)
```

**Expected Response:**
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

---

### Test 9: Error Handling ✅

**Test Unauthenticated Access:**
1. Open incognito window
2. Go to http://localhost:3000/dashboard

**Expected:**
- ✅ Redirects to `/login`

**Test No Data:**
1. Delete user's data from Supabase
2. Go to `/dashboard`

**Expected:**
- ✅ Shows "No Trust Score Yet" message
- ✅ Button to "Get Started"

**Test Invalid Gemini Key:**
1. Set `GEMINI_API_KEY=invalid-key`
2. Restart server
3. Calculate score

**Expected:**
- ✅ Falls back to deterministic scoring
- ✅ Console shows: `[Gemini] Error calling Gemini API`
- ✅ Console shows: `[Gemini] Falling back to deterministic scoring`
- ✅ Score still calculated successfully

---

### Test 10: Score Variations ✅

**Test High Score (750+):**

Insert excellent data:
```sql
-- Delete existing data
DELETE FROM utility_bills WHERE user_id = 'your-user-id';
DELETE FROM upi_transactions WHERE user_id = 'your-user-id';

-- Insert perfect utility history
INSERT INTO utility_bills (user_id, bill_type, amount, due_date, paid_date, status)
VALUES 
  ('your-user-id', 'electricity', 1200, '2024-01-15', '2024-01-14', 'paid'),
  ('your-user-id', 'electricity', 1150, '2024-02-15', '2024-02-14', 'paid'),
  ('your-user-id', 'electricity', 1180, '2024-03-15', '2024-03-14', 'paid'),
  ('your-user-id', 'electricity', 1220, '2024-04-15', '2024-04-14', 'paid'),
  ('your-user-id', 'electricity', 1190, '2024-05-15', '2024-05-14', 'paid'),
  ('your-user-id', 'electricity', 1210, '2024-06-15', '2024-06-14', 'paid');

-- Insert high-income UPI transactions
-- (Add many credit transactions with consistent amounts)

-- Recalculate
```

**Expected:**
- ✅ Trust score ≥ 750
- ✅ Loan eligibility: ₹25,000 - ₹100,000
- ✅ Interest rate: 12%
- ✅ Risk category: "Excellent"

**Test Low Score (<550):**

Insert poor data:
```sql
-- Insert missed payments
INSERT INTO utility_bills (user_id, bill_type, amount, due_date, status)
VALUES 
  ('your-user-id', 'electricity', 1200, '2024-01-15', 'missed'),
  ('your-user-id', 'electricity', 1150, '2024-02-15', 'missed');

-- Insert volatile UPI transactions
-- (Add transactions with high variance)

-- Recalculate
```

**Expected:**
- ✅ Trust score < 550
- ✅ Loan eligibility: ₹2,000 - ₹10,000
- ✅ Interest rate: 22%
- ✅ Risk category: "Building"

---

### Test 11: Demo Mode ✅

1. Set in `.env.local`:
```env
DEMO_MODE=true
```

2. Restart server
3. Sign up new user
4. Calculate score

**Expected:**
- ✅ Always uses fallback scoring
- ✅ Console shows: `[Gemini] API key not configured or demo mode, using fallback scoring`
- ✅ Score calculated successfully
- ✅ No Gemini API calls made
- ✅ Score page shows: "Score calculated using deterministic model"

---

### Test 12: Multiple Users ✅

1. Sign up User A
2. Calculate score for User A
3. Sign out
4. Sign up User B
5. Calculate score for User B
6. Check both users have separate data

**Expected:**
- ✅ Each user has own profile
- ✅ Each user has own data
- ✅ Each user has own trust score
- ✅ No data leakage between users

**Verify in Supabase:**
```sql
SELECT id, email, trust_score FROM profiles;
-- Should show both users with different scores
```

---

## Performance Testing

### Load Time Benchmarks

| Page | Expected Load Time |
|------|-------------------|
| Home | < 1s |
| Login | < 1s |
| Upload | < 1s |
| Analyzing | 5-8s (includes calculation) |
| Score | < 2s |
| Dashboard | < 2s |

### API Response Times

| Endpoint | Expected Time |
|----------|--------------|
| /api/trust-score/calculate | 3-6s (with Gemini) |
| /api/trust-score/calculate | 1-2s (fallback) |
| /api/trust-score/get | < 500ms |
| /api/dashboard/data | < 1s |

---

## Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Chrome
- ✅ Mobile Safari

---

## Regression Testing Checklist

Before each demo/deployment:

- [ ] User can sign up
- [ ] User can log in
- [ ] User can upload data
- [ ] Score calculation works
- [ ] Score displays correctly
- [ ] Dashboard shows data
- [ ] All API endpoints respond
- [ ] Database has entries
- [ ] No console errors
- [ ] Gemini or fallback works
- [ ] Loan eligibility calculates
- [ ] Score breakdown shows
- [ ] Sign out works

---

## Troubleshooting Tests

### If Test Fails:

1. **Check Console Logs**
   - Browser console (F12)
   - Terminal running `npm run dev`

2. **Check Database**
   - Supabase Dashboard > Table Editor
   - Verify data exists

3. **Check Environment**
   - `.env.local` has correct values
   - Server restarted after env changes

4. **Check Authentication**
   - User is logged in
   - Session cookie exists

5. **Try Demo Mode**
   - Set `DEMO_MODE=true`
   - Restart server
   - Test again

---

## Success Criteria

All tests pass when:
- ✅ No errors in console
- ✅ All pages load correctly
- ✅ All API endpoints respond
- ✅ Database has correct data
- ✅ Trust score calculates
- ✅ Dashboard displays data
- ✅ User flow is smooth
- ✅ Gemini or fallback works

---

## Automated Testing (Future)

Consider adding:
- Unit tests for feature extraction
- Unit tests for scoring logic
- Integration tests for API endpoints
- E2E tests for user flows
- Performance tests for load

Example test structure:
```typescript
// lib/services/__tests__/feature-extraction.test.ts
describe('Feature Extraction', () => {
  it('should calculate utility features correctly', () => {
    // Test implementation
  })
})
```

---

## Test Data Cleanup

After testing, clean up:
```sql
-- Delete test users
DELETE FROM auth.users WHERE email LIKE 'test%';

-- Cascade will delete related data automatically
```

---

## Production Testing

Before going live:
1. Test with production Supabase
2. Test with production Gemini key
3. Test with real user data
4. Monitor error rates
5. Check performance metrics
6. Verify security policies

Good luck with testing! 🧪
