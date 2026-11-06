/* Random draws in which a card with a higher weight comes up more often (TWA-14.4). The weight of a
   card comes from the importance score of the player; a card without a weight counts as 1. */

/* The weight of every card by tool key. */
export type Weights = Readonly<Record<string, number>>;

export function weightFor(weights: Weights, key: string): number {
  return weights[key] ?? 1;
}

/* All items in a random order in which heavier items tend to come first (weighted shuffle without
   replacement). Items with a weight of 0 or less are left out. */
export function weightedShuffle<T>(
  items: readonly T[],
  weightOf: (item: T) => number,
): T[] {
  return items
    .flatMap((item) => {
      const weight = weightOf(item);
      return weight > 0 ? [{ item, order: Math.random() ** (1 / weight) }] : [];
    })
    .sort((a, b) => b.order - a.order)
    .map(({ item }) => item);
}

/* The index of one item chosen at random, in proportion to its weight; -1 for an empty list or
   when no item has a weight. */
export function weightedIndex<T>(
  items: readonly T[],
  weightOf: (item: T) => number,
): number {
  const total = items.reduce(
    (sum, item) => sum + Math.max(0, weightOf(item)),
    0,
  );
  if (total <= 0) {
    return -1;
  }
  let point = Math.random() * total;
  for (let index = 0; index < items.length; index += 1) {
    point -= Math.max(0, weightOf(items[index] as T));
    if (point < 0) {
      return index;
    }
  }
  return items.length - 1;
}
