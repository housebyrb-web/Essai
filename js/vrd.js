import { toNumber } from "./utils.js";

const VRD_DEFAULTS = {
  accessCostPerMeter: 180,
  trenchCostPerMeter: 95,
  servicedConnectionPackage: 2500,
  unservicedConnectionPackage: 12000,
  networkDistanceCostPerMeter: 120,
  stormwaterPackage: 2500,
  individualSanitationPackage: 9000,
  contingencyRate: 0.1
};

export function calculateVrd(input = {}) {
  const normalizedInput = normalizeVrdInput(input);
  const access = normalizedInput.accessLength * VRD_DEFAULTS.accessCostPerMeter;
  const trenches = normalizedInput.networkDistance * VRD_DEFAULTS.trenchCostPerMeter;
  const connections = getConnectionPackage(normalizedInput);
  const networkDistanceExtra = normalizedInput.isServiced
    ? 0
    : normalizedInput.networkDistance * VRD_DEFAULTS.networkDistanceCostPerMeter;
  const stormwater = normalizedInput.includeStormwater ? VRD_DEFAULTS.stormwaterPackage : 0;
  const individualSanitation = normalizedInput.needsIndividualSanitation
    ? VRD_DEFAULTS.individualSanitationPackage
    : 0;
  const subtotal = access + trenches + connections + networkDistanceExtra + stormwater + individualSanitation;
  const contingency = subtotal * VRD_DEFAULTS.contingencyRate;

  return {
    ...normalizedInput,
    detail: {
      access,
      trenches,
      connections,
      networkDistanceExtra,
      stormwater,
      individualSanitation,
      contingency
    },
    subtotal,
    total: subtotal + contingency,
    warnings: getVrdWarnings(normalizedInput)
  };
}

export function normalizeVrdInput(input = {}) {
  return {
    isServiced: toBoolean(input.isServiced),
    accessLength: sanitizePositiveNumber(input.accessLength),
    networkDistance: sanitizePositiveNumber(input.networkDistance),
    includeStormwater: input.includeStormwater === undefined ? true : toBoolean(input.includeStormwater),
    needsIndividualSanitation: toBoolean(input.needsIndividualSanitation)
  };
}

function getConnectionPackage(input) {
  return input.isServiced
    ? VRD_DEFAULTS.servicedConnectionPackage
    : VRD_DEFAULTS.unservicedConnectionPackage;
}

function getVrdWarnings(input) {
  const warnings = [];

  if (!input.isServiced) {
    warnings.push("Terrain non viabilisé : prévoir une validation technique des réseaux disponibles en limite de propriété.");
  }

  if (input.networkDistance > 40) {
    warnings.push("Distance aux réseaux importante : les coûts réels peuvent varier fortement selon les concessionnaires.");
  }

  if (input.accessLength <= 0) {
    warnings.push("La longueur d'accès est nécessaire pour estimer le cheminement chantier et l'accès définitif.");
  }

  if (input.needsIndividualSanitation) {
    warnings.push("Assainissement individuel : une étude de sol et une validation SPANC seront nécessaires.");
  }

  return warnings;
}

function sanitizePositiveNumber(value) {
  return Math.max(toNumber(value), 0);
}

function toBoolean(value) {
  return value === true || value === "true" || value === "oui" || value === "on";
}
