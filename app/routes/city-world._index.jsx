import {redirect} from 'react-router';

/**
 * Legacy URL — living map now lives at `/map`. Homepage is the magazine edition.
 */
export const meta = () => [{title: 'Sotabosc'}];

export function loader({request}) {
  const url = new URL(request.url);
  const suffix = url.pathname.replace(/^\/city-world\/?/, '');
  const target = suffix ? `/map/${suffix}`.replace(/\/+/g, '/') : '/map';
  throw redirect(target + url.search, 301);
}

export default function CityWorldRedirect() {
  return null;
}
