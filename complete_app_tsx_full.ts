import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Target, Clock, DollarSign, TrendingUp, Award, Zap, Users, Brain } from 'lucide-react';
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

interface LeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
  function?: string;
}

interface AssessmentResults {
  score: number;
  timeToHire: number;
  costPerHire: number;
  successRate: number;
  benchmark: typeof INDUSTRY_BENCHMARKS[0];
  potentialImprovement: {
    timeToHire: number;
    costPerHire: number;
    successRate: number;
  };
}

function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [leadData, setLeadData] = useState<LeadData>({} as LeadData);
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

  const submitLead = async (data: LeadData) => {
    const results = calculateResults();
    
    console.log('🔄 Lead submitted:', data);
    console.log('📊 Assessment results:', results);
    
    // Here you would normally send to your CRM/backend
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

  const calculateResults = (): AssessmentResults => {
    let score = 70;
    let timeToHire = 48;
    let costPerHire = 12000;
    let successRate = 65;

    Object.entries(answers).forEach(([questionId, answerIndex]) => {
      const qId = parseInt(questionId);
      
      switch(qId) {
        case 5:
          timeToHire = [25, 37, 52, 67, 82, 100][answerIndex] || 48;
          if (answerIndex <= 1) score += 10;
          else if (answerIndex >= 4) score -= 10;
          break;
        case 6:
          successRate = [95, 80, 60, 40, 25, 50][answerIndex] || 65;
          if (answerIndex <= 1) score += 15;
          else if (answerIndex >= 3) score -= 15;
          break;
        case 7:
          costPerHire = [2500, 4500, 8000, 12500, 20000, 30000][answerIndex] || 12000;
          if (answerIndex <= 1) score += 8;
          else if (answerIndex >= 4) score -= 8;
          break;
        case 10:
          if (answerIndex === 0) score += 15;
          else if (answerIndex >= 3) score -= 10;
          break;
        case 11:
          if (answerIndex === 0) score += 10;
          else if (answerIndex >= 3) score -= 5;
          break;
        case 13:
          if (answerIndex === 0) score += 15;
          else if (answerIndex >= 3) score -= 10;
          break;
        case 17:
          if (answerIndex === 0) score += 10;
          else if (answerIndex >= 3) score -= 15;
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

  if (currentStep === 'assessment') {
    const question = ASSESSMENT_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
    const isAnswered = answers[question.id] !== undefined;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                <p className="text-sm text-slate-600">{notification.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Enterprise Assessment</h2>
              <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {currentQuestion + 1} / {ASSESSMENT_QUESTIONS.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-blue-800 text-white p-6">
              <h2 className="text-2xl font-semibold mb-2">Enterprise Recruitment Intelligence</h2>
              <p className="text-slate-200">Uitgebreide analyse van je recruitment maturity en competitive positioning</p>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Vraag {currentQuestion + 1} van {ASSESSMENT_QUESTIONS.length}
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-4">{question.text}</h3>
                {question.help && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg mb-6">
                    <p className="text-slate-700 text-sm">💡 {question.help}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectOption(question.id, index)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-0.5 relative ${
                      answers[question.id] === index
                        ? 'border-orange-500 bg-orange-50 transform -translate-y-0.5'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-slate-800">{option}</span>
                    {answers[question.id] === index && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-6 bg-slate-50 border-t">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentQuestion === 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Vorige
              </button>

              <button
                onClick={nextQuestion}
                disabled={!isAnswered || currentQuestion >= ASSESSMENT_QUESTIONS.length - 1}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                  !isAnswered || currentQuestion >= ASSESSMENT_QUESTIONS.length - 1
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                Volgende
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'lead') {
    return (
      <>
        <LeadModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={submitLead}
        />
        {showThankYou && <ThankYouPage />}
      </>
    );
  }

  if (currentStep === 'loading') {
    return (
      <div className="fixed inset-0 bg-slate-800 bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold mb-2">Je wervingsrapport wordt gegenereerd...</h3>
          <p className="text-slate-300">Inclusief sector benchmarking en competitive analysis</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'results') {
    const results = calculateResults();
    
    return (
      <ResultsReport 
        results={results} 
        leadData={leadData} 
        answers={answers}
        showNotification={showNotification}
      />
    );
  }

  return null;
}

interface LeadModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: LeadData) => void;
}

function LeadModal({ show, onClose, onSubmit }: LeadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobFunction, setJobFunction] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = () => {
    if (name.trim() && email.trim() && phone.trim() && company.trim() && privacyAccepted) {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        function: jobFunction
      });
    } else {
      alert('Vul alle verplichte velden in en accepteer de privacyvoorwaarden');
    }
  };

  const isFormValid = name.trim() && email.trim() && phone.trim() && company.trim() && privacyAccepted;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all text-xl font-bold"
          >
            ×
          </button>
          <h2 className="text-2xl font-semibold mb-2">Ontvang je Persoonlijke Wervingsrapport</h2>
          <p className="text-orange-100">Uitgebreide analyse + vergelijking + concrete verbeteradviezen</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-slate-700 font-medium mb-2">Voor- en achternaam *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Jouw volledige naam"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">E-mailadres *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="naam@bedrijf.nl"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">Telefoonnummer *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="06-12345678"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">Bedrijfsnaam *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Jouw bedrijfsnaam"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">Functie (optioneel)</label>
            <select
              value={jobFunction}
              onChange={(e) => setJobFunction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">Selecteer je functie (optioneel)</option>
              <option value="Eigenaar/Directeur">Eigenaar/Directeur</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Recruitment Manager">Recruitment Manager</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="HR Medewerker">HR Medewerker</option>
              <option value="Anders">Anders</option>
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="privacy-check" 
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500" 
              />
              <label htmlFor="privacy-check" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                Ik ga akkoord met het verwerken van mijn gegevens voor het opstellen van mijn persoonlijke wervingsrapport. 
                Mijn gegevens worden veilig behandeld conform de <span className="text-orange-500 underline">AVG-privacyvoorwaarden</span>. *
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              isFormValid 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            📊 Genereer Mijn Persoonlijke Wervingsrapport
          </button>

          <p className="text-xs text-slate-500 text-center leading-relaxed">
            🔒 Je gegevens worden veilig behandeld. Het rapport wordt direct gegenereerd.
          </p>
        </div>
      </div>
    </div>
  );
}

function ThankYouPage() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center z-50">
      <div className="text-center text-white max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-4xl">🎉</div>
        </div>
        <h2 className="text-3xl font-bold mb-4">Bedankt!</h2>
        <p className="text-xl mb-6 text-orange-100">
          Je wervingsrapport wordt nu gegenereerd...
        </p>
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

interface ResultsReportProps {
  results: AssessmentResults;
  leadData: LeadData;
  answers: Record<number, number>;
  showNotification: (title: string, message: string, type?: string) => void;
}

function ResultsReport({ results, leadData, answers, showNotification }: ResultsReportProps) {
  const today = new Date();
  const reportId = `RPENT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  
  const maturityLevel = results.score >= 85 ? 'Koploper' : 
                       results.score >= 70 ? 'Gevorderd' :
                       results.score >= 55 ? 'Ontwikkelend' : 'Basis Niveau';

  const handleExportPdf = () => {
    showNotification('PDF Export', 'Wervingsrapport wordt gedownload...', 'success');
  };

  const handleScheduleConsultation = () => {
    window.open('https://www.recruitin.nl', '_blank');
    showNotification('Contact Openen', 'RecruitIn website geopend voor contact', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-800 to-blue-800 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"></div>
            <div className="relative p-8 md:p-12">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    R
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">RECRUITPRO ENTERPRISE</h1>
                    <p className="text-slate-300">Geavanceerde Werving Analyse & Strategisch Advies</p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-300">
                  <div><strong>Rapport ID:</strong> {reportId}</div>
                  <div><strong>Datum:</strong> {today.toLocaleDateString('nl-NL')}</div>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">🎯 Uitgebreid Wervingsrapport</h2>
              <p className="text-xl text-slate-200 mb-8">Complete analyse en verbeteradvies voor {leadData.company}</p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <div className="text-xs text-slate-300 uppercase tracking-wider mb-1">Organisatie</div>
                      <div className="text-lg font-semibold">{leadData.company}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-300 uppercase tracking-wider mb-1">Contactpersoon</div>
                      <div className="text-lg font-semibold">{leadData.name}</div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <div className="text-xs text-slate-300 uppercase tracking-wider mb-1">Score</div>
                      <div className="text-lg font-semibold">{results.score}/100 ({maturityLevel})</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-300 uppercase tracking-wider mb-1">Potentieel</div>
                      <div className="text-lg font-semibold">Hoog verbeterpotentieel</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
            >
              📄 Download PDF
            </button>
            <button
              onClick={handleScheduleConsultation}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all"
            >
              📞 Plan Gesprek
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            Jouw Wervingsprestaties in Cijfers
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={<Target className="w-6 h-6" />}
              value={results.score}
              label="Ontwikkelingsscore"
              change={`+${100 - results.score} mogelijk`}
              positive={true}
            />
            <MetricCard
              icon={<Clock className="w-6 h-6" />}
              value={`${results.timeToHire}d`}
              label="Wervingstijd"
              change={`${results.timeToHire <= results.benchmark.avgTTH ? '✓' : '+'} ${Math.abs(results.timeToHire - results.benchmark.avgTTH)}d vs sector`}
              positive={results.timeToHire <= results.benchmark.avgTTH}
            />
            <MetricCard
              icon={<DollarSign className="w-6 h-6" />}
              value={`€${Math.round(results.costPerHire/1000)}k`}
              label="Kosten per Aanname"
              change={`${results.costPerHire <= results.benchmark.avgCPH ? '✓' : '+'} €${Math.round(Math.abs(results.costPerHire - results.benchmark.avgCPH)/1000)}k vs sector`}
              positive={results.costPerHire <= results.benchmark.avgCPH}
            />
            <MetricCard
              icon={<TrendingUp className="w-6 h-6" />}
              value={`${results.successRate}%`}
              label="Succespercentage"
              change={`${results.successRate >= results.benchmark.avgSuccessRate ? '✓' : '+'} ${Math.abs(results.successRate - results.benchmark.avgSuccessRate)}% vs sector`}
              positive={results.successRate >= results.benchmark.avgSuccessRate}
            />
          </div>

          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">🎯 Samenvatting voor de Directie</h3>
            <p className="text-slate-700 mb-4">
              <strong>{leadData.company} bevindt zich in de "{maturityLevel}" fase</strong> van werving en selectie met een score van {results.score}/100 punten.
            </p>
            <p className="text-slate-700">
              <strong>💡 Verbeterpotentieel:</strong> Door gerichte verbeteringen kan binnen 6 maanden een aanzienlijke kostenbesparing van €{Math.round((results.costPerHire - results.potentialImprovement.costPerHire)/1000)}k per aanname gerealiseerd worden.
            </p>
          </div>
        </div>

        <div className="bg-slate-700 text-white rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">📞 Persoonlijk Adviesgesprek</h3>
            <p className="text-slate-300 mb-6">
              Bespreek je rapport en krijg specifiek advies voor {leadData.company}
            </p>
            <div className="space-y-2 text-sm text-slate-300 mb-6">
              <div>📧 warts@recruitin.nl</div>
              <div>📱 06-14314593</div>
              <div>🌐 www.recruitin.nl</div>
            </div>
            <button
              onClick={handleScheduleConsultation}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              📅 Plan een Gesprek
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change: string;
  positive: boolean;
}

function MetricCard({ icon, value, label, change, positive }: MetricCardProps) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
        {icon}
      </div>
      <div className="text-3xl font-bold text-orange-500 mb-2">{value}</div>
      <div className={`text-xs font-semibold px-3 py-1 rounded-full mb-2 inline-block ${
        positive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}>
        {change}
      </div>
      <div className="text-xs text-slate-600 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default App;