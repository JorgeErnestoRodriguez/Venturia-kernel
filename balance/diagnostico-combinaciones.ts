// Diagnóstico: patrimonio del bot prudente en cada combinación plantilla × segmento × propuesta × sábados.
// Sirve para ver de dónde viene el desbalance entre combinaciones.
//
// Uso: node balance/diagnostico-combinaciones.ts [partidas=300]

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { BOTS } from '../bots/bots.ts';

const PARTIDAS = Number(process.argv[2] ?? 300);
const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const plantillas = ['arepas', 'tutorias'].map((id) => leer<DatosPlantilla>(`../datos/plantillas/${id}.json`));
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];
const mediana = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const V = (c: number): string => Math.round(c / 100).toLocaleString('es-VE');

for (const pl of plantillas) {
  console.log(`\n## ${pl.nombre} — patrimonio mediano del prudente (V)\n`);
  console.log('| Segmento | Propuesta | Sin sábados | Con sábados | Efecto de abrir sábados |');
  console.log('| --- | --- | --- | --- | --- |');
  const porSegmento: Record<string, number[]> = {};
  for (const seg of pl.segmentos) {
    for (const prop of propuestas) {
      const p = resolverParametros(config, pl, seg.id, prop);
      const m = [false, true].map((sab) => {
        const xs: number[] = [];
        for (let i = 0; i < PARTIDAS; i++) xs.push(jugarTemporada(p, BOTS.prudente!, `s${i}`, sab).patrimonioFinal);
        return mediana(xs);
      });
      (porSegmento[seg.id] ??= []).push(...m);
      const [sin, con] = m as [number, number];
      console.log(`| ${seg.id} | ${prop} | ${V(sin)} | ${V(con)} | ${con >= sin ? '+' : ''}${Math.round((con / sin - 1) * 100)}% |`);
    }
  }
  const prom = Object.entries(porSegmento).map(([s, xs]) => `${s} ${V(xs.reduce((a, b) => a + b, 0) / xs.length)}`);
  console.log(`\nPromedio por segmento: ${prom.join(' · ')}`);
}
