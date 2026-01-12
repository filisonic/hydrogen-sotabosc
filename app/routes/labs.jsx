import {motion} from 'framer-motion';
import AnimateOnScroll from '~/components/AnimateOnScroll';
import CustomImage from '~/components/CustomImage';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Sotabosc | Speculative Futures Lab'}];
};

export default function Labs() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-light via-dark-bg to-yellow-dark opacity-30" />
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="text-sm text-black/60 uppercase tracking-[0.2em] font-medium">Labs</span>
          </motion.div>

          <motion.h1
            className="text-7xl md:text-9xl lg:text-[10rem] font-black mb-8 leading-[0.9] gradient-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Speculative
            <br />
            <span className="text-black/90">Futures</span>
            <br />
            <span className="text-black/70">Lab</span>
          </motion.h1>
          
          <motion.p
            className="text-2xl md:text-3xl text-black/80 mb-10 max-w-3xl leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Our research and practice areas exploring speculative futures, embodied interaction, and emergent systems.
          </motion.p>
        </div>
      </section>

      {/* Labs Content */}
      <section className="py-24 md:py-36 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll direction="fade" delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Research Areas</h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Speculative Design',
                description: 'Exploring possible futures through design fiction and world-building.',
              },
              {
                title: 'Embodied Interaction',
                description: 'Investigating the relationship between body, technology, and space.',
              },
              {
                title: 'Emergent Systems',
                description: 'Studying complex adaptive systems and their behaviors.',
              },
            ].map((lab, index) => (
              <AnimateOnScroll key={lab.title} direction="up" delay={index * 0.1}>
                <div className="bg-white/50 rounded-xl p-8 border border-black/10 hover:border-black/20 transition-colors">
                  <h3 className="text-2xl font-bold mb-4">{lab.title}</h3>
                  <p className="text-black/70 leading-relaxed">{lab.description}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/labs').Route} Route */
