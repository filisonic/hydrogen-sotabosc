import {redirect} from 'react-router';

/**
 * Legacy /work → /research
 */
export async function loader() {
  throw redirect('/research');
}

export default function WorkRedirect() {
  return null;
}

/** @typedef {import('./+types/work._index').Route} Route */
