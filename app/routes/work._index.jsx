import {redirect} from 'react-router';

/**
 * Legacy /work → /research
 * @param {Route.LoaderArgs} _args
 */
export async function loader(_args) {
  throw redirect('/research');
}

export default function WorkRedirect() {
  return null;
}

/** @typedef {import('./+types/work._index').Route} Route */
