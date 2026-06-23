import { createElement } from "./utils.js";

const WIZARD_STEPS = [
  "Commune",
  "Terrain",
  "Maison",
  "Équipements",
  "Taxes",
  "Budget",
  "Export"
];

const MODULES = [
  ["communes.js", "Recherche de commune, code INSEE et rattachement départemental."],
  ["terrain.js", "Données terrain, surface et contraintes de base."],
  ["notaire.js", "Calcul des frais d'acquisition."],
  ["vrd.js", "VRD, raccordements et accès au terrain."],
  ["taxe.js", "Taxe d'aménagement, RAP et règles fiscales."],
  ["budget.js", "Synthèse globale et postes complémentaires."],
  ["charts.js", "Graphiques SVG sans dépendance externe."],
  ["pdf.js", "Export professionnel imprimable/PDF."],
  ["storage.js", "Sauvegarde automatique des projets."]
];

export function initUi(documentRef = document) {
  renderWizardSteps(documentRef);
  renderModuleGrid(documentRef);
  updateStatus(documentRef, "Architecture V2 chargée");
}

export function updateStatus(documentRef, message) {
  const status = documentRef.getElementById("appStatus");

  if (status) {
    status.textContent = message;
  }
}

export function getCommuneSearchRefs(documentRef = document) {
  return {
    form: getElement(documentRef, "communeSearchForm"),
    input: getElement(documentRef, "communeSearchInput"),
    results: getElement(documentRef, "communeResults"),
    selected: getElement(documentRef, "selectedCommune"),
    status: getElement(documentRef, "communeSearchStatus"),
    submitButton: documentRef.querySelector("#communeSearchForm button[type='submit']"),
    taxSummary: getElement(documentRef, "taxSummary")
  };
}

export function getTerrainRefs(documentRef = document) {
  return {
    form: getElement(documentRef, "terrainForm"),
    landPriceInput: getElement(documentRef, "landPriceInput"),
    landSurfaceInput: getElement(documentRef, "landSurfaceInput"),
    summary: getElement(documentRef, "terrainSummary")
  };
}

export function setCommuneSearchLoading(refs, isLoading) {
  refs.submitButton.disabled = isLoading;
  refs.submitButton.textContent = isLoading ? "Recherche..." : "Rechercher";
}

export function setCommuneSearchMessage(refs, message, state = "info") {
  refs.status.textContent = message;
  refs.status.dataset.state = state;
}

export function renderCommuneResults(refs, communes, onSelect) {
  refs.results.replaceChildren(...communes.map((commune) => createCommuneResult(commune, onSelect)));
}

export function renderSelectedCommune(refs, commune) {
  refs.selected.hidden = false;
  refs.selected.replaceChildren(
    createElement("h3", "", commune.nom),
    createSelectedCommuneDetails(commune)
  );
}

export function clearCommuneResults(refs) {
  refs.results.replaceChildren();
}

export function setTaxSummaryLoading(refs) {
  refs.taxSummary.hidden = false;
  refs.taxSummary.replaceChildren(
    createElement("h3", "", "Fiscalité d'urbanisme"),
    createElement("p", "tax-summary__muted", "Récupération des taux officiels DGFiP/DELTA...")
  );
}

export function renderTaxSummary(refs, rates, estimate, formatCurrency) {
  refs.taxSummary.hidden = false;
  refs.taxSummary.replaceChildren(
    createElement("h3", "", "Fiscalité d'urbanisme"),
    createElement("p", "tax-summary__muted", `Source : ${rates.source}, année ${rates.year}.`),
    createTaxRatesList(rates),
    createTaxEstimate(estimate, formatCurrency),
    createTaxWarnings(rates)
  );
}

export function renderTaxSummaryError(refs) {
  refs.taxSummary.hidden = false;
  refs.taxSummary.replaceChildren(
    createElement("h3", "", "Fiscalité d'urbanisme"),
    createElement(
      "p",
      "tax-summary__error",
      "Les taux officiels ne sont pas disponibles pour le moment. Le calcul fiscal sera relancé automatiquement plus tard."
    )
  );
}

export function renderTerrainSummary(refs, terrain, formatCurrency) {
  refs.summary.replaceChildren(
    createElement("h3", "", "Synthèse terrain"),
    createTerrainMetrics(terrain, formatCurrency),
    createTerrainWarnings(terrain)
  );
}

function renderWizardSteps(documentRef) {
  const container = documentRef.getElementById("wizardSteps");

  if (!container) return;

  container.replaceChildren(...WIZARD_STEPS.map(createWizardStep));
}

