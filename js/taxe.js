import { TAXE_DEFAULTS } from "../data/taxe-defaults.js";
import { toNumber } from "./utils.js";

const ZONES = {
  communal: "Communale",
  departmental: "Départementale",
  regional: "Régionale"
};

const taxRateCache = new Map();

export class TaxRatesError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = "TaxRatesError";
    this.status = status;
  }
}

export async function fetchTaxRatesForCommune(commune, options = {}) {
  const codeInsee = getInseeCode(commune);
  const departmentCode = getDepartmentCode(commune);
  const communeCode = codeInsee.slice(departmentCode.length);
  const year = options.year || TAXE_DEFAULTS.referenceYear;
  const cacheKey = `${codeInsee}-${year}`;

  if (taxRateCache.has(cacheKey)) {
    return taxRateCache.get(cacheKey);
  }

  const [communalRates, departmentalRate, regionalRate] = await Promise.all([
    fetchCommunalRates(departmentCode, communeCode, year, options),
    fetchSingleRate(ZONES.departmental, departmentCode, year, options),
    shouldFetchRegionalRate(departmentCode) ? fetchSingleRate(ZONES.regional, departmentCode, year, options) : null
  ]);

  const rates = normalizeTaxRates({
    commune,
    year,
    communalRates,
    departmentalRate,
    regionalRate
  });
  taxRateCache.set(cacheKey, rates);

  return rates;
}

export function calculateTaxes(input = {}) {
  const rates = normalizeRatesInput(input.rates || input);
  const baseValue = getBaseValue(input);
  const constructionSurface = getConstructionSurface(input);
  const discountedSurface = getDiscountedSurface(constructionSurface);
  const constructionBase = discountedSurface * baseValue;
  const poolBase = toNumber(input.poolSurface) * TAXE_DEFAULTS.poolBaseValue;
  const parkingBase = getExternalParkingCount(input) * getExternalParkingBaseValue(input);
  const taxableBase = constructionBase + poolBase + parkingBase;
  const amenagementRate = rates.communal + rates.departmental + rates.regional;
  const amenagement = taxableBase * amenagementRate;
  const archaeology = taxableBase * rates.archaeology;

  return {
    bases: {
      construction: constructionBase,
      piscine: poolBase,
      stationnement: parkingBase,
      total: taxableBase
    },
    rates,
    amenagement,
    archaeology,
    total: amenagement + archaeology
  };
}

export function createDefaultTaxInput(commune, rates) {
  return {
    commune,
    rates,
    taxableSurface: 120,
    garageSurface: 0,
    annexesSurface: 0,
    poolSurface: 0,
    carportCount: 0,
    externalParkingCount: 0
  };
}

async function fetchCommunalRates(departmentCode, communeCode, year, options) {
  const url = buildRecordsUrl({
    where: [
      `zone_application="${ZONES.communal}"`,
      `departement="${departmentCode}"`,
      `commune="${communeCode}"`,
      getApplicabilityWhere(year)
    ].join(" and "),
    select: "taux,count(*) as total",
    groupBy: "taux",
    orderBy: "taux desc",
    limit: 50
  });
  const data = await fetchJson(url, options);

  return data.results || [];
}

async function fetchSingleRate(zone, departmentCode, year, options) {
  const url = buildRecordsUrl({
    where: [
      `zone_application="${zone}"`,
      `departement="${departmentCode}"`,
      getApplicabilityWhere(year)
    ].join(" and "),
    orderBy: "date_effet desc",
    limit: 1
  });
  const data = await fetchJson(url, options);

  return data.results?.[0] || null;
}

async function fetchJson(url, options) {
  const fetcher = getFetcher(options.fetcher);
  const response = await fetcher(url, { signal: options.signal });

  if (!response.ok) {
    throw new TaxRatesError(`Récupération des taux impossible (${response.status}).`, response.status);
  }

  return response.json();
}

function normalizeTaxRates({ commune, year, communalRates, departmentalRate, regionalRate }) {
  const normalizedCommunalRates = communalRates.map(normalizeGroupedRate).filter(Boolean);
  const selectedCommunalRate = getSelectedCommunalRate(normalizedCommunalRates);

  return {
    source: "DGFiP DELTA - data.economie.gouv.fr",
    year,
    communeCode: getInseeCode(commune),
    communeName: commune.nom,
    communal: selectedCommunalRate.rate / 100,
    communalPercent: selectedCommunalRate.rate,
    communalMinPercent: getRateBoundary(normalizedCommunalRates, "min"),
    communalMaxPercent: getRateBoundary(normalizedCommunalRates, "max"),
    communalSectors: normalizedCommunalRates,
    isSectorized: normalizedCommunalRates.length > 1,
    departmental: toPercentRate(departmentalRate?.taux),
    departmentalPercent: toNumber(departmentalRate?.taux),
    regional: toPercentRate(regionalRate?.taux),
    regionalPercent: toNumber(regionalRate?.taux),
    archaeology: TAXE_DEFAULTS.archaeologyRate,
    archaeologyPercent: TAXE_DEFAULTS.archaeologyRate * 100,
    warnings: getRateWarnings(normalizedCommunalRates)
  };
}

