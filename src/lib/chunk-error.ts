// Un ChunkLoadError pasa cuando alguien tiene la web abierta justo cuando
// publicamos un despliegue nuevo: su navegador pide un archivo .js con el
// hash de la build anterior, que ya no existe. Es transitorio y se cura
// solo con una recarga — no es un bug real, así que no merece el aviso por
// email a admin (eso se reserva para fallos de verdad).
export function isChunkLoadError(error: Error): boolean {
  const msg = error?.message || "";
  return (
    error?.name === "ChunkLoadError" ||
    /Loading chunk [\w-]+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
}

// Recarga la página una vez (nunca en bucle) si el error es de este tipo.
// Devuelve true si ha lanzado la recarga.
export function autoReloadOnChunkError(error: Error): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return false;
  const KEY = "fm_chunk_reload_at";
  const last = Number(sessionStorage.getItem(KEY) || 0);
  if (Date.now() - last < 15000) return false; // ya se intentó hace poco, no insistir
  sessionStorage.setItem(KEY, String(Date.now()));
  window.location.reload();
  return true;
}
