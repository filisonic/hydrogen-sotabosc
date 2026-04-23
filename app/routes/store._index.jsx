import {redirect} from 'react-router';

/** `/store` → storefront catalog (same content as `/collections`). */
export function loader() {
  return redirect('/collections');
}

/** @typedef {import('./+types/store._index').Route} Route */
