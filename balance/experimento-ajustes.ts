// Experimento genérico: compara las elecciones de fundación (segmento × propuesta) del bot prudente
// bajo uno o varios conjuntos de ajustes a los datos, sin editar los JSON.
//
// Uso: node balance/experimento-ajustes.ts [partidas=150] [v1] "<escenario>" ["<escenario>" …]
//   v1: con imprevistos y oportunidades (datos/eventos.json); admite rutas eventos.<ruta>
//   escenario: ajustes separados por espacios, cada uno ruta=valor. Rutas:
//     config.<ruta>                          p. ej. config.propuestasDeValor.calidad.qBase=3.7
//     <plantilla>.<ruta>                     p. ej. arepas.costos.rentaSemanal=220
//     <plantilla>.seg.<segmento>.<campo>     p. ej. arepas.seg.oficinistas.clientesIniciales=60
//   Un escenario vacío ("") es la configuración actual.

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosEventos, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { BOTS } from '../bots/bots.ts';

const N = Number(process.argv[2] ?? 150);
const V1 = process.argv[3] === 'v1';
const escenarios = process.argv.slice(V1 ? 4 : 3);
if (escenarios.length === 0) escenarios.push('');
const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];
const mediana = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };

function asignar(obj: Record<string, unknown>, ruta: string[], valor: number): void {
  let o = obj;
  for (const k of ruta.slice(0, -1)) o = (Array.isArray(o) ? (o as unknown[]).find((x) => (x as { id?: string }).id === k) : o[k]) as Record<string, unknown>;
  o[ruta.at(-1)!] = valor;
}

for (const esc of escenarios) {
  const config = leer<DatosConfig>('../datos/config.json');
  const eventos = V1 ? leer<DatosEventos>('../datos/eventos.json') : undefined;
  const pls: Record<string, DatosPlantilla> = {
    arepas: leer<DatosPlantilla>('../datos/plantillas/arepas.json'),
    tutorias: leer<DatosPlantilla>('../datos/plantillas/tutorias.json'),
  };
  for (const a of esc.split(' ').filter(Boolean)) {
    const [ruta, valor] = a.split('=') as [string, string];
    const partes = ruta.split('.');
    const raiz = partes[0]!;
    if (raiz === 'config') asignar(config as unknown as Record<string, unknown>, partes.slice(1), Number(valor));
    else if (raiz === 'eventos') asignar(eventos as unknown as Record<string, unknown>, partes.slice(1), Number(valor));
    else if (partes[1] === 'seg') {
      const seg = pls[raiz]!.segmentos.find((s) => s.id === partes[2])!;
      asignar(seg as unknown as Record<string, unknown>, partes.slice(3), Number(valor));
    } else asignar(pls[raiz] as unknown as Record<string, unknown>, partes.slice(1), Number(valor));
  }
  console.log(`\n### ${esc || 'actual'}\n`);
  for (const pl of Object.values(pls)) {
    const filas: string[] = [];
    const todos: number[] = [];
    const porProp: Record<string, number[]> = { precio: [], rapidez: [], calidad: [] };
    for (const seg of pl.segmentos) {
      const celdas = propuestas.map((prop) => {
        const p = resolverParametros(config, pl, seg.id, prop, eventos);
        const m = Math.max(...[false, true].map((sab) => {
          const xs: number[] = [];
          for (let i = 0; i < N; i++) { const r = jugarTemporada(p, BOTS.prudente!, `s${i}`, sab); xs.push(r.patrimonioFinal / r.factorMeta); }
          return mediana(xs);
        }));
        todos.push(m); porProp[prop]!.push(m);
        return m;
      });
      filas.push(`${seg.id}: ${celdas.map((c) => Math.round(c / 100)).join(' / ')}`);
    }
    const prom = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
    const brecha = Math.max(...todos) / Math.min(...todos);
    console.log(`- **${pl.id}** (precio / rapidez / calidad) — ${filas.join(' · ')} · promedio por propuesta ${propuestas.map((p) => Math.round(prom(porProp[p]!) / 100)).join(' / ')} · **brecha ${brecha.toFixed(2)}**`);
  }
}
