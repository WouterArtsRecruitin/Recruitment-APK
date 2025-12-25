import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, CheckCircle, Loader2, X, Mail, ArrowRight, Gift, Target, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { trackLeadMagnetDownload } from './GoogleAdsRemarketing';
import { clarityTrack } from './MicrosoftClarity';

// ============================================================================
// LEAD MAGNET COMPONENT
// Downloadable resources to capture leads
// Expected conversion lift: +10-20% email capture rate
// ============================================================================

interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fileName: string;
  fileUrl?: string; // Optional: direct download URL
  tags: string[];
  color: string;
}

// Available lead magnets
const LEAD_MAGNETS: LeadMagnet[] = [
  {
    id: 'recruitment-checklist',
    title: 'Recruitment Optimalisatie Checklist',
    description: '15 directe verbeterpunten voor jouw wervingsproces. Gebaseerd op data van 500+ bedrijven.',
    icon: <FileText className="w-6 h-6" />,
    fileName: 'Recruitment_Optimalisatie_Checklist.pdf',
    tags: ['PDF', '15 tips', 'Direct toepasbaar'],
    color: 'orange',
  },
  {
    id: 'interview-template',
    title: 'Gestructureerd Interview Template',
    description: 'Professionele vragenlijst voor consistente en eerlijke sollicitatiegesprekken.',
    icon: <Target className="w-6 h-6" />,
    fileName: 'Interview_Template_NL.pdf',
    tags: ['PDF', 'Template', 'HR-approved'],
    color: 'blue',
  },
  {
    id: 'salary-benchmark',
    title: 'Salaris Benchmark 2025',
    description: 'Actuele salarisdata voor 50+ functies in Nederland. Blijf competitief.',
    icon: <TrendingUp className="w-6 h-6" />,
    fileName: 'Salaris_Benchmark_2025.pdf',
    tags: ['PDF', '50+ functies', 'NL data'],
    color: 'green',
  },
];

interface LeadMagnetCardProps {
  magnet: LeadMagnet;
  onDownload: (magnet: LeadMagnet) => void;
}

function LeadMagnetCard({ magnet, onDownload }: LeadMagnetCardProps) {
  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
  };

  const iconColorClasses = {
    orange: 'text-orange-400 bg-orange-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    green: 'text-green-400 bg-green-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative bg-gradient-to-br ${colorClasses[magnet.color as keyof typeof colorClasses]} backdrop-blur-sm rounded-xl border p-6 cursor-pointer transition-all`}
      onClick={() => onDownload(magnet)}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg ${iconColorClasses[magnet.color as keyof typeof iconColorClasses]} flex items-center justify-center mb-4`}>
        {magnet.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">{magnet.title}</h3>

      {/* Description */}
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{magnet.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {magnet.tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Download CTA */}
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <Download className="w-4 h-4" />
        Gratis Downloaden
        <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

interface LeadMagnetModalProps {
  magnet: LeadMagnet;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, name: string) => Promise<void>;
}

function LeadMagnetModal({ magnet, isOpen, onClose, onSubmit }: LeadMagnetModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(email, name);
      setIsSuccess(true);

      // Track conversion
      trackLeadMagnetDownload(magnet.id);
      clarityTrack.exitIntentConverted();

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setEmail('');
        setName('');
      }, 3000);
    } catch (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  }, [email, name, isLoading, onSubmit, magnet.id, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10 p-1"
                aria-label="Sluiten"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="p-8">
                {!isSuccess ? (
                  <>
                    {/* Icon */}
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Gift className="w-8 h-8 text-orange-400" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                      {magnet.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-400 text-center mb-6">
                      {magnet.description}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Je naam"
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="je@email.nl"
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />

                      {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 h-auto rounded-lg font-semibold transition-all disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Verzenden...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 mr-2" />
                            Download {magnet.fileName.split('.')[1].toUpperCase()}
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Privacy note */}
                    <p className="text-slate-500 text-xs text-center mt-4">
                      We respecteren je privacy. Geen spam, beloofd.
                    </p>
                  </>
                ) : (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Check je inbox!
                    </h3>
                    <p className="text-slate-300">
                      {magnet.fileName} is onderweg naar {email}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Bottom decoration */}
              <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface LeadMagnetSectionProps {
  onLeadCapture?: (data: { email: string; name: string; magnetId: string }) => Promise<void>;
}

export function LeadMagnetSection({ onLeadCapture }: LeadMagnetSectionProps) {
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);

  const handleDownload = useCallback((magnet: LeadMagnet) => {
    setSelectedMagnet(magnet);
  }, []);

  const handleSubmit = useCallback(async (email: string, name: string) => {
    if (!selectedMagnet) return;

    // Call parent handler if provided
    if (onLeadCapture) {
      await onLeadCapture({
        email,
        name,
        magnetId: selectedMagnet.id,
      });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Here you would:
    // 1. Add to email list (Mailchimp, ActiveCampaign, etc.)
    // 2. Trigger email with download link
    // 3. Add to CRM
  }, [selectedMagnet, onLeadCapture]);

  return (
    <section className="py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white mb-4"
        >
          Gratis Recruitment Resources
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 max-w-2xl mx-auto"
        >
          Download onze gratis templates en checklists om direct aan de slag te gaan
          met het verbeteren van je wervingsproces.
        </motion.p>
      </div>

      {/* Lead Magnet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {LEAD_MAGNETS.map((magnet, index) => (
          <motion.div
            key={magnet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <LeadMagnetCard magnet={magnet} onDownload={handleDownload} />
          </motion.div>
        ))}
      </div>

      {/* Download Modal */}
      {selectedMagnet && (
        <LeadMagnetModal
          magnet={selectedMagnet}
          isOpen={!!selectedMagnet}
          onClose={() => setSelectedMagnet(null)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}

// ============================================================================
// COMPACT LEAD MAGNET CTA
// For use in sidebar or footer
// ============================================================================

export function LeadMagnetCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mainMagnet = LEAD_MAGNETS[0];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Gratis Checklist</h3>
            <p className="text-slate-400 text-sm mb-3">
              15 tips om je recruitment direct te verbeteren
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </motion.div>

      <LeadMagnetModal
        magnet={mainMagnet}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }}
      />
    </>
  );
}

export { LEAD_MAGNETS };