function normalizeGroupedRate(rate) {
  const value = toNumber(rate.taux, null);

  if (value === null) {
    return null;
  }

  return {
    rate: value,
    count: toNumber(rate.total)
  };
}

function getSelectedCommunalRate(rates) {
  if (rates.length === 0) {
    return { rate: 0, count: 0 };
  }

  // En commune sectorisée, retenir le taux le plus élevé évite une sous-estimation en l'absence de parcelle.
  return rates.reduce((selected, rate) => (rate.rate > selected.rate ? rate : selected), rates[0]);
}

function getRateBoundary(rates, type) {
  if (rates.length === 0) {
    return 0;
  }

  const values = rates.map((rate) => rate.rate);

  return type === "min" ? Math.min(...values) : Math.max(...values);
}

function getRateWarnings(rates) {
  if (rates.length <= 1) {
    return [];
  }

  return [
    "La commune possède plusieurs taux sectorisés. Sans référence parcellaire, le taux communal maximal est retenu."
  ];
}

function getDiscountedSurface(surface) {
  const discounted = Math.min(surface, TAXE_DEFAULTS.discountThreshold) * 0.5;
  const fullRate = Math.max(surface - TAXE_DEFAULTS.discountThreshold, 0);

  return discounted + fullRate;
}

function getConstructionSurface(input) {
  return toNumber(input.taxableSurface) + toNumber(input.garageSurface) + toNumber(input.annexesSurface);
}

function getExternalParkingCount(input) {
  return toNumber(input.externalParkingCount) + toNumber(input.carportCount);
}

function getExternalParkingBaseValue(input) {
  return toNumber(input.externalParkingBaseValue, TAXE_DEFAULTS.externalParkingBaseValue);
}

function getBaseValue(input) {
  if (input.taxBaseValue) {
    return toNumber(input.taxBaseValue);
  }

  if (!input.commune) {
    return TAXE_DEFAULTS.horsIleDeFranceBaseValue;
  }

  return isIleDeFrance(input.commune) ? TAXE_DEFAULTS.ileDeFranceBaseValue : TAXE_DEFAULTS.horsIleDeFranceBaseValue;
}

function normalizeRatesInput(rates) {
  return {
    communal: normalizeRate(rates.communalPercent, rates.communalRate ?? rates.communal),
    departmental: normalizeRate(rates.departmentalPercent, rates.departmentalRate ?? rates.departmental),
    regional: normalizeRate(rates.regionalPercent, rates.regionalRate ?? rates.regional),
    archaeology: normalizeRate(
      rates.archaeologyPercent,
      rates.archaeologyRate ?? rates.archaeology ?? TAXE_DEFAULTS.archaeologyRate
    )
  };
}

function normalizeRate(percentValue, decimalValue) {
  if (percentValue !== undefined && percentValue !== null) {
    return toNumber(percentValue) / 100;
  }

  return toPercentRate(decimalValue);
}

function toPercentRate(value) {
  const numericValue = toNumber(value);

  return numericValue > 1 ? numericValue / 100 : numericValue;
}

function buildRecordsUrl({ where, select, groupBy, orderBy, limit }) {
  const url = new URL(TAXE_DEFAULTS.datasetUrl);
  url.searchParams.set("where", where);
  url.searchParams.set("limit", String(limit || 20));

  if (select) url.searchParams.set("select", select);
  if (groupBy) url.searchParams.set("group_by", groupBy);
  if (orderBy) url.searchParams.set("order_by", orderBy);

  return url;
}

function getApplicabilityWhere(year) {
  const date = `${year}-01-01`;

  return `date_effet<=date'${date}' and (date_fin is null or date_fin>=date'${date}')`;
}

function getInseeCode(commune) {
  const code = commune?.codeInsee || commune?.code;

  if (!code) {
    throw new TaxRatesError("Le code INSEE de la commune est obligatoire.");
  }

  return code;
}

function getDepartmentCode(commune) {
  const departmentCode = commune?.departement?.code;

  if (departmentCode) {
    return departmentCode;
  }

  return getInseeCode(commune).slice(0, 2);
}

function shouldFetchRegionalRate(departmentCode) {
  return TAXE_DEFAULTS.ileDeFranceDepartments.includes(departmentCode);
}

function isIleDeFrance(commune) {
  if (!commune) {
    return false;
  }

  return TAXE_DEFAULTS.ileDeFranceDepartments.includes(getDepartmentCode(commune));
}

function getFetcher(fetcher) {
  const resolvedFetcher = fetcher || globalThis.fetch;

  if (typeof resolvedFetcher !== "function") {
    throw new TaxRatesError("Le service officiel des taux de taxe n'est pas disponible.");
  }

  return resolvedFetcher;
}
