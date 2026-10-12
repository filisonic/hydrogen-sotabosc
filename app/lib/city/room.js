/**
 * Optional pixel-office room (WorkAdventure or Gather) linked from Join —
 * never embedded on the homepage. Gather usually blocks iframes; WorkAdventure
 * can be inlined if allow="camera; microphone; fullscreen" is set.
 *
 * Set PUBLIC_VIRTUAL_ROOM_URL (or PUBLIC_WORKADVENTURE_URL) on Oxygen.
 */
export function virtualRoomFromEnv(env) {
  const url = String(env?.PUBLIC_VIRTUAL_ROOM_URL || env?.PUBLIC_WORKADVENTURE_URL || '').trim();
  if (!url) return null;
  const gather = /gather\.(town|gg)/i.test(url);
  return {
    url,
    embed: !gather,
    kind: gather ? 'gather' : 'workadventure',
  };
}