function createWizardStep(title, index) {
  const item = createElement("li", "wizard-step");
  const number = createElement("span", "wizard-step__index", String(index + 1).padStart(2, "0"));
  const content = createElement("span", "wizard-step__content");
  const label = createElement("span", "wizard-step__title", title);
  const status = createElement("span", "wizard-step__status", index === 0 ? "En cours" : "Planifié");

  content.append(label, status);
  item.append(number, content);

  return item;
}

function renderModuleGrid(documentRef) {
  const container = documentRef.getElementById("moduleGrid");

  if (!container) return;

  container.replaceChildren(...MODULES.map(createModuleCard));
}

function createModuleCard([name, description]) {
  const card = createElement("article", "module-card");
  const title = createElement("h3", "module-card__name", name);
  const text = createElement("p", "module-card__description", description);

  card.dataset.ready = "true";
  card.append(title, text);

  return card;
}

function createCommuneResult(commune, onSelect) {
  const button = document.createElement("button");
  const name = createElement("span", "commune-result__name", commune.nom);
  const meta = createElement("span", "commune-result__meta", getCommuneMeta(commune));

  button.type = "button";
  button.className = "commune-result";
  button.append(name, meta);
  button.addEventListener("click", () => onSelect(commune));

  return button;
}

function createSelectedCommuneDetails(commune) {
  const list = document.createElement("dl");
  list.append(
    createDefinition("Code INSEE", commune.codeInsee),
    createDefinition("Code postal", commune.codesPostaux.join(", ") || "-"),
    createDefinition("Département", commune.departement?.nom || "-"),
    createDefinition("Région", commune.region?.nom || "-")
  );

  return list;
}

function createDefinition(term, description) {
  const wrapper = document.createElement("div");
  const dt = createElement("dt", "", term);
  const dd = createElement("dd", "", description);

  wrapper.append(dt, dd);

  return wrapper;
}

function getCommuneMeta(commune) {
  const postalCodes = commune.codesPostaux.join(", ");
  const department = commune.departement?.nom || "département inconnu";

  return `${postalCodes} · INSEE ${commune.codeInsee} · ${department}`;
}

function createTaxRatesList(rates) {
  const list = document.createElement("dl");
  list.className = "tax-summary__rates";
  list.append(
    createDefinition("Taux communal retenu", `${formatPercent(rates.communalPercent)} %`),
    createDefinition("Taux départemental", `${formatPercent(rates.departmentalPercent)} %`),
    createDefinition("Taux régional", `${formatPercent(rates.regionalPercent)} %`),
    createDefinition("Archéologie préventive", `${formatPercent(rates.archaeologyPercent)} %`)
  );

  if (rates.isSectorized) {
    list.append(createDefinition("Sectorisation", `${formatPercent(rates.communalMinPercent)} % à ${formatPercent(rates.communalMaxPercent)} %`));
  }

  return list;
}

function createTaxEstimate(estimate, formatCurrency) {
  const wrapper = document.createElement("div");
  wrapper.className = "tax-summary__estimate";
  wrapper.append(
    createElement("p", "tax-summary__label", "Simulation indicative 120 m²"),
    createElement("p", "tax-summary__amount", formatCurrency(estimate.total)),
    createElement("p", "tax-summary__muted", `Taxe d'aménagement : ${formatCurrency(estimate.amenagement)} · RAP : ${formatCurrency(estimate.archaeology)}`)
  );

  return wrapper;
}

function createTaxWarnings(rates) {
  const list = document.createElement("ul");
  list.className = "tax-summary__warnings";

  rates.warnings.forEach((warning) => {
    const item = createElement("li", "", warning);
    list.append(item);
  });

  return list;
}

function createTerrainMetrics(terrain, formatCurrency) {
  const list = document.createElement("dl");
  list.className = "terrain-summary__metrics";
  list.append(
    createDefinition("Prix du terrain", formatCurrency(terrain.landPrice)),
    createDefinition("Surface", terrain.landSurface > 0 ? `${formatNumber(terrain.landSurface)} m²` : "-"),
    createDefinition("Prix au m²", terrain.pricePerM2 > 0 ? `${formatCurrency(terrain.pricePerM2)}/m²` : "-"),
    createDefinition("Catégorie", terrain.category.label)
  );

  return list;
}

function createTerrainWarnings(terrain) {
  const list = document.createElement("ul");
  list.className = "terrain-summary__warnings";

  terrain.warnings.forEach((warning) => {
    list.append(createElement("li", "", warning));
  });

  if (terrain.warnings.length === 0) {
    list.append(createElement("li", "", "Données terrain suffisantes pour les prochains calculateurs."));
  }

  return list;
}

function formatPercent(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0
  }).format(value || 0);
}

function getElement(documentRef, id) {
  const element = documentRef.getElementById(id);

  if (!element) {
    throw new Error(`Élément introuvable : ${id}`);
  }

  return element;
}
