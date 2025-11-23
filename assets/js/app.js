/**
 * FlowMaster Pro V4 - Main Application
 * Recruitment Assessment Platform
 * Version: 2.0
 */

'use strict';

// ========================================
// Global State Management
// ========================================

let currentStep = 1;
let formData = {
    companyName: '',
    contactName: '',
    mobilePhone: '',
    companySize: '',
    sector: '',
    privacyAccepted: false,
    totalScore: 0,
    answers: {},
    currentQuestion: 1
};

let gapi;
let googleAuth;
let sheetsInitialized = false;

// ========================================
// Assessment Questions Data
// ========================================

const assessmentQuestions = [
    {
        id: 1,
        question: "Hoe vaak evalueert jullie organisatie het recruitment proces?",
        options: [
            { text: "Nooit - we doen altijd hetzelfde", points: 0 },
            { text: "Jaarlijks tijdens evaluaties", points: 3 },
            { text: "Per kwartaal systematisch", points: 7 },
            { text: "Maandelijks met data-analyse", points: 10 }
        ]
    },
    {
        id: 2,
        question: "Beschikt jullie organisatie over een gestructureerd onboarding programma?",
        options: [
            { text: "Geen onboarding - mensen zoeken het zelf uit", points: 0 },
            { text: "Basis introductie van 1-2 dagen", points: 3 },
            { text: "Gestructureerd 2-4 weken programma", points: 7 },
            { text: "Volledig gepersonaliseerd 90-dagen traject", points: 10 }
        ]
    },
    {
        id: 3,
        question: "Hoe meet jullie organisatie de effectiviteit van recruitment?",
        options: [
            { text: "Helemaal niet - geen metingen", points: 0 },
            { text: "Basis statistieken (aantal hires)", points: 3 },
            { text: "KPI dashboard (TTH, CPH, kwaliteit)", points: 7 },
            { text: "Advanced analytics met predictive insights", points: 10 }
        ]
    },
    {
        id: 4,
        question: "Welke moderne recruitment tools gebruikt jullie organisatie?",
        options: [
            { text: "Alleen traditionele methoden (advertenties)", points: 0 },
            { text: "Basis job boards (Indeed, LinkedIn)", points: 3 },
            { text: "ATS systeem + professional tools", points: 7 },
            { text: "AI-powered recruitment suite + automation", points: 10 }
        ]
    },
    {
        id: 5,
        question: "Hoe is de samenwerking tussen HR en hiring managers?",
        options: [
            { text: "Minimale communicatie - ieder doet zijn ding", points: 0 },
            { text: "Ad-hoc contact bij vacatures", points: 3 },
            { text: "Reguliere meetings en afstemming", points: 7 },
            { text: "Strategische partnership met gedeelde KPIs", points: 10 }
        ]
    },
    {
        id: 6,
        question: "Hoe lang duurt jullie gemiddelde recruitment proces?",
        options: [
            { text: "Meer dan 3 maanden", points: 0 },
            { text: "2-3 maanden", points: 3 },
            { text: "1-2 maanden", points: 7 },
            { text: "Minder dan 1 maand", points: 10 }
        ]
    },
    {
        id: 7,
        question: "Heeft jullie organisatie een duidelijke employer branding strategie?",
        options: [
            { text: "Geen strategie - we hopen dat mensen ons vinden", points: 0 },
            { text: "Basis company profile op LinkedIn", points: 3 },
            { text: "Actieve employer branding campagnes", points: 7 },
            { text: "Award-winning employer brand met meetbare impact", points: 10 }
        ]
    },
    {
        id: 8,
        question: "Hoe goed zijn jullie recruitment processen gedocumenteerd?",
        options: [
            { text: "Niet gedocumenteerd - kennis in hoofden", points: 0 },
            { text: "Basis procedures op papier", points: 3 },
            { text: "Gedetailleerde handleidingen en workflows", points: 7 },
            { text: "Volledig geautomatiseerd met process flows", points: 10 }
        ]
    },
    {
        id: 9,
        question: "Welk percentage van jullie vacatures wordt intern vervuld?",
        options: [
            { text: "0-10% - we kijken nauwelijks intern", points: 0 },
            { text: "10-25% - soms promoveren we intern", points: 3 },
            { text: "25-40% - goede interne mobiliteit", points: 7 },
            { text: "40%+ - excellent interne development", points: 10 }
        ]
    },
    {
        id: 10,
        question: "Hoe vaak trainen jullie hiring managers in interview technieken?",
        options: [
            { text: "Nooit - ze doen het op gevoel", points: 0 },
            { text: "Bij aanstelling een keer", points: 3 },
            { text: "Jaarlijks refresh trainingen", points: 7 },
            { text: "Voortdurende ontwikkeling met coaching", points: 10 }
        ]
    },
    {
        id: 11,
        question: "Gebruikt jullie organisatie data-driven recruitment decisions?",
        options: [
            { text: "Alleen op gevoel en intuïtie", points: 0 },
            { text: "Basis rapportage achteraf", points: 3 },
            { text: "Data-informed beslissingen met dashboards", points: 7 },
            { text: "Volledig data-driven met predictive analytics", points: 10 }
        ]
    },
    {
        id: 12,
        question: "Hoe proactief is jullie talent acquisition strategie?",
        options: [
            { text: "Alleen reactief - vacature -> zoeken", points: 0 },
            { text: "Occasioneel proactief sourcing", points: 3 },
            { text: "Strategisch proactief met talent pools", points: 7 },
            { text: "Continue talent pipeline building", points: 10 }
        ]
    },
    {
        id: 13,
        question: "Welke diversiteit & inclusie maatregelen zijn er in recruitment?",
        options: [
            { text: "Geen specifieke maatregelen", points: 0 },
            { text: "Basis awareness en goede intenties", points: 3 },
            { text: "Actieve D&I strategie met doelen", points: 7 },
            { text: "Geavanceerde D&I programma's met meetbare impact", points: 10 }
        ]
    },
    {
        id: 14,
        question: "Hoe snel kunnen jullie reageren op urgente recruitment behoeften?",
        options: [
            { text: "Weken tot maanden - traag proces", points: 0 },
            { text: "1-2 weken met extra inspanning", points: 3 },
            { text: "Binnen een week georganiseerd", points: 7 },
            { text: "Binnen 24-48 uur actief", points: 10 }
        ]
    },
    {
        id: 15,
        question: "Hoe goed is de candidate experience in jullie proces?",
        options: [
            { text: "Geen focus op experience", points: 0 },
            { text: "Basis communicatie en feedback", points: 3 },
            { text: "Gestructureerde experience journey", points: 7 },
            { text: "Premium candidate journey met NPS tracking", points: 10 }
        ]
    },
    {
        id: 16,
        question: "Welke recruitment marketing strategieën gebruikt jullie organisatie?",
        options: [
            { text: "Geen specifieke marketing", points: 0 },
            { text: "Basic job postings op boards", points: 3 },
            { text: "Multi-channel approach met content", points: 7 },
            { text: "Geavanceerde recruitment marketing met ROI tracking", points: 10 }
        ]
    },
    {
        id: 17,
        question: "Hoe effectief is jullie employee referral programma?",
        options: [
            { text: "Geen referral programma", points: 0 },
            { text: "Informeel referral systeem", points: 3 },
            { text: "Gestructureerd referral programma met incentives", points: 7 },
            { text: "High-performance referral systeem (>30% hires)", points: 10 }
        ]
    },
    {
        id: 18,
        question: "Hoe goed wordt de cultural fit geëvalueerd tijdens recruitment?",
        options: [
            { text: "Geen culture fit evaluatie", points: 0 },
            { text: "Basis gesprek over waarden", points: 3 },
            { text: "Gestructureerde culture fit assessment", points: 7 },
            { text: "Geavanceerde culture matching met tools", points: 10 }
        ]
    },
    {
        id: 19,
        question: "Welke technologie wordt gebruikt voor candidate screening?",
        options: [
            { text: "Handmatige screening van CV's", points: 0 },
            { text: "Basic filtering tools", points: 3 },
            { text: "Automated screening software", points: 7 },
            { text: "AI-powered screening platform met bias detection", points: 10 }
        ]
    },
    {
        id: 20,
        question: "Hoe wordt feedback verzameld van kandidaten na het proces?",
        options: [
            { text: "Geen feedback verzameling", points: 0 },
            { text: "Occasionele feedback vragen", points: 3 },
            { text: "Systematische feedback surveys", points: 7 },
            { text: "Real-time feedback en analytics met actieplannen", points: 10 }
        ]
    },
    {
        id: 21,
        question: "Hoe effectief is de talent pool management?",
        options: [
            { text: "Geen talent pool - altijd opnieuw zoeken", points: 0 },
            { text: "Basic contact database", points: 3 },
            { text: "Georganiseerde talent pool met segmentatie", points: 7 },
            { text: "Dynamic talent community met engagement", points: 10 }
        ]
    },
    {
        id: 22,
        question: "Welke assessment methoden worden gebruikt voor skills evaluatie?",
        options: [
            { text: "Alleen interview gesprekken", points: 0 },
            { text: "Basic skills vragen tijdens interview", points: 3 },
            { text: "Gestructureerde competentie tests", points: 7 },
            { text: "Geavanceerde assessment center met simulations", points: 10 }
        ]
    },
    {
        id: 23,
        question: "Hoe wordt de recruitment ROI gemeten en geoptimaliseerd?",
        options: [
            { text: "Geen ROI tracking", points: 0 },
            { text: "Basic cost-per-hire berekeningen", points: 3 },
            { text: "Uitgebreide ROI analytics per channel", points: 7 },
            { text: "Predictive ROI optimization met business impact", points: 10 }
        ]
    },
    {
        id: 24,
        question: "Hoe goed is de communicatie met kandidaten tijdens het proces?",
        options: [
            { text: "Minimale communicatie", points: 0 },
            { text: "Standard status updates", points: 3 },
            { text: "Proactieve communicatie met timelines", points: 7 },
            { text: "Personalized candidate journey met real-time updates", points: 10 }
        ]
    },
    {
        id: 25,
        question: "Welke social media strategieën worden gebruikt voor recruitment?",
        options: [
            { text: "Geen social media gebruik", points: 0 },
            { text: "Basic LinkedIn posting", points: 3 },
            { text: "Multi-platform social recruiting", points: 7 },
            { text: "Advanced social media recruitment met influencer strategy", points: 10 }
        ]
    },
    {
        id: 26,
        question: "Hoe effectief is de salary benchmarking en compensation strategy?",
        options: [
            { text: "Geen benchmarking - gissing", points: 0 },
            { text: "Basis markt onderzoek per jaar", points: 3 },
            { text: "Regelmatige benchmarking met tools", points: 7 },
            { text: "Dynamic compensation intelligence met real-time data", points: 10 }
        ]
    },
    {
        id: 27,
        question: "Welke video interviewing en remote assessment tools worden gebruikt?",
        options: [
            { text: "Alleen face-to-face interviews", points: 0 },
            { text: "Basic video calling (Teams/Zoom)", points: 3 },
            { text: "Professionele video interview platform", points: 7 },
            { text: "AI-enhanced video assessment met analysis", points: 10 }
        ]
    },
    {
        id: 28,
        question: "Hoe goed wordt er samengewerkt met external recruitment partners?",
        options: [
            { text: "Geen externe partners", points: 0 },
            { text: "Ad-hoc recruitment bureaus", points: 3 },
            { text: "Strategische partnerships met SLA's", points: 7 },
            { text: "Integrated recruitment ecosystem met data sharing", points: 10 }
        ]
    },
    {
        id: 29,
        question: "Welke continuous improvement processen zijn er voor recruitment?",
        options: [
            { text: "Geen improvement proces", points: 0 },
            { text: "Jaarlijkse review en aanpassingen", points: 3 },
            { text: "Kwartaal optimalisaties met data", points: 7 },
            { text: "Continuous optimization cycle met innovation lab", points: 10 }
        ]
    }
];

// Continue in volgende deel...
