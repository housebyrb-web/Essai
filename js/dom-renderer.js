export function renderProjectMetrics(metrics, container) {
  replaceChildren(container, metrics.map(createProjectMetric));
}

export function renderFeatures(features, container) {
  replaceChildren(container, features.map(createFeatureCard));
}

export function renderActivityMetrics(metrics, container) {
  replaceChildren(container, metrics.map(createActivityMetric));
}

export function renderSteps(steps, container) {
  replaceChildren(container, steps.map(createStep));
}

export function renderLoadError(container, message) {
  const alert = createElement("p", "load-error", message);
  alert.setAttribute("role", "alert");
  replaceChildren(container, [alert]);
}

function createProjectMetric(metric) {
  const wrapper = createElement("div", "hero-card__metric");
  const label = createElement("dt", "", metric.label);
  const value = createElement("dd", "", metric.value);

  wrapper.append(label, value);

  return wrapper;
}

function createFeatureCard(feature) {
  const card = createElement("article", "feature-card");
  const icon = createElement("span", "feature-card__icon", feature.icon);
  const title = createElement("h3", "", feature.title);
  const description = createElement("p", "", feature.description);

  icon.setAttribute("aria-hidden", "true");
  card.append(icon, title, description);

  return card;
}

function createActivityMetric(metric) {
  const card = createElement("article", "metric-card");
  const label = createElement("p", "metric-card__label", metric.label);
  const value = createElement("p", "metric-card__value", metric.value);
  const description = createElement("p", "", metric.description);

  card.append(label, value, description);

  return card;
}

function createStep(step) {
  const item = createElement("li", "timeline__item");
  const title = createElement("h3", "", step.title);
  const description = createElement("p", "", step.description);

  item.append(title, description);

  return item;
}

function createElement(tagName, className, text = "") {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  // textContent évite l'injection HTML depuis les données de contenu.
  element.textContent = text;

  return element;
}

function replaceChildren(container, children) {
  container.replaceChildren(...children);
}
