import { useEffect, useState } from 'react';

/**
 * Barcelona clock ticks every 30s in the browser; weather refreshes from
 * `/api/city-context` (Open-Meteo, Europe/Madrid) about every ten minutes.
 */
export function useLiveCityContext(initial) {
  const [weather, setWeather] = useState(initial?.weather ?? null);
  const [now, setNow] = useState(() => new Date(initial?.nowISO ?? Date.now()));

  useEffect(() => {
    setNow(new Date());
    const clock = window.setInterval(() => setNow(new Date()), 30_000);

    let cancelled = false;
    const loadWeather = async () => {
      try {
        const res = await fetch('/api/city-context');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.weather) setWeather(data.weather);
      } catch {
        /* keep the last reading */
      }
    };
    loadWeather();
    const weatherTick = window.setInterval(loadWeather, 10 * 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(clock);
      window.clearInterval(weatherTick);
    };
  }, []);

  return { now, weather };
}
