# 🚀 Implementation Guide - Verbeterde Assessment Component

## 📋 Overzicht

Deze guide helpt je bij het implementeren van de verbeterde Assessment component in je Recruitment APK applicatie.

---

## 📁 Bestandsstructuur

```
src/
├── components/
│   ├── Assessment.tsx              # Main assessment component (NIEUW)
│   ├── SocialProofToast.tsx       # Social proof notifications (NIEUW)
│   └── ui/
│       └── button.tsx              # Reusable button component (NIEUW)
├── lib/
│   └── utils.ts                    # Utility functions (NIEUW)
└── assets/
    └── images/
        └── logo.png                # Recruitin logo (BESTAAND)
```

---

## ⚙️ Installatie & Setup

### 1. Installeer Dependencies

```bash
npm install motion lucide-react clsx tailwind-merge
# of
yarn add motion lucide-react clsx tailwind-merge
# of
pnpm add motion lucide-react clsx tailwind-merge
```

**Package uitleg:**
- `motion` - Framer Motion voor animaties (v11+)
- `lucide-react` - Modern icon library
- `clsx` - Conditional className utility
- `tailwind-merge` - Merge Tailwind classes intelligently

### 2. TypeScript Configuration

Zorg dat `tsconfig.json` correct is ingesteld:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Vite Configuration (voor path aliases)

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 4. Tailwind CSS Configuration

Zorg dat Tailwind correct is geconfigureerd in `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Recruitin brand colors
        orange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
      },
    },
  },
  plugins: [],
}
```

---

## 🎯 Component Usage

### Basic Implementation

```typescript
// src/App.tsx
import { Assessment } from './components/Assessment';

function App() {
  return <Assessment />;
}

export default App;
```

### With Error Boundary

```typescript
// src/App.tsx
import { Assessment } from './components/Assessment';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl text-white mb-4">Er is iets misgegaan</h1>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg"
            >
              Vernieuwen
            </button>
          </div>
        </div>
      }
    >
      <Assessment />
    </ErrorBoundary>
  );
}

export default App;
```

---

## 🔧 Configuratie Opties

### Typeform ID Aanpassen

Update de constant in `Assessment.tsx`:

```typescript
const TYPEFORM_ID = "JOU_TYPEFORM_ID_HIER";
```

### Contact Informatie Aanpassen

Update `CONTACT_INFO` in `Assessment.tsx`:

```typescript
const CONTACT_INFO = {
  website: "jouw-website.nl",
  email: "info@jouwbedrijf.nl",
  phone: "+31 XX XXX XXXX",
  websiteUrl: "https://jouw-website.nl"
} as const;
```

### Animatie Timing Aanpassen

Update `ANIMATION_CONFIG`:

```typescript
const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  duration: 1.2 // Slower animations
} as const;
```

### Social Proof Messages Aanpassen

Update `SOCIAL_PROOF_MESSAGES` in `SocialProofToast.tsx`:

```typescript
const SOCIAL_PROOF_MESSAGES: SocialProofMessage[] = [
  {
    id: '1',
    icon: <Users className="w-5 h-5 text-orange-400" />,
    text: 'Jouw custom bericht',
    subtext: 'Timing info'
  },
  // ... meer berichten
];
```

---

## 🎨 Styling Aanpassingen

### Kleuren Aanpassen

Vervang alle `orange-` classes met je eigen brand kleuren:

```typescript
// Bijvoorbeeld: Verander naar blauw
className="bg-orange-500" → className="bg-blue-500"
className="text-orange-400" → className="text-blue-400"
```

Of update de Tailwind config voor globale kleuren:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
      },
    },
  },
}

// Dan gebruik je: bg-primary-500
```

### Font Aanpassen

```typescript
// Voeg Google Fonts toe in index.html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

// Update Tailwind config
theme: {
  extend: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
  },
}
```

---

## 📊 Analytics Integratie

### Google Analytics

```typescript
// src/components/Assessment.tsx

// Voeg toe aan handleStart
const handleStart = useCallback(() => {
  // Track assessment start
  if (typeof gtag !== 'undefined') {
    gtag('event', 'assessment_started', {
      event_category: 'engagement',
      event_label: 'recruitment_apk',
      value: 1
    });
  }
  setCurrentStep('assessment');
}, []);

