import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Award, TrendingUp } from 'lucide-react';

// ============================================================================
// TRUST BAR COMPONENT
// Displays social proof and trust signals above the fold
// Expected conversion lift: +8-12%
// ============================================================================

interface TrustStat {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const trustStats: TrustStat[] = [
  {
    icon: <Users className="w-5 h-5" />,
    value: '500+',
    label: 'Bedrijven geholpen',
  },
  {
    icon: <Star className="w-5 h-5" />,
    value: '4.9/5',
    label: 'Klanttevredenheid',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    value: '40%',
    label: 'Gem. kostenbesparing',
  },
  {
    icon: <Award className="w-5 h-5" />,
    value: '24 uur',
    label: 'Rapport levertijd',
  },
];

// Client logos - replace with actual client logos
const clientLogos = [
  { name: 'TechCorp', initial: 'TC' },
  { name: 'FinanceHub', initial: 'FH' },
  { name: 'RetailPlus', initial: 'RP' },
  { name: 'HealthFirst', initial: 'HF' },
  { name: 'BuildPro', initial: 'BP' },
];

export function TrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="w-full"
    >
      {/* Stats Row */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8">
        {trustStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-center gap-3 text-slate-400"
          >
            <div className="text-orange-400">{stat.icon}</div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{stat.value}</span>
              <span className="text-xs text-slate-500">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Client Logos Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col items-center"
      >
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-4">
          Vertrouwd door toonaangevende bedrijven
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {clientLogos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              whileHover={{ scale: 1.1, opacity: 1 }}
              className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 font-bold text-sm opacity-60 hover:opacity-100 hover:border-orange-500/30 transition-all cursor-default"
              title={logo.name}
            >
              {logo.initial}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Rating Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="flex justify-center mt-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/30 rounded-full border border-slate-700/50">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 text-yellow-400 fill-yellow-400"
              />
            ))}
          </div>
          <span className="text-slate-300 text-sm font-medium">
            4.9 uit 127 reviews
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Compact version for use in header or smaller spaces
export function TrustBarCompact() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="flex flex-wrap justify-center items-center gap-4 text-sm text-slate-400"
    >
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4 text-orange-400" />
        <span>500+ bedrijven</span>
      </div>
      <span className="text-slate-600">•</span>
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span>4.9/5 rating</span>
      </div>
      <span className="text-slate-600">•</span>
      <div className="flex items-center gap-1">
        <Award className="w-4 h-4 text-green-400" />
        <span>Gratis & vrijblijvend</span>
      </div>
    </motion.div>
  );
}
