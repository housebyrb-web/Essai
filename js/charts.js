export function createBudgetChartData(budget) {
  const detail = budget?.detail || {};

  return Object.entries(detail).map(([label, value]) => ({
    label,
    value
  }));
}
