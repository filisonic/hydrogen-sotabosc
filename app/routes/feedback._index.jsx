import { useState } from 'react';
import { Link } from 'react-router';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';

export const meta = ({ data }) => [
  { title: 'Share Feedback — Sotabosc' },
  {
    name: 'description',
    content:
      "Help us shape the Sotabosc city directory. Share what's working, what's missing, and what places we should add.",
  },
  ...openGraphImageMeta(data?.origin),
];

export async function loader({ request }) {
  return { origin: new URL(request.url).origin };
}

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
    if (!topic) {
      setError('Please choose a topic.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }

    try {
      const key = 'sotabosc-feedback';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(
        key,
        JSON.stringify([
          { topic, message: message.trim(), name: name.trim(), submittedAt: new Date().toISOString() },
          ...existing,
        ]),
      );
    } catch {}

    setSubmitted(true);
  }

  const inputClass =
    'w-full text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 border resize-none transition-shadow';

  return (
    <DirectorySurface>
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link
          to="/city"
          className="text-xs mb-8 inline-block transition-opacity hover:opacity-80"
          style={{ color: 'var(--sotabosc-muted)' }}
        >
          ← Back to directory
        </Link>

        <h1 className="text-3xl font-black tracking-tight mb-2 font-[family-name:var(--font-display)]">
          Share feedback
        </h1>
        <p className="text-sm mb-8 max-w-md" style={{ color: 'var(--sotabosc-muted)' }}>
          Sotabosc is built with and for Barcelona&apos;s creative community. Tell us what&apos;s missing, broken,
          or brilliant.
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
              className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--sotabosc-accent)',
                color: 'var(--sotabosc-surface)',
              }}
            >
              Back to the directory
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-bold mb-2 uppercase tracking-wide"
                style={{ color: 'var(--sotabosc-muted)' }}
              >
                What&apos;s this about?
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTopic(t.id);
                      setError('');
                    }}
                    className="text-sm font-medium px-4 py-2 rounded-full border transition-opacity hover:opacity-90"
                    style={
                      topic === t.id
                        ? {
                            backgroundColor: 'var(--sotabosc-accent)',
                            color: 'var(--sotabosc-surface)',
                            borderColor: 'transparent',
                          }
                        : {
                            backgroundColor: 'var(--sotabosc-surface)',
                            borderColor: 'var(--sotabosc-border)',
                            color: 'var(--sotabosc-muted)',
                          }
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--sotabosc-muted)' }}
              >
                Your name <span className="font-normal normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Laia"
                className={`${inputClass} focus:ring-[var(--sotabosc-accent-soft)]`}
                style={{
                  borderColor: 'var(--sotabosc-border)',
                  backgroundColor: 'var(--sotabosc-surface)',
                  color: 'var(--sotabosc-text)',
                }}
                maxLength={60}
              />
            </div>

            <div>
              <label
                className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--sotabosc-muted)' }}
              >
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError('');
                }}
                placeholder={"Tell us what's on your mind..."}
                rows={5}
                className={`${inputClass} focus:ring-[var(--sotabosc-accent-soft)]`}
                style={{
                  borderColor: 'var(--sotabosc-border)',
                  backgroundColor: 'var(--sotabosc-surface)',
                  color: 'var(--sotabosc-text)',
                }}
                maxLength={1000}
              />
              <p className="text-right text-[10px] mt-0.5" style={{ color: 'var(--sotabosc-muted)', opacity: 0.7 }}>
                {message.length}/1000
              </p>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full font-bold text-sm py-3.5 rounded-xl transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--sotabosc-accent)',
                color: 'var(--sotabosc-surface)',
              }}
            >
              Send feedback
            </button>
          </form>
        )}
      </div>
    </DirectorySurface>
  );
}
