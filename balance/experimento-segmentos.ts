// Experimento: equilibrio entre segmentos y valor de abrir los sábados.
// Juega el bot prudente (promedio de las tres propuestas de valor).
//
// Uso:
//   node balance/experimento-segmentos.ts sabado [partidas=200] [factores=1,1.25,1.5,2]
//   node balance/experimento-segmentos.ts clientes <plantilla> <segmento> <valores> [partidas=200] [factorSabado]

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { BOTS } from '../bots/bots.ts';

const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const cargar = (id: string): DatosPlantilla => leer<DatosPlantilla>(`../datos/plantillas/${id}.json`);
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];
const mediana = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const V = (c: number): string => Math.round(c / 100).toLocaleString('es-VE');

/** Patrimonio mediano del prudente, promedio de las tres propuestas. */
function medir(pl: DatosPlantilla, seg: string, sabados: boolean, partidas: number): number {
  let suma = 0;
  for (const prop of propuestas) {
    const p = resolverParametros(config, pl, seg, prop);
    const xs: number[] = [];
    for (let i = 0; i < partidas; i++) xs.push(jugarTemporada(p, BOTS.prudente!, `s${i}`, sabados).patrimonioFinal);
    suma += mediana(xs);
  }
  return suma / propuestas.length;
}
const mejor = (pl: DatosPlantilla, seg: string, n: number): number => Math.max(medir(pl, seg, false, n), medir(pl, seg, true, n));

const modo = process.argv[2] ?? 'sabado';
if (modo === 'sabado') {
  const n = Number(process.argv[3] ?? 200);
  const factores = (process.argv[4] ?? '1,1.25,1.5,2').split(',').map(Number);
  console.log('## Efecto de abrir los sábados según el costo de capacidad del sábado\n');
  console.log(`| Plantilla · segmento | ${factores.map((f) => `×${f.toLocaleString('es-VE')}`).join(' | ')} |`);
  console.log(`| --- | ${factores.map(() => '---').join(' | ')} |`);
  for (const id of ['arepas', 'tutorias']) {
    for (const seg of cargar(id).segmentos) {
      const celdas = factores.map((f) => {
        const pl = cargar(id); pl.factores.costoCapacidadSabado = f;
        const sin = medir(pl, seg.id, false, n), con = medir(pl, seg.id, true, n);
        return `${con >= sin ? '+' : ''}${Math.round((con / sin - 1) * 100)}%`;
      });
      console.log(`| ${id} · ${seg.id} | ${celdas.join(' | ')} |`);
    }
  }
} else {
  const [id, segVar, valores] = [process.argv[3]!, process.argv[4]!, process.argv[5]!.split(',').map(Number)];
  const n = Number(process.argv[6] ?? 200);
  const fs = process.argv[7] ? Number(process.argv[7]) : undefined;
  const base = cargar(id);
  const otro = base.segmentos.find((s) => s.id !== segVar)!;
  console.log(`## ${base.nombre}: clientes iniciales de «${segVar}» (con la mejor elección de sábados)\n`);
  console.log(`| Clientes iniciales | ${segVar} | ${otro.id} (${otro.clientesIniciales ?? base.inicio.clientes}) | Relación |`);
  console.log('| --- | --- | --- | --- |');
  for (const c of valores) {
    const pl = cargar(id);
    if (fs !== undefined) pl.factores.costoCapacidadSabado = fs;
    pl.segmentos.find((s) => s.id === segVar)!.clientesIniciales = c;
    const a = mejor(pl, segVar, n), b = mejor(pl, otro.id, n);
    console.log(`| ${c} | ${V(a)} | ${V(b)} | ${(a / b).toFixed(2)} |`);
  }
}
