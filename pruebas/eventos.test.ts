// Pruebas de la v1: imprevistos y oportunidades con plazo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolverParametros, type DatosConfig, type DatosEventos, type DatosPlantilla } from '../motor/datos.ts';
import { crearContexto, estadoInicial, simularDia } from '../motor/simulacion.ts';
import { costoCaja, modificadores, oportunidadesDelDia } from '../motor/eventos.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import { BOTS } from '../bots/bots.ts';

const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const eventos = leer<DatosEventos>('../datos/eventos.json');
const arepas = leer<DatosPlantilla>('../datos/plantillas/arepas.json');
const tutorias = leer<DatosPlantilla>('../datos/plantillas/tutorias.json');
const p = resolverParametros(config, arepas, 'estudiantes', 'calidad', eventos);
const plan = { precio: p.precioReferencia, capacidad: 50, marketing: 'medio' as const };

test('v1 es determinista: misma semilla, mismos eventos y mismo patrimonio', () => {
  for (const bot of Object.values(BOTS)) {
    const a = jugarTemporada(p, bot, 'semilla-v1', true);
    const b = jugarTemporada(p, bot, 'semilla-v1', true);
    assert.deepEqual(a.registros, b.registros);
  }
});

test('sin catálogo de eventos, el motor no genera imprevistos ni oportunidades', () => {
  const p0 = resolverParametros(config, arepas, 'estudiantes', 'calidad');
  const r = jugarTemporada(p0, BOTS.oportunista!, 's1', false);
  assert.ok(r.registros.every((d) => d.imprevisto === null && d.oportunidades.ofrecidas.length === 0));
});

test('nunca hay imprevisto el primer día, máximo uno por día, y no se repite en 7 días de venta', () => {
  for (let i = 0; i < 50; i++) {
    const r = jugarTemporada(p, BOTS.avaro!, `s${i}`, true);
    assert.equal(r.registros[0]!.imprevisto, null);
    const vistos: Record<string, number> = {};
    let venta = 0;
    for (const d of r.registros) {
      if (!d.abierto) continue;
      if (d.imprevisto) {
        const u = vistos[d.imprevisto.id];
        if (u !== undefined) assert.ok(venta - u >= 7, `${d.imprevisto.id} repetido`);
        vistos[d.imprevisto.id] = venta;
      }
      venta++;
    }
  }
});

test('una oportunidad por día abierto y una estrella por temporada', () => {
  for (let i = 0; i < 30; i++) {
    const ctx = crearContexto(p, `s${i}`);
    let estrellas = 0;
    for (let d = 0; d < 28; d++) {
      if (d % 7 >= 5) continue;
      const ops = oportunidadesDelDia(p, ctx, d);
      assert.equal(ops.length, 1);
      if (ops[0]!.tipo === 'estrella') { estrellas++; assert.ok(d < 21, 'la estrella no cae en la última semana'); }
    }
    assert.equal(estrellas, 1);
  }
});

test('tope de daño: con poca caja, la opción que cuesta caja se cambia por otra', () => {
  const ctx = crearContexto(p, 's1');
  const e0 = estadoInicial(p, false);
  const estado = { ...e0, caja: 100, ev: { ...e0.ev, pendiente: 'I-01' } };   // multa = 0,5 G_d ≫ 1 V
  const r = simularDia(p, estado, plan, ctx, { respuestaImprevisto: 'a' });
  assert.deepEqual(r.registro.imprevisto, { id: 'I-01', opcion: 'b' });
  assert.equal(r.registro.cajaEventos, 0);
});

test('no se puede aceptar una oportunidad sin caja para pagarla', () => {
  for (let i = 0; i < 200; i++) {
    const ctx = crearContexto(p, `s${i}`);
    const o = oportunidadesDelDia(p, ctx, 0)[0]!;
    const e0 = estadoInicial(p, false);
    const costo = costoCaja(p, e0.ev, o.efectos);
    if (costo === 0) continue;
    const r = simularDia(p, { ...e0, caja: costo - 1 }, plan, ctx, { oportunidadesAceptadas: [o.id] });
    assert.deepEqual(r.registro.oportunidades.aceptadas, []);
    return;
  }
  assert.fail('no se encontró una oportunidad con costo');
});

test('los efectos que coinciden se multiplican y se acotan al rango', () => {
  const e0 = estadoInicial(p, false);
  const ev = { ...e0.ev, efectos: [
    { variable: 'demanda' as const, valor: 1400, desde: 0, hasta: 2 },
    { variable: 'demanda' as const, valor: 1400, desde: 0, hasta: 2 },
    { variable: 'capacidad' as const, valor: 500, desde: 0, hasta: 1 },
    { variable: 'capacidad' as const, valor: 700, desde: 0, hasta: 1 },
  ] };
  const m = modificadores(p, ev);
  assert.equal(m.demanda, 1.5);      // 1,96 acotado
  assert.equal(m.capacidad, 0.5);    // 0,35 acotado
});

test('la inflación sube precio de referencia, costo variable y meta un 10%', () => {
  const ctx = crearContexto(p, 's1');
  const e0 = estadoInicial(p, false);
  const r = simularDia(p, { ...e0, ev: { ...e0.ev, pendiente: 'I-13' } }, plan, ctx);
  assert.equal(r.estado.ev.factorPrecioRef, 1100);
  assert.equal(r.estado.ev.factorCostoVar, 1100);
  assert.equal(r.estado.ev.factorMeta, 1100);
});

test('tutorías también corre con eventos', () => {
  const pt = resolverParametros(config, tutorias, 'primaria', 'precio', eventos);
  const r = jugarTemporada(pt, BOTS.oportunista!, 's3', false);
  assert.ok(r.registros.some((d) => d.oportunidades.ofrecidas.length > 0));
});
