import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Calendar, Share2, BarChart3, Target, Clock, DollarSign, TrendingUp, Award, Zap, Users, Brain, Star } from 'lucide-react';
import './App.css';

const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    text: "In welke sector is jouw bedrijf actief?",
    help: "Dit helpt ons om je te benchmarken tegen soortgelijke bedrijven in jouw branche en specifieke sector insights te geven.",
    options: [
      "🏗️ Bouw & Constructie",
      "⚡ Installatietechniek (W/E/Klimaat)",
      "🔧 Metaalbewerking & Industrie",
      "⚙️ Machinebouw & Equipment",
      "💻 High-tech & Elektronica",
      "📋 Andere technische sector"
    ]
  },
  {
    id: 2,
    text: "Hoeveel medewerkers heeft jouw bedrijf?",
    help: "De bedrijfsgrootte bepaalt welke recruitment strategieën en benchmarks het meest relevant zijn.",
    options: [
      "👤 1-25 medewerkers (micro bedrijf)",
      "👥 25-50 medewerkers (klein bedrijf)",
      "🏢 50-100 medewerkers (middelgroot)",
      "🏭 100-250 medewerkers (groot MKB)",
      "🌐 250+ medewerkers (enterprise)",
      "📊 Wisselend door groei/seizoen"
    ]
  },
  {
    id: 3,
    text: "Hoeveel nieuwe mensen neem je gemiddeld per jaar aan?",
    help: "Dit volume bepaalt welke recruitment processen en tools voor jou het meest effectief zijn.",
    options: [
      "👤 Minder dan 5 per jaar",
      "👥 5-15 per jaar",
      "👥👥 15-30 per jaar", 
      "🏢 30-50 per jaar",
      "🏭 50+ per jaar",
      "📊 Zeer wisselend per periode"
    ]
  },
  {
    id: 4,
    text: "Wat is jouw grootste uitdaging bij recruitment?",
    help: "Je primaire uitdaging bepaalt welke oplossingen we voorstellen en hoe we je advies prioriteren.",
    options: [
      "😤 We vinden te weinig geschikte kandidaten",
      "⏰ Het duurt veel te lang om posities in te vullen",
      "💸 Recruitment kost ons te veel geld",
      "🏆 Concurrenten pakken de beste kandidaten weg",
      "❌ We trekken niet de juiste mensen aan",
      "🌪️ Ons hele proces is chaotisch en inefficiënt"
    ]
  },
  {
    id: 5,
    text: "Hoe lang duurt het gemiddeld van vacature tot eerste werkdag?",
    help: "Time-to-hire is een cruciale metric voor recruitment efficiency en kandidaat experience.",
    options: [
      "⚡ Minder dan 30 dagen",
      "😊 30-45 dagen",
      "😐 45-60 dagen",
      "😕 60-75 dagen",
      "🐌 75-90 dagen",
      "⏰ Meer dan 90 dagen"
    ]
  },
  {
    id: 6,
    text: "Hoe vaak vind je binnen de gewenste tijd de juiste persoon?",
    help: "Success rate toont de effectiviteit van je huidige recruitment aanpak en proces kwaliteit.",
    options: [
      "🏆 Bijna altijd (90%+) - we zijn zeer succesvol",
      "😊 Meestal wel (70-90%) - redelijk effectief",
      "😐 Ongeveer de helft (50-70%) - wisselend succes",
      "😕 Regelmatig niet (30-50%) - vaak problemen",
      "😤 Zelden (minder dan 30%) - structurele uitdagingen",
      "🤷 We meten dit niet systematisch"
    ]
  },
  {
    id: 7,
    text: "Wat kost het jou gemiddeld om één nieuwe medewerker aan te nemen?",
    help: "Cost-per-hire inclusief alle kosten: advertenties, tijd, bureaus, assessments, etc.",
    options: [
      "💪 Minder dan €3.000",
      "😊 €3.000 - €6.000",
      "😐 €6.000 - €10.000",
      "😕 €10.000 - €15.000",
      "💸 €15.000 - €25.000",
      "🔥 Meer dan €25.000"
    ]
  },
  {
    id: 8,
    text: "Hoe tevreden ben je met de kwaliteit van nieuwe hires?",
    help: "Quality of hire meet hoe goed nieuwe medewerkers presteren na 6-12 maanden.",
    options: [
      "🌟 Uitstekend - overtreffen verwachtingen",
      "😊 Goed - voldoen aan verwachtingen",
      "😐 Wisselend - sommigen wel, anderen niet",
      "😕 Teleurstellend - vaak onder verwachting",
      "😤 Problematisch - veel vertrek/mismatch",
      "🤷 We evalueren dit niet structureel"
    ]
  },
  {
    id: 9,
    text: "Waar vind je momenteel je beste kandidaten?",
    help: "Source of hire analysis - welk kanaal levert je de meest succesvolle medewerkers op?",
    options: [
      "💼 LinkedIn (actief sourcing)",
      "📋 Vacaturesites (Indeed, Monsterboard)",
      "🏢 Wervingsbureaus en headhunters",
      "👥 Eigen netwerk en referrals",
      "🌐 Eigen website en carrièrepagina",
      "📱 Social media en andere kanalen"
    ]
  },
  {
    id: 10,
    text: "Welke recruitment tools en systemen gebruik je?",
    help: "Technology stack bepaalt je efficiency en mogelijkheden voor data-driven recruitment.",
    options: [
      "🚀 Professioneel ATS met integraties",
      "📊 Basis ATS of recruitment software",
      "📧 Hoofdzakelijk Excel en email",
      "🔀 Mix van verschillende tools",
      "📝 Voornamelijk handmatig/papier",
      "🤷 Weet niet precies wat we gebruiken"
    ]
  },
  {
    id: 11,
    text: "Hoe belangrijk is employer branding voor jouw organisatie?",
    help: "Employer branding impact op candidate attraction, quality en acceptance rates.",
    options: [
      "🌟 Zeer belangrijk - we investeren er actief in",
      "👍 Belangrijk - we doen er wel wat aan",
      "😐 Matig belangrijk - weinig aandacht voor",
      "❓ Niet prioriteit - andere dingen gaan voor",
      "💭 Geen idee wat dit precies inhoudt",
      "🤔 Willen er meer mee doen"
    ]
  },
  {
    id: 12,
    text: "Hoeveel kost een verkeerde aanname je ongeveer?",
    help: "Total cost of bad hire: werving, training, verloren productiviteit, impact op team, etc.",
    options: [
      "💰 €5.000 - €15.000",
      "💸 €15.000 - €30.000",
      "🔥 €30.000 - €50.000",
      "💥 €50.000 - €75.000",
      "🚨 Meer dan €75.000",
      "❓ Hebben we nooit uitgerekend"
    ]
  },
  {
    id: 13,
    text: "Hoe meet je het succes van je recruitment activiteiten?",
    help: "Data-driven recruitment: welke KPI's track je om je recruitment performance te optimaliseren?",
    options: [
      "📊 Uitgebreide dashboard met alle KPI's",
      "📈 Basis metrics (tijd, kosten, volume)",
      "📝 Sporadische metingen en rapportages",
      "👀 Vooral op gevoel en anekdotes",
      "❌ Meten we eigenlijk niet",
      "🔄 Willen dit gaan implementeren"
    ]
  },
  {
    id: 14,
    text: "Wat is je grootste personeelszorg voor de komende 2 jaar?",
    help: "Strategic workforce planning: welke trends en uitdagingen zie je aankomen?",
    options: [
      "👴 Vergrijzing en pensionering van ervaren mensen",
      "🎓 Tekort aan vakbekwame mensen in onze sector",
      "📈 Groei bijhouden met voldoende gekwalificeerd personeel",
      "🔄 Hoge uitstroom en retentie problemen",
      "💰 Stijgende loonkosten en budgetdruk",
      "🌍 Combinatie van alle bovenstaande factoren"
    ]
  },
  {
    id: 15,
    text: "Hoe concurrerend is de arbeidsmarkt in jouw sector/regio?",
    help: "Market conditions bepalen welke recruitment strategieën en employer branding tactieken effectief zijn.",
    options: [
      "🔥 Extreem competitief - oorlog om talent",
      "⚡ Behoorlijk lastig - veel concurrentie",
      "⚖️ Gemiddeld - normale marktomstandigheden",
      "👍 Redelijk gunstig - kunnen goed selecteren",
      "😌 Ruime keuze - kandidaten solliciteren bij ons",
      "🤷 Weet niet hoe we er tegenover staan"
    ]
  },
  {
    id: 16,
    text: "Hoe aantrekkelijk is jullie organisatie als werkgever?",
    help: "Employer attractiveness: hoe positioneer je jezelf ten opzichte van directe concurrenten?",
    options: [
      "🏆 Veel aantrekkelijker - eerste keus voor kandidaten",
      "😊 Aantrekkelijker - winnen vaak van concurrenten",
      "😐 Vergelijkbaar - ongeveer gelijk niveau",
      "😕 Minder aantrekkelijk - verliezen vaak kandidaten",
      "😤 Veel minder - zijn vaak tweede of derde keus",
      "🤷 Geen idee hoe we ervoor staan in de markt"
    ]
  },
  {
    id: 17,
    text: "Hoe georganiseerd is jullie recruitment proces?",
    help: "Process maturity: van ad-hoc naar gestructureerd en geoptimaliseerd recruitment proces.",
    options: [
      "🚀 Volledig gestroomlijnd met duidelijke workflows",
      "📊 Gestructureerd proces maar kan efficiënter",
      "📋 Basis structuur aanwezig maar inconsistent",
      "🔥 Reactief - reageren op wat er binnenkomt",
      "🌪️ Chaotisch - iedereen doet maar wat",
      "🔄 Bezig met proces verbetering en standaardisatie"
    ]
  },
  {
    id: 18,
    text: "Hoe urgent is verbetering van je recruitment?",
    help: "Urgency level bepaalt de implementatie snelheid en resource allocatie voor verbeteringen.",
    options: [
      "🚨 Crisis - moet direct aangepakt worden",
      "⚡ Zeer urgent - binnen 1 maand resultaat nodig",
      "📅 Urgent - binnen 3 maanden verbetering",
      "📆 Belangrijk - binnen 6 maanden aanpakken",
      "💡 Nice to have - komend jaar oppakken",
      "😌 Geen directe haast - toekomstvoorbereiding"
    ]
  },
  {
    id: 19,
    text: "Zou je open staan voor professionele recruitment ondersteuning?",
    help: "Investment readiness: bereidheid om te investeren in recruitment optimalisatie en externe expertise.",
    options: [
      "💪 Ja, we willen alles zelf leren en implementeren",
      "🤝 Ja, met begeleiding en training van ons team",
      "⚖️ Afhankelijk van de kosten en verwachte ROI",
      "🔍 Eerst meer informatie en concrete business case",
      "❌ Nee, we lossen het intern op",
      "🤷 Weet nog niet, hangt van verschillende factoren af"
    ]
  }
];

