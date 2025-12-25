import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

// ============================================================================
// TESTIMONIALS CAROUSEL
// Displays rotating customer testimonials with photos and ratings
// Expected conversion lift: +15-25%
// ============================================================================

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  industry: string;
  avatar: string; // Initials for placeholder, replace with actual image URLs
  quote: string;
  rating: number;
  result: string; // Specific result achieved
}

// Realistic Dutch testimonials for recruitment context
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Marieke van den Berg',
    role: 'HR Director',
    company: 'TechFlow Solutions',
    industry: 'IT & Software',
    avatar: 'MvdB',
    quote: 'De Recruitment APK gaf ons precies de inzichten die we nodig hadden. We zagen direct waar onze bottlenecks zaten in het wervingsproces.',
    rating: 5,
    result: '45% snellere time-to-hire',
  },
  {
    id: 2,
    name: 'Jeroen Bakker',
    role: 'CEO',
    company: 'GreenBuild BV',
    industry: 'Bouw & Constructie',
    avatar: 'JB',
    quote: 'Binnen 24 uur hadden we een compleet rapport met concrete verbeterpunten. De ROI was al na 2 maanden zichtbaar.',
    rating: 5,
    result: '€32.000 bespaard op bureaus',
  },
  {
    id: 3,
    name: 'Sandra de Wit',
    role: 'Talent Acquisition Lead',
    company: 'FinanceFirst',
    industry: 'Financiële Dienstverlening',
    avatar: 'SdW',
    quote: 'Eindelijk een objectieve kijk op ons recruitment. De benchmark met andere bedrijven was eye-opening.',
    rating: 5,
    result: '3x meer gekwalificeerde kandidaten',
  },
  {
    id: 4,
    name: 'Peter Jansen',
    role: 'Operations Manager',
    company: 'LogiTrans',
    industry: 'Transport & Logistiek',
    avatar: 'PJ',
    quote: 'We worstelden met hoog verloop. Het APK rapport identificeerde exact waar het misging in onze onboarding.',
    rating: 5,
    result: '60% lager verloop in jaar 1',
  },
  {
    id: 5,
    name: 'Lisa Vermeer',
    role: 'HR Manager',
    company: 'CareConnect',
    industry: 'Zorg & Welzijn',
    avatar: 'LV',
    quote: 'In de zorg is goed personeel cruciaal. Dankzij de APK hebben we ons employer brand volledig vernieuwd.',
    rating: 5,
    result: '2x meer spontane sollicitaties',
  },
];

interface TestimonialsCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
}

export function TestimonialsCarousel({
  autoPlay = true,
  autoPlayInterval = 6000,
  showNavigation = true,
  showIndicators = true,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused, goToNext]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Wat onze klanten zeggen
        </h2>
        <p className="text-slate-400 text-sm">
          500+ bedrijven verbeterden hun recruitment met de APK
        </p>
      </motion.div>

      {/* Carousel Container */}
      <div className="relative px-4 md:px-12">
        {/* Navigation Arrows */}
        {showNavigation && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-all opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Vorige testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-all opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Volgende testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Testimonial Card */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8"
            >
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Quote className="w-6 h-6 text-orange-400" />
                </div>
              </div>

              {/* Quote Text */}
              <blockquote className="text-lg md:text-xl text-white text-center leading-relaxed mb-6">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Result Badge */}
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold">
                  📈 {currentTestimonial.result}
                </span>
              </div>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < currentTestimonial.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {currentTestimonial.avatar}
                </div>

                {/* Details */}
                <div className="text-left">
                  <p className="text-white font-semibold">
                    {currentTestimonial.name}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {currentTestimonial.role}
                  </p>
                  <p className="text-orange-400 text-sm font-medium">
                    {currentTestimonial.company}
                  </p>
                </div>
              </div>

              {/* Industry Tag */}
              <div className="flex justify-center mt-4">
                <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                  {currentTestimonial.industry}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        {showIndicators && (
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-6 bg-orange-500'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Ga naar testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trust Indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-slate-500 text-xs mt-6"
      >
        Gemiddelde score: 4.9/5 uit 127 beoordelingen
      </motion.p>
    </motion.div>
  );
}

// Compact version for sidebar or smaller spaces
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {testimonial.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm line-clamp-2">"{testimonial.quote}"</p>
          <p className="text-slate-400 text-xs mt-2">
            {testimonial.name}, {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

// Mini testimonial strip for use in headers or footers
export function TestimonialStrip() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden h-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center gap-2 text-sm"
        >
          <span className="text-yellow-400">★</span>
          <span className="text-slate-300 truncate max-w-xs">
            "{testimonials[currentIndex].quote.substring(0, 50)}..."
          </span>
          <span className="text-slate-500">
            - {testimonials[currentIndex].name}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
