import { calculateProject } from "./calculator.js";
import { searchCommunes } from "./communes.js";
import {
  clearCommuneResults,
  getCommuneSearchRefs,
  initUi,
  renderCommuneResults,
  renderSelectedCommune,
  setCommuneSearchLoading,
  setCommuneSearchMessage,
  updateStatus
} from "./ui.js";

const appState = {
  selectedCommune: null
};

export function initApp(documentRef = document) {
  initUi(documentRef);
  initCommuneSearch(documentRef);
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

function selectCommune(documentRef, refs, commune) {
  appState.selectedCommune = commune;
  renderSelectedCommune(refs, commune);
  clearCommuneResults(refs);
  setCommuneSearchMessage(refs, `Commune sélectionnée : ${commune.nom}.`);
  updateStatus(documentRef, `Commune INSEE ${commune.codeInsee}`);
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
  });
}
