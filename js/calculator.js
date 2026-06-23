import { calculateBudget } from "./budget.js";
import { CONSTRUCTION_COSTS } from "../data/construction-costs.js";
import { calculateNotaireFees } from "./notaire.js";
import { calculateTaxes } from "./taxe.js";
import { calculateTerrain } from "./terrain.js";
import { calculateVrd } from "./vrd.js";
import { toNumber } from "./utils.js";

export function calculateProject(input = {}) {
  const terrain = calculateTerrain(input);
  const notaire = calculateNotaireFees(input);
  const vrd = calculateVrd(input);
  const taxes = calculateTaxes(input);
  const construction = calculateConstruction(input);

  return calculateBudget({
    input,
    terrain,
    notaire,
    vrd,
    taxes,
    construction
  });
}

export function calculateConstruction(input = {}) {
  const construction = normalizeConstructionInput(input);
  const basePricePerM2 = CONSTRUCTION_COSTS.prestations[construction.prestationLevel];
  const roofCoefficient = CONSTRUCTION_COSTS.toiture[construction.roofType];
  const heatingCoefficient = CONSTRUCTION_COSTS.chauffage[construction.heatingType];
  const sizeCoefficient = getSizeCoefficient(construction.livingSurface);
  const adjustedPricePerM2 = basePricePerM2 * roofCoefficient * heatingCoefficient * sizeCoefficient;
  const total = adjustedPricePerM2 * construction.livingSurface;

  return {
    ...construction,
    basePricePerM2,
    adjustedPricePerM2,
    coefficients: {
      roof: roofCoefficient,
      heating: heatingCoefficient,
      size: sizeCoefficient
    },
    range: {
      low: total * 0.93,
      high: total * 1.1
    },
    total,
    isComplete: construction.livingSurface > 0,
    warnings: getConstructionWarnings(construction)
  };
}

export function normalizeConstructionInput(input = {}) {
  return {
    livingSurface: Math.max(toNumber(input.livingSurface), 0),
    prestationLevel: getAllowedValue(input.prestationLevel, CONSTRUCTION_COSTS.prestations, "standard"),
    roofType: getAllowedValue(input.roofType, CONSTRUCTION_COSTS.toiture, "tuiles"),
    heatingType: getAllowedValue(input.heatingType, CONSTRUCTION_COSTS.chauffage, "pompeAChaleur")
  };
}

function getSizeCoefficient(surface) {
  if (surface <= 0) return 0;
  if (surface < 80) return 1.12;
  if (surface < 120) return 1.05;
  if (surface <= 180) return 1;

  return 0.96;
}

function getConstructionWarnings(construction) {
  const warnings = [];

  if (construction.livingSurface <= 0) {
    warnings.push("La surface habitable est nécessaire pour estimer le coût de construction.");
  }

  if (construction.livingSurface > 180) {
    warnings.push("Grande surface : vérifier les choix architecturaux, la structure et le phasage des lots.");
  }

  return warnings;
}

function getAllowedValue(value, allowedValues, fallback) {
  return Object.hasOwn(allowedValues, value) ? value : fallback;
}
