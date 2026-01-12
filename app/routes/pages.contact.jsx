import {motion} from 'framer-motion';
import AnimateOnScroll from '~/components/AnimateOnScroll';
import CustomImage from '~/components/CustomImage';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Sotabosc | Contact'}];
};

export default function Contact() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-light via-dark-bg to-yellow-dark opacity-30" />
        <div className="max-w-4xl mx-auto w-full relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="text-sm text-black/60 uppercase tracking-[0.2em] font-medium">Contact</span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-black mb-8 leading-tight lowercase tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Get in Touch
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-black/80 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Interested in partnering, collaborating, or learning more about our work? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 md:py-36 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <AnimateOnScroll direction="fade" delay={0.1}>
              <div className="bg-white/50 rounded-xl p-8 border border-black/10">
                <h2 className="text-3xl font-bold mb-6 lowercase tracking-wide">Visit Us</h2>
                <div className="space-y-4 text-black/80 leading-relaxed">
                  <p className="text-lg">
                    <strong className="text-black">Address:</strong>
                  </p>
                  <p>
                    2, Ground Floor<br />
                    Carrer de Progrés, 13<br />
                    Barcelona, Spain
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="fade" delay={0.2}>
              <div className="bg-white/50 rounded-xl p-8 border border-black/10">
                <h2 className="text-3xl font-bold mb-6 lowercase tracking-wide">Contact</h2>
                <div className="space-y-6 text-black/80 leading-relaxed">
                  <div>
                    <p className="text-lg mb-2">
                      <strong className="text-black">Phone:</strong>
                    </p>
                    <p>
                      <a 
                        href="tel:+34608706702" 
                        className="hover:opacity-70 transition-opacity"
                      >
                        +34 608 706 702
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-lg mb-2">
                      <strong className="text-black">Email:</strong>
                    </p>
                    <p>
                      <a 
                        href="mailto:hola@sotabosc.world" 
                        className="hover:opacity-70 transition-opacity"
                      >
                        hola@sotabosc.world
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll direction="fade" delay={0.3}>
            <div className="mt-12 text-center">
              <p className="text-black/60 text-lg leading-relaxed">
                We're always open to new collaborations, partnerships, and conversations about speculative futures, world-building, and creative practice.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/pages.contact').Route} Route */
