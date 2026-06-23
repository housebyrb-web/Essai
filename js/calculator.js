import { calculateBudget } from "./budget.js";
import { calculateNotaireFees } from "./notaire.js";
import { calculateTaxes } from "./taxe.js";
import { calculateTerrain } from "./terrain.js";
import { calculateVrd } from "./vrd.js";

export function calculateProject(input = {}) {
  const terrain = calculateTerrain(input);
  const notaire = calculateNotaireFees(input);
  const vrd = calculateVrd(input);
  const taxes = calculateTaxes(input);

  return calculateBudget({
    input,
    terrain,
    notaire,
    vrd,
    taxes
  });
}
