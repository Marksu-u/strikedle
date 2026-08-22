// Canonical ordering for every generated pool.
//
// `lib/daily/deck.ts` applies its seeded permutation to the input array's ORDER,
// so two pools holding the same players in a different order produce different
// answers for every future day — with membership completely unchanged. Sorting
// before writing is what makes the draw depend on WHO is in the pool rather than
// on the order the generator happened to walk the centre in.

export function canonicalise<T extends { name: string }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase(), "en"),
  );
}
