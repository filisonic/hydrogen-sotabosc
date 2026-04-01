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
        className="w-full bg-white border border-black/10 rounded-full px-5 py-3 text-sm placeholder:text-black/30 focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-black/80 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
