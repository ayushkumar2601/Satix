# Rate Limit Error - Quick Fix

## The Problem
Supabase has default rate limits for authentication:
- **Email signups**: 3-4 per hour per email/IP
- **Password attempts**: 5-10 per hour per IP

## Quick Fix (2 Minutes)

### Option 1: Disable Rate Limiting in Supabase (Recommended for Development)

1. Go to: https://supabase.com/dashboard/project/pbidmecmucjclntpuwju
2. Click: **Authentication** → **Rate Limits**
3. Find these settings and increase them:
   - **Email signups per hour**: Change from 3 to **100**
   - **Password attempts per hour**: Change from 5 to **100**
   - **Email OTP per hour**: Change from 3 to **100**
4. Click: **Save**

### Option 2: Wait 1 Hour
The rate limit will reset automatically after 1 hour.

### Option 3: Use Different Email
Try signing up with a different email address:
- test1@example.com
- test2@example.com
- yourname+test@gmail.com (Gmail ignores +anything)

### Option 4: Clear Rate Limit (SQL)

Run this in Supabase SQL Editor:

```sql
-- Clear rate limit for your IP/email
-- This resets the counter
DELETE FROM auth.rate_limits 
WHERE created_at < NOW() - INTERVAL '1 hour';
```

## Permanent Solution

### Update Supabase Rate Limits:

1. **Authentication → Rate Limits**
2. Set these values:

| Setting | Default | Recommended (Dev) | Recommended (Prod) |
|---------|---------|-------------------|-------------------|
| Email signups/hour | 3 | 100 | 10 |
| Password attempts/hour | 5 | 100 | 20 |
| Email OTP/hour | 3 | 100 | 10 |
| SMS OTP/hour | 3 | 100 | 10 |

### For Production:
Keep rate limits reasonable but not too strict:
- Email signups: 10 per hour
- Password attempts: 20 per hour
- Add CAPTCHA for additional protection

## Testing Without Rate Limits

### Use Different Emails:
```
test1@example.com
test2@example.com
test3@example.com
demo1@satix.com
demo2@satix.com
```

### Use Gmail Plus Trick:
If your email is `yourname@gmail.com`, you can use:
```
yourname+1@gmail.com
yourname+2@gmail.com
yourname+test@gmail.com
yourname+demo@gmail.com
```
All emails go to the same inbox, but Supabase treats them as different users.

## Error Handling Added

The app now shows a better error message when rate limit is hit.

## Quick Test

After updating Supabase settings:

```bash
npm run dev
```

Try signing up again - should work now!

---

**Action Required**: Update Supabase rate limit settings (2 minutes)
**Alternative**: Wait 1 hour or use different email
