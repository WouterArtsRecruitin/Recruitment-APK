// Google Sheets API Configuration
// BELANGRIJK: Voor productie gebruik, verplaats deze naar environment variabelen
// en gebruik een server-side proxy om credentials te beschermen

const CONFIG = {
    // Google Sheets API - deze credentials moeten NIET in productie gebruikt worden
    // Maak een backend API endpoint die deze credentials beschermt
    googleSheets: {
        apiKey: 'AIzaSyAekeml5hJviLRGhnHQaXRuWm1l2x4DnkM', // TODO: Verplaats naar backend
        clientId: '1065495130882-nualmgg1t2ot16ogfu1dajkg7j4ufu6q.apps.googleusercontent.com', // TODO: Verplaats naar backend
        discoveryDoc: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
        spreadsheetId: '1EP_rT6Wd5ch68wZAgCuqSR0bAl_7oZGOEP25LY6dnPQ',
        sheetName: 'FlowMaster Assessments'
    },

    // Site configuratie
    site: {
        name: 'FlowMaster Pro V4',
        url: 'https://recruitmentapk.nl',
        supportEmail: 'info@recruitmentapk.nl',
        calendlyUrl: 'https://calendly.com/wouter-arts-/recruitment-apk-advies',
        phone: '+31 (0)12 345 6789',  // UPDATE met echt Recruitin telefoonnummer
        whatsapp: '+31612345678'       // UPDATE met echt WhatsApp nummer
    },

    // Admin email detectie
    adminEmails: [
        'warts@',
        'wouter@',
        'recruitin.nl'
    ],

    // Feature flags
    features: {
        googleSheetsEnabled: true,
        emailNotifications: true,
        csvDownload: true,
        adminDashboard: true
    }
};

// Freeze config om wijzigingen te voorkomen
Object.freeze(CONFIG);
Object.freeze(CONFIG.googleSheets);
Object.freeze(CONFIG.site);
Object.freeze(CONFIG.features);
