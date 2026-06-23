import { toNumber } from "./utils.js";

export function calculateTerrain(input = {}) {
  const landPrice = toNumber(input.landPrice);
  const landSurface = toNumber(input.landSurface);

  return {
    landPrice,
    landSurface,
    total: landPrice
  };
}
