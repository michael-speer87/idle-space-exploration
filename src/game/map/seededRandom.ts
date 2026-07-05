export type RandomNumberGenerator = () => number;

export function createSeededRandom(seed: number): RandomNumberGenerator {
  let value = seed;

  return function random() {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;

    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;

    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickOne<T>(
  random: RandomNumberGenerator,
  options: readonly T[],
): T {
  const index = Math.floor(random() * options.length);
  return options[index];
}