// Voeg toe aan handleClose
const handleClose = useCallback(() => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'assessment_closed', {
      event_category: 'engagement',
      event_label: 'recruitment_apk'
    });
  }
  setCurrentStep('welcome');
}, []);
```

### Typeform Events Tracking

```typescript
// Voeg toe aan Assessment.tsx

useEffect(() => {
  if (currentStep !== 'assessment') return;

  const handleTypeformEvent = (event: MessageEvent) => {
    // Check if message is from Typeform
    if (!event.data || typeof event.data !== 'object') return;

    switch (event.data.type) {
      case 'form-ready':
        console.log('Typeform loaded');
        if (typeof gtag !== 'undefined') {
          gtag('event', 'typeform_loaded', {
            event_category: 'technical',
          });
        }
        break;

      case 'form-submit':
        console.log('Form submitted');
        if (typeof gtag !== 'undefined') {
          gtag('event', 'assessment_completed', {
            event_category: 'conversion',
            event_label: 'recruitment_apk',
            value: 1
          });
        }
        // Optional: Redirect to thank you page
        setTimeout(() => {
          window.location.href = '/thank-you.html';
        }, 1000);
        break;

      case 'form-screen-changed':
        console.log('Screen changed:', event.data);
        break;
    }
  };

  window.addEventListener('message', handleTypeformEvent);
  return () => window.removeEventListener('message', handleTypeformEvent);
}, [currentStep]);
```

---

## 🧪 Testing

### Unit Tests

```typescript
// src/components/__tests__/Assessment.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Assessment } from '../Assessment';

describe('Assessment Component', () => {
  it('renders welcome screen by default', () => {
    render(<Assessment />);
    expect(screen.getByText(/Recruitment APK/i)).toBeInTheDocument();
  });

  it('shows assessment when clicking Start de Audit', () => {
    render(<Assessment />);
    const startButton = screen.getByText(/Start de Audit/i);
    fireEvent.click(startButton);
    expect(screen.getByText(/Sluiten/i)).toBeInTheDocument();
  });

  it('shows loading state when loading Typeform', () => {
    render(<Assessment />);
    const startButton = screen.getByText(/Start de Audit/i);
    fireEvent.click(startButton);
    expect(screen.getByText(/wordt geladen/i)).toBeInTheDocument();
  });
});
```

### Accessibility Tests

```typescript
// src/components/__tests__/Assessment.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Assessment } from '../Assessment';

expect.extend(toHaveNoViolations);

describe('Assessment Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Assessment />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env.production`:

```env
VITE_TYPEFORM_ID=01KARGCADMYDCG24PA4FWVKZJ2
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_API_ENDPOINT=https://api.recruitmentapk.nl
```

Update code to use env vars:

```typescript
const TYPEFORM_ID = import.meta.env.VITE_TYPEFORM_ID || "01KARGCADMYDCG24PA4FWVKZJ2";
```

### Performance Optimization

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
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
  },
});
```

---

## 🐛 Troubleshooting

### Typeform niet geladen

**Probleem**: Typeform embed wordt niet getoond

**Oplossingen**:
1. Check of TYPEFORM_ID correct is
2. Controleer browser console voor errors
3. Controleer netwerk tab voor script loading
4. Test in incognito mode (ad blockers kunnen Typeform blokkeren)

### TypeScript errors bij import

**Probleem**: `Cannot find module '@/...'`

**Oplossing**: Check `tsconfig.json` en `vite.config.ts` path aliases

### Animaties werken niet

**Probleem**: Framer Motion animaties niet smooth

**Oplossing**:
```bash
# Zorg dat je motion v11+ hebt
npm install motion@latest
```

### Logo wordt niet geladen

**Probleem**: Figma asset niet beschikbaar

**Oplossing**: Vervang met lokale logo:
```typescript
import logo from "../assets/images/logo.png";
```

---

## 📚 Referenties

- [Framer Motion Docs](https://motion.dev/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Typeform Embed SDK](https://developer.typeform.com/embed/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## 📞 Support

Voor vragen of problemen:
- Email: info@recruitin.nl
- Website: www.recruitin.nl
- Tel: +31 313 410 507

---

**Gemaakt met ❤️ door Recruitin**
