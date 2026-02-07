# MHMVP Troubleshooting Guide

## Common Issues

### Password Not Working

1. Ensure you're using: `TebeMHMVP2026!`
2. Password is case-sensitive
3. Clear browser cookies and try again
4. Try incognito/private mode

### Voice Commands Not Working

1. **Must use Chrome** - other browsers don't support Web Speech API
2. Allow microphone permissions when prompted
3. Say "Tebra" or "Hey Tebra" to activate
4. Speak clearly after the wake word

### Page Not Loading

1. Check internet connection
2. Clear browser cache
3. Try a different browser
4. Check Vercel status: https://www.vercel-status.com

### Supabase Connection Issues

1. Verify environment variables are set in Vercel
2. Check Supabase project is running
3. Verify RLS policies aren't blocking

---

## Redeploy Instructions

### Quick Redeploy (from local machine)

```bash
cd /Users/jaytrainer/Documents/Tebra/hackathon-final
npx vercel --prod --token YOUR_VERCEL_TOKEN
```

### Full Redeploy with Fresh Build

```bash
rm -rf .next node_modules
npm install
npm run build
npx vercel --prod --token YOUR_VERCEL_TOKEN
```

---

## Rollback Procedure

### Via Vercel Dashboard

1. Go to https://vercel.com/jays-projects-c0cce392/hackathon-final
2. Click "Deployments" tab
3. Find the previous working deployment
4. Click "..." menu → "Promote to Production"

### Via CLI

```bash
npx vercel rollback --token YOUR_VERCEL_TOKEN
```

---

## Environment Variables

To update env vars:

```bash
# View current vars
npx vercel env ls --token YOUR_VERCEL_TOKEN

# Update a variable
npx vercel env rm VARIABLE_NAME production --token YOUR_VERCEL_TOKEN
echo "new_value" | npx vercel env add VARIABLE_NAME production --token YOUR_VERCEL_TOKEN

# Redeploy to apply
npx vercel --prod --token YOUR_VERCEL_TOKEN
```

---

## Contact for Support

- **Developer**: Jay Trainer
- **GitHub**: https://github.com/jtrainer357/hackathon-final
- **Vercel Dashboard**: https://vercel.com/jays-projects-c0cce392/hackathon-final
