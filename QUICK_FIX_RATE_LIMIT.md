# Rate Limit Error - Quick Fix (30 Seconds)

## The Error
```
❌ Rate limit exceeded
❌ Too many signup attempts
❌ Too many requests
```

## Fastest Fix (30 seconds)

### Use Gmail+ Trick

If your email is: `yourname@gmail.com`

Try these instead:
```
✅ yourname+1@gmail.com
✅ yourname+2@gmail.com
✅ yourname+test@gmail.com
✅ yourname+demo@gmail.com
```

**All emails go to the same inbox!** But Supabase treats them as different users.

### Or Use Different Emails
```
✅ test1@example.com
✅ test2@example.com
✅ demo@satix.com
```

## Permanent Fix (2 minutes)

### Update Supabase Settings:

1. **Go to:** https://supabase.com/dashboard/project/pbidmecmucjclntpuwju

2. **Click:** Authentication → Rate Limits

3. **Change these:**
   - Email signups per hour: **100** (was 3)
   - Password attempts per hour: **100** (was 5)
   - Email OTP per hour: **100** (was 3)

4. **Click:** Save

5. **Wait:** 1-2 minutes

6. **Try again!**

## Alternative: Wait 1 Hour

The rate limit resets automatically after 1 hour.

## Now Try Again

```bash
npm run dev
```

Go to http://localhost:3000/login and sign up with a different email!

---

**Recommended:** Update Supabase settings for permanent fix
**Quick workaround:** Use Gmail+ trick or different email
