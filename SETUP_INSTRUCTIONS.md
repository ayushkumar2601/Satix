# TrustScore Backend Setup Instructions

## Quick Start (5 Minutes)

### Step 1: Database Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Open **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `supabase-schema.sql` in this project
5. Copy ALL content and paste into SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for "Success" message

### Step 2: Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Copy the key
4. Open `.env.local` in this project
5. Replace `your-gemini-api-key-here` with your actual key

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://pbidmecmucjclntpuwju.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyD...your-actual-key-here
DEMO_MODE=false
```

### Step 3: Install Dependencies (if needed)

```bash
npm install
```

### Step 4: Run the App

```bash
npm run dev
```

### Step 5: Test the Flow

1. Go to http://localhost:3000
2. Click **Get Started**
3. **Sign Up** with email/password (e.g., test@example.com / password123)
4. Grant permissions
5. Upload page will appear - click **Analyze My Data**
6. System will:
   - Seed demo data automatically
   - Extract features
   - Call Gemini AI
   - Calculate trust score
   - Show results

## Verification

### Check if Database is Set Up

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. You should see these tables:
   - profiles
   - utility_bills
   - upi_transactions
   - location_data
   - social_trust
   - trust_score_calculations
   - score_history
   - loans

### Check if Gemini is Working

After analyzing data, check browser console:
- `[Gemini] Calling Gemini API` = Gemini is being called
- `[Gemini] Successfully generated trust score` = Gemini worked!
- `[Fallback] Generating deterministic trust score` = Using fallback (check API key)

### Check Score Page

After analysis, you should see:
- Trust Score (300-900)
- "✓ AI-powered scoring active" (if Gemini worked)
- "Score calculated using deterministic model" (if fallback used)
- Score breakdown with explanations
- Loan eligibility range

## Troubleshooting

### "Invalid login credentials"
- You need to **Sign Up** first, not Sign In
- Use the toggle on login page to switch to Sign Up mode

### "Profile not found" on dashboard
- Database schema not run
- Go back to Step 1 and run the SQL schema

### "Failed to calculate trust score"
- Check browser console for errors
- Verify Gemini API key is correct
- Try setting `DEMO_MODE=true` in `.env.local` to use fallback

### Gemini not working (using fallback)
- Check API key is correct (no spaces, complete key)
- Verify key is active at https://aistudio.google.com/app/apikey
- Check you have API quota remaining
- Fallback still works fine for demos!

### No data on dashboard
- Go to `/upload` page
- Click "Analyze My Data"
- System will seed demo data and calculate score

## Demo Mode

For judge demos or testing without Gemini:

1. Set in `.env.local`:
```env
DEMO_MODE=true
```

2. Restart dev server

This will:
- Always use deterministic fallback scoring
- Seed demo data automatically
- Work without Gemini API key
- Be completely stable

## Testing Different Scenarios

### Test High Score (750+)

Manually insert good data in Supabase:

```sql
-- Insert excellent utility payment history
INSERT INTO utility_bills (user_id, bill_type, amount, due_date, paid_date, status)
VALUES 
  ('your-user-id', 'electricity', 1200, '2024-01-15', '2024-01-14', 'paid'),
  ('your-user-id', 'electricity', 1150, '2024-02-15', '2024-02-14', 'paid'),
  -- Add more...
```

### Test Low Score (<550)

Seed data with missed payments and high variance.

### Test No Data

Delete user's data and see "No Trust Score Yet" message.

## Production Deployment

Before deploying:

1. ✅ Database schema run in production Supabase
2. ✅ Real Gemini API key in production env vars
3. ✅ `DEMO_MODE=false` in production
4. ✅ Test full flow in production
5. ✅ Monitor logs for errors
6. ✅ Set up error alerting

## API Testing

### Test Calculate Endpoint

```bash
curl -X POST http://localhost:3000/api/trust-score/calculate \
  -H "Content-Type: application/json" \
  -d '{"seed_demo_data": true}' \
  -H "Cookie: your-session-cookie"
```

### Test Get Endpoint

```bash
curl http://localhost:3000/api/trust-score/get \
  -H "Cookie: your-session-cookie"
```

## Next Steps

1. ✅ Complete setup above
2. Test the full user flow
3. Review `BACKEND_IMPLEMENTATION.md` for architecture details
4. Customize scoring weights if needed
5. Add more data sources
6. Implement score refresh logic
7. Add admin dashboard

## Support

If you encounter issues:

1. Check all console logs (browser + terminal)
2. Verify environment variables
3. Test with `DEMO_MODE=true`
4. Check Supabase connection
5. Verify Gemini API key

## Success Indicators

You'll know it's working when:

- ✅ User can sign up and log in
- ✅ Upload page shows and accepts data
- ✅ Analyzing page shows progress
- ✅ Score page displays trust score
- ✅ Dashboard shows dynamic data
- ✅ Console shows `[Gemini] Successfully generated trust score`
- ✅ Database has entries in all tables

## Judge Demo Script

1. "Let me show you our AI-powered trust scoring system"
2. Sign up with demo account
3. "We're now analyzing financial behavior patterns"
4. Show analyzing page with real-time progress
5. "Here's the trust score generated by Gemini AI"
6. Show score breakdown with explanations
7. "Every score is explainable and based on deterministic features"
8. Show dashboard with dynamic data
9. "The system works without traditional credit history"

**Key Message:** "We use deterministic financial signals combined with an AI reasoning layer to generate an explainable Trust Score, without relying on traditional credit history."

Good luck! 🚀
