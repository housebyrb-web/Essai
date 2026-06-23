import { TAXE_DEFAULTS } from "../data/taxe-defaults.js";
import { toNumber } from "./utils.js";

export function calculateTaxes(input = {}) {
  const taxableSurface = toNumber(input.taxableSurface);
  const communalRate = toNumber(input.communalRate);
  const departmentalRate = toNumber(input.departmentalRate);
  const archaeologyRate = toNumber(input.archaeologyRate, TAXE_DEFAULTS.archaeologyRate);
  const baseValue = toNumber(input.taxBaseValue, TAXE_DEFAULTS.horsIleDeFranceBaseValue);
  const taxableValue = getDiscountedSurface(taxableSurface) * baseValue;

  return {
    amenagement: taxableValue * (communalRate + departmentalRate),
    archaeology: taxableValue * archaeologyRate,
    total: taxableValue * (communalRate + departmentalRate + archaeologyRate)
  };
}

function getDiscountedSurface(surface) {
  const discounted = Math.min(surface, TAXE_DEFAULTS.discountThreshold) * 0.5;
  const fullRate = Math.max(surface - TAXE_DEFAULTS.discountThreshold, 0);

  return discounted + fullRate;
}
