const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=41.39&longitude=2.17&current=temperature_2m,weather_code,is_day&timezone=Europe%2FMadrid';

/** WMO weather codes → short screen copy. */
function describeWeather(code) {
  if (code === 0) return 'clear skies';
  if (code <= 2) return 'a few clouds';
  if (code === 3) return 'overcast';
  if (code <= 48) return 'fog';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'showers';
  return 'storms';
}

/**
 * Live Barcelona context for the signage demo. Never throws — the homepage
 * must render even when the weather API is slow or down.
 */
export async function getCityContext() {
  const nowISO = new Date().toISOString();
  try {
    const response = await Promise.race([
      fetch(WEATHER_URL),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ]);
    if (!response.ok) throw new Error(`weather ${response.status}`);
    const { current } = await response.json();
    return {
      nowISO,
      weather: {
        temperature: Math.round(current.temperature_2m),
        code: current.weather_code,
        summary: describeWeather(current.weather_code),
        isDay: current.is_day === 1,
        wet: current.weather_code >= 51,
      },
    };
  } catch {
    return { nowISO, weather: null };
  }
}
