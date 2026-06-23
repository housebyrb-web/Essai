const GEO_API_URL = "https://geo.api.gouv.fr/communes";

export async function searchCommunes(query, fetcher = globalThis.fetch) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return [];
  }

  const url = new URL(GEO_API_URL);
  url.searchParams.set("nom", normalizedQuery);
  url.searchParams.set("boost", "population");
  url.searchParams.set("fields", "nom,code,codesPostaux,departement,region");

  const response = await fetcher(url);

  if (!response.ok) {
    throw new Error(`Recherche de commune impossible (${response.status}).`);
  }

  return response.json();
}
