# 🚀 Vercel Deployment Guide - Recruitment APK

Complete deployment guide voor de Recruitment APK applicatie op Vercel.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Setup](#project-setup)
3. [Environment Variables](#environment-variables)
4. [Deployment Configuration](#deployment-configuration)
5. [Analytics Setup](#analytics-setup)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### Option 1: Deploy via Vercel Dashboard

1. **Login** to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Click** "Add New Project"
3. **Import** your Git repository (GitHub/GitLab/Bitbucket)
4. **Configure** project settings:
   - Framework Preset: `Other` (statische site) of `Vite` (React app)
   - Build Command: (leeg voor statisch) of `npm run build` (React)
   - Output Directory: (leeg voor statisch) of `dist` (React)
5. **Add** Environment Variables (zie sectie hieronder)
6. **Deploy** 🚀

### Option 2: Deploy via Vercel CLI

```bash
# Installeer Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy naar preview
vercel

# Deploy naar production
vercel --prod
```

---

## 🔧 Project Setup

### 1. Installeer Dependencies (voor React versie)

```bash
# Core dependencies
npm install react react-dom

# UI & Animations
npm install motion lucide-react clsx tailwind-merge

# Analytics
npm install @vercel/analytics @vercel/speed-insights

# Dev dependencies
npm install -D @vitejs/plugin-react vite typescript @types/react @types/react-dom
```

### 2. Vercel Configuration Files

Het project bevat al de benodigde configuratiebestanden:

- ✅ `vercel.json` - Deployment configuratie
- ✅ `.vercelignore` - Files om te negeren
- ✅ `.env.example` - Environment variables template

### 3. Create Local Environment File

```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local  # of je favoriete editor
```

---

## 🔐 Environment Variables

### Required Variables

Voeg deze toe in Vercel Dashboard → Project Settings → Environment Variables:

#### Typeform
```env
VITE_TYPEFORM_ID=01KARGCADMYDCG24PA4FWVKZJ2
```

#### Google Analytics 4
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Facebook Pixel (optioneel)
```env
VITE_FB_PIXEL_ID=your_pixel_id_here
VITE_ENABLE_FB_PIXEL=true
```

#### Feature Flags
```env
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_PROOF=true
NODE_ENV=production
```

#### API Configuration (voor PHP backend)
```env
PIPEDRIVE_API_TOKEN=your_token_here
PIPEDRIVE_API_URL=https://api.pipedrive.com/v1

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@recruitin.nl
SMTP_PASSWORD=your_password_here
SMTP_FROM=info@recruitin.nl
SMTP_TO=info@recruitin.nl
```

### Environment Variable Scopes

In Vercel Dashboard kun je per variable instellen voor welke omgeving deze geldt:

- ✅ **Production** - Live website (recruitmentapk.nl)
- ✅ **Preview** - Pull request previews
- ✅ **Development** - Local development via `vercel dev`

**Aanbeveling:**
- Gebruik verschillende GA IDs voor production vs preview
- Disable FB Pixel in preview/development
- Gebruik test API keys in non-production

---

## ⚙️ Deployment Configuration

### vercel.json Explained

```json
{
  "version": 2,
  "name": "recruitment-apk",

  // Build configuratie
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"  // Voor statische HTML
    },
    {
      "src": "api/**/*.php",
      "use": "vercel-php@0.6.0"  // Voor PHP API routes
    }
  ],

  // Routing rules
  "routes": [
    // API routes
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },

    // Legacy PHP redirect
    {
      "src": "/submit_assessment.php",
      "dest": "/api/submit_assessment.php"
    },

    // Static assets met caching
    {
      "src": "/(.*\\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot))$",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "dest": "/$1"
    },

    // HTML routes zonder extensie
    {
      "src": "/(privacy|thank-you|index)",
      "dest": "/$1.html"
    }
  ],

  // Security headers
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],

  "cleanUrls": true,  // /about instead of /about.html
  "trailingSlash": false  // /about not /about/
}
```

### PHP API Routes

PHP bestanden in `/api/` worden automatisch serverless functions:

```
/submit_assessment.php  →  /api/submit_assessment.php
```

**Vercel PHP Runtime:**
- PHP 8.2 (default)
- Serverless execution
- Automatic scaling
- Cold start optimized

---

## 📊 Analytics Setup

### 1. Vercel Analytics (Automatic)

```typescript
// src/App.tsx of src/main.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

**Features:**
- ✅ Real-time traffic analytics
- ✅ Audience insights
- ✅ Top pages tracking
- ✅ Custom events (coming soon)

### 2. Google Analytics 4

**Automatisch geïnitialiseerd via** `AnalyticsProvider` component:

```typescript
import { AnalyticsProvider } from './components/AnalyticsProvider';

function App() {
  return (
    <AnalyticsProvider>
      <Assessment />
    </AnalyticsProvider>
  );
}
```

**Tracked Events:**
- ✅ Page views
- ✅ Assessment started
- ✅ Assessment completed
- ✅ Assessment abandoned
- ✅ Contact clicks
- ✅ Typeform interactions
- ✅ Errors

### 3. Facebook Pixel

**Automatisch geïnitialiseerd** wanneer `VITE_FB_PIXEL_ID` is ingesteld.

**Standard Events:**
- `PageView` - Page load
- `InitiateCheckout` - Assessment started
- `CompleteRegistration` - Assessment completed
- `Contact` - Contact link clicked

**Custom Events:**
- `AssessmentStarted`
- `AssessmentCompleted`
- `AssessmentAbandoned`
- `CTAClicked`

### 4. Custom Event Tracking

```typescript
import { trackEvent } from './lib/analytics';

// Custom event
trackEvent({
  action: 'button_click',
  category: 'engagement',
  label: 'hero_cta',
  value: 1
});
```

---

## ⚡ Performance Optimization

### 1. Edge Network Configuration

Vercel gebruikt automatisch hun **Edge Network** voor:
- ✅ Statische assets (HTML, CSS, JS, images)
- ✅ Serverless functions (regionale deployment)
- ✅ Smart caching

### 2. Caching Strategy

```json
// In vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Cache Durations:**
- Static assets: 1 jaar (immutable)
- HTML: No cache (always fresh)
- API responses: Custom per endpoint

### 3. Image Optimization

Gebruik Vercel Image Optimization:

```typescript
// Voor React
import Image from 'next/image';  // Als je Next.js gebruikt

// Voor statische site
// Add to vercel.json:
{
  "images": {
    "domains": ["recruitmentapk.nl"],
    "formats": ["image/avif", "image/webp"]
  }
}
```

### 4. Bundle Size Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'animations': ['motion'],
          'icons': ['lucide-react'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
});
```

### 5. Performance Monitoring

In Vercel Dashboard → Analytics → Speed Insights:

**Core Web Vitals:**
- ✅ LCP (Largest Contentful Paint)
- ✅ FID (First Input Delay)
- ✅ CLS (Cumulative Layout Shift)
- ✅ TTFB (Time to First Byte)

**Target Scores:**
- LCP: < 2.5s ✅
- FID: < 100ms ✅
- CLS: < 0.1 ✅

---

## 🌐 Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to **Project Settings** → **Domains**
2. **Add** `recruitmentapk.nl`
3. **Add** `www.recruitmentapk.nl`

### 2. DNS Configuration

Bij je domain provider (TransIP, Cloudflare, etc.):

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Verification:**
```bash
# Check DNS propagation
dig recruitmentapk.nl
dig www.recruitmentapk.nl
```

### 3. SSL Certificate

Vercel genereert **automatisch** een gratis SSL certificaat:
- ✅ Let's Encrypt
- ✅ Auto-renewal
- ✅ Wildcard support

---

## 🔄 Deployment Workflow

### Automatic Deployments

**Production (main branch):**
```
git push origin main
→ Vercel detects push
→ Builds automatically
→ Deploys to recruitmentapk.nl
```

**Preview (feature branches):**
```
git push origin feature/new-design
→ Creates preview deployment
→ Unique URL: recruitment-apk-xyz.vercel.app
→ Comment in PR with preview link
```

### Manual Deployment

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Deployment with specific env
vercel --prod --env VITE_TYPEFORM_ID=xxx
```

---

## 🐛 Troubleshooting

### Issue: "Build Failed"

**Oplossing:**
```bash
# Check build logs in Vercel Dashboard
# Test locally:
npm run build

# Common issues:
# 1. Missing dependencies
npm install

# 2. TypeScript errors
npm run type-check

# 3. Environment variables
# Check if all required vars are set in Vercel
```

### Issue: "Typeform Not Loading"

**Oplossing:**
1. Check `VITE_TYPEFORM_ID` in environment variables
2. Check browser console for errors
3. Disable ad blockers (they might block Typeform)
4. Check Typeform dashboard if form is published

### Issue: "Analytics Not Working"

**Oplossing:**
```typescript
// Enable debug mode
// Add to .env.local:
NODE_ENV=development

// Check browser console for analytics events
// Should see: [GA4], [FB Pixel], [Analytics] logs
```

### Issue: "PHP API Not Working"

**Oplossing:**
1. Check if file is in `/api/` directory
2. Check Vercel Function logs in Dashboard
3. Verify `vercel-php` version in `vercel.json`
4. Test endpoint: `curl https://yourdomain.com/api/submit_assessment.php`

### Issue: "Images Not Loading"

**Oplossing:**
```bash
# Check paths are correct
# In Vercel, paths are relative to project root
# ✅ /assets/images/logo.png
# ❌ ../assets/images/logo.png

# For Figma imports, make sure file exists locally
```

### Issue: "Environment Variables Not Available"

**Oplossing:**
1. Variables must start with `VITE_` to be exposed to client
2. Restart dev server after changing .env
3. In Vercel, check variable scopes (Production/Preview/Development)
4. Re-deploy after adding variables

---

## 📈 Monitoring & Logs

### 1. Real-time Logs

```bash
# Stream production logs
vercel logs --follow

# Stream specific deployment
vercel logs deployment-url --follow
```

### 2. Vercel Dashboard

**Analytics Tab:**
- Traffic overview
- Top pages
- Visitor locations
- Device breakdown

**Deployments Tab:**
- Build logs
- Function logs
- Deployment history
- Rollback options

**Speed Insights:**
- Core Web Vitals
- Performance scores
- Page-by-page analysis

### 3. Error Tracking

```typescript
// src/lib/analytics.ts
export const trackError = (error: string, fatal: boolean) => {
  // Logged in Vercel Function logs
  console.error('[Error]', error);

  // Sent to Google Analytics
  trackEvent({
    action: 'error',
    category: 'technical',
    label: error,
    value: fatal ? 1 : 0,
  });
};
```

---

## 🎯 Best Practices

### 1. Branch Strategy

```
main (production) ← Auto-deploy to recruitmentapk.nl
  ├── develop (staging) ← Preview deployments
  └── feature/* ← Preview deployments
```

### 2. Environment Strategy

```
Production → Real analytics, real API keys
Preview → Test analytics, test API keys
Development → Debug mode, mock data
```

### 3. Testing Before Deploy

```bash
# 1. Test build locally
npm run build
npm run preview

# 2. Test with Vercel CLI locally
vercel dev

# 3. Create preview deployment
vercel

# 4. Test preview URL thoroughly

# 5. Deploy to production
vercel --prod
```

### 4. Rollback Strategy

```bash
# Option 1: Instant rollback in Dashboard
# Go to Deployments → Click previous deployment → Promote to Production

# Option 2: CLI
vercel rollback

# Option 3: Git revert
git revert HEAD
git push
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel PHP Runtime](https://github.com/vercel-community/php)
- [Analytics Documentation](https://vercel.com/docs/analytics)
- [Speed Insights Documentation](https://vercel.com/docs/speed-insights)

---

## ✅ Deployment Checklist

Gebruik deze checklist voordat je naar production deployt:

### Pre-Deployment
- [ ] Alle environment variables ingesteld
- [ ] Build test lokaal succesvol
- [ ] TypeScript errors opgelost
- [ ] Accessibility getest
- [ ] Analytics getest (GA4 + FB Pixel)
- [ ] Typeform werkt correct
- [ ] Contact links werken
- [ ] Privacy policy up-to-date

### Deployment
- [ ] Preview deployment getest
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsive testing
- [ ] Performance check (Lighthouse score > 90)
- [ ] SEO check (meta tags, structured data)

### Post-Deployment
- [ ] Production URL werkt
- [ ] SSL certificate actief
- [ ] Analytics tracking verified
- [ ] Custom domain configured
- [ ] Error tracking actief
- [ ] Speed Insights monitoring
- [ ] Backup strategy in plaats

---

## 🆘 Support

**Vercel Support:**
- Dashboard: [vercel.com/support](https://vercel.com/support)
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

**Project Specifiek:**
- Email: info@recruitin.nl
- Website: www.recruitin.nl

---

**Happy Deploying! 🚀**

*Laatste update: 2024-11-24*
