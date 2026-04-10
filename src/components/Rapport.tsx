import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

// ============================================================================
// CONFIG
// ============================================================================

interface ClaudeAnalysis {
  executive_summary: string;
  category_insights: Record<string, { strengths: string; improvements: string; impact: string }>;
  quick_wins: string[];
  roi_estimate: string;
}

const CATS = ['Processen', 'Technologie', 'Talent Attraction', 'Data & Analytics'];
const BENCHMARKS: Record<string, number> = {
  'oil': 58, 'gas': 58, 'constructie': 52, 'bouw': 52, 'productie': 48,
  'automation': 62, 'techniek': 55, 'renewables': 60, 'default': 52,
};

function bench(s: string) { for (const [k, v] of Object.entries(BENCHMARKS)) { if (s.toLowerCase().includes(k)) return v; } return 52; }
function clr(p: number) { return p >= 70 ? '#059669' : p >= 40 ? '#E8630A' : '#dc2626'; }
function lbl(p: number) { return p >= 80 ? 'Excellent' : p >= 60 ? 'Goed' : p >= 40 ? 'Gemiddeld' : 'Ontwikkeling Nodig'; }

// ============================================================================
// COMPONENT
// ============================================================================

export function Rapport() {
  const [params] = useSearchParams();
  const score = parseInt(params.get('score') || '0');
  const max = parseInt(params.get('max') || '100');
  const company = params.get('company') || 'Uw bedrijf';
  const contact = params.get('contact') || '';
  const sector = params.get('sector') || '';
  const cats = (params.get('cats') || '').split(',').map(Number);
  const aiRaw = params.get('ai') || '';

  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const bm = bench(sector);
  const diff = pct - bm;
  const today = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  const sc = clr(pct);

  const ai: ClaudeAnalysis | null = useMemo(() => {
    if (!aiRaw) return null;
    try { return JSON.parse(atob(aiRaw)); } catch { return null; }
  }, [aiRaw]);

  const a = (d: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.35 } });

  return (
    <div style={{ background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>

      {/* ═══ HEADER ═══ */}
      <div style={{ background: '#2d2d2d', color: 'white' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', background: '#E8630A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>R</div>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em' }}>RECRUITMENT APK</span>
          </div>
          <span style={{ fontSize: '13px', opacity: 0.6 }}>{today}</span>
        </div>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', background: 'white' }}>

        {/* ═══ HERO ═══ */}
        <motion.div {...a(0)} style={{ padding: '48px 40px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#E8630A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Assessment Rapport</div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', marginBottom: '4px' }}>{company}</h1>
          {sector && <p style={{ fontSize: '15px', color: '#888' }}>{sector}{contact ? ` · ${contact}` : ''}</p>}
        </motion.div>

        {/* ═══ SCORE ═══ */}
        <motion.div {...a(0.15)} style={{ padding: '0 40px 48px', textAlign: 'center' }}>
          <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: `5px solid ${sc}`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontSize: '56px', fontWeight: 900, color: sc, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '16px', color: '#999' }}>/100</span>
          </div>
          <div style={{ display: 'inline-block', background: sc, color: 'white', padding: '5px 18px', borderRadius: '16px', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>{lbl(pct)}</div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            Benchmark: {bm}% · <span style={{ color: diff >= 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>{diff >= 0 ? '+' : ''}{diff}% vs sector</span>
          </div>
        </motion.div>

        {/* ═══ EXECUTIVE SUMMARY (alleen als Claude analyse er is) ═══ */}
        {ai?.executive_summary && (
          <motion.div {...a(0.2)} style={{ margin: '0 40px 40px', background: '#FFFBF5', borderLeft: '4px solid #E8630A', padding: '20px 24px', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#333' }}>{ai.executive_summary}</p>
          </motion.div>
        )}

        {/* ═══ 4 CATEGORIE KAARTEN ═══ */}
        <div style={{ padding: '0 40px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {CATS.map((name, i) => {
            const cp = cats[i] || pct;
            const cc = clr(cp);
            const catScore = Math.round(cp * 25 / 100);
            const catAi = ai?.category_insights?.[name];

            return (
              <motion.div key={name} {...a(0.25 + i * 0.08)} style={{ border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                {/* Kleur indicator top */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: cc }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>{name}</span>
                  <span style={{ fontWeight: 800, fontSize: '20px', color: cc }}>{catScore}/25</span>
                </div>

                {/* Bar */}
                <div style={{ background: '#f0f0f0', borderRadius: '3px', height: '8px', marginBottom: '14px' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${cp}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    style={{ background: cc, borderRadius: '3px', height: '100%' }} />
                </div>

                {/* Korte insight — max 1 zin */}
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                  {catAi?.improvements || (cp >= 65 ? 'Bovengemiddeld — focus op optimalisatie' : cp >= 35 ? 'Verbeterpotentieel aanwezig' : 'Urgente aandacht nodig')}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ═══ QUICK WINS ═══ */}
        <motion.div {...a(0.6)} style={{ margin: '0 40px 40px', background: '#fafafa', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>Quick Wins</h2>
          {(ai?.quick_wins || [
            'Belangrijkste verbeterpunt aanpakken (zie rapport)',
            'Basis KPIs gaan bijhouden',
            'Strategiegesprek inplannen',
          ]).slice(0, 3).map((win, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: i < 2 ? '10px' : 0 }}>
              <div style={{ width: '24px', height: '24px', background: '#E8630A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>{i + 1}</div>
              <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.5 }}>{win}</p>
            </div>
          ))}
        </motion.div>

        {/* ═══ ROI — compact 4 metrics ═══ */}
        <motion.div {...a(0.7)} style={{ margin: '0 40px 40px', background: '#2d2d2d', borderRadius: '12px', padding: '28px', color: 'white' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>Verwachte Impact</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { v: `-${Math.max(15, 45 - Math.round(pct * 0.3))}%`, l: 'Doorlooptijd' },
              { v: `-${Math.max(10, 35 - Math.round(pct * 0.2))}%`, l: 'Cost-per-hire' },
              { v: `+${Math.max(10, 60 - Math.round(pct * 0.4))}%`, l: 'Talent pool' },
              { v: ai?.roi_estimate || `€${Math.max(15, 80 - pct)}K+`, l: 'Besparing/jaar' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#E8630A' }}>{s.v}</div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══ CTA ═══ */}
        <motion.div {...a(0.8)} style={{ padding: '32px 40px 40px', textAlign: 'center', borderTop: '2px solid #E8630A' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>Volgende stap?</h2>
          <p style={{ fontSize: '15px', color: '#888', marginBottom: '24px' }}>30 min strategiegesprek — concreet en vrijblijvend</p>
          <a href="https://wa.me/31614314593" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#E8630A', color: 'white', padding: '14px 36px', borderRadius: '28px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 20px rgba(232,99,10,0.25)' }}>
            Plan gesprek →
          </a>
        </motion.div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ padding: '20px 40px', borderTop: '1px solid #eee', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
          <strong style={{ color: '#666' }}>Wouter Arts</strong> · Recruitin B.V. · warts@recruitin.nl · +31 6 14 31 45 93
          <br />Dit rapport is vertrouwelijk en uitsluitend bestemd voor {company}.
        </div>
      </div>
    </div>
  );
}
