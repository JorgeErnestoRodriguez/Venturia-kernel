// Experimento: costo de la capacidad de una plantilla.
// Aísla la decisión de holgura: todos juegan con precio de referencia y marketing medio,
// y solo cambia cuánta capacidad contratan respecto de la demanda esperada.
// Opcionalmente traslada costo del variable a la capacidad (mismo costo total por pedido):
// así el margen no cambia, solo el precio de la capacidad ociosa.
//
// Lo deseable: un óptimo con poca holgura (≈ 1,0–1,1) y que sobredimensionar rinda menos.
//
// Uso: node balance/experimento-capacidad.ts [plantilla=arepas] [partidas=200] [fracciones=actual,0.5,0.67]
//   cada fracción = parte del costo total por pedido que corresponde a capacidad.

import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import type { PropuestaValor } from '../motor/tipos.ts';
import { demandaEsperada, type FabricaBot } from '../bots/bots.ts';
import type { Vista } from '../motor/temporada.ts';

const PLANTILLA = process.argv[2] ?? 'arepas';
const PARTIDAS = Number(process.argv[3] ?? 200);
const FRACCIONES = (process.argv[4] ?? 'actual,0.5,0.67').split(',');
const HOLGURAS = [0.9, 1.0, 1.05, 1.15, 1.3, 1.5];
const ESTIMADOR = process.argv[5] ?? 'ingenuo';

/** Estimación que descuenta el clima del día de referencia (el jugador lo ve en la revelación). */
function demandaSinClima(v: Vista): number {
  const p = v.parametros;
  const esSabado = v.diaSemana === 5;
  const ref = [...v.historial].reverse().find((r) => r.abierto && (r.diaSemana === 5) === esSabado)
    ?? [...v.historial].reverse().find((r) => r.abierto);
  if (!ref) return demandaEsperada(v);
  const esperado = p.probClima.soleado * p.factorClima.soleado + p.probClima.nublado * p.factorClima.nublado + p.probClima.lluvia * p.factorClima.lluvia;
  return ref.demanda / p.factorClima[ref.clima] * esperado;
}
const estimar = (v: Vista): number => (ESTIMADOR === 'clima' ? demandaSinClima(v) : demandaEsperada(v));

const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const base = leer<DatosPlantilla>(`../datos/plantillas/${PLANTILLA}.json`);
const propuestas: PropuestaValor[] = ['precio', 'rapidez', 'calidad'];

const holgura = (h: number): FabricaBot => () => ({
  nombre: `h${h}`,
  decidir: (v) => ({ precio: v.parametros.precioReferencia, capacidad: Math.ceil(estimar(v) * h), marketing: 'medio' }),
});

console.log(`## ${base.nombre}: patrimonio final promedio según la holgura de capacidad (V) — estimación ${ESTIMADOR}\n`);
console.log(`| Costo por pedido (variable + capacidad) | ${HOLGURAS.map((h) => `×${h.toLocaleString('es-VE')}`).join(' | ')} | Mejor holgura | Por propuesta: precio / rapidez / calidad |`);
console.log(`| --- | ${HOLGURAS.map(() => '---').join(' | ')} | --- | --- |`);

for (const fr of FRACCIONES) {
  const pl = structuredClone(base);
  if (fr !== 'actual') {
    for (const s of pl.segmentos) {
      const total = s.costoVariablePorPedido + s.costoCapacidadPorUnidad;
      s.costoCapacidadPorUnidad = Math.round(total * Number(fr) * 100) / 100;
      s.costoVariablePorPedido = Math.round((total - s.costoCapacidadPorUnidad) * 100) / 100;
    }
  }
  const etiqueta = pl.segmentos.map((s) => `${s.id}: ${s.costoVariablePorPedido.toFixed(2)} + ${s.costoCapacidadPorUnidad.toFixed(2)}`).join(' · ');
  const porPropuesta: Record<string, number[]> = {};
  const promedios = HOLGURAS.map((h) => {
    let suma = 0, n = 0;
    for (const seg of pl.segmentos) {
      for (const prop of propuestas) {
        const p = resolverParametros(config, pl, seg.id, prop);
        let sp = 0, np = 0;
        for (const sab of [false, true]) {
          for (let i = 0; i < PARTIDAS; i++) { const x = jugarTemporada(p, holgura(h), `s${i}`, sab).patrimonioFinal; suma += x; n++; sp += x; np++; }
        }
        (porPropuesta[prop] ??= []).push(sp / np);
      }
    }
    return suma / n / 100;
  });
  const iMejor = promedios.indexOf(Math.max(...promedios));
  const mejorH = HOLGURAS[iMejor] ?? 1;
  // mejor patrimonio de cada propuesta (sobre todas las holguras)
  const k = pl.segmentos.length;
  const mejorPorProp = propuestas.map((prop) => {
    const xs = porPropuesta[prop] ?? [];
    let mejor = 0;
    for (let i = 0; i < HOLGURAS.length; i++) {
      const m = xs.slice(i * k, i * k + k).reduce((a, b) => a + b, 0) / k;
      mejor = Math.max(mejor, m);
    }
    return Math.round(mejor / 100).toLocaleString('es-VE');
  });
  console.log(`| ${etiqueta} | ${promedios.map((x) => Math.round(x).toLocaleString('es-VE')).join(' | ')} | ×${mejorH.toLocaleString('es-VE')} | ${mejorPorProp.join(' / ')} |`);
}
