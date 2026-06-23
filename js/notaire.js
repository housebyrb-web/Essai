import { toNumber } from "./utils.js";

const DEFAULT_NOTAIRE_RATE = 0.075;

export function calculateNotaireFees(input = {}) {
  const landPrice = toNumber(input.landPrice);
  const rate = toNumber(input.notaireRate, DEFAULT_NOTAIRE_RATE);

  return {
    rate,
    total: landPrice * rate
  };
}
