import { useState } from 'react';
import { Link } from 'react-router';

export const meta = () => [
  { title: 'Share Feedback — Sotabosc' },
  { name: 'description', content: "Help us shape the Sotabosc city directory. Share what's working, what's missing, and what places we should add." },
];

const TOPICS = [
  { id: 'missing-place', label: 'Missing a place' },
  { id: 'wrong-info', label: 'Wrong information' },
  { id: 'feature', label: 'Feature idea' },
  { id: 'bug', label: 'Something broken' },
  { id: 'general', label: 'General feedback' },
];

export default function FeedbackPage() {
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!topic) { setError('Please choose a topic.'); return; }
    if (message.trim().length < 10) { setError('Message must be at least 10 characters.'); return; }

    // Store locally for now (no backend yet)
    try {
      const key = 'sotabosc-feedback';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([
        { topic, message: message.trim(), name: name.trim(), submittedAt: new Date().toISOString() },
        ...existing,
      ]));
    } catch {}

    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link to="/city" className="text-xs text-black/40 hover:text-black/60 transition-colors mb-8 inline-block">
          ← Back to directory
        </Link>

        <h1 className="text-3xl font-black tracking-tight mb-2">Share feedback</h1>
        <p className="text-sm text-black/50 mb-8 max-w-md">
          Sotabosc is built with and for Barcelona's creative community.
          Tell us what's missing, broken, or brilliant.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">🌱</div>
            <h2 className="font-bold text-green-800 mb-2">Thank you — feedback received.</h2>
            <p className="text-sm text-green-600 mb-6">
              We read every submission. Your input shapes what Sotabosc becomes.
            </p>
            <Link
              to="/city"
              className="inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-black/80 transition-colors"
            >
              Back to the directory
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Topic */}
            <div>
              <label className="block text-xs font-bold text-black/40 mb-2 uppercase tracking-wide">
                What's this about?
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTopic(t.id); setError(''); }}
                    className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                      topic === t.id
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black/60 border-black/10 hover:border-black/30'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name (optional) */}
            <div>
              <label className="block text-xs font-bold text-black/40 mb-1.5 uppercase tracking-wide">
                Your name <span className="font-normal normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Laia"
                className="w-full text-sm border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
                maxLength={60}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-black/40 mb-1.5 uppercase tracking-wide">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError(''); }}
                placeholder="Tell us what's on your mind..."
                rows={5}
                className="w-full text-sm border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white resize-none"
                maxLength={1000}
              />
              <p className="text-right text-[10px] text-black/25 mt-0.5">{message.length}/1000</p>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full bg-black text-white font-bold text-sm py-3.5 rounded-xl hover:bg-black/80 transition-colors"
            >
              Send feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
