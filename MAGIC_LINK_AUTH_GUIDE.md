# Magic Link Authentication - Setup Guide

## Overview
The app now uses magic link email confirmation for signup. Users receive an email with a confirmation link that redirects them to the onboarding flow.

## How It Works

### User Flow:

1. **User Signs Up**
   - Enters email and password
   - Clicks "Create Account"
   - Sees success message: "Please check your email for confirmation link"

2. **User Checks Email**
   - Opens email inbox
   - Finds email from Satix/Supabase
   - Clicks confirmation link

3. **Email Link Redirects**
   - Link goes to: `/api/auth/callback?code=...`
   - Callback exchanges code for session
   - User is redirected to `/consent` (onboarding)

4. **User Continues**
   - Completes onboarding
   - Uploads data
   - Gets trust score

## Success Message

When user signs up, they see:

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

## Supabase Configuration

### 1. Enable Email Confirmation

1. Go to: https://supabase.com/dashboard/project/pbidmecmucjclntpuwju
2. Click: **Authentication** → **Providers** → **Email**
3. Ensure: **"Confirm email"** is **ON** ✓
4. Click: **Save**

### 2. Set Redirect URLs

1. Go to: **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (dev) or your production URL
3. Add **Redirect URLs**:
   - `http://localhost:3000/api/auth/callback`
   - `https://yourdomain.com/api/auth/callback` (production)
4. Click: **Save**

### 3. Customize Email Template (Optional)

1. Go to: **Authentication** → **Email Templates**
2. Select: **Confirm signup**
3. Customize the email content
4. Use variables: `{{ .ConfirmationURL }}`, `{{ .Email }}`
5. Click: **Save**

## Code Implementation

### 1. Signup Function (`lib/auth/actions.ts`)

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
  }
})
```

### 2. Auth Callback (`app/api/auth/callback/route.ts`)

```typescript
// Exchange code for session
const { error } = await supabase.auth.exchangeCodeForSession(code)

// Redirect to onboarding
return NextResponse.redirect(`${requestUrl.origin}/consent`)
```

### 3. Login Page (`app/login/page.tsx`)

Shows clear instructions to check email after signup.

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Testing

### Test Signup Flow:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Sign up:**
   - Go to http://localhost:3000/login
   - Click "Sign Up"
   - Enter email and password
   - Click "Create Account"

3. **Check email:**
   - Open your email inbox
   - Look for email from Supabase
   - Subject: "Confirm your signup"

4. **Click link:**
   - Click the confirmation link in email
   - Should redirect to `/consent` (onboarding)
   - You're now logged in!

5. **Complete flow:**
   - Accept permissions on consent page
   - Upload data
   - Get trust score

## Troubleshooting

### Issue: Not receiving emails

**Solutions:**
1. Check spam/junk folder
2. Verify email provider allows Supabase emails
3. Check Supabase email settings
4. Try different email address
5. Check Supabase logs for email delivery status

### Issue: "Email link is invalid or has expired"

**Solutions:**
1. Links expire after 1 hour - request new signup
2. Don't click the link multiple times
3. Make sure you're using the latest email
4. Clear browser cache and try again

### Issue: Redirects to wrong URL

**Solutions:**
1. Check `NEXT_PUBLIC_SITE_URL` in `.env.local`
2. Verify redirect URLs in Supabase dashboard
3. Restart dev server after changing env vars

### Issue: "Email not confirmed" error on signin

**Solutions:**
1. User must click confirmation link first
2. Check if email was sent
3. Resend confirmation email
4. Or manually confirm in Supabase dashboard

## Manual Email Confirmation (For Testing)

If you need to confirm users manually:

```sql
-- Confirm specific user
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'user@example.com';

-- Confirm all users
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;
```

## Production Considerations

### 1. Custom Email Domain
- Set up custom SMTP in Supabase
- Use your own domain for emails
- Improves deliverability and trust

### 2. Email Templates
- Customize email design
- Add your branding
- Include helpful instructions
- Add support contact info

### 3. Rate Limiting
- Keep reasonable limits (10-20/hour)
- Prevents abuse
- Add CAPTCHA for extra security

### 4. Monitoring
- Track email delivery rates
- Monitor bounce rates
- Check spam complaints
- Set up alerts for issues

## User Experience Tips

### 1. Clear Instructions
✅ Tell users to check email
✅ Mention spam folder
✅ Show which email address
✅ Explain next steps

### 2. Resend Option
Add a "Resend confirmation email" button for users who didn't receive it.

### 3. Email Preview
Show a preview of what the email looks like so users know what to look for.

### 4. Status Indicator
Show "Waiting for email confirmation..." status on login page.

## Security Benefits

✅ **Email Ownership Verified** - Ensures user owns the email
✅ **Prevents Fake Accounts** - Can't use fake emails
✅ **Reduces Spam** - Bots can't easily create accounts
✅ **Audit Trail** - Know when users confirmed
✅ **Compliance** - Meets regulatory requirements

## Summary

✅ **Magic link authentication enabled**
✅ **Clear email check instructions shown**
✅ **Callback route handles confirmation**
✅ **Redirects to onboarding after confirmation**
✅ **Better user experience with helpful messages**

---

**Status**: Magic link auth configured ✓
**User Flow**: Signup → Check Email → Click Link → Onboarding
**Next Step**: Test the complete flow
