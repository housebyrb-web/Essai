export function preparePdfExport(project) {
  return {
    generatedAt: new Date().toISOString(),
    project
  };
}

export function printPdf() {
  globalThis.print?.();
}
