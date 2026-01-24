# Grok API Setup Guide

## ✅ What's Been Fixed

1. **Dashboard now shows zeros** when no score exists
2. **Grok API support added** as alternative to Gemini
3. **User can see dashboard** even without uploading data

## 🤖 How to Use Grok API

### Step 1: Get Your Grok API Key

1. Go to: https://console.x.ai/
2. Sign up / Log in
3. Create an API key
4. Copy the key

### Step 2: Add to Environment

Open `.env.local` and add your Grok API key:

```env
# Replace this line:
GROK_API_KEY=your-grok-api-key-here

# With your actual key:
GROK_API_KEY=xai-abc123...your-actual-key
```

### Step 3: Set AI Provider

Make sure this line is set to `grok`:

```env
AI_PROVIDER=grok
```

### Step 4: Disable Demo Mode

```env
DEMO_MODE=false
```

### Step 5: Restart Server

```bash
# Stop the server (Ctrl+C)
# Start again:
npm run dev
```

## 🎯 Your Complete .env.local Should Look Like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pbidmecmucjclntpuwju.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Gemini AI (optional - not used if AI_PROVIDER=grok)
GEMINI_API_KEY=AIza...

# Grok AI (your key here)
GROK_API_KEY=xai-your-actual-key-here

# Set to 'grok' to use Grok, or 'gemini' to use Gemini
AI_PROVIDER=grok

# Set to false to use AI
DEMO_MODE=false
```

## 🔄 Switching Between AI Providers

### To Use Grok:
```env
AI_PROVIDER=grok
GROK_API_KEY=your-grok-key
DEMO_MODE=false
```

### To Use Gemini:
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
DEMO_MODE=false
```

### To Use Fallback (No AI):
```env
DEMO_MODE=true
```

## 📊 Dashboard Behavior

### Before Uploading Data:
- Shows score as **0**
- Shows "No Score Yet"
- Shows "Get Started" button
- Shows "--" for interest rate
- Shows "Upload data to see eligibility"

### After Uploading Data:
- Shows actual trust score (300-900)
- Shows score breakdown
- Shows loan eligibility range
- Shows interest rate
- Shows score history

## ✅ Testing

1. **Sign up** with new account
2. **Go to dashboard** - should show zeros
3. **Click "Get Started"** or go to `/upload`
4. **Click "Analyze My Data"**
5. **Check console** for:
   ```
   [Grok] Calling Grok API for trust score generation
   [Grok] Successfully generated trust score: 742
   ```
6. **View score** on score page
7. **Go back to dashboard** - should show actual numbers

## 🐛 Troubleshooting

### If Grok API Fails:
- Check API key is correct
- Check you have API credits
- System will automatically fall back to deterministic scoring
- Console will show: `[Grok] Falling back to deterministic scoring`

### If Dashboard Shows Error:
- Make sure you ran the database schema
- Make sure you're logged in
- Try refreshing the page

### If Score is Always 0:
- Make sure you went through the upload flow
- Check console for calculation errors
- Try with `DEMO_MODE=true` first to test

## 🎤 For Judges

You can say:
- "We support multiple AI providers - Gemini and Grok"
- "The system has automatic fallback if AI fails"
- "Dashboard shows zeros until user uploads data"
- "Everything is dynamic and backend-driven"

## 📝 Console Logs to Watch

With Grok:
```
[AI] Using Grok provider
[Grok] Calling Grok API for trust score generation
[Grok] Raw response: {...}
[Grok] Successfully generated trust score: 742
```

With Gemini:
```
[AI] Using Gemini provider
[Gemini] Calling Gemini API for trust score generation
[Gemini] Successfully generated trust score: 742
```

With Fallback:
```
[Fallback] Generating deterministic trust score
```

## 🚀 You're All Set!

The system now:
- ✅ Shows dashboard with zeros before upload
- ✅ Supports Grok API
- ✅ Supports Gemini API
- ✅ Has deterministic fallback
- ✅ Never crashes

Just add your Grok API key and you're ready to demo!
