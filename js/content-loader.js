const CONTENT_URL = new URL("../data/site-content.json", import.meta.url);

export async function loadSiteContent(fetcher = globalThis.fetch) {
  if (typeof fetcher !== "function") {
    throw new Error("Le chargement distant des données n'est pas disponible.");
  }

  const response = await fetcher(CONTENT_URL);

  if (!response.ok) {
    throw new Error(`Impossible de charger les données du site (${response.status}).`);
  }

  return normalizeContent(await response.json());
}

function normalizeContent(content) {
  return {
    projectMetrics: normalizeList(content.projectMetrics),
    features: normalizeList(content.features),
    activityMetrics: normalizeList(content.activityMetrics),
    steps: normalizeList(content.steps)
  };
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}
