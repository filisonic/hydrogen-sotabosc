import { useState } from 'react';
import { useNavigate } from 'react-router';

export function DirectorySearchBar({ defaultValue = '', action = '/city' }) {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`${action}?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(action);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search places, events, creators..."
        className="w-full rounded-full px-5 py-3 text-sm transition-all border placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-[var(--sotabosc-accent-soft)] focus:ring-offset-2 focus:ring-offset-[var(--sotabosc-bg)]"
        style={{
          backgroundColor: 'var(--sotabosc-surface)',
          borderColor: 'var(--sotabosc-border)',
          color: 'var(--sotabosc-text)',
        }}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--sotabosc-accent)',
          color: 'var(--sotabosc-surface)',
        }}
      >
        Search
      </button>
    </form>
  );
}
