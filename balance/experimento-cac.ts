// Experimento: costo por cliente nuevo (CAC) de una plantilla.
// Para cada valor de CAC (y cada forma de valorar la cartera) corre todos los bots en todas
// las combinaciones, deriva la meta del bot prudente y compara a los bots contra esa meta.
//
// Uso: node balance/experimento-cac.ts [plantilla=arepas] [partidas=300]

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { BOTS } from '../bots/bots.ts';

const PLANTILLA = process.argv[2] ?? 'arepas';
const PARTIDAS = Number(process.argv[3] ?? 300);
const VALORES_CAC = (process.argv[4] ?? "3,4,5,6,7,8,10").split(",").map(Number);
const PROPORCION_META = 0.65;

const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const configBase = leer<DatosConfig>('../datos/config.json');
const plantillaBase = leer<DatosPlantilla>(`../datos/plantillas/${PLANTILLA}.json`);
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];

const percentil = (xs: number[], q: number): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))] ?? 0;
};
const pct = (x: number): string => `${Math.round(x * 100)}%`;
const V = (c: number): string => Math.round(c / 100).toLocaleString('es-VE');

for (const restaCapacidad of [false, true]) {
  console.log(`\n### Cartera valorada con ${restaCapacidad ? 'margen completo (P* − c_v − c_k)' : 'margen actual (P* − c_v)'}\n`);
  console.log('| CAC | Valor máx. de un cliente | Meta | Prudente | Agresivo | Cosechador | Barato | Avaro | Aleatorio | Agresivo/prudente (mediana) | Rango del prudente entre combinaciones |');
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const cac of VALORES_CAC) {
    const config = structuredClone(configBase);
    config.cartera.restarCostoCapacidad = restaCapacidad;
    const pl = structuredClone(plantillaBase);
    pl.marketing.costoPorClienteNuevo = cac;

    const porBot: Record<string, number[]> = {};
    const prudentePorCombo: number[][] = [];
    let valorMax = 0;
    for (const seg of pl.segmentos) {
      for (const prop of propuestas) {
        const p = resolverParametros(config, pl, seg.id, prop);
        const costo = p.costoVariable + (p.carteraRestaCapacidad ? p.costoCapacidad : 0);
        valorMax = Math.max(valorMax, p.frecuenciaCompra * (p.precioReferencia - costo) * p.diasValoracionCartera);
        for (const sab of [false, true]) {
          for (const [nombre, fabrica] of Object.entries(BOTS)) {
            const pats: number[] = [];
            for (let i = 0; i < PARTIDAS; i++) pats.push(jugarTemporada(p, fabrica, `s${i}`, sab).patrimonioFinal);
            (porBot[nombre] ??= []).push(...pats);
            if (nombre === 'prudente') prudentePorCombo.push(pats);
          }
        }
      }
    }
    const meta = Math.round(percentil(porBot.prudente ?? [], 1 - PROPORCION_META) / 5000) * 5000;
    const llega = (xs: number[]): number => xs.filter((x) => x >= meta).length / xs.length;
    const tasasCombo = prudentePorCombo.map(llega);
    const mediana = (b: string): number => percentil(porBot[b] ?? [], 0.5);
    const celdas = ['prudente', 'agresivo', 'cosechador', 'barato', 'avaro', 'aleatorio'].map((b) => pct(llega(porBot[b] ?? [])));
    console.log(`| ${cac} V | ${V(valorMax)} V | ${V(meta)} V | ${celdas.join(' | ')} | ${(mediana('agresivo') / mediana('prudente')).toFixed(2)} | ${pct(Math.min(...tasasCombo))}–${pct(Math.max(...tasasCombo))} |`);
  }
}
