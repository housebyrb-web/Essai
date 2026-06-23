export function calculateBudget(parts = {}) {
  const terrain = parts.terrain?.total || 0;
  const notaire = parts.notaire?.total || 0;
  const vrd = parts.vrd?.total || 0;
  const taxes = parts.taxes?.total || 0;

  return {
    detail: {
      terrain,
      notaire,
      vrd,
      taxes
    },
    total: terrain + notaire + vrd + taxes
  };
}
