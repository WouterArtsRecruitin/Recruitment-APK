import { CheckCircle, Mail, Phone, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function ThankYou() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-b)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* Succes icoon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(29,184,122,.12)', border: '2px solid rgba(29,184,122,.3)' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: 'var(--green)' }} />
          </div>
        </div>

        {/* Titel */}
        <h1
          className="font-black uppercase mb-4"
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.05,
            color: 'var(--fg)',
          }}
        >
          Assessment <span style={{ color: 'var(--green)' }}>Voltooid!</span>
        </h1>

        {/* Uitleg */}
        <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.65, marginBottom: '32px' }}>
          Bedankt voor het invullen van de Recruitment APK. Ons team analyseert je antwoorden
          en je ontvangt binnen <strong style={{ color: 'var(--fg)' }}>24 uur</strong> je
          persoonlijke rapport inclusief verbeterplan.
        </p>

        {/* Verwachtingen */}
        <div className="bb-card p-6 mb-8 text-left">
          <p className="bb-eyebrow mb-4">Wat kun je verwachten?</p>
          <ul className="space-y-3">
            {[
              'Bevestigingsmail met samenvatting',
              'Analyse door recruitment specialist',
              'APK-rapport met concrete verbeterpunten',
              'Optioneel: gratis strategiegesprek',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3" style={{ color: 'var(--muted)', fontSize: '14px' }}>
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--green)' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <a
            href="mailto:info@recruitin.nl"
            className="bb-btn bb-btn-ghost flex items-center gap-2"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <Mail className="w-4 h-4" />
            info@recruitin.nl
          </a>
          <a
            href="tel:+31313410507"
            className="bb-btn bb-btn-ghost flex items-center gap-2"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <Phone className="w-4 h-4" />
            Bel direct
          </a>
        </div>

        {/* Terug */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2"
          style={{ color: 'var(--primary)', fontSize: '14px', fontFamily: 'var(--font-m)', letterSpacing: '0.04em' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar homepage
        </Link>
      </motion.div>
    </div>
  );
}
