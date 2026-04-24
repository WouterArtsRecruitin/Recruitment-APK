import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

// ============================================================================
// CONFIG
// ============================================================================

interface ClaudeAnalysis {
  executive_summary: string;
  category_insights: Record<string, { strengths: string; improvements: string; impact: string }>;
  roi_estimate: string;
  top_strengths?: string[];
  weakest_points?: string[];
  biggest_opportunity?: string;
  opportunity_hook?: string;
  action_plan_30?: string[];
  action_plan_60?: string[];
  action_plan_90?: string[];
}

const CATS = ['Processen', 'Technologie', 'Talent Attraction', 'Data & Analytics'];
const CAT_ICONS = ['\u2699\uFE0F', '\uD83D\uDCBB', '\u2B50', '\uD83D\uDCCA'];

// Sub-topics per categorie (vraagnummer → label)
const SUB_TOPICS: Record<string, { q: number; label: string }[]> = {
  'Processen': [
    { q: 1, label: 'Evaluatiefrequentie' },
    { q: 5, label: 'Samenwerking HR & managers' },
    { q: 6, label: 'Doorlooptijd proces' },
    { q: 8, label: 'Procesdocumentatie' },
    { q: 14, label: 'Reactiesnelheid' },
  ],
  'Technologie': [
    { q: 4, label: 'Recruitment tools & ATS' },
    { q: 19, label: 'Candidate screening tech' },
    { q: 22, label: 'Assessment methoden' },
    { q: 27, label: 'Video & remote tools' },
  ],
  'Talent Attraction': [
    { q: 7, label: 'Employer branding' },
    { q: 9, label: 'Interne mobiliteit' },
    { q: 12, label: 'Proactieve sourcing' },
    { q: 13, label: 'Diversiteit & inclusie' },
    { q: 16, label: 'Recruitment marketing' },
    { q: 17, label: 'Referral programma' },
    { q: 21, label: 'Talent pool beheer' },
    { q: 25, label: 'Social media strategie' },
  ],
  'Data & Analytics': [
    { q: 2, label: 'Onboarding' },
    { q: 3, label: 'Effectiviteitsmeting' },
    { q: 10, label: 'Hiring manager training' },
    { q: 11, label: 'Data-driven beslissingen' },
    { q: 15, label: 'Candidate experience' },
    { q: 18, label: 'Cultural fit evaluatie' },
    { q: 20, label: 'Kandidaat feedback' },
    { q: 23, label: 'ROI meting' },
    { q: 24, label: 'Kandidaat communicatie' },
    { q: 26, label: 'Salary benchmarking' },
    { q: 28, label: 'Externe partners' },
    { q: 29, label: 'Continuous improvement' },
  ],
};
const BENCHMARKS: Record<string, number> = { oil: 58, gas: 58, constructie: 52, bouw: 52, productie: 48, automation: 62, techniek: 55, renewables: 60, default: 52 };

function bench(s: string) { for (const [k, v] of Object.entries(BENCHMARKS)) { if (s.toLowerCase().includes(k)) return v; } return 52; }
function clr(p: number) { return p >= 70 ? '#059669' : p >= 40 ? '#E8630A' : '#dc2626'; }
function tier(p: number) {
  if (p >= 85) return { label: 'Expert', color: '#b45309', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' };
  if (p >= 65) return { label: 'Professional', color: '#059669', bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)' };
  if (p >= 40) return { label: 'Groeier', color: '#E8630A', bg: 'linear-gradient(135deg,#fff7ed,#ffedd5)' };
  return { label: 'Starter', color: '#dc2626', bg: 'linear-gradient(135deg,#fef2f2,#fecaca)' };
}

const TRIGGERS: Record<string, { title: string; desc: string; cta: string; link: string }> = {
  'Processen': { title: 'Gratis Recruitment Process Scan', desc: 'Wij analyseren jullie wervingsproces en leveren binnen 48 uur een verbeterplan met prioriteiten en verwachte besparing.', cta: 'Plan gratis Process Scan', link: 'https://calendly.com/wouter-arts-/vacature-analyse-advies' },
  'Technologie': { title: 'Gratis ATS & Tooling Advies', desc: 'Wij vergelijken jullie tooling met de beste oplossingen voor jullie sector. Inclusief implementatieplan en kostenanalyse.', cta: 'Plan gratis Tooling Advies', link: 'https://calendly.com/wouter-arts-/vacature-analyse-advies' },
  'Talent Attraction': { title: 'Gratis Vacaturetekst Scan', desc: 'Stuur jullie vacaturetekst en wij herschrijven deze met technieken die 3x meer gekwalificeerde sollicitanten opleveren. Eerste vacature gratis.', cta: 'Stuur je vacature voor gratis scan', link: 'https://wa.me/31614314593?text=Hoi%20Wouter%2C%20ik%20wil%20graag%20een%20gratis%20vacature-scan%20nav%20mijn%20Recruitment%20APK.' },
  'Data & Analytics': { title: 'Gratis KPI Dashboard Sessie', desc: 'Wij helpen jullie in 1 sessie de 5 belangrijkste recruitment KPIs opzetten voor data-gedreven beslissingen vanaf dag 1.', cta: 'Plan gratis KPI Sessie', link: 'https://calendly.com/wouter-arts-/vacature-analyse-advies' },
};

const a = (d: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.3 } });

