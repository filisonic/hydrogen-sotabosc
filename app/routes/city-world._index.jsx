import { redirect } from 'react-router';

/**
 * Legacy URL — living map is now the homepage at `/`.
 */
export const meta = () => [{ title: 'Sotabosc' }];

export function loader({ request }) {
  const url = new URL(request.url);
  const suffix = url.pathname.replace(/^\/city-world\/?/, '');
  const target = suffix ? `/${suffix}` : '/';
  throw redirect(target, 301);
}

export default function CityWorldRedirect() {
  return null;
}
