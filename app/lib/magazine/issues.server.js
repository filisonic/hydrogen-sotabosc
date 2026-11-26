import no0 from './issues/no-0.json';

/** Published magazine issues, newest first. Built from content/magazine/<slug> by `npm run magazine:build <slug>`. */
export const ISSUES = [no0];

export function getIssue(slug) {
  return ISSUES.find((issue) => issue.slug === slug) ?? null;
}
