import { toNumber } from "./utils.js";

const NOTAIRE_DEFAULTS = {
  transferDutyRate: 0.058,
  reducedTransferDutyRate: 0.00715,
  realEstateSecurityRate: 0.001,
  minimumRealEstateSecurity: 15,
  vatRate: 0.2,
  formalities: 1200,
  disbursements: 400
};

const EMOLUMENT_BRACKETS = [
  { limit: 6500, rate: 0.0387 },
  { limit: 17000, rate: 0.01596 },
  { limit: 60000, rate: 0.01064 },
  { limit: Infinity, rate: 0.00799 }
];

export function calculateNotaireFees(input = {}) {
  const landPrice = sanitizePositiveNumber(input.landPrice);
  const transferDutyRate = getTransferDutyRate(input);
  const transferDuties = landPrice * transferDutyRate;
  const realEstateSecurity = Math.max(
    landPrice * NOTAIRE_DEFAULTS.realEstateSecurityRate,
    landPrice > 0 ? NOTAIRE_DEFAULTS.minimumRealEstateSecurity : 0
  );
  const emoluments = calculateEmoluments(landPrice);
  const emolumentsVat = emoluments * NOTAIRE_DEFAULTS.vatRate;
  const formalities = landPrice > 0 ? NOTAIRE_DEFAULTS.formalities : 0;
  const disbursements = landPrice > 0 ? NOTAIRE_DEFAULTS.disbursements : 0;
  const total = transferDuties + realEstateSecurity + emoluments + emolumentsVat + formalities + disbursements;

  return {
    landPrice,
    acquisitionType: input.acquisitionType || "standard",
    effectiveRate: landPrice > 0 ? total / landPrice : 0,
    detail: {
      transferDuties,
      realEstateSecurity,
      emoluments,
      emolumentsVat,
      formalities,
      disbursements
    },
    total,
    warnings: getNotaireWarnings(input, landPrice)
  };
}

export function calculateEmoluments(price) {
  let remainingPrice = sanitizePositiveNumber(price);
  let previousLimit = 0;
  let total = 0;

  for (const bracket of EMOLUMENT_BRACKETS) {
    const taxableSlice = Math.min(remainingPrice, bracket.limit - previousLimit);

    if (taxableSlice <= 0) {
      break;
    }

    total += taxableSlice * bracket.rate;
    remainingPrice -= taxableSlice;
    previousLimit = bracket.limit;
  }

  return total;
}

function getTransferDutyRate(input) {
  if (input.transferDutyRate !== undefined) {
    return normalizeRate(input.transferDutyRate);
  }

  return input.acquisitionType === "reduced"
    ? NOTAIRE_DEFAULTS.reducedTransferDutyRate
    : NOTAIRE_DEFAULTS.transferDutyRate;
}

function getNotaireWarnings(input, landPrice) {
  const warnings = [];

  if (landPrice <= 0) {
    warnings.push("Le prix du terrain est nécessaire pour estimer les frais d'acquisition.");
  }

  if (!input.acquisitionType) {
    warnings.push("Calcul indicatif basé sur un régime standard. Le notaire confirmera le régime fiscal exact.");
  }

  return warnings;
}

function normalizeRate(value) {
  const rate = toNumber(value);

  return rate > 1 ? rate / 100 : rate;
}

function sanitizePositiveNumber(value) {
  return Math.max(toNumber(value), 0);
}
