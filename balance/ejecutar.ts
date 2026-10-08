// Simulador de balance (RF-A-16).
// Corre todas las combinaciones plantilla × segmento × propuesta × sábados con cada bot,
// deriva la meta de patrimonio de cada plantilla y escribe el reporte.
//
// Uso: node balance/ejecutar.ts [partidasPorCombinacion=500]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada, type ResultadoTemporada } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { BOTS } from '../bots/bots.ts';

const PARTIDAS = Number(process.argv[2] ?? 500);
const BOT_META = 'prudente';
const PROPORCION_META = 0.65;           // la meta la alcanza el 65% del bot prudente (rango objetivo 60–70%)

const leer = <T>(ruta: string): T => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const plantillas = [
  leer<DatosPlantilla>('../datos/plantillas/arepas.json'),
  leer<DatosPlantilla>('../datos/plantillas/tutorias.json'),
];
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];

const V = (c: number): number => c / 100;
const fmt = (x: number, d = 0): string => x.toLocaleString('es-VE', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x: number): string => `${fmt(x * 100)}%`;
function percentil(xs: number[], q: number): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))] ?? 0;
}
const mediana = (xs: number[]): number => percentil(xs, 0.5);

interface Fila { combo: string; segmento: string; propuesta: string; sabados: boolean; bot: string; patrimonios: number[]; quiebras: number; }

const inicio = Date.now();
const salida: string[] = [];
const json: Record<string, unknown> = { version: config.version, partidasPorCombinacion: PARTIDAS, plantillas: {} };

salida.push('# Reporte de balance — v0', '');
salida.push(`Generado con \`node balance/ejecutar.ts ${PARTIDAS}\`. ${PARTIDAS} partidas por combinación y bot, con las mismas semillas para todos los bots.`, '');
salida.push('Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).', '');

