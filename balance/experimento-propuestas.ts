// Experimento: ¿quedan parejas las tres propuestas de valor?
// Para cada plantilla × segmento × propuesta busca la mejor respuesta entre varios estilos de juego
// (y la mejor elección de sábados), y compara el patrimonio mediano entre propuestas.
//
// Uso: node balance/experimento-propuestas.ts [partidas=300]

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { NivelMarketing, PropuestaValor } from '../motor/tipos.ts';
import { demandaEsperada, type FabricaBot } from '../bots/bots.ts';

const PARTIDAS = Number(process.argv[2] ?? 300);
const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const base = leer<DatosConfig>('../datos/config.json');
const plantillas = [leer<DatosPlantilla>('../datos/plantillas/arepas.json'), leer<DatosPlantilla>('../datos/plantillas/tutorias.json')];
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];

const estilo = (nombre: string, holgura: number, mk: NivelMarketing): FabricaBot => () => ({
  nombre,
  decidir: (v) => ({ precio: v.parametros.precioReferencia, capacidad: Math.ceil(demandaEsperada(v) * holgura), marketing: mk }),
});
const ESTILOS: FabricaBot[] = [
  estilo('justo-bajo', 1.0, 'bajo'), estilo('prudente', 1.05, 'bajo'), estilo('holgado-bajo', 1.2, 'bajo'),
  estilo('justo-medio', 1.0, 'medio'), estilo('prudente-medio', 1.05, 'medio'), estilo('holgado-medio', 1.2, 'medio'),
];

type Ajuste = (c: DatosConfig) => void;
const escenarios: [string, Ajuste[]][] = [
  ['S0 · actual', []],
  ['S1 · rapidez con efecto', [rapidez]],
  ['S2 · S1 + precio: frecuencia ×1,2', [rapidez, frec]],
  ['S3 · S1 + precio: costo por cliente ×0,7', [rapidez, cac]],
  ['S4 · S1 + precio: ambos', [rapidez, frec, cac]],
  ['S5 · S2 + calificación base 3,4 / 3,6 / 3,8', [rapidez, frec, qb]],
  ['S6 · S4 + calificación base 3,4 / 3,6 / 3,8', [rapidez, frec, cac, qb]],
  ['S7 · S5 + calidad: costo de capacidad ×1,1', [rapidez, frec, qb, calCap]],
];
function rapidez(c: DatosConfig): void {
  Object.assign(c.propuestasDeValor.rapidez, { umbralSaturacion: 0.98, factorCastigoSaturacion: 0.5, factorAbandonoMalServicio: 0.5 });
}
function frec(c: DatosConfig): void { c.propuestasDeValor.precio.factorFrecuencia = 1.2; }
function cac(c: DatosConfig): void { c.propuestasDeValor.precio.factorCostoCliente = 0.7; }
function calCap(c: DatosConfig): void { c.propuestasDeValor.calidad.factorCostoCapacidad = 1.1; }
function qb(c: DatosConfig): void {
  c.propuestasDeValor.precio.qBase = 3.4; c.propuestasDeValor.rapidez.qBase = 3.6; c.propuestasDeValor.calidad.qBase = 3.8;
}

const mediana = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const V = (c: number): string => Math.round(c / 100).toLocaleString('es-VE');

for (const [nombre, ajustes] of escenarios) {
  const cfg = structuredClone(base);
  for (const a of ajustes) a(cfg);
  console.log(`\n### ${nombre}\n`);
  console.log('| Plantilla · segmento | Precio | Rapidez | Calidad | Brecha (máx/mín) |');
  console.log('| --- | --- | --- | --- | --- |');
  const brechas: number[] = [];
  for (const pl of plantillas) {
    for (const seg of pl.segmentos) {
      const mejores = propuestas.map((prop) => {
        const p = resolverParametros(cfg, pl, seg.id, prop);
        let mejor = -Infinity, cual = '';
        for (const sab of [false, true]) {
          for (const est of ESTILOS) {
            const pats: number[] = [];
            for (let i = 0; i < PARTIDAS; i++) pats.push(jugarTemporada(p, est, `s${i}`, sab).patrimonioFinal);
            const m = mediana(pats);
            if (m > mejor) { mejor = m; cual = `${est('').nombre}${sab ? '+sáb' : ''}`; }
          }
        }
        return { mejor, cual };
      });
      const vals = mejores.map((m) => m.mejor);
      const brecha = Math.max(...vals) / Math.min(...vals);
      brechas.push(brecha);
      console.log(`| ${pl.id} · ${seg.id} | ${mejores.map((m) => `${V(m.mejor)} (${m.cual})`).join(' | ')} | ${brecha.toFixed(2)} |`);
    }
  }
  console.log(`\nBrecha promedio: **${(brechas.reduce((a, b) => a + b, 0) / brechas.length).toFixed(2)}** (1,00 = propuestas idénticas)`);
}
