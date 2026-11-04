/* Shuffles the items into a new array; the random source can be replaced in tests. */
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const current = result[index];
    const swapped = result[other];
    if (current !== undefined && swapped !== undefined) {
      result[index] = swapped;
      result[other] = current;
    }
  }
  return result;
}
