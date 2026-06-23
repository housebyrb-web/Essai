export function calculateBudget(parts = {}) {
  const items = [
    createBudgetItem("terrain", "Terrain", parts.terrain?.total, "validé"),
    createBudgetItem("notaire", "Frais d'acquisition", parts.notaire?.total, "validé"),
    createBudgetItem("vrd", "VRD et raccordements", parts.vrd?.total, "validé"),
    createBudgetItem("taxes", "Taxes d'urbanisme", parts.taxes?.total, parts.taxes ? "validé" : "à compléter"),
    createBudgetItem("construction", "Construction maison", parts.construction?.total, "à développer"),
    createBudgetItem("equipements", "Équipements et extérieurs", parts.equipements?.total, "à développer")
  ];
  const activeItems = items.filter((item) => item.amount > 0);
  const subtotal = activeItems.reduce((total, item) => total + item.amount, 0);
  const contingency = subtotal * getContingencyRate(parts);

  return {
    items,
    activeItems,
    detail: getDetail(activeItems),
    subtotal,
    contingency,
    total: subtotal + contingency,
    warnings: getBudgetWarnings(items)
  };
}

function createBudgetItem(id, label, amount = 0, status) {
  return {
    id,
    label,
    amount: Math.max(Number(amount) || 0, 0),
    status
  };
}

function getDetail(items) {
  return items.reduce((detail, item) => {
    return {
      ...detail,
      [item.id]: item.amount
    };
  }, {});
}

function getContingencyRate(parts) {
  const rate = Number(parts.contingencyRate);

  if (Number.isFinite(rate) && rate >= 0) {
    return rate > 1 ? rate / 100 : rate;
  }

  return 0.1;
}

function getBudgetWarnings(items) {
  return items
    .filter((item) => item.status !== "validé")
    .map((item) => `${item.label} : ${item.status}.`);
}
