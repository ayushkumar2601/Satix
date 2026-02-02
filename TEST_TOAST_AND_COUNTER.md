# Test Toast Notifications & Animated Counters

## Quick Test (2 minutes)

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test Toast Notifications

#### Test Signup Success:
1. Go to http://localhost:3000/login
2. Click "Sign Up"
3. Enter email and password
4. Click "Create Account"
5. ✅ Should see green toast: "Account created successfully!"

#### Test Login Error:
1. Go to http://localhost:3000/login
2. Enter wrong password
3. Click "Sign In"
4. ❌ Should see red toast: "Invalid email or password..."

#### Test Score Calculation:
1. Complete signup and upload data
2. Go to analyzing page
3. ✅ Should see green toast: "Trust Score Calculated!"

### 3. Test Animated Counters

#### Test Score Page:
1. Go to http://localhost:3000/score
2. Watch the trust score number
3. ✅ Should animate from 0 → your score (e.g., 764)
4. ✅ Should take 2 seconds
5. ✅ Should be smooth

#### Test Dashboard:
1. Go to http://localhost:3000/dashboard
2. Watch the trust score number
3. ✅ Should animate from 0 → your score
4. ✅ Should be smooth and engaging

## What to Look For

### Toast Notifications:
- ✅ Appears in top-right corner
- ✅ Has colored background (green/red)
- ✅ Has close button (×)
- ✅ Auto-dismisses after 4 seconds
- ✅ Smooth slide-in animation
- ✅ Can stack multiple toasts

### Animated Counters:
- ✅ Starts from 0
- ✅ Counts up smoothly
- ✅ Ends at correct value
- ✅ Takes ~2 seconds
- ✅ Smooth easing (not linear)
- ✅ No flickering

## Expected Results

### Login Page:
```
✅ Signup → Green toast
❌ Wrong password → Red toast
❌ Rate limit → Red toast with tips
```

### Analyzing Page:
```
✅ Success → Green toast with score
❌ Error → Red toast with fallback message
```

### Score Page:
```
Trust Score: 0 → 152 → 384 → 576 → 712 → 764
(smooth animation over 2 seconds)
```

### Dashboard:
```
Trust Score: 0 → 152 → 384 → 576 → 712 → 764
(smooth animation over 2 seconds)
```

## Troubleshooting

### Toast not showing?
- Check browser console for errors
- Verify Toaster is in layout.tsx
- Check if sonner is installed

### Counter not animating?
- Check if useCounter hook is imported
- Verify score value is not 0
- Check browser console for errors

### Animation too fast/slow?
- Adjust duration in useCounter(score, 2000)
- Try 1000 (1s) or 3000 (3s)

## Demo Script

**For Judges:**

1. **Show Toast Notifications:**
   - "Notice how every action gives clear feedback"
   - Try wrong password → Red toast appears
   - "Users always know what's happening"

2. **Show Animated Counters:**
   - Navigate to score page
   - "Watch the score count up smoothly"
   - "This makes the experience more engaging"
   - "Numbers feel more impactful"

3. **Highlight Polish:**
   - "These small details make a big difference"
   - "Professional, modern user experience"
   - "Better than static displays"

---

**Status**: Ready to test!
**Time**: 2 minutes
**Expected**: All features working perfectly ✓
