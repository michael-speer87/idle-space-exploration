export const BASE_EXPEDITION_CREDITS = 100;
export const EXPEDITION_CREDITS_PER_INFLUENCE = 10;

export const BASE_CREDITS_PER_MATERIAL = 1;
export const GRAD_COMMAND_STARTER_ENERGY = 10;

export function getExpeditionStartingCredits(
  lifetimeInfluence: number,
): number {
  const safeLifetimeInfluence = Math.max(
    0,
    Math.floor(lifetimeInfluence),
  );

  return (
    BASE_EXPEDITION_CREDITS +
    safeLifetimeInfluence *
      EXPEDITION_CREDITS_PER_INFLUENCE
  );
}