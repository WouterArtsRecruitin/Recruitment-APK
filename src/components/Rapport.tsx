import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, CheckCircle, AlertTriangle, XCircle, TrendingUp, Target, Calendar, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

// ============================================================================
// TYPES & CONFIG
// ============================================================================

interface ClaudeAnalysis {
  executive_summary: string;
  category_insights: Record<string, { strengths: string; improvements: string; impact: string }>;
  quick_wins: string[];
  roi_estimate: string;
}

const CAT_NAMES = ['Processen', 'Technologie', 'Talent Attraction', 'Data & Analytics'];
const CAT_ICONS = ['🔧', '💻', '🎯', '📊'];
const CAT_DESCS = [
  'Workflow, documentatie, doorlooptijd, samenwerking',
  'ATS, screening, video interviewing, assessment',
  'Employer branding, sourcing, referrals, social, D&I',
  'KPIs, data-driven decisions, ROI, benchmarking',
];

const BENCHMARKS: Record<string, number> = {
  'oil': 58, 'gas': 58, 'constructie': 52, 'bouw': 52, 'productie': 48,
  'automation': 62, 'techniek': 55, 'renewables': 60, 'energie': 56,
  'logistiek': 45, 'it': 68, 'software': 70, 'default': 52,
};

function getBenchmark(sector: string): number {
  const s = sector.toLowerCase();
  for (const [k, v] of Object.entries(BENCHMARKS)) {
    if (s.includes(k)) return v;
  }
  return BENCHMARKS.default;
}

function color(p: number) { return p >= 70 ? '#059669' : p >= 40 ? '#d97706' : '#dc2626'; }
function label(p: number) { return p >= 80 ? 'Excellent' : p >= 60 ? 'Goed' : p >= 40 ? 'Gemiddeld' : 'Ontwikkeling Nodig'; }
function icon(p: number) { return p >= 65 ? <CheckCircle className="w-5 h-5" /> : p >= 35 ? <AlertTriangle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />; }

// Fallback insights als Claude analyse niet beschikbaar is
function fallbackStrength(cat: string, p: number): string {
  if (p < 30) return '';
  const s: Record<string, string> = {
    'Processen': p >= 65 ? 'Gestroomlijnd proces met snelle response en systematische evaluatie' : 'Functionele processen met basis documentatie',
    'Technologie': p >= 65 ? 'Professionele ATS en screening tools met automation' : 'Basis tooling aanwezig',
    'Talent Attraction': p >= 65 ? 'Actieve employer branding en multi-channel sourcing' : 'Aanwezigheid op kernkanalen',
    'Data & Analytics': p >= 65 ? 'Data-driven besluitvorming met KPI dashboards' : 'Basis rapportage aanwezig',
  };
  return s[cat] || '';
}

function fallbackImprovement(cat: string, p: number): string {
  const level = p >= 65 ? 'high' : p >= 35 ? 'mid' : 'low';
  const m: Record<string, Record<string, string>> = {
    'Processen': { low: 'Start met vastleggen van werkwijzen en stel een evaluatiecyclus in', mid: 'Automatiseer workflows en verkort doorlooptijd naar <30 dagen', high: 'Predictive hiring en advanced process automation' },
    'Technologie': { low: 'Implementeer een basis ATS — direct 8+ uur/week besparing', mid: 'Upgrade naar automated screening en video assessment', high: 'AI-powered candidate matching toevoegen' },
    'Talent Attraction': { low: 'Bouw een employer brand en start actief sourcen', mid: 'Diversifieer kanalen en implementeer referral programma', high: 'Dynamic talent community met continue engagement' },
    'Data & Analytics': { low: 'Begin met bijhouden van doorlooptijd en cost-per-hire', mid: 'Implementeer KPI dashboard en train hiring managers', high: 'Predictive analytics en continuous optimization' },
  };
  return m[cat]?.[level] || '';
}

