// Experimento: valor de cada oportunidad con plazo.
// Compara un oportunista que solo acepta la oportunidad X con el prudente (que no acepta ninguna),
// con las mismas semillas. Reporta cuántas veces se acepta X por temporada, el valor medio por aceptación
// (en V y en G_d) y su aporte al patrimonio final como % de la meta v1.
//
// Uso: node balance/experimento-oportunidades.ts [partidas=60] [total] [ajustes ruta=valor …]
//   total: solo la fila de todas las oportunidades juntas
//   Los ajustes usan el formato de experimento-ajustes, más eventos.<ruta> (p. ej. eventos.oportunidades.porDia=1).

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosEventos, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada, type Bot, type Decision } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { BOTS } from '../bots/bots.ts';

const N = Number(process.argv[2] ?? 60);
const SOLO_TOTAL = process.argv.includes('total');
const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const eventos = leer<DatosEventos>('../datos/eventos.json');
const pls: Record<string, DatosPlantilla> = { arepas: leer('../datos/plantillas/arepas.json'), tutorias: leer('../datos/plantillas/tutorias.json') };
for (const a of process.argv.slice(3).filter((x) => x.includes('='))) {
  const [ruta, valor] = a.split('=') as [string, string];
  const partes = ruta.split('.');
  let o: Record<string, unknown> = partes[0] === 'eventos' ? eventos as never : partes[0] === 'config' ? config as never : pls[partes[0]!] as never;
  for (const k of partes.slice(1, -1)) o = (Array.isArray(o) ? (o as unknown[]).find((x) => (x as { id: string }).id === k) : o[k]) as Record<string, unknown>;
  o[partes.at(-1)!] = Number(valor);
}
const META: Record<string, number> = { arepas: 850, tutorias: 1250 };   // metas v1 de referencia (V)
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];

/** Oportunista que solo acepta las oportunidades de la lista. */
const soloEstas = (ids: string[]) => (semilla: string): Bot => {
  const base = BOTS.oportunista!(semilla);
  return {
    nombre: 'solo',
    decidir: (v) => {
      const d = base.decidir({ ...v, oportunidades: v.oportunidades.filter((o) => ids.includes(o.id)) }) as Decision;
      return d;
    },
  };
};

for (const [id, pl] of Object.entries(pls)) {
  const ops = eventos.oportunidades.catalogo.filter((o) => o.aplica.includes(id) && o.tipo !== 'informacion');
  const combos = pl.segmentos.flatMap((s) => propuestas.flatMap((pr) => [false, true].map((sab) => ({ seg: s.id, pr, sab }))));
  const params = combos.map((c) => ({ ...c, p: resolverParametros(config, pl, c.seg, c.pr, eventos) }));
  const gd = params.reduce((a, x) => a + x.p.gananciaDiaria, 0) / params.length / 100;
  const base = params.map((x) => Array.from({ length: N }, (_, i) => jugarTemporada(x.p, BOTS.prudente!, `s${i}`, x.sab)));
  const promBase = base.flat().reduce((a, r) => a + r.patrimonioFinal / r.factorMeta, 0) / (N * params.length) / 100;
  console.log(`\n## ${pl.nombre} (G_d medio ${gd.toFixed(1)} V, meta v1 ${META[id]} V)\n`);
  console.log('| Oportunidad | Aceptada por temporada | Valor por aceptación (V) | En G_d | Aporte (% de la meta) |\n| --- | --- | --- | --- | --- |');
  const todas: string[] = [];
  todas.push(...ops.map((o) => o.id));
  for (const o of [...(SOLO_TOTAL ? [] : ops), { id: 'TODAS', nombre: 'Todas las anteriores' }]) {
    const ids = o.id === 'TODAS' ? todas : [o.id];
    let suma = 0, acept = 0;
    for (const x of params) for (let i = 0; i < N; i++) {
      const r = jugarTemporada(x.p, soloEstas(ids), `s${i}`, x.sab);
      suma += r.patrimonioFinal / r.factorMeta / 100;
      acept += r.registros.reduce((a, d) => a + d.oportunidades.aceptadas.length, 0);
    }
    const delta = suma / (N * params.length) - promBase;
    const porTemp = acept / (N * params.length);
    const porAcept = porTemp > 0 ? delta / porTemp : 0;
    console.log(`| ${o.id} ${o.nombre} | ${porTemp.toFixed(1)} | ${porAcept.toFixed(1)} | ${(porAcept / gd).toFixed(2)} | ${(delta / META[id]! * 100).toFixed(1)}% |`);
  }
}
