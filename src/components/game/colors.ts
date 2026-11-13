const PLAYER_COLORS = ['#c67139', '#5f7f9e', '#7a8a5e', '#b0476e', '#c89a1c', '#6b5ca5', '#2f8f83', '#8c491a'];

/** Fast farge per spiller etter rekkefølge, felles for alle spill. */
export function playerColor(i: number): string {
  return PLAYER_COLORS[((i % PLAYER_COLORS.length) + PLAYER_COLORS.length) % PLAYER_COLORS.length];
}

export const GOLD = '#d9a521';
export const GOLD_LIGHT = '#f3d27a';
