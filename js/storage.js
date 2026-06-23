const STORAGE_KEY = "house-by-rb-projects";

export function loadProjects(storage = globalThis.localStorage) {
  if (!storage) {
    return [];
  }

  try {
    return JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProjects(projects, storage = globalThis.localStorage) {
  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