const INDUSTRY_BENCHMARKS = {
  0: { name: 'Bouw & Constructie', avgTTH: 42, avgCPH: 8500, avgSuccessRate: 65 },
  1: { name: 'Installatietechniek', avgTTH: 38, avgCPH: 7200, avgSuccessRate: 70 },
  2: { name: 'Metaalbewerking', avgTTH: 45, avgCPH: 9200, avgSuccessRate: 62 },
  3: { name: 'Machinebouw', avgTTH: 52, avgCPH: 11500, avgSuccessRate: 58 },
  4: { name: 'High-tech', avgTTH: 55, avgCPH: 15800, avgSuccessRate: 55 },
  5: { name: 'Technische Sector', avgTTH: 48, avgCPH: 10200, avgSuccessRate: 60 }
};

function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [leadData, setLeadData] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [notification, setNotification] = useState<any>(null);

  const showNotification = (title: string, message: string, type = 'info') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const startAssessment = () => {
    setCurrentStep('assessment');
    showNotification('Assessment Gestart', 'Beantwoord alle vragen voor een volledig rapport', 'success');
  };

  const selectOption = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    
    setTimeout(() => {
      if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setCurrentStep('lead');
        setShowModal(true);
      }
    }, 800);
  };

  const nextQuestion = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitLead = async (data: any) => {
    // Calculate assessment results for potential CRM integration
    const results = calculateResults();
    
    console.log('🔄 Lead submitted:', data);
    console.log('📊 Assessment results:', results);
    
    // Store data locally for now
    setLeadData(data);
    setShowModal(false);
    setShowThankYou(true);
    
    setTimeout(() => {
      setShowThankYou(false);
      setCurrentStep('loading');
      
      setTimeout(() => {
        setCurrentStep('results');
        showNotification('Rapport Klaar', 'Je uitgebreide rapport is gegenereerd!', 'success');
      }, 3000);
    }, 2000);
  };

  const calculateResults = () => {
    let score = 70;
    let timeToHire = 48;
    let costPerHire = 12000;
    let successRate = 65;

    // Calculate based on answers
    Object.entries(answers).forEach(([questionId, answerIndex]) => {
      const qId = parseInt(questionId);
      
      switch(qId) {
        case 5: // Time-to-hire
          timeToHire = [25, 37, 52, 67, 82, 100][answerIndex] || 48;
          if (answerIndex <= 1) score += 10;
          else if (answerIndex >= 4) score -= 10;
          break;
        case 6: // Success rate  
          successRate = [95, 80, 60, 40, 25, 50][answerIndex] || 65;
          if (answerIndex <= 1) score += 15;
          else if (answerIndex >= 3) score -= 15;
          break;
        case 7: // Cost per hire
          costPerHire = [2500, 4500, 8000, 12500, 20000, 30000][answerIndex] || 12000;
          if (answerIndex <= 1) score += 8;
          else if (answerIndex >= 4) score -= 8;
          break;
        case 10: // Tools/systems
          if (answerIndex === 0) score += 15;
          else if (answerIndex >= 3) score -= 10;
          break;
        case 11: // Employer branding
          if (answerIndex === 0) score += 10;
          else if (answerIndex >= 3) score -= 5;
          break;
        case 13: // Measurement
          if (answerIndex === 0) score += 15;
          else if (answerIndex >= 3) score -= 10;
          break;
        case 17: // Process organization
          if (answerIndex === 0) score += 10;
          else if (answerIndex >= 3) score -= 15;
          break;
        default:
          break;
      }
    });

    score = Math.max(35, Math.min(95, score));
    const benchmark = INDUSTRY_BENCHMARKS[answers[1] as keyof typeof INDUSTRY_BENCHMARKS] || INDUSTRY_BENCHMARKS[5];
    
    return {
      score: Math.round(score),
      timeToHire: Math.round(timeToHire),
      costPerHire: Math.round(costPerHire),
      successRate: Math.round(successRate),
      benchmark,
      potentialImprovement: {
        timeToHire: Math.max(20, Math.round(timeToHire * 0.7)),
        costPerHire: Math.max(2000, Math.round(costPerHire * 0.8)),
        successRate: Math.min(95, Math.round(successRate * 1.3))
      }
    };
  };

  // Component renders based on currentStep
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2"></div>
            
            <div className="p-8 md:p-12 text-center">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  R
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-slate-800">RECRUITPRO ENTERPRISE</h1>
                  <p className="text-slate-600">Geavanceerde Werving Analyse & Strategisch Advies</p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto mb-8">
                <p className="text-lg text-slate-700 leading-relaxed">
                  🎯 <strong>Enterprise-grade recruitment assessment</strong> met strategische vragen, 
                  sector benchmarking, competitive positioning en gedetailleerd actieplan. 
                  Krijg inzicht in je maturity level, ROI projecties en concrete implementatie roadmap.
                </p>
              </div>

              <button
                onClick={startAssessment}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <span>🚀</span>
                Start Enterprise Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add other step renderings here...
  return <div>Assessment Tool - {currentStep}</div>;
}

export default App;