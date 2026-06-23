import { calculateProject } from "./calculator.js";
import { searchCommunes } from "./communes.js";
import { calculateNotaireFees } from "./notaire.js";
import { calculateTaxes, createDefaultTaxInput, fetchTaxRatesForCommune } from "./taxe.js";
import { calculateTerrain } from "./terrain.js";
import { calculateVrd } from "./vrd.js";
import {
  clearCommuneResults,
  getCommuneSearchRefs,
  getTerrainRefs,
  getVrdRefs,
  initUi,
  renderCommuneResults,
  renderNotaireSummary,
  renderSelectedCommune,
  renderTerrainSummary,
  renderTaxSummary,
  renderTaxSummaryError,
  renderVrdSummary,
  setTaxSummaryLoading,
  setCommuneSearchLoading,
  setCommuneSearchMessage,
  updateStatus
} from "./ui.js";
import { formatCurrency } from "./utils.js";

const appState = {
  selectedCommune: null,
  taxRates: null,
  terrain: {
    landPrice: 0,
    landSurface: 0
  },
  vrd: {
    isServiced: false,
    accessLength: 0,
    networkDistance: 0,
    includeStormwater: true,
    needsIndividualSanitation: false
  }
};

export function initApp(documentRef = document) {
  initUi(documentRef);
  initCommuneSearch(documentRef);
  initTerrainForm(documentRef);
  initVrdForm(documentRef);
  calculateProject();
  updateStatus(documentRef, "Recherche commune prête");
}

function initCommuneSearch(documentRef) {
  const refs = getCommuneSearchRefs(documentRef);

  refs.form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleCommuneSearch(documentRef, refs);
  });
}

function initTerrainForm(documentRef) {
  const refs = getTerrainRefs(documentRef);

  refs.form.addEventListener("input", () => {
    appState.terrain = {
      landPrice: refs.landPriceInput.value,
      landSurface: refs.landSurfaceInput.value
    };
    renderTerrain(documentRef, refs);
  });
  renderTerrain(documentRef, refs);
}

function renderTerrain(documentRef, refs) {
  const terrain = calculateTerrain(appState.terrain);
  const notaireFees = calculateNotaireFees(appState.terrain);
  renderTerrainSummary(refs, terrain, formatCurrency);
  renderNotaireSummary(refs, notaireFees, formatCurrency);

  if (terrain.isComplete) {
    updateStatus(documentRef, `Terrain ${formatCurrency(terrain.landPrice)}`);
  }
}

function initVrdForm(documentRef) {
  const refs = getVrdRefs(documentRef);

  refs.form.addEventListener("input", () => {
    appState.vrd = getVrdInput(refs);
    renderVrd(documentRef, refs);
  });
  refs.form.addEventListener("change", () => {
    appState.vrd = getVrdInput(refs);
    renderVrd(documentRef, refs);
  });
  renderVrd(documentRef, refs);
}

function getVrdInput(refs) {
  return {
    isServiced: refs.isServicedInput.value,
    accessLength: refs.accessLengthInput.value,
    networkDistance: refs.networkDistanceInput.value,
    includeStormwater: refs.includeStormwaterInput.checked,
    needsIndividualSanitation: refs.needsIndividualSanitationInput.checked
  };
}

function renderVrd(documentRef, refs) {
  const vrd = calculateVrd(appState.vrd);
  renderVrdSummary(refs, vrd, formatCurrency);

  if (vrd.total > 0) {
    updateStatus(documentRef, `VRD ${formatCurrency(vrd.total)}`);
  }
}

async function handleCommuneSearch(documentRef, refs) {
  const query = refs.input.value.trim();

  if (query.length < 2) {
    setCommuneSearchMessage(refs, "Saisissez au moins 2 caractères.", "error");
    clearCommuneResults(refs);
    return;
  }

  setCommuneSearchLoading(refs, true);
  setCommuneSearchMessage(refs, "Recherche en cours...");

  try {
    const communes = await searchCommunes(query);
    handleCommuneResults(documentRef, refs, communes);
  } catch (error) {
    console.error(error);
    clearCommuneResults(refs);
    setCommuneSearchMessage(refs, "La recherche de commune est momentanément indisponible.", "error");
  } finally {
    setCommuneSearchLoading(refs, false);
  }
}

function handleCommuneResults(documentRef, refs, communes) {
  if (communes.length === 0) {
    clearCommuneResults(refs);
    setCommuneSearchMessage(refs, "Aucune commune trouvée.", "error");
    return;
  }

  renderCommuneResults(refs, communes, (commune) => selectCommune(documentRef, refs, commune));
  setCommuneSearchMessage(refs, `${communes.length} commune(s) trouvée(s).`);
}

async function selectCommune(documentRef, refs, commune) {
  appState.selectedCommune = commune;
  renderSelectedCommune(refs, commune);
  clearCommuneResults(refs);
  setCommuneSearchMessage(refs, `Commune sélectionnée : ${commune.nom}.`);
  setTaxSummaryLoading(refs);
  updateStatus(documentRef, `Chargement fiscal INSEE ${commune.codeInsee}`);

  try {
    const rates = await fetchTaxRatesForCommune(commune);
    const estimate = calculateTaxes(createDefaultTaxInput(commune, rates));
    appState.taxRates = rates;
    renderTaxSummary(refs, rates, estimate, formatCurrency);
    updateStatus(documentRef, `Taux fiscaux chargés ${commune.codeInsee}`);
  } catch (error) {
    console.error(error);
    renderTaxSummaryError(refs);
    updateStatus(documentRef, `Commune INSEE ${commune.codeInsee}`);
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
  });
}
