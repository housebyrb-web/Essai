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
  const status = createElement("span", "wizard-step__status", index === 0 ? "À développer" : "Planifié");

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
