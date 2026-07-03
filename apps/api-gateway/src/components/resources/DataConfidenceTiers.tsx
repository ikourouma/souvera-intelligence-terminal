'use client';

import { motion, useReducedMotion } from 'framer-motion';

const TIERS = [
  {
    key: 'confirmed',
    title: 'Confirmed',
    titleClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20 hover:border-emerald-500/40',
    description:
      'Official published figures from institutional sources with established methodologies.',
  },
  {
    key: 'estimated',
    title: 'Estimated',
    titleClass: 'text-amber-400',
    borderClass: 'border-amber-500/20 hover:border-amber-500/40',
    description:
      'Modelled or benchmark-derived values where official gaps exist — always labelled in the UI.',
  },
  {
    key: 'projected',
    title: 'Projected',
    titleClass: 'text-blue-400',
    borderClass: 'border-blue-500/20 hover:border-blue-500/40',
    description:
      'Forward-looking IMF/WEO and similar projections — never presented as confirmed actuals.',
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardVariantsReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

export function DataConfidenceTiers() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-12 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <h2
          className="text-xl md:text-2xl font-bold mb-6"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Data Confidence Tiers
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {TIERS.map((tier) => (
            <motion.div
              key={tier.key}
              variants={reduceMotion ? cardVariantsReduced : cardVariants}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -4,
                      transition: { duration: 0.2 },
                    }
              }
              className={`w-full min-w-0 p-6 md:p-8 bg-[#121821] border rounded-sm transition-colors ${tier.borderClass}`}
            >
              <h3
                className={`text-base md:text-lg font-bold mb-2 md:mb-3 ${tier.titleClass}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {tier.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{tier.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
