# Authentication - Final Setup

## ✅ What's Configured

**Magic Link Email Confirmation**
- Users sign up with email/password
- Receive confirmation email
- Click link to verify and start onboarding

## User Journey

```
1. Visit /login
2. Click "Sign Up"
3. Enter email + password
4. Click "Create Account"
5. See message: "Check your email for confirmation link"
6. Open email inbox
7. Click confirmation link
8. → Redirected to /consent (onboarding)
9. Complete onboarding
10. Upload data and get trust score
```

## Success Message Shown

After signup, users see:

```
✅ Account created! Please check your email (user@example.com) 
   for a confirmation link to complete signup.

📧 Next Steps:
1. Open your email inbox
2. Look for an email from Satix
3. Click the confirmation link
4. You'll be redirected to start onboarding

💡 Tip: Check your spam folder if you don't see it
```

## Supabase Setup Required (2 minutes)

### Step 1: Enable Email Confirmation
1. Go to: https://supabase.com/dashboard/project/pbidmecmucjclntpuwju
2. Click: **Authentication** → **Providers** → **Email**
3. Ensure: **"Confirm email"** is **ON** ✓
4. Save

### Step 2: Set Redirect URLs
1. Go to: **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Add **Redirect URLs**: `http://localhost:3000/api/auth/callback`
4. Save

## Files Updated

1. ✅ `lib/auth/actions.ts` - Added email confirmation
2. ✅ `app/api/auth/callback/route.ts` - Recreated callback handler
3. ✅ `app/login/page.tsx` - Added email check instructions
4. ✅ `.env.local` - Added NEXT_PUBLIC_SITE_URL

## Test It

```bash
npm run dev
```

1. Go to http://localhost:3000/login
2. Sign up with your email
3. Check your inbox for confirmation email
4. Click the link
5. Should redirect to /consent

## For Production

Update `.env.local` (or production env):
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

And add to Supabase redirect URLs:
```
https://yourdomain.com/api/auth/callback
```

## Troubleshooting

**Not receiving emails?**
- Check spam folder
- Verify Supabase email settings
- Try different email provider

**Link expired?**
- Links expire after 1 hour
- Sign up again to get new link

**Rate limit error?**
- Wait 1 hour
- Or use different email
- Or increase rate limits in Supabase

---

**Status**: ✅ Magic link auth configured
**Action Required**: Update Supabase settings (2 minutes)
**Ready to Test**: Yes!
