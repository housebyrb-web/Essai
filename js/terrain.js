import { toNumber } from "./utils.js";

const SURFACE_CATEGORIES = [
  { id: "compact", label: "Terrain compact", maxSurface: 300 },
  { id: "standard", label: "Terrain standard", maxSurface: 800 },
  { id: "large", label: "Grand terrain", maxSurface: 1500 },
  { id: "veryLarge", label: "Très grand terrain", maxSurface: Infinity }
];

export function calculateTerrain(input = {}) {
  const terrain = normalizeTerrainInput(input);
  const pricePerM2 = calculatePricePerM2(terrain.landPrice, terrain.landSurface);

  return {
    ...terrain,
    pricePerM2,
    category: getSurfaceCategory(terrain.landSurface),
    isComplete: isTerrainComplete(terrain),
    warnings: getTerrainWarnings(terrain),
    total: terrain.landPrice
  };
}

export function normalizeTerrainInput(input = {}) {
  return {
    landPrice: sanitizePositiveNumber(input.landPrice),
    landSurface: sanitizePositiveNumber(input.landSurface)
  };
}

export function getSurfaceCategory(surface) {
  const normalizedSurface = sanitizePositiveNumber(surface);

  return SURFACE_CATEGORIES.find((category) => normalizedSurface <= category.maxSurface);
}

function calculatePricePerM2(landPrice, landSurface) {
  if (landPrice <= 0 || landSurface <= 0) {
    return 0;
  }

  return landPrice / landSurface;
}

function isTerrainComplete(terrain) {
  return terrain.landPrice > 0 && terrain.landSurface > 0;
}

function getTerrainWarnings(terrain) {
  const warnings = [];

  if (terrain.landPrice <= 0) {
    warnings.push("Le prix du terrain est nécessaire pour calculer le budget global et les frais de notaire.");
  }

  if (terrain.landSurface <= 0) {
    warnings.push("La surface du terrain est nécessaire pour qualifier la parcelle.");
  }

  if (terrain.landSurface > 0 && terrain.landSurface < 150) {
    warnings.push("Surface très faible : vérifier la constructibilité, les reculs et l'emprise au sol autorisée.");
  }

  return warnings;
}

function sanitizePositiveNumber(value) {
  return Math.max(toNumber(value), 0);
}
