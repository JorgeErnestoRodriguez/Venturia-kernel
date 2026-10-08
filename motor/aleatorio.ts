// Generador aleatorio con semilla (RNF-03). Solo usa operaciones enteras de 32 bits,
// que son idénticas en cualquier motor de JavaScript.

export interface Aleatorio {
  /** Número en [0, 1). */
  siguiente(): number;
  /** Número en [min, max). */
  rango(min: number, max: number): number;
  /** Entero en [0, n). */
  entero(n: number): number;
}

/** Hash de texto a entero de 32 bits (xmur3). */
function hash(texto: string): number {
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++) {
    h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/**
 * Crea un generador mulberry32. El "canal" separa secuencias independientes
 * (clima, ruido de demanda, bots…) a partir de la misma semilla de temporada,
 * para que añadir un uso nuevo no altere las secuencias existentes.
 */
export function crearAleatorio(semilla: string | number, canal = ''): Aleatorio {
  let a = hash(`${semilla}|${canal}`);
  const siguiente = (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    siguiente,
    rango: (min, max) => min + (max - min) * siguiente(),
    entero: (n) => Math.floor(siguiente() * n),
  };
}