function getRoadmap(p: number): { title: string; tasks: string[]; result: string }[] {
  if (p >= 65) return [
    { title: 'Advanced Optimization', tasks: ['AI-powered candidate matching', 'Predictive analytics dashboard', 'Employer brand content strategie', 'Advanced assessment methoden'], result: 'Automation 75%+ | Market leadership' },
    { title: 'Talent Community', tasks: ['Dynamic talent pool opzetten', 'Referral programma >30% hires', 'Social recruiting influencer strategie', 'Continuous improvement formaliseren'], result: 'Talent pool +60% | Inbound +45%' },
    { title: 'Scale & Measure', tasks: ['ROI per kanaal optimaliseren', 'Predictive quality-of-hire', 'Employer brand NPS tracking', 'Best practices schalen'], result: 'Full ROI | 85+ APK score' },
  ];
  if (p >= 40) return [
    { title: 'Foundation Fix', tasks: ['ATS selectie en implementatie', 'Processen documenteren', 'Basis KPI dashboard opzetten', 'Hiring manager training'], result: 'Automation 25%→50% | 8u/week besparing' },
    { title: 'Sourcing Uitbreiding', tasks: ['LinkedIn Recruiter activeren', 'Employee referral programma', 'Candidate experience structureren', 'Multi-channel employer branding'], result: 'Talent pool +40% | Doorlooptijd -20%' },
    { title: 'Data & Optimalisatie', tasks: ['Data-driven besluitvorming', 'Feedback loops inrichten', 'Sourcing kanaal ROI meten', 'Compensation benchmarking'], result: 'Cost-per-hire -25% | Quality +15%' },
  ];
  return [
    { title: 'Basis op Orde', tasks: ['Recruitment proces vastleggen', 'Basis onboarding opzetten', 'Job postings professionaliseren', 'Response tijd <48 uur'], result: 'Structuur aanwezig | Geen kandidaten kwijt' },
    { title: 'Tooling & Kanalen', tasks: ['ATS implementeren', 'LinkedIn profiel optimaliseren', 'Communicatie-templates maken', 'KPIs gaan bijhouden'], result: 'Automation 0%→30% | Inzicht in performance' },
    { title: 'Groei & Branding', tasks: ['Employer branding strategie', 'Referral programma starten', 'Hiring managers trainen', 'KPI targets instellen'], result: 'Brand zichtbaar | Doorlooptijd -30%' },
  ];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Rapport() {
  const [params] = useSearchParams();

  const score = parseInt(params.get('score') || '0');
  const maxScore = parseInt(params.get('max') || '100');
  const company = params.get('company') || 'Uw bedrijf';
  const contact = params.get('contact') || '';
  const sector = params.get('sector') || '';
  const catScoresRaw = params.get('cats') || '';
  const aiRaw = params.get('ai') || '';

  const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const benchmark = getBenchmark(sector);
  const diff = scorePercent - benchmark;
  const catScores = catScoresRaw ? catScoresRaw.split(',').map(Number) : CAT_NAMES.map(() => scorePercent);
  const roadmap = getRoadmap(scorePercent);
  const today = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  // Decode Claude analyse
  const analysis: ClaudeAnalysis | null = useMemo(() => {
    if (!aiRaw) return null;
    try { return JSON.parse(atob(aiRaw)); } catch { return null; }
  }, [aiRaw]);

  const sc = color(scorePercent);

  return (
    <div style={{ background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100vh' }}>
      {/* Header bar */}
      <div style={{ background: '#2d2d2d', padding: '16px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#E8630A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '16px', fontFamily: "'Outfit', sans-serif" }}>R</div>
            <div>
              <div style={{ color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', letterSpacing: '-0.01em' }}>RECRUITMENT APK</div>
              <div style={{ color: '#E8630A', fontSize: '12px', fontStyle: 'italic' }}>the right people, right now</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', color: 'white' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px' }}>{company}</div>
            {sector && <div style={{ fontSize: '13px', opacity: 0.7 }}>{sector}</div>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px 60px', background: 'white', minHeight: 'calc(100vh - 72px)' }}>

        {/* Executive Summary Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'linear-gradient(135deg, #FFF8E7, #FFE4B5)', padding: '28px 32px', borderLeft: '5px solid #E8630A', margin: '0 -32px 40px' }}>
          <div style={{ display: 'inline-block', background: '#E8630A', color: 'white', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Executive Summary</div>
          {analysis?.executive_summary ? (
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#1a202c' }}>{analysis.executive_summary}</p>
          ) : (
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#1a202c' }}>
              {company} scoort <strong>{scorePercent}/100</strong> op de Recruitment Maturity Assessment.
              {diff >= 5 ? ` Dit is ${diff} punten boven het sectorgemiddelde van ${benchmark}%. ` : diff >= -5 ? ` Dit is rond het sectorgemiddelde van ${benchmark}%. ` : ` Dit is ${Math.abs(diff)} punten onder het sectorgemiddelde van ${benchmark}%. `}
              {scorePercent >= 60 ? 'Er zijn gerichte kansen om door te groeien naar het volgende niveau.' : 'Er liggen concrete verbetermogelijkheden die direct impact hebben op uw recruitment resultaten.'}
            </p>
          )}
        </motion.div>

        {/* Score Circle */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ textAlign: 'center', padding: '48px 0', marginBottom: '40px' }}>
          <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: `4px solid ${sc}`, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: `${sc}08` }}>
            <div style={{ fontSize: '72px', fontWeight: 900, color: sc, fontFamily: "'Outfit', sans-serif", lineHeight: 0.9 }}>{score}</div>
            <div style={{ fontSize: '18px', color: '#666', marginTop: '4px' }}>/100</div>
          </div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>Recruitment Maturity Score</div>
          <div style={{ display: 'inline-block', background: sc, color: 'white', padding: '6px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>{label(scorePercent)}</div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            Sector benchmark: <strong>{benchmark}%</strong> | Verschil: <strong style={{ color: diff >= 0 ? '#059669' : '#dc2626' }}>{diff >= 0 ? '+' : ''}{diff}%</strong> | Percentiel: <strong>{Math.min(95, Math.max(5, 50 + diff * 2))}e</strong>
          </div>
        </motion.div>

        {/* Categorie Analyse */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, color: '#1a202c', marginBottom: '8px', textAlign: 'center' }}>Score Analyse Per Categorie</h2>
          <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '24px' }}>Gedetailleerd inzicht in uw sterke punten en verbeterkansen</p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {CAT_NAMES.map((name, i) => {
              const cp = catScores[i] || scorePercent;
              const cc = color(cp);
              const catScore = Math.round(cp * 25 / 100);
              const ai = analysis?.category_insights?.[name];

              return (
                <motion.div key={name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${cc}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{CAT_ICONS[i]}</span>
                      <div>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '16px', color: '#1a202c' }}>{name}</span>
                        <div style={{ fontSize: '12px', color: '#666' }}>{CAT_DESCS[i]}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '22px', color: cc }}>{catScore}/25</div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '6px', margin: '12px 0' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${cp}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      style={{ background: cc, borderRadius: '4px', height: '100%' }} />
                  </div>
                  {/* Insights */}
                  {(ai?.strengths || fallbackStrength(name, cp)) && (
                    <div style={{ fontSize: '13px', color: '#059669', background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', marginTop: '8px' }}>
                      ✓ {ai?.strengths || fallbackStrength(name, cp)}
                    </div>
                  )}
                  <div style={{ fontSize: '13px', color: '#d97706', background: '#fffbeb', padding: '8px 12px', borderRadius: '6px', marginTop: '6px' }}>
                    ↑ {ai?.improvements || fallbackImprovement(name, cp)}
                  </div>
                  {ai?.impact && (
                    <div style={{ fontSize: '13px', color: '#2563eb', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px', marginTop: '6px' }}>
                      📈 {ai.impact}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Wins */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', textAlign: 'center' }}>
            {analysis ? 'Gepersonaliseerde Quick Wins' : 'Top 3 Quick Wins'}
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {(analysis?.quick_wins || [
              CAT_NAMES.map((n, i) => ({ n, p: catScores[i] })).sort((a, b) => a.p - b.p).slice(0, 3).map(c => fallbackImprovement(c.n, c.p))
            ].flat()).slice(0, 3).map((win, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: '#E8630A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>{i + 1}</div>
                <p style={{ fontSize: '14px', color: '#1a202c', lineHeight: 1.6 }}>{win}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 90-Dagen Roadmap */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, color: '#1a202c', marginBottom: '20px', textAlign: 'center' }}>90-Dagen Implementatie Roadmap</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {roadmap.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.1 }}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: '#E8630A', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '18px' }}>{i + 1}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#1a202c' }}>Maand {i + 1}: {m.title}</h3>
                <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, marginBottom: '12px' }}>
                  {m.tasks.map((t, j) => (
                    <li key={j} style={{ fontSize: '13px', color: '#4a5568', padding: '3px 0', display: 'flex', gap: '6px' }}>
                      <span style={{ color: '#E8630A' }}>•</span> {t}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', background: '#f0fdf4', padding: '8px', borderRadius: '6px' }}>{m.result}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ROI Projectie */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ background: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', borderRadius: '16px', padding: '32px', marginBottom: '48px', color: 'white', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Business Impact & ROI Projectie</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
            {[
              { v: `${Math.max(15, 45 - Math.round(scorePercent * 0.3))}%`, l: 'Doorlooptijd reductie' },
              { v: `${Math.max(10, 35 - Math.round(scorePercent * 0.2))}%`, l: 'Cost-per-hire besparing' },
              { v: analysis?.roi_estimate || `€${Math.max(15, 80 - scorePercent) * 1000}+`, l: 'Jaarlijkse besparing' },
              { v: `${Math.min(300, 120 + (100 - scorePercent) * 2)}%`, l: 'Verwachte ROI' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#E8630A', fontFamily: "'Outfit', sans-serif" }}>{s.v}</div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>{s.l}</div>
              </div>
            ))}
          </div>
          {analysis?.roi_estimate && (
            <div style={{ background: 'linear-gradient(135deg, #E8630A, #d45a08)', padding: '16px', borderRadius: '10px', fontSize: '16px', fontWeight: 700 }}>
              Geschatte jaarlijkse besparing: {analysis.roi_estimate}
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '40px 0', borderTop: '3px solid #E8630A' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 900, color: '#2d2d2d', marginBottom: '12px' }}>Transformeer Uw Recruitment</h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 28px' }}>
            Bespreek uw rapport met een specialist. 30 minuten, concrete vervolgstappen, geen verplichtingen.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <a href="https://wa.me/31614314593" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#E8630A', color: 'white', padding: '14px 32px', borderRadius: '30px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(232,99,10,0.3)' }}>
              Plan Strategiesessie →
            </a>
            <a href="mailto:info@recruitin.nl" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#2d2d2d', padding: '14px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', border: '2px solid #e2e8f0' }}>
              info@recruitin.nl
            </a>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#2d2d2d' }}>Wouter Arts</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Senior Recruitment Consultant | Recruitin B.V.</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>📧 warts@recruitin.nl | 📱 +31 6 14 31 45 93 | 🌐 recruitin.nl</div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#999' }}>
          <p>Rapport gegenereerd op {today} | recruitmentapk.nl — powered by Recruitin B.V.</p>
          <p style={{ marginTop: '4px', fontSize: '11px' }}>Dit rapport is vertrouwelijk en uitsluitend bestemd voor {company}.</p>
        </div>
      </div>
    </div>
  );
}
