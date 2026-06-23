export function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function toNumber(value, fallback = 0) {
  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function createElement(tagName, className, text = "") {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  // textContent protège l'interface contre l'injection HTML.
  element.textContent = text;

  return element;
}
