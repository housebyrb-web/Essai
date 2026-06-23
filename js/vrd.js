import { toNumber } from "./utils.js";

export function calculateVrd(input = {}) {
  const vrd = toNumber(input.vrd);
  const raccordements = toNumber(input.raccordements);

  return {
    vrd,
    raccordements,
    total: vrd + raccordements
  };
}
