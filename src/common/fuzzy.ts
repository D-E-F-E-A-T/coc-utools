export function fuzzy(origin: string, query: string): number {
  let score = 0;
  for (let qIdx = 0, oIdx = 0; qIdx < query.length && oIdx < origin.length; qIdx++) {
    const ch = query[qIdx];
    for (; oIdx < origin.length; oIdx++) {
      const iCh = origin[oIdx];
      if (ch === iCh) {
        score += 1;
        oIdx += 1;
        break;
      }
    }
  }
  return score;
}
