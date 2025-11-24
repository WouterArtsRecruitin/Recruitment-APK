import { Helmet } from 'react-helmet-async';

/**
 * SEO Head Component
 * Comprehensive meta tags, Open Graph, Twitter Cards, and Structured Data
 */

// ============================================================================
// TYPES
// ============================================================================

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SEO = {
  title: 'Recruitment APK - Gratis Assessment | Optimaliseer je Wervingsproces',
  description:
    'Test binnen 5 minuten je recruitment proces. Ontvang binnen 24 uur een uitgebreid APK rapport met praktische adviezen en een verbeterplan. Gratis en vrijblijvend.',
  canonical: 'https://recruitmentapk.nl',
  ogImage: 'https://recruitmentapk.nl/assets/images/og-recruitment-apk.png',
  siteName: 'Recruitment APK',
  twitterHandle: '@Recruitin',
} as const;

const ORGANIZATION = {
  name: 'Recruitin',
  url: 'https://www.recruitin.nl',
  logo: 'https://recruitmentapk.nl/assets/images/logo.png',
  email: 'info@recruitin.nl',
  phone: '+31313410507',
  address: {
    streetAddress: '',
    addressLocality: 'Nederland',
    postalCode: '',
    addressCountry: 'NL',
  },
  socialProfiles: [
    'https://www.linkedin.com/company/recruitin',
    'https://www.facebook.com/recruitin',
  ],
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export function SEOHead({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  canonical = DEFAULT_SEO.canonical,
  ogImage = DEFAULT_SEO.ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
}: SEOHeadProps) {
  // JSON-LD Structured Data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.phone,
    address: {
      '@type': 'PostalAddress',
      ...ORGANIZATION.address,
    },
    sameAs: ORGANIZATION.socialProfiles,
  };

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Recruitment APK',
    description: description,
    url: canonical,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    provider: {
      '@type': 'Organization',
      name: ORGANIZATION.name,
      url: ORGANIZATION.url,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2500',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      '29 expertcriteria',
      'Binnen 5 minuten afgerond',
      'Gratis assessment',
      'Persoonlijk rapport binnen 24 uur',
      'Benchmarking met markt',
      'Praktisch verbeterplan',
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: canonical,
    inLanguage: 'nl-NL',
    isPartOf: {
      '@type': 'WebSite',
      name: DEFAULT_SEO.siteName,
      url: DEFAULT_SEO.canonical,
    },
    about: {
      '@type': 'Thing',
      name: 'Recruitment Process Optimization',
      description:
        'Tools and services for optimizing recruitment and talent acquisition processes',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: DEFAULT_SEO.canonical,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Recruitment APK',
        item: canonical,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Wat is een Recruitment APK?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Een Recruitment APK is een grondige analyse van je wervingsproces, vergelijkbaar met een APK-keuring voor je auto. We toetsen 29 criteria om te bepalen hoe goed je recruitment proces functioneert en waar verbeteringen mogelijk zijn.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hoe lang duurt het assessment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Het assessment duurt slechts 5 minuten om in te vullen. Je ontvangt binnen 24 uur een uitgebreid rapport met persoonlijke adviezen en een concreet verbeterplan.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is het Recruitment APK gratis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, het Recruitment APK assessment is volledig gratis en vrijblijvend. Je krijgt direct waardevolle inzichten in je wervingsproces zonder kosten of verplichtingen.',
        },
      },
      {
        '@type': 'Question',
        name: 'Voor wie is dit assessment geschikt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Het Recruitment APK is geschikt voor alle bedrijven die werven: van MKB tot grootbedrijf, van 10 tot 1000+ medewerkers. Of je nu 2 of 200 mensen per jaar aanneemt, je krijgt relevante inzichten.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wat krijg ik na het assessment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Je ontvangt een uitgebreid APK rapport met: (1) Score op 29 recruitment criteria, (2) Benchmarking tegen de markt, (3) Sterke en zwakke punten analyse, (4) Praktische verbeteradviezen, (5) Prioriteitenplan voor optimalisatie.',
        },
      },
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Language & Locale */}
      <html lang="nl" />
      <meta httpEquiv="content-language" content="nl-NL" />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow" />
          <meta name="bingbot" content="index, follow" />
        </>
      )}

      {/* Keywords */}
      <meta
        name="keywords"
        content="recruitment assessment, recruitment APK, werving keuring, recruitment optimalisatie, talent acquisition, HR assessment, wervingsproces verbeteren, recruitment benchmark, gratis recruitment test, Recruitin"
      />

      {/* Author & Publisher */}
      <meta name="author" content="Recruitin" />
      <meta name="publisher" content="Recruitin" />
      <link rel="author" href="https://www.recruitin.nl" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Recruitment APK - Optimaliseer je Wervingsproces" />
      <meta property="og:locale" content="nl_NL" />
      <meta property="og:site_name" content={DEFAULT_SEO.siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Recruitment APK - Optimaliseer je Wervingsproces" />
      <meta name="twitter:site" content={DEFAULT_SEO.twitterHandle} />
      <meta name="twitter:creator" content={DEFAULT_SEO.twitterHandle} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#0f172a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Recruitment APK" />
      <meta name="application-name" content="Recruitment APK" />
      <meta name="msapplication-TileColor" content="#f97316" />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://connect.facebook.net" />
      <link rel="preconnect" href="https://embed.typeform.com" />
      <link rel="dns-prefetch" href="https://embed.typeform.com" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(webApplicationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
import { SEOHead } from './components/SEOHead';

function App() {
  return (
    <>
      <SEOHead />
      <YourApp />
    </>
  );
}

// Custom page
function ThankYouPage() {
  return (
    <>
      <SEOHead
        title="Bedankt! | Recruitment APK"
        description="Je assessment is ontvangen. We sturen binnen 24 uur je persoonlijke rapport."
        canonical="https://recruitmentapk.nl/thank-you"
        noindex={true}
      />
      <ThankYouContent />
    </>
  );
}
*/
