// Experimento: valle de arranque y quiebra.
// Para cada configuración (capital × renta × escala de clientes iniciales) mide, por bot,
// en todas las combinaciones de la plantilla (segmento × propuesta × sábados):
//   - quiebra: % de partidas que terminan con caja negativa
//   - pierde: % de partidas que terminan con menos patrimonio del inicial
// y, para el prudente, la semana en que la caja toca fondo (fin del valle).
//
// Uso: node balance/experimento-quiebra.ts <plantilla> [partidas=40] [capital=a,b] [renta=a,b] [clientes=f1,f2]
//   clientes: factor sobre los clientes iniciales de cada segmento (conserva su proporción)

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { estadoInicial, patrimonio } from '../motor/simulacion.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { BOTS } from '../bots/bots.ts';

const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const id = process.argv[2] ?? 'arepas';
const N = Number(process.argv[3] ?? 40);
const base = leer<DatosPlantilla>(`../datos/plantillas/${id}.json`);
const opt = Object.fromEntries(process.argv.slice(4).map((a) => a.split('=') as [string, string]));
const lista = (k: string, def: number): number[] => (opt[k] ? opt[k].split(',').map(Number) : [def]);
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];
const pct = (x: number): string => `${Math.round(x * 100)}%`;
const med = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const bots = Object.keys(BOTS);

console.log(`## ${base.nombre}: quiebra por bot (${N} partidas × 12 combinaciones)\n`);
console.log(`| Capital | Renta | Clientes | ${bots.join(' | ')} | Prudente pierde | Prudente: fondo del valle | Prudente: patrimonio final / inicial |`);
console.log(`| --- | --- | --- | ${bots.map(() => '---').join(' | ')} | --- | --- | --- |`);

for (const capital of lista('capital', base.inicio.capital))
for (const renta of lista('renta', base.costos.rentaSemanal))
for (const fc of lista('clientes', 1)) {
  const pl: DatosPlantilla = structuredClone(base);
  pl.inicio.capital = capital;
  pl.costos.rentaSemanal = renta;
  for (const s of pl.segmentos) s.clientesIniciales = Math.round((s.clientesIniciales ?? pl.inicio.clientes ?? 0) * fc);
  const celdas: string[] = [];
  let pierdePrud = 0, fondos: number[] = [], ratios: number[] = [];
  for (const nombre of bots) {
    let quiebras = 0, pierde = 0, total = 0;
    for (const seg of pl.segmentos) for (const prop of propuestas) for (const sab of [false, true]) {
      const p = resolverParametros(config, pl, seg.id, prop);
      const inicial = patrimonio(p, estadoInicial(p, sab));
      for (let i = 0; i < N; i++) {
        const r = jugarTemporada(p, BOTS[nombre]!, `s${i}`, sab);
        total++;
        if (r.quebrada) quiebras++;
        if (r.patrimonioFinal < inicial) pierde++;
        if (nombre === 'prudente') {
          const cajas = r.registros.map((x) => x.cajaFinal);
          fondos.push(Math.floor(cajas.indexOf(Math.min(...cajas)) / 7) + 1);
          ratios.push(r.patrimonioFinal / inicial);
        }
      }
    }
    celdas.push(pct(quiebras / total));
    if (nombre === 'prudente') pierdePrud = pierde / total;
  }
  console.log(`| ${capital} | ${renta} | ×${fc} | ${celdas.join(' | ')} | ${pct(pierdePrud)} | semana ${med(fondos)} | ${med(ratios).toFixed(2)} |`);
}
