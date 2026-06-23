import { calculateProject } from "./calculator.js";
import { initUi, updateStatus } from "./ui.js";

export function initApp(documentRef = document) {
  initUi(documentRef);
  calculateProject();
  updateStatus(documentRef, "Prêt pour l'étape 5");
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
  });
}