// ============================================================================
// COMPONENT
// ============================================================================

export function Rapport() {
  const [params] = useSearchParams();
  const rapportId = params.get('id');

  // State for async-loaded rapport data
  const [loading, setLoading] = useState(!!rapportId);
  const [error, setError] = useState('');
  const [data, setData] = useState<{
    score: number; max: number; company: string; contact: string;
    sector: string; cats: number[]; qs: number[]; ai: ClaudeAnalysis | null;
  } | null>(null);

  // Fetch from Supabase if UUID present
  useEffect(() => {
    if (!rapportId) return;
    fetch(`/api/rapport?id=${rapportId}`)
      .then(res => {
        if (!res.ok) throw new Error('Rapport niet gevonden');
        return res.json();
      })
      .then(row => {
        const catPercents = (row.categories || []).map((c: any) => c.percent || 0);
        const indScores = row.individualScores || {};
        const qArr = Array.from({ length: 29 }, (_, i) => indScores[String(i + 1)] || 0);
        setData({
          score: row.score,
          max: row.maxScore || 100,
          company: row.companyName || 'Uw bedrijf',
          contact: row.contactName || '',
          sector: row.sector || '',
          cats: catPercents,
          qs: qArr,
          ai: row.aiAnalysis || null,
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Rapport niet gevonden of verlopen.');
        setLoading(false);
      });
  }, [rapportId]);

  // Legacy: read from URL params (backward compatible with old email links)
  const legacyData = useMemo(() => {
    if (rapportId) return null; // UUID mode — skip legacy
    const aiRaw = params.get('ai') || '';
    let ai: ClaudeAnalysis | null = null;
    if (aiRaw) { try { ai = JSON.parse(atob(aiRaw)); } catch { /* ignore */ } }
    return {
      score: parseInt(params.get('score') || '0'),
      max: parseInt(params.get('max') || '100'),
      company: params.get('company') || 'Uw bedrijf',
      contact: params.get('contact') || '',
      sector: params.get('sector') || '',
      cats: (params.get('cats') || '').split(',').map(Number),
      qs: (params.get('qs') || '').split(',').map(Number),
      ai,
    };
  }, [rapportId, params]);

  // Resolve: UUID data takes priority, then legacy params
  const d = data || legacyData;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(232,99,10,0.2)', borderTopColor: '#E8630A', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#999', fontSize: 14 }}>Rapport laden...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !d) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Rapport niet gevonden</h2>
          <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>{error || 'Dit rapport bestaat niet of is verlopen.'}</p>
          <a href="/" style={{ display: 'inline-block', marginTop: 24, padding: '12px 24px', background: '#E8630A', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Nieuwe assessment starten</a>
        </div>
      </div>
    );
  }

  const { score, max, company, contact, sector, cats, qs, ai } = d;
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const bm = bench(sector);
  const diff = pct - bm;
  const today = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  const t = tier(pct);

  const weakestIdx = cats.reduce((min, val, i) => val < cats[min] ? i : min, 0);
  const strongestIdx = cats.reduce((max, val, i) => val > cats[max] ? i : max, 0);
  const weakestCat = CATS[weakestIdx];
  const trigger = TRIGGERS[ai?.biggest_opportunity || weakestCat] || TRIGGERS['Processen'];

  return (
    <div style={{ background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ background: '#1a1a1a', color: 'white' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#E8630A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12px' }}>R</div>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recruitment APK</span>
          </div>
          <span style={{ fontSize: '12px', opacity: 0.5 }}>{today}</span>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', background: 'white' }}>

        {/* ═══ SCORE HERO ═══ */}
        <motion.div {...a(0)} style={{ padding: '48px 40px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '16px' }}>Assessment Rapport</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '4px' }}>{company}</h1>
          {sector && <p style={{ fontSize: '14px', color: '#999', marginBottom: '32px' }}>{sector}{contact ? ` \u00B7 ${contact}` : ''}</p>}

          {/* Animated score ring */}
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 16px' }}>
            <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f0f0f0" strokeWidth="8" />
              <motion.circle cx="60" cy="60" r="52" fill="none" stroke={clr(pct)} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`} initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - pct / 100) }} transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px', fontWeight: 900, color: clr(pct), lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '14px', color: '#bbb' }}>/100</span>
            </div>
          </div>
          <div style={{ display: 'inline-block', background: t.bg, color: t.color, padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, border: `1px solid ${t.color}22` }}>{t.label}</div>
          <div style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>
            <span style={{ color: diff >= 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>{diff >= 0 ? '+' : ''}{diff}%</span> vs sectorgemiddelde ({bm}%)
          </div>
        </motion.div>

        {/* ═══ EXECUTIVE SUMMARY — kort ═══ */}
        {ai?.executive_summary && (
          <motion.div {...a(0.12)} style={{ margin: '0 40px 32px', background: '#f8f9fa', borderLeft: '3px solid #E8630A', padding: '16px 20px', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#444' }}>{ai.executive_summary}</p>
          </motion.div>
        )}

        {/* ═══ DONUT CHART + SCORE OVERZICHT ═══ */}
        <motion.div {...a(0.16)} style={{ padding: '0 40px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
              <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {(() => {
                  const total = cats.reduce((s, v) => s + (v || 0), 0) || 1;
                  const colors = cats.map(c => clr(c || 0));
                  let offset = 0;
                  return cats.map((cp, i) => {
                    const pctSlice = ((cp || 0) / total) * 100;
                    const dashArray = (pctSlice / 100) * 2 * Math.PI * 44;
                    const dashOffset = -(offset / 100) * 2 * Math.PI * 44;
                    offset += pctSlice;
                    return <circle key={i} cx="60" cy="60" r="44" fill="none" stroke={colors[i]} strokeWidth="14"
                      strokeDasharray={`${dashArray} ${2 * Math.PI * 44}`} strokeDashoffset={dashOffset} />;
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#1a1a1a' }}>{score}</span>
                <span style={{ fontSize: '11px', color: '#999' }}>van 100</span>
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CATS.map((name, i) => {
                const cp = cats[i] || 0;
                const catScore = Math.round(cp * 25 / 100);
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: clr(cp), flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#555', minWidth: '130px' }}>{name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: clr(cp) }}>{catScore}/25</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ═══ SWOT ANALYSE ═══ */}
        <motion.div {...a(0.22)} style={{ padding: '0 40px 36px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>SWOT Analyse</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Strengths */}
            <div style={{ background: '#ecfdf5', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Sterktes</div>
              {(ai?.top_strengths || CATS.filter((_, i) => (cats[i] || 0) >= 65).map(c => `${c} bovengemiddeld`)).slice(0, 3).map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#065f46', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                  <span style={{ flexShrink: 0 }}>{'\u2713'}</span> {s}
                </div>
              ))}
            </div>
            {/* Weaknesses */}
            <div style={{ background: '#fef2f2', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Zwaktes</div>
              {(ai?.weakest_points || CATS.filter((_, i) => (cats[i] || 0) < 40).map(c => `${c} onder niveau`)).slice(0, 3).map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                  <span style={{ flexShrink: 0 }}>{'\u26A0'}</span> {s}
                </div>
              ))}
            </div>
            {/* Opportunities */}
            <div style={{ background: '#eff6ff', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Kansen</div>
              {[
                `${CATS[weakestIdx]} verbeteren = directe ROI`,
                `Sector ${sector || 'benchmark'}: concurrenten scoren ${bm}%`,
                pct < 60 ? 'Grote verbeterruimte = snel resultaat' : 'Optimalisatie naar Expert-niveau mogelijk',
              ].map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                  <span style={{ flexShrink: 0 }}>{'\u2197'}</span> {s}
                </div>
              ))}
            </div>
            {/* Threats */}
            <div style={{ background: '#fefce8', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#a16207', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Bedreigingen</div>
              {[
                pct < bm ? `Score ${diff}% onder sector = talent verlies` : 'Concurrenten investeren in recruitment tech',
                'Krappe arbeidsmarkt vergroot urgentie',
                'Elke maand vertraging = hogere kosten',
              ].map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#854d0e', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                  <span style={{ flexShrink: 0 }}>{'\u26A1'}</span> {s}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ PEER BENCHMARK ═══ */}
        <motion.div {...a(0.3)} style={{ padding: '0 40px 36px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Benchmark vs {sector || 'sector'}</div>
          <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '20px' }}>
            {CATS.map((name, i) => {
              const cp = cats[i] || pct;
              return (
                <div key={name} style={{ marginBottom: i < 3 ? '16px' : 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>{name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, position: 'relative', height: '24px', background: '#e8e8e8', borderRadius: '4px', overflow: 'hidden' }}>
                      {/* Sector average */}
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${bm}%`, background: '#ddd', borderRadius: '4px' }} />
                      {/* Your score */}
                      <motion.div initial={{ width: 0 }} animate={{ width: `${cp}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: clr(cp), borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' }}>
                        {cp > 20 && <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>{cp}%</span>}
                      </motion.div>
                      {/* Sector marker label */}
                      <div style={{ position: 'absolute', left: `${bm}%`, top: 0, height: '100%', width: '2px', background: '#888' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#999', minWidth: '32px', textAlign: 'right' }}>{bm}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ fontSize: '10px', color: clr(cp), fontWeight: 600 }}>Jouw score</span>
                    <span style={{ fontSize: '10px', color: '#999' }}>Sector avg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ CATEGORIE BARS — visueel overzicht ═══ */}
        <motion.div {...a(0.18)} style={{ padding: '0 40px 36px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Score per dimensie</div>
          {CATS.map((name, i) => {
            const cp = cats[i] || pct;
            const cc = clr(cp);
            const catScore = Math.round(cp * 25 / 100);
            return (
              <div key={name} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{CAT_ICONS[i]}</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a' }}>{name}</span>
                    {i === weakestIdx && <span style={{ fontSize: '9px', fontWeight: 700, color: '#dc2626', background: '#fecaca', padding: '2px 6px', borderRadius: '8px' }}>LAAGST</span>}
                    {i === strongestIdx && <span style={{ fontSize: '9px', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 6px', borderRadius: '8px' }}>STERKST</span>}
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: cc }}>{catScore}/25</span>
                </div>
                <div style={{ position: 'relative', height: '12px', background: '#f0f0f0', borderRadius: '6px' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${cp}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                    style={{ height: '100%', background: cc, borderRadius: '6px' }} />
                  <div style={{ position: 'absolute', left: `${bm}%`, top: '-2px', width: '2px', height: '16px', background: '#888', borderRadius: '1px' }} />
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: '10px', color: '#bbb', textAlign: 'right', marginTop: '4px' }}>
            {'\u2502'} = sectorgemiddelde ({bm}%)
          </div>
        </motion.div>

        {/* ═══ DETAIL PER CATEGORIE — sub-topics ═══ */}
        {qs.length > 1 && (
          <motion.div {...a(0.32)} style={{ padding: '0 40px 36px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Detail per onderdeel</div>
            {CATS.map((name, i) => {
              const cp = cats[i] || pct;
              const cc = clr(cp);
              return (
                <div key={name} style={{ border: '1px solid #e8e8e8', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{CAT_ICONS[i]}</span>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a' }}>{name}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: cc }}>{cp}%</span>
                  </div>
                  {SUB_TOPICS[name].map(({ q, label }) => {
                    const qScore = qs[q - 1] || 0;
                    const qPct = Math.round((qScore / 10) * 100);
                    const qClr = qScore >= 7 ? '#059669' : qScore >= 3 ? '#E8630A' : '#dc2626';
                    const qLbl = qScore >= 7 ? 'Goed' : qScore >= 3 ? 'Basis' : 'Ontbreekt';
                    return (
                      <div key={q} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#777', minWidth: '150px', flexShrink: 0 }}>{label}</span>
                        <div style={{ flex: 1, height: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
                          <div style={{ width: `${qPct}%`, height: '100%', background: qClr, borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: qClr, minWidth: '58px', textAlign: 'right' }}>{qLbl}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ═══ VERGELIJKINGSTABEL ═══ */}
        <motion.div {...a(0.35)} style={{ padding: '0 40px 36px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Jouw score vs sector</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8e8e8' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#999', fontWeight: 600 }}>Dimensie</th>
                <th style={{ textAlign: 'center', padding: '8px 0', color: '#999', fontWeight: 600 }}>Jouw score</th>
                <th style={{ textAlign: 'center', padding: '8px 0', color: '#999', fontWeight: 600 }}>Sector</th>
                <th style={{ textAlign: 'center', padding: '8px 0', color: '#999', fontWeight: 600 }}>Verschil</th>
              </tr>
            </thead>
            <tbody>
              {CATS.map((name, i) => {
                const cp = cats[i] || pct;
                const catDiff = cp - bm;
                return (
                  <tr key={name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600, color: '#333' }}>{CAT_ICONS[i]} {name}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: clr(cp) }}>{cp}%</td>
                    <td style={{ textAlign: 'center', color: '#999' }}>{bm}%</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: catDiff >= 0 ? '#059669' : '#dc2626' }}>{catDiff >= 0 ? '+' : ''}{catDiff}%</td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: '2px solid #1a1a1a' }}>
                <td style={{ padding: '10px 0', fontWeight: 800, color: '#1a1a1a' }}>Totaal</td>
                <td style={{ textAlign: 'center', fontWeight: 900, fontSize: '15px', color: clr(pct) }}>{pct}%</td>
                <td style={{ textAlign: 'center', color: '#999' }}>{bm}%</td>
                <td style={{ textAlign: 'center', fontWeight: 800, color: diff >= 0 ? '#059669' : '#dc2626' }}>{diff >= 0 ? '+' : ''}{diff}%</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* ═══ STERKSTE + ZWAKSTE — pills ═══ */}
        <motion.div {...a(0.42)} style={{ padding: '0 40px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Sterkste punten</div>
            {(ai?.top_strengths || ['Procesmatige basis', 'Teamcommunicatie', 'Interne betrokkenheid']).map((s, i) => (
              <div key={i} style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', marginBottom: '6px', fontSize: '13px', color: '#065f46', lineHeight: 1.4 }}>
                {'\u2713'} {s}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Aandachtspunten</div>
            {(ai?.weakest_points || ['Employer branding ontbreekt', 'Geen data-gedreven aanpak', 'Recruitment tooling beperkt']).map((s, i) => (
              <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', marginBottom: '6px', fontSize: '13px', color: '#991b1b', lineHeight: 1.4 }}>
                {'\u26A0'} {s}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══ ROI METRICS ═══ */}
        <motion.div {...a(0.5)} style={{ margin: '0 40px 36px', background: '#1a1a1a', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
            {[
              { v: `-${Math.max(15, 45 - Math.round(pct * 0.3))}%`, l: 'Doorlooptijd' },
              { v: `-${Math.max(10, 35 - Math.round(pct * 0.2))}%`, l: 'Cost-per-hire' },
              { v: `+${Math.max(10, 60 - Math.round(pct * 0.4))}%`, l: 'Talent pool' },
              { v: ai?.roi_estimate ? (ai.roi_estimate.match(/\u20AC[\d.,]+(?: ?[-\u2013] ?\u20AC[\d.,]+)?/)?.[0] || `\u20AC${Math.max(15, 80 - pct)}K+`) : `\u20AC${Math.max(15, 80 - pct)}K+`, l: 'Besparing/jaar' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#E8630A' }}>{s.v}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            Verwachte impact bij implementatie van alle verbeterpunten
          </div>
        </motion.div>

        {/* ═══ LOCKED VERBETERPLAN — preview van echt actieplan ═══ */}
        <motion.div {...a(0.58)} style={{ margin: '0 40px 36px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
          {/* Header */}
          <div style={{ background: '#1a1a1a', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>{'\uD83D\uDD12'}</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>Jouw persoonlijk verbeterplan</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Op maat voor {company}</div>
            </div>
          </div>

          {/* Blurred preview van echt actieplan */}
          <div style={{ position: 'relative', padding: '20px' }}>
            <div style={{ filter: 'blur(4px)', opacity: 0.4, pointerEvents: 'none' }}>
              {[
                { label: '30 dagen', items: ai?.action_plan_30 || ['Eerste prioriteitsacties...', 'Quick wins implementeren...'], color: '#059669' },
                { label: '60 dagen', items: ai?.action_plan_60 || ['Structurele verbeteringen...', 'Processen optimaliseren...'], color: '#E8630A' },
                { label: '90 dagen', items: ai?.action_plan_90 || ['Meten en bijsturen...', 'ROI evaluatie...'], color: '#7c3aed' },
              ].map((phase, pi) => (
                <div key={pi} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: phase.color, minWidth: '55px', textAlign: 'right', paddingTop: '8px' }}>{phase.label}</span>
                  <div style={{ width: '2px', background: phase.color, borderRadius: '1px' }} />
                  <div style={{ flex: 1, border: '1px solid #e8e8e8', borderRadius: '6px', padding: '8px 10px' }}>
                    {phase.items.map((item, i) => (
                      <div key={i} style={{ fontSize: '12px', color: '#555', marginBottom: i < phase.items.length - 1 ? '4px' : 0 }}>{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.75)' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '340px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1a1a1a', marginBottom: '6px' }}>Verbeterplan beschikbaar</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>Kies hoe je het wilt ontvangen</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', paddingTop: '12px' }}>
                  {/* €249 VERBETERPLAN — MEEST GEKOZEN (middle tier, emphasized, shown first) */}
                  <a href="https://buy.stripe.com/dRm14g8pP0n9a7P5Zt4Rq07" target="_blank" rel="noopener noreferrer"
                    style={{ position: 'relative', flex: 1, display: 'block', background: 'white', border: '2px solid #E8630A', borderRadius: '8px', padding: '14px 8px', textDecoration: 'none', textAlign: 'center', transform: 'scale(1.06)', zIndex: 1, boxShadow: '0 12px 48px rgba(232,99,10,0.25)' }}>
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#E8630A', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 12, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                      MEEST GEKOZEN
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#E8630A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{'\u20AC'}249</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginTop: '4px' }}>Verbeterplan</div>
                  </a>
                  <a href="https://buy.stripe.com/9B67sE35v0n993L2Nh4Rq08" target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, display: 'block', background: '#E8630A', borderRadius: '8px', padding: '12px 8px', textDecoration: 'none', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{'\u20AC'}995</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginTop: '4px' }}>Plan + coaching</div>
                  </a>
                  {/* Gratis 30-min gesprek — secundair, laatste */}
                  <a href="https://calendly.com/wouter-arts-/vacature-analyse-advies" target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, display: 'block', background: 'white', border: '2px solid #09aedd', borderRadius: '8px', padding: '12px 8px', textDecoration: 'none', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#09aedd', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gratis</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginTop: '4px' }}>30-min gesprek</div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Wat je krijgt */}
          <div style={{ padding: '16px 20px', background: '#f8f9fa', borderTop: '1px solid #e8e8e8' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {['30/60/90 dagen roadmap', 'Tools en templates', 'KPI targets per categorie', 'Implementatie kickoff'].map((item, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#666', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: '#059669' }}>{'\u2713'}</span> {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ GEPERSONALISEERDE CTA — hook per zwakste categorie ═══ */}
        <motion.div {...a(0.65)} style={{ margin: '0 40px 32px', background: '#1a1a1a', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#E8630A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Op basis van jouw assessment</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{ai?.opportunity_hook || trigger.title}</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>{trigger.desc}</div>
          <a href={trigger.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#E8630A', color: 'white', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 20px rgba(232,99,10,0.3)' }}>
            {trigger.cta} {'\u2192'}
          </a>
          <div style={{ marginTop: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Of <a href="https://calendly.com/wouter-arts-/vacature-analyse-advies" target="_blank" rel="noopener noreferrer" style={{ color: '#09aedd', textDecoration: 'underline', fontWeight: 600 }}>plan een gratis 30-min strategiegesprek</a>
          </div>
        </motion.div>

        {/* WHATSAPP */}
        <motion.div {...a(0.72)} style={{ padding: '20px 40px', textAlign: 'center' }}>
          <a href="https://wa.me/31614314593" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: 'white', padding: '12px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Direct een vraag stellen
          </a>
        </motion.div>

        {/* FOOTER */}
        <div style={{ padding: '16px 40px', borderTop: '1px solid #eee', textAlign: 'center', color: '#bbb', fontSize: '11px' }}>
          <strong style={{ color: '#888' }}>Wouter Arts</strong> {'\u00B7'} Recruitin B.V. {'\u00B7'} warts@recruitin.nl
          <br />Dit rapport is vertrouwelijk en bestemd voor {company}.
        </div>
      </div>
    </div>
  );
}