for (const pl of plantillas) {
  const filas: Fila[] = [];
  for (const seg of pl.segmentos) {
    for (const prop of propuestas) {
      const p = resolverParametros(config, pl, seg.id, prop);
      for (const sabados of [false, true]) {
        for (const [nombreBot, fabrica] of Object.entries(BOTS)) {
          const fila: Fila = {
            combo: `${seg.id} · ${prop} · ${sabados ? 'con sábados' : 'sin sábados'}`,
            segmento: seg.id, propuesta: prop, sabados, bot: nombreBot, patrimonios: [], quiebras: 0,
          };
          for (let i = 0; i < PARTIDAS; i++) {
            const r: ResultadoTemporada = jugarTemporada(p, fabrica, `s${i}`, sabados);
            fila.patrimonios.push(r.patrimonioFinal);
            if (r.quebrada) fila.quiebras++;
          }
          filas.push(fila);
        }
      }
    }
  }

  // Meta derivada: patrimonio que alcanza el PROPORCION_META de las partidas del bot prudente
  const prudentes = filas.filter((f) => f.bot === BOT_META).flatMap((f) => f.patrimonios);
  const metaCruda = percentil(prudentes, 1 - PROPORCION_META);
  const meta = Math.max(0, Math.round(metaCruda / 5000) * 5000);   // redondeada a 50 V
  const alcanza = (f: Fila): number => f.patrimonios.filter((x) => x >= meta).length / f.patrimonios.length;
  const capital = pl.inicio.capital;

  salida.push(`## ${pl.nombre}`, '');
  salida.push(`**Meta derivada: ${fmt(V(meta))} V** (capital inicial ${fmt(capital)} V; multiplicador ${fmt(V(meta) / capital, 2)}×).`, '');

  // Por bot
  salida.push('### Resultado por bot (todas las combinaciones)', '');
  salida.push('| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |', '| --- | --- | --- | --- | --- | --- |');
  const porBot: Record<string, unknown> = {};
  for (const nombreBot of Object.keys(BOTS)) {
    const fs = filas.filter((f) => f.bot === nombreBot);
    const pats = fs.flatMap((f) => f.patrimonios);
    const llega = pats.filter((x) => x >= meta).length / pats.length;
    const quiebra = fs.reduce((a, f) => a + f.quiebras, 0) / pats.length;
    porBot[nombreBot] = { llega, quiebra, mediana: V(mediana(pats)) };
    salida.push(`| ${nombreBot} | ${pct(llega)} | ${pct(quiebra)} | ${fmt(V(mediana(pats)))} | ${fmt(V(percentil(pats, 0.1)))} | ${fmt(V(percentil(pats, 0.9)))} |`);
  }
  salida.push('');

  // Por combinación, todos los bots: % que llega a la meta
  salida.push('### Llega a la meta, por combinación y bot', '');
  const nombres = Object.keys(BOTS);
  salida.push(`| Combinación | ${nombres.join(' | ')} | Mejor bot |`, `| --- | ${nombres.map(() => '---').join(' | ')} | --- |`);
  const combos = [...new Set(filas.map((f) => f.combo))];
  const porCombo: Record<string, unknown> = {};
  for (const c of combos) {
    const celdas = nombres.map((b) => filas.find((f) => f.combo === c && f.bot === b)!);
    const tasas = celdas.map(alcanza);
    const meds = celdas.map((f) => mediana(f.patrimonios));
    const iMejor = meds.indexOf(Math.max(...meds));
    porCombo[c] = Object.fromEntries(nombres.map((b, i) => [b, { llega: tasas[i], mediana: V(meds[i] ?? 0), quiebra: (celdas[i]?.quiebras ?? 0) / PARTIDAS }]));
    salida.push(`| ${c} | ${tasas.map(pct).join(' | ')} | ${nombres[iMejor]} |`);
  }
  salida.push('');

  // Alertas
  const alertas: string[] = [];
  const pb = porBot as Record<string, { llega: number; quiebra: number; mediana: number }>;
  const prud = pb[BOT_META]!;
  if (pb.aleatorio && pb.aleatorio.llega >= 0.2) alertas.push(`El bot aleatorio llega a la meta en ${pct(pb.aleatorio.llega)} de las partidas (criterio: < 20%). Las decisiones importan poco.`);
  for (const [b, r] of Object.entries(pb)) {
    if (b !== BOT_META && r.llega > prud.llega + 0.05) alertas.push(`**${b}** supera al prudente (${pct(r.llega)} frente a ${pct(prud.llega)}): posible estrategia dominante.`);
  }
  const tasasPrud = combos.map((c) => alcanza(filas.find((f) => f.combo === c && f.bot === BOT_META)!));
  const [tMin, tMax] = [Math.min(...tasasPrud), Math.max(...tasasPrud)];
  if (tMax - tMin > 0.3) {
    const peor = combos[tasasPrud.indexOf(tMin)], mejor = combos[tasasPrud.indexOf(tMax)];
    alertas.push(`Combinaciones desbalanceadas para el prudente: de ${pct(tMin)} (${peor}) a ${pct(tMax)} (${mejor}).`);
  }
  if (prud.quiebra > 0.1) alertas.push(`El prudente quiebra en ${pct(prud.quiebra)} de las partidas.`);
  if (prud.quiebra === 0 && Object.values(pb).every((r) => r.quiebra < 0.02)) alertas.push('Casi nadie quiebra: la mecánica de fracaso no se activa.');
  salida.push('### Alertas', '', ...(alertas.length ? alertas.map((a) => `- ${a}`) : ['- Ninguna.']), '');

  (json.plantillas as Record<string, unknown>)[pl.id] = { meta: V(meta), porBot, porCombo, alertas };
}

salida.push(`---`, `Tiempo de ejecución: ${fmt((Date.now() - inicio) / 1000, 1)} s.`);
mkdirSync(new URL('../reportes/', import.meta.url), { recursive: true });
writeFileSync(new URL('../reportes/balance-v0.md', import.meta.url), salida.join('\n') + '\n');
writeFileSync(new URL('../reportes/balance-v0.json', import.meta.url), JSON.stringify(json, null, 2) + '\n');
console.log(salida.join('\n'));
