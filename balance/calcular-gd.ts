// Calcula G_d, la ganancia diaria de referencia de cada segmento: el margen de contribución
// (ingresos − costo variable − costo de capacidad) por día de venta del bot prudente en la economía base
// (sin eventos), mediana entre partidas, promedio de las tres propuestas, sin abrir sábados.
// No descuenta marketing ni costos fijos: con el valle de arranque la ganancia neta es negativa al inicio
// y no sirve como escala. El resultado va a gananciaDiariaReferencia de cada segmento.
//
// Uso: node balance/calcular-gd.ts [partidas=300]

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { BOTS } from '../bots/bots.ts';

const N = Number(process.argv[2] ?? 300);
const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];
const mediana = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };

console.log('| Plantilla | Segmento | G_d (V por día de venta) |\n| --- | --- | --- |');
for (const id of ['arepas', 'tutorias']) {
  const pl = leer<DatosPlantilla>(`../datos/plantillas/${id}.json`);
  for (const seg of pl.segmentos) {
    let suma = 0;
    for (const prop of propuestas) {
      const p = resolverParametros(config, pl, seg.id, prop);
      const xs: number[] = [];
      for (let i = 0; i < N; i++) {
        const r = jugarTemporada(p, BOTS.prudente!, `s${i}`, false);
        const abiertos = r.registros.filter((x) => x.abierto).length;
        xs.push(r.registros.reduce((a, x) => a + x.ingresos - x.costoVariable - x.costoCapacidad, 0) / Math.max(1, abiertos));
      }
      suma += mediana(xs);
    }
    console.log(`| ${id} | ${seg.id} | ${(suma / propuestas.length / 100).toFixed(1)} |`);
  }
}
