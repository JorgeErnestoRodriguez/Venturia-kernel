// Matemática determinista (RNF-02).
//
// JavaScript garantiza resultados idénticos en cualquier motor solo para las
// operaciones básicas de IEEE-754 (+, −, ×, ÷) y para Math.floor/trunc/min/max.
// Math.pow, Math.exp y Math.log pueden variar entre navegadores y dispositivos,
// por eso aquí se implementan con operaciones básicas.
// El estado persistente se guarda siempre en enteros (ver tipos.ts).

const LN2 = 0.6931471805599453;

/** Redondeo al entero más cercano; los empates se alejan de cero. */
export function redondear(x: number): number {
  return x >= 0 ? Math.floor(x + 0.5) : -Math.floor(-x + 0.5);
}

export function acotar(x: number, min: number, max: number): number {
  return x < min ? min : x > max ? max : x;
}

/** Logaritmo natural para x > 0. */
export function ln(x: number): number {
  if (!(x > 0)) throw new RangeError(`ln indefinido para ${x}`);
  // Reducción de rango: x = m · 2^k con m en [0,75; 1,5)
  let k = 0;
  let m = x;
  while (m >= 1.5) { m /= 2; k++; }
  while (m < 0.75) { m *= 2; k--; }
  // ln(m) = 2 · atanh(s), con s = (m − 1)/(m + 1), |s| ≤ 0,2
  const s = (m - 1) / (m + 1);
  const s2 = s * s;
  let termino = s;
  let suma = 0;
  for (let n = 1; n <= 41; n += 2) {
    suma += termino / n;
    termino *= s2;
  }
  return 2 * suma + k * LN2;
}

/** Función exponencial. */
export function exp(x: number): number {
  if (x > 700) throw new RangeError(`exp desborda para ${x}`);
  if (x < -700) return 0;
  // x = k · ln2 + r, con |r| ≤ ln2/2
  const k = redondear(x / LN2);
  const r = x - k * LN2;
  let termino = 1;
  let suma = 1;
  for (let n = 1; n <= 25; n++) {
    termino *= r / n;
    suma += termino;
  }
  // Multiplicar por 2^k es exacto
  let p = 1;
  const base = k >= 0 ? 2 : 0.5;
  for (let i = 0; i < Math.abs(k); i++) p *= base;
  return suma * p;
}

/** Potencia para base > 0. */
export function pot(base: number, exponente: number): number {
  if (exponente === 0) return 1;
  if (exponente === 1) return base;
  return exp(exponente * ln(base));
}
