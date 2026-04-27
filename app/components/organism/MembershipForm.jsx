import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MembershipForm({ domain, organismName }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('domain', domain);
            formData.append('organismName', organismName || '');
            
            const res = await fetch('/api/organism/save', {
                method: 'POST',
                body: formData
            });
            
            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div>
            <AnimatePresence mode="wait">
                {status === 'success' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                    >
                        <p className="text-sm text-green-400 font-medium mb-1">Organism Saved</p>
                        <p className="text-xs text-green-400/60">You will receive weekly {domain} trips.</p>
                    </motion.div>
                ) : (
                    <motion.form 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit} 
                        className="space-y-3"
                    >
                        <div className="relative">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email to save organism..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <button 
                                type="submit"
                                disabled={status === 'loading'}
                                className="absolute right-1 top-1 bottom-1 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                {status === 'loading' ? '...' : 'Save'}
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[10px] text-white/40">
                                Free tier: Weekly curated trips
                            </p>
                            <a href="#paid-tier" className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                                View Paid Tier (Magazine & Art) →
                            </a>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
