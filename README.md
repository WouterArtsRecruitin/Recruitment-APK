# FlowMaster Pro V4 - Recruitment Assessment Platform

Verbeterde en beveiligde versie van het Recruitment APK assessment platform.

## 🎯 Features

- **29 Expert Assessment Vragen** - Diepgaande analyse van recruitment maturity
- **Real-time Scoring** - Direct feedback en resultaten
- **Lead Qualification** - Automatische lead scoring en prioritering
- **Veilige Data Handling** - Server-side PHP backend met rate limiting
- **SEO Geoptimaliseerd** - Complete meta tags, structured data en Open Graph
- **Responsive Design** - Werkt op alle apparaten
- **WCAG Toegankelijk** - Voldoet aan toegankelijkheidseisen
- **Privacy Compliant** - AVG-conform met privacy policy

## 📁 Project Structuur

```
Recruitment-APK/
├── index-new.html          # Nieuwe verbeterde hoofdpagina (hernoem naar index.html)
├── privacy.html            # Privacy policy pagina
├── robots.txt              # SEO robots configuratie
├── sitemap.xml             # XML sitemap voor zoekmachines
├── .htaccess              # Apache beveiligings configuratie
├── config.js               # Configuratie (credentials apart)
│
├── api/
│   └── submit-assessment.php  # Backend API voor data verwerking
│
├── assets/
│   ├── css/
│   │   └── styles.css      # Complete stylesheet
│   ├── js/
│   │   ├── flowmaster.js   # Hoofd applicatie logic
│   │   └── questions.js    # Assessment vragen data
│   └── images/
│       └── (logo, favicon, og-image, etc.)
│
└── data/
    └── assessments.csv     # CSV backup (auto-generated)
```

## 🚀 Belangrijke Verbeteringen

### ✅ Beveiligingsverbeteringen
- API credentials verplaatst naar config.js
- Server-side PHP backend voor data handling
- Rate limiting (5 requests/uur per IP)
- Input sanitization & validatie
- Content Security Policy headers
- Privacy policy pagina toegevoegd
- .htaccess beveiligingsregels

### ✅ Code Kwaliteit
- Code gesplitst in aparte HTML, CSS en JS bestanden
- Modulaire JavaScript architectuur
- Georganiseerde bestandsstructuur
- Duidelijke comments en documentatie
- Best practices toegepast

### ✅ UX Verbeteringen
- Betere formulier validatie met foutmeldingen
- Loading states tijdens verwerking
- Error handling verbeterd
- Toegankelijkheid (ARIA labels, keyboard support)
- Responsive design geoptimaliseerd

### ✅ SEO Optimalisaties
- Complete meta tags (title, description, keywords)
- Open Graph tags voor social media
- Twitter Card tags
- Structured Data (Schema.org)
- XML sitemap
- robots.txt
- Semantische HTML

## 🚨 Deployment Checklist

Voordat je de nieuwe versie live zet:

1. **Backup maken van huidige versie**
   ```bash
   cp -r /path/to/current /path/to/backup-$(date +%Y%m%d)
   ```

2. **HERNOEM nieuwe index:**
   ```bash
   mv index-new.html index.html
   ```

3. **MAAK data directory:**
   ```bash
   mkdir -p data
   chmod 755 data
   ```

4. **MAAK assets/images directory:**
   ```bash
   mkdir -p assets/images
   # Upload logo, favicon, og-image
   ```

5. **UPDATE config.js:**
   - Pas site URL aan naar productie domein
   - Configureer Google Analytics ID
   - (Optioneel) Configureer Google Sheets credentials

6. **UPDATE api/submit-assessment.php:**
   - Pas ADMIN_EMAIL aan
   - Test email functionaliteit

7. **VERWIJDER oude bestanden:**
   - index.html (oude versie - backup eerst!)
   - app_css.css
   - app_css kopie.css
   - production_html_full (1).html
   - recruitpro_deploy_workflow kopie.html
   - submit_assessment.php (root - nieuw bestand is in /api/)

8. **TEST alles:**
   - Assessment flow compleet doorlopen
   - Formulier validatie testen
   - Email notificaties verifiëren
   - Responsive design checken
   - Browser compatibility testen

## 🔒 Beveiliging voor Productie

⚠️ **BELANGRIJK: Voor productie gebruik**

1. **Verplaats API credentials:**
   - Gebruik environment variabelen of .env bestand
   - Voeg .env toe aan .gitignore
   - Gebruik backend proxy voor Google Sheets API

2. **Configureer HTTPS:**
   - Installeer SSL certificaat (Let's Encrypt)
   - Forceer HTTPS redirect (staat in .htaccess)

3. **Review bestandspermissies:**
   ```bash
   chmod 644 *.html *.php *.js *.css
   chmod 755 api/ data/ assets/
   chmod 600 config.js  # Indien credentials erin blijven
   ```

## 📧 Email Configuratie

Email notificaties worden verzonden bij:
- Urgentie: ZEER HOOG
- Urgentie: HOOG
- Score < 60%

Update in `api/submit-assessment.php`:
```php
define('ADMIN_EMAIL', 'jouw-email@bedrijf.nl');
define('ENABLE_EMAIL_NOTIFICATIONS', true);
```

## 📊 Google Sheets (Optioneel)

Indien Google Sheets integratie nodig is:

1. Maak Google Cloud project
2. Enable Google Sheets API
3. Maak OAuth credentials
4. Update in config.js
5. Voor productie: verplaats naar backend

## 🐛 Troubleshooting

### Assessment laadt niet
- Check browser console voor JavaScript errors
- Verifieer dat alle JS bestanden laden
- Check .htaccess syntax

### Formulier werkt niet
- Verifieer input validatie
- Check PHP error logs
- Test met disabled ad-blocker

### Email wordt niet verzonden
- Check PHP mail() configuratie
- Review SMTP instellingen server
- Test mail() functie apart

## 📈 Monitoring

Aanbevolen om te monitoren:
- Conversion rate (completions)
- Drop-off rate per stap
- Average assessment score
- Email delivery rate
- Page load performance

## 📞 Contact & Support

- Website: https://recruitmentapk.nl
- Email: info@recruitmentapk.nl

## 📄 Licentie

Copyright © 2025 Recruitment APK. Alle rechten voorbehouden.

---

**Versie:** 2.0
**Laatste update:** 27 oktober 2025
**Status:** Ready for Production Deployment