# Rate Limit Error - Complete Solutions Guide

## What's Happening?

Supabase has built-in rate limiting to prevent abuse:
- **Email signups**: 3-4 attempts per hour per IP/email
- **Password logins**: 5-10 attempts per hour per IP
- **Email OTP**: 3 attempts per hour

When you hit this limit, you see: "Rate limit exceeded" or "Too many requests"

## Immediate Solutions (Choose One)

### Solution 1: Use Different Email (Fastest - 30 seconds)

Try these email variations:

**If you have Gmail:**
```
yourname+1@gmail.com
yourname+2@gmail.com
yourname+test@gmail.com
yourname+demo@gmail.com
```
All go to the same inbox, but Supabase treats them as different users!

**Or use different emails:**
```
test1@example.com
test2@example.com
demo@satix.com
```

### Solution 2: Wait 1 Hour
The rate limit automatically resets after 1 hour. Come back later!

### Solution 3: Update Supabase Settings (2 minutes - Permanent Fix)

1. Go to: https://supabase.com/dashboard/project/pbidmecmucjclntpuwju
2. Click: **Authentication** → **Rate Limits**
3. Update these settings:

| Setting | Change To |
|---------|-----------|
| Email signups per hour | 100 |
| Password attempts per hour | 100 |
| Email OTP per hour | 100 |
| SMS OTP per hour | 100 |

4. Click: **Save**
5. Wait 1-2 minutes for changes to apply

### Solution 4: Clear Rate Limit via SQL (Advanced)

1. Go to Supabase SQL Editor
2. Run this query:

```sql
-- Clear all rate limits older than 1 hour
DELETE FROM auth.rate_limits 
WHERE created_at < NOW() - INTERVAL '1 hour';

-- Or clear ALL rate limits (use carefully!)
TRUNCATE auth.rate_limits;
```

3. Try signing up again

## Better Error Messages Added

The app now shows helpful tips when you hit rate limits:

**Before:**
```
Rate limit exceeded
```

**After:**
```
Too many signup attempts. Please try again in 1 hour or use a different email address.

💡 Quick fixes:
• Try a different email address
• Wait 1 hour and try again
• Use Gmail+ trick: yourname+1@gmail.com
```

## For Development

### Recommended Settings:
```
Email signups per hour: 100
Password attempts per hour: 100
Email OTP per hour: 100
```

This allows you to test freely without hitting limits.

### Testing Strategy:
1. Use Gmail+ trick for multiple test accounts
2. Keep a list of test emails
3. Use incognito mode to test fresh sessions

## For Production

### Recommended Settings:
```
Email signups per hour: 10
Password attempts per hour: 20
Email OTP per hour: 10
```

### Additional Security:
1. **Add CAPTCHA** - Prevents bot signups
2. **IP Monitoring** - Track suspicious patterns
3. **Email Verification** - For sensitive actions
4. **Phone Verification** - For loan applications
5. **KYC Process** - Before loan approval

## Common Rate Limit Scenarios

### Scenario 1: Testing Signup Flow
**Problem:** Hit limit after 3 test signups
**Solution:** Use Gmail+ trick or increase rate limit

### Scenario 2: Demo for Judges
**Problem:** Can't create demo accounts during presentation
**Solution:** Pre-create demo accounts or increase rate limit to 100

### Scenario 3: Production Launch
**Problem:** Real users hitting rate limits
**Solution:** Set reasonable limits (10-20) + add CAPTCHA

### Scenario 4: Forgot Password Spam
**Problem:** Someone spamming password reset
**Solution:** Keep rate limits + add CAPTCHA on reset form

## Testing Without Limits

### Create Multiple Test Accounts:

```bash
# Use these emails for testing
test1@example.com
test2@example.com
test3@example.com
demo1@satix.com
demo2@satix.com

# Or Gmail+ variations
yourname+test1@gmail.com
yourname+test2@gmail.com
yourname+test3@gmail.com
```

### Pre-create Demo Accounts:

For demos, create accounts in advance:
1. Sign up with demo1@satix.com
2. Sign up with demo2@satix.com
3. Sign up with demo3@satix.com
4. Use these during presentation

## Monitoring Rate Limits

### Check Current Rate Limits (SQL):

```sql
-- See all rate limits
SELECT * FROM auth.rate_limits 
ORDER BY created_at DESC 
LIMIT 10;

-- Count rate limits by IP
SELECT ip_address, COUNT(*) as attempts
FROM auth.rate_limits
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
ORDER BY attempts DESC;
```

### Clear Specific IP:

```sql
-- Clear rate limits for specific IP
DELETE FROM auth.rate_limits 
WHERE ip_address = 'YOUR_IP_HERE';
```

## Prevention Tips

### For Development:
1. ✅ Set high rate limits (100/hour)
2. ✅ Use Gmail+ trick for testing
3. ✅ Pre-create demo accounts
4. ✅ Test in incognito mode

### For Production:
1. ✅ Set reasonable limits (10-20/hour)
2. ✅ Add CAPTCHA on signup
3. ✅ Monitor for abuse patterns
4. ✅ Add phone verification for loans
5. ✅ Implement KYC before disbursement

## Quick Reference

| Issue | Solution | Time |
|-------|----------|------|
| Hit rate limit | Use different email | 30 sec |
| Testing signup | Use Gmail+ trick | 30 sec |
| Permanent fix | Update Supabase settings | 2 min |
| Clear limits | Run SQL query | 1 min |
| Wait it out | Come back in 1 hour | 60 min |

## Support

If you're still having issues:

1. **Check Supabase Status**: https://status.supabase.com
2. **Verify Settings**: Authentication → Rate Limits
3. **Check SQL**: Query auth.rate_limits table
4. **Contact Support**: Supabase dashboard → Support

## Summary

✅ **Immediate Fix**: Use different email (Gmail+ trick)
✅ **Permanent Fix**: Update Supabase rate limit settings
✅ **Better UX**: App now shows helpful error messages
✅ **For Production**: Keep reasonable limits + add CAPTCHA

---

**Action Required**: Update Supabase rate limit settings (2 minutes)
**Alternative**: Use different email or wait 1 hour
**Status**: Error handling improved ✓
