import { loadSiteContent } from "./content-loader.js";
import {
  renderActivityMetrics,
  renderFeatures,
  renderLoadError,
  renderProjectMetrics,
  renderSteps
} from "./dom-renderer.js";
import { initNavigation } from "./navigation.js";

const selectors = {
  activityMetrics: "#indicateurs-activite",
  currentYear: "#annee-courante",
  features: "#fonctionnalites",
  projectMetrics: "#indicateurs-projet",
  steps: "#etapes-projet"
};

export async function initApplication(documentRef = document) {
  initNavigation(documentRef);
  updateCurrentYear(documentRef);

  try {
    const content = await loadSiteContent();
    renderContent(documentRef, content);
  } catch (error) {
    handleLoadError(documentRef, error);
  }
}

function renderContent(documentRef, content) {
  renderProjectMetrics(content.projectMetrics, getElement(documentRef, selectors.projectMetrics));
  renderFeatures(content.features, getElement(documentRef, selectors.features));
  renderActivityMetrics(content.activityMetrics, getElement(documentRef, selectors.activityMetrics));
  renderSteps(content.steps, getElement(documentRef, selectors.steps));
}

function handleLoadError(documentRef, error) {
  console.error(error);
  renderLoadError(
    getElement(documentRef, selectors.projectMetrics),
    "Les données de présentation sont momentanément indisponibles."
  );
}

function updateCurrentYear(documentRef) {
  getElement(documentRef, selectors.currentYear).textContent = String(new Date().getFullYear());
}

function getElement(documentRef, selector) {
  const element = documentRef.querySelector(selector);

  if (!element) {
    throw new Error(`Element introuvable pour le sélecteur ${selector}.`);
  }

  return element;
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initApplication();
  });
}
