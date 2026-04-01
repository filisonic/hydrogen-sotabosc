import type { ArtifactActionType } from '../directory/types';

export type GrowthStage = 'seed' | 'sprout' | 'growth' | 'bloom' | 'elder';

export interface GrowthMilestone {
  stage: GrowthStage;
  label: string;
  minXP: number;
  description: string;
  emoji: string;
}

export const GROWTH_STAGES: GrowthMilestone[] = [
  { stage: 'seed',   label: 'Seed',   minXP: 0,   emoji: '🌱', description: 'Just arrived in the ecosystem.' },
  { stage: 'sprout', label: 'Sprout', minXP: 10,  emoji: '🌿', description: 'Beginning to explore.' },
  { stage: 'growth', label: 'Growth', minXP: 30,  emoji: '🌳', description: 'Rooted in the community.' },
  { stage: 'bloom',  label: 'Bloom',  minXP: 75,  emoji: '🌸', description: 'A recognised presence in the city.' },
  { stage: 'elder',  label: 'Elder',  minXP: 150, emoji: '🌍', description: 'A living memory of Sotabosc.' },
];

export const ACTION_XP: Record<ArtifactActionType, number> = {
  listing_view:  1,
  event_view:    2,
  creator_view:  2,
  review_create: 10,
  store_click:   5,
  purchase:      15,
};

export function getXPForAction(action: ArtifactActionType): number {
  return ACTION_XP[action] ?? 0;
}

export function getStageForXP(xp: number): GrowthMilestone {
  return [...GROWTH_STAGES].reverse().find((s) => xp >= s.minXP) ?? GROWTH_STAGES[0];
}

export function getNextStage(xp: number): GrowthMilestone | null {
  return GROWTH_STAGES.find((s) => xp < s.minXP) ?? null;
}

export function getProgressToNext(xp: number): number {
  const next = getNextStage(xp);
  if (!next) return 100;
  const current = getStageForXP(xp);
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.round((progress / range) * 100);
}
