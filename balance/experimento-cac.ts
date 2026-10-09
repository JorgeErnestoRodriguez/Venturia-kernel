// Experimento: costo por cliente nuevo (CAC) de una plantilla.
// Aísla la decisión de marketing: todos los bots juegan igual (precio de referencia,
// capacidad = demanda esperada × 1,05) y solo cambia el marketing. Así el resultado no se
// mezcla con otras decisiones, como la holgura de capacidad.
//
// Lo deseable: un óptimo intermedio (algo de marketing rinde más que nada, y el máximo rinde
// menos que un nivel moderado) y ningún beneficio por comprar clientes al final de la temporada.
//
// Uso: node balance/experimento-cac.ts [plantilla=arepas] [partidas=200] [valores=3,4,5,6,8]

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { NivelMarketing, PropuestaValor } from '../motor/tipos.ts';
import { demandaEsperada, type FabricaBot } from '../bots/bots.ts';

const PLANTILLA = process.argv[2] ?? 'arepas';
const PARTIDAS = Number(process.argv[3] ?? 200);
const VALORES = (process.argv[4] ?? '3,4,5,6,8').split(',').map(Number);

const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const base = leer<DatosPlantilla>(`../datos/plantillas/${PLANTILLA}.json`);
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];

const marketing = (nombre: string, nivel: (dia: number) => NivelMarketing): FabricaBot => () => ({
  nombre,
  decidir: (v) => ({ precio: v.parametros.precioReferencia, capacidad: Math.ceil(demandaEsperada(v) * 1.05), marketing: nivel(v.dia) }),
});
const ESTRATEGIAS: [string, FabricaBot][] = [
  ['nada', marketing('nada', () => '0')],
  ['bajo', marketing('bajo', () => 'bajo')],
  ['medio', marketing('medio', () => 'medio')],
  ['alto', marketing('alto', () => 'alto')],
  ['medio → alto la última semana', marketing('compra-final', (d) => (d < 21 ? 'medio' : 'alto'))],
  ['medio → nada las 2 últimas semanas', marketing('cosecha', (d) => (d < 14 ? 'medio' : '0'))],
];

console.log(`## ${base.nombre}: patrimonio final promedio según el marketing (V)\n`);
console.log(`Fórmula de la cartera: ${config.cartera.restarCostoCapacidad ? 'margen completo (P* − c_v − c_k)' : 'P* − c_v'}. ${PARTIDAS} partidas × 12 combinaciones por celda.\n`);
console.log(`| CAC | ${ESTRATEGIAS.map(([n]) => n).join(' | ')} | Mejor nivel constante |`);
console.log(`| --- | ${ESTRATEGIAS.map(() => '---').join(' | ')} | --- |`);

for (const cac of VALORES) {
  const pl = structuredClone(base);
  pl.marketing.costoPorClienteNuevo = cac;
  const promedios = ESTRATEGIAS.map(([, fabrica]) => {
    let suma = 0, n = 0;
    for (const seg of pl.segmentos) {
      for (const prop of propuestas) {
        const p = resolverParametros(config, pl, seg.id, prop);
        for (const sab of [false, true]) {
          for (let i = 0; i < PARTIDAS; i++) { suma += jugarTemporada(p, fabrica, `s${i}`, sab).patrimonioFinal; n++; }
        }
      }
    }
    return suma / n / 100;
  });
  const constantes = promedios.slice(0, 4);
  const mejor = ESTRATEGIAS[constantes.indexOf(Math.max(...constantes))]?.[0] ?? '';
  console.log(`| ${cac} V | ${promedios.map((x) => Math.round(x).toLocaleString('es-VE')).join(' | ')} | ${mejor} |`);
}
