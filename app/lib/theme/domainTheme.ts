import type { DomainCategory } from '../directory/types';
import { normalizeDomain, normalizeDomainList } from '../directory/domains';

export type DomainTheme = {
  key: DomainCategory | 'neutral';
  label: string;
  emoji: string;
  bg: string;
  surface: string;
  surfaceMuted: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  border: string;
};

export const NEUTRAL_THEME: DomainTheme = {
  key: 'neutral',
  label: 'Sotabosc',
  emoji: '🌿',
  bg: '#f4f1ea',
  surface: '#ffffff',
  surfaceMuted: '#ebe6dc',
  accent: '#1b4332',
  accentSoft: '#2d6a4f',
  text: '#1a1a1a',
  muted: '#5c5c5c',
  border: 'rgba(27, 67, 50, 0.12)',
};

const THEMES: Record<DomainCategory, DomainTheme> = {
  plants: {
    key: 'plants',
    label: 'Plants',
    emoji: '🌳',
    bg: '#e8f3e6',
    surface: '#ffffff',
    surfaceMuted: '#d4e8d0',
    accent: '#166534',
    accentSoft: '#22c55e',
    text: '#14532d',
    muted: '#3f6212',
    border: 'rgba(22, 101, 52, 0.15)',
  },
  algae: {
    key: 'algae',
    label: 'Algae',
    emoji: '🌊',
    bg: '#dff6fb',
    surface: '#ffffff',
    surfaceMuted: '#c8ecf7',
    accent: '#0e7490',
    accentSoft: '#06b6d4',
    text: '#164e63',
    muted: '#155e75',
    border: 'rgba(14, 116, 144, 0.18)',
  },
  fungi: {
    key: 'fungi',
    label: 'Fungi',
    emoji: '🍄',
    bg: '#f3e8ff',
    surface: '#faf5ff',
    surfaceMuted: '#e9d5ff',
    accent: '#6b21a8',
    accentSoft: '#a855f7',
    text: '#4c1d95',
    muted: '#6b21a8',
    border: 'rgba(107, 33, 168, 0.14)',
  },
  microbes: {
    key: 'microbes',
    label: 'Microbes',
    emoji: '🦠',
    bg: '#fefce8',
    surface: '#fffef5',
    surfaceMuted: '#fef9c3',
    accent: '#a16207',
    accentSoft: '#eab308',
    text: '#713f12',
    muted: '#854d0e',
    border: 'rgba(161, 98, 7, 0.16)',
  },
  animals: {
    key: 'animals',
    label: 'Animals',
    emoji: '🐾',
    bg: '#fff1e6',
    surface: '#fff7ed',
    surfaceMuted: '#ffedd5',
    accent: '#c2410c',
    accentSoft: '#f97316',
    text: '#7c2d12',
    muted: '#9a3412',
    border: 'rgba(194, 65, 12, 0.14)',
  },
  earth: {
    key: 'earth',
    label: 'Earth',
    emoji: '🪨',
    bg: '#f2f0eb',
    surface: '#fafaf9',
    surfaceMuted: '#e7e5e4',
    accent: '#44403c',
    accentSoft: '#78716c',
    text: '#292524',
    muted: '#57534e',
    border: 'rgba(68, 64, 60, 0.14)',
  },
};

export function getDomainTheme(domain: DomainCategory | null | undefined): DomainTheme {
  const key = normalizeDomain(domain);
  if (!key) return NEUTRAL_THEME;
  return THEMES[key];
}

export function itemMatchesUserDomain(
  primaryDomain: string,
  secondaryDomains: string[] | undefined,
  userDomain: string | null,
): boolean {
  if (!userDomain) return true;
  const user = normalizeDomain(userDomain);
  if (!user) return true;
  const primary = normalizeDomain(primaryDomain);
  if (primary === user) return true;
  const secondaries = normalizeDomainList(secondaryDomains as DomainCategory[] | undefined);
  return Boolean(secondaries?.includes(user));
}
