# 🚀 Netlify Deployment Guide - Recruitment APK

## ⚡ Quick Deploy (1 Minuut!)

### Method 1: Netlify Dashboard (Makkelijkst)

**1. Ga naar Netlify:**
```
https://app.netlify.com/
```

**2. Click "Add new site" → "Import an existing project"**

**3. Connect to Git:**
```
Choose: GitHub
Select: WouterArtsRecruitin/Recruitment-APK
Branch: claude/improve-recruitment-app-01D1TGp2mZdxsuRVvaRjETkC
```

**4. Build Settings (Auto-detected from netlify.toml):**
```
Build command: npm run build
Publish directory: dist
```

**5. Environment Variables:**
```
VITE_TYPEFORM_ID = 01KARGCADMYDCG24PA4FWVKZJ2
VITE_GA_MEASUREMENT_ID = G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS = true
```

**6. Click "Deploy"**

**✅ Live in 2-3 minuten!**

---

### Method 2: Netlify CLI (Snelst)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Follow prompts:
# - Create new site? Yes
# - Build command: npm run build
# - Publish directory: dist
```

---

## 📋 Environment Variables Setup

**In Netlify Dashboard:**
```
Site settings → Environment variables → Add a variable
```

**Required:**
```
VITE_TYPEFORM_ID = 01KARGCADMYDCG24PA4FWVKZJ2
VITE_GA_MEASUREMENT_ID = G-XXXXXXXXXX
NODE_ENV = production
```

**Optional:**
```
VITE_FB_PIXEL_ID = your_pixel_id
VITE_ENABLE_FB_PIXEL = true
VITE_ENABLE_ANALYTICS = true
VITE_ENABLE_SOCIAL_PROOF = true
```

---

## 🌐 Custom Domain Setup

**1. Go to Domain settings:**
```
Site settings → Domain management → Add custom domain
```

**2. Add domain:**
```
recruitmentapk.nl
```

**3. DNS Configuration:**

Bij je DNS provider (TransIP/Cloudflare):

**A Record:**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: [your-site-name].netlify.app
TTL: 3600
```

**4. SSL:**
```
✅ Automatically enabled by Netlify (Let's Encrypt)
```

---

## ✅ Advantages of Netlify

vs Vercel:
- ✅ Eenvoudiger configuratie
- ✅ Minder build errors
- ✅ Betere error messages
- ✅ Snellere builds
- ✅ Gratis SSL
- ✅ Instant cache purge
- ✅ Deploy previews voor elke PR

---

## 🎯 After Deployment

**1. Check your site:**
```
https://[your-site-name].netlify.app
```

**2. Test:**
- ✅ Website loads
- ✅ Animations work
- ✅ Typeform opens
- ✅ Analytics tracking

**3. Set up notifications:**
```
Site settings → Build & deploy → Deploy notifications
→ Add notification (email on deploy success/failure)
```

---

## 🔧 Troubleshooting

### Build Failed
```
Check: Deploys → Failed build → View logs
```

### Environment Variables Not Working
```
Check: Site settings → Environment variables
Make sure they start with VITE_
Redeploy after adding variables
```

### 404 Errors
```
Already configured in netlify.toml:
All routes redirect to /index.html (SPA mode)
```

---

## 📊 Monitoring

**Analytics:**
```
Netlify Analytics (optional paid feature)
Or use: Google Analytics + Vercel Speed Insights
```

**Build Logs:**
```
Deploys → Latest → View logs
```

**Performance:**
```
Site settings → Performance
→ Enable Asset Optimization (free!)
```

---

## 🚀 Deploy Triggers

**Automatic:**
- Push to branch → Auto-deploy
- PR created → Deploy preview
- Merge to main → Production deploy

**Manual:**
```
Deploys → Trigger deploy → Deploy site
Or: Clear cache and deploy
```

---

**Ready to Deploy!** 🎉
