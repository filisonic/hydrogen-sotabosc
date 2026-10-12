import { getCityContext } from '~/lib/city/context.server';

/** Live Barcelona clock + weather for the city UI. No personal data. */
export async function loader() {
  const ctx = await getCityContext();
  return Response.json(ctx, {
    headers: {
      'Cache-Control': 'public, max-age=60',
    },
  });
}
