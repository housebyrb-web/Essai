const GEO_API_URL = "https://geo.api.gouv.fr/communes";
const DEFAULT_LIMIT = 8;
const SEARCH_FIELDS = "nom,code,codesPostaux,departement,region,population";
const communeCache = new Map();

export class CommuneSearchError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = "CommuneSearchError";
    this.status = status;
  }
}

export async function searchCommunes(query, options = {}) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const cacheKey = getCacheKey(normalizedQuery, options.limit);

  if (communeCache.has(cacheKey)) {
    return communeCache.get(cacheKey);
  }

  const response = await fetchCommunes(normalizedQuery, options);
  const communes = normalizeCommunes(await response.json(), options.limit);
  communeCache.set(cacheKey, communes);

  return communes;
}

export async function getCommuneByCode(code, options = {}) {
  const normalizedCode = String(code || "").trim();

  if (!/^\d{5}$/.test(normalizedCode)) {
    throw new CommuneSearchError("Le code INSEE doit contenir 5 chiffres.");
  }

  const response = await fetchCommunesByCode(normalizedCode, options);
  return normalizeCommune(await response.json());
}

export function normalizeCommune(commune) {
  return {
    codeInsee: commune.code,
    nom: commune.nom,
    codesPostaux: Array.isArray(commune.codesPostaux) ? commune.codesPostaux : [],
    departement: normalizeAdministrativeArea(commune.departement),
    region: normalizeAdministrativeArea(commune.region),
    population: commune.population || null
  };
}

function normalizeCommunes(communes, limit = DEFAULT_LIMIT) {
  if (!Array.isArray(communes)) {
    return [];
  }

  return communes.slice(0, limit || DEFAULT_LIMIT).map(normalizeCommune);
}

async function fetchCommunes(query, options) {
  const fetcher = getFetcher(options.fetcher);
  const response = await fetcher(buildSearchUrl(query, options), {
    signal: options.signal
  });

  assertValidResponse(response);

  return response;
}

async function fetchCommunesByCode(code, options) {
  const fetcher = getFetcher(options.fetcher);
  const response = await fetcher(buildCodeUrl(code), {
    signal: options.signal
  });

  assertValidResponse(response);

  return response;
}

function buildSearchUrl(query, options = {}) {
  const url = new URL(GEO_API_URL);
  const parameter = isPostalCode(query) ? "codePostal" : "nom";

  url.searchParams.set(parameter, query);
  url.searchParams.set("boost", "population");
  url.searchParams.set("fields", SEARCH_FIELDS);
  url.searchParams.set("format", "json");

  if (options.limit) {
    url.searchParams.set("limit", String(options.limit));
  }

  return url;
}

function buildCodeUrl(code) {
  const url = new URL(`${GEO_API_URL}/${code}`);
  url.searchParams.set("fields", SEARCH_FIELDS);
  url.searchParams.set("format", "json");

  return url;
}

function assertValidResponse(response) {
  if (!response.ok) {
    throw new CommuneSearchError(`Recherche de commune impossible (${response.status}).`, response.status);
  }
}

function normalizeAdministrativeArea(area) {
  if (!area) {
    return null;
  }

  return {
    code: area.code,
    nom: area.nom
  };
}

function normalizeQuery(query) {
  return String(query || "").trim().replace(/\s+/g, " ");
}

function isPostalCode(query) {
  return /^\d{5}$/.test(query);
}

function getFetcher(fetcher) {
  const resolvedFetcher = fetcher || globalThis.fetch;

  if (typeof resolvedFetcher !== "function") {
    throw new CommuneSearchError("Le service de recherche de commune n'est pas disponible.");
  }

  return resolvedFetcher;
}

function getCacheKey(query, limit) {
  return `${query.toLocaleLowerCase("fr-FR")}::${limit || DEFAULT_LIMIT}`;
}
