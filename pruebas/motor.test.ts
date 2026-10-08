import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exp, ln, pot } from '../motor/matematica.ts';
import { resolverParametros, type DatosConfig, type DatosPlantilla } from '../motor/datos.ts';
import { crearContexto, estadoInicial, simularDia, valorCartera } from '../motor/simulacion.ts';
import { jugarTemporada } from '../motor/temporada.ts';
import { BOTS } from '../bots/bots.ts';

const leer = <T>(r: string): T => JSON.parse(readFileSync(new URL(r, import.meta.url), 'utf8')) as T;
const config = leer<DatosConfig>('../datos/config.json');
const arepas = leer<DatosPlantilla>('../datos/plantillas/arepas.json');
const tutorias = leer<DatosPlantilla>('../datos/plantillas/tutorias.json');
const p = resolverParametros(config, arepas, 'estudiantes', 'rapidez');

test('ln, exp y pot coinciden con Math dentro de 1e-12 relativo', () => {
  for (const x of [0.01, 0.37, 0.5, 0.9, 1, 1.1, 1.5, 2, 3.7, 10, 1234.5]) {
    assert.ok(Math.abs(ln(x) - Math.log(x)) <= 1e-12 * Math.max(1, Math.abs(Math.log(x))), `ln(${x})`);
  }
  for (const x of [-20, -3.3, -1, -0.1, 0, 0.2, 1, 2.5, 10, 40]) {
    assert.ok(Math.abs(exp(x) - Math.exp(x)) <= 1e-12 * Math.exp(x), `exp(${x})`);
  }
  for (const [b, e] of [[0.667, 1.8], [1.5, 1.8], [2, 0.8], [0.5, 1.2]] as const) {
    assert.ok(Math.abs(pot(b, e) - Math.pow(b, e)) <= 1e-12 * Math.pow(b, e), `pot(${b},${e})`);
  }
});

test('determinismo: misma semilla, mismo resultado al céntimo', () => {
  for (const bot of Object.values(BOTS)) {
    const a = jugarTemporada(p, bot, 'semilla-x', true);
    const b = jugarTemporada(p, bot, 'semilla-x', true);
    assert.deepEqual(a.registros, b.registros);
    assert.equal(a.patrimonioFinal, b.patrimonioFinal);
  }
});

test('semillas distintas dan temporadas distintas', () => {
  const a = jugarTemporada(p, BOTS.prudente!, 's1', false);
  const b = jugarTemporada(p, BOTS.prudente!, 's2', false);
  assert.notEqual(a.patrimonioFinal, b.patrimonioFinal);
});

test('el estado se guarda siempre en enteros', () => {
  const r = jugarTemporada(p, BOTS.aleatorio!, 'enteros', true);
  for (const reg of r.registros) {
    for (const k of ['ingresos', 'ganancia', 'cajaFinal', 'clientesFinal', 'calificacionFinal', 'patrimonioFinal'] as const) {
      assert.ok(Number.isInteger(reg[k]), `${k} = ${reg[k]} en el día ${reg.dia}`);
    }
  }
});

test('calendario: domingo cerrado y cobra la renta; sábado según la elección', () => {
  const sin = jugarTemporada(p, BOTS.prudente!, 'cal', false).registros;
  const con = jugarTemporada(p, BOTS.prudente!, 'cal', true).registros;
  for (const regs of [sin, con]) {
    for (const r of regs.filter((x) => x.diaSemana === 6)) {
      assert.equal(r.abierto, false);
      assert.equal(r.renta, p.rentaSemanal);
      assert.equal(r.ingresos, 0);
    }
  }
  assert.ok(sin.filter((r) => r.diaSemana === 5).every((r) => !r.abierto && r.costoCapacidad === 0));
  assert.ok(con.filter((r) => r.diaSemana === 5).every((r) => r.abierto));
});

test('la capacidad se paga completa aunque no se use; atendidos = mín(demanda, capacidad)', () => {
  const ctx = crearContexto(p, 'cap');
  const e = estadoInicial(p, false);
  const { registro } = simularDia(p, e, { precio: p.precioReferencia, capacidad: 1000, marketing: '0' }, ctx);
  assert.equal(registro.costoCapacidad, 1000 * p.costoCapacidad);
  assert.equal(registro.atendidos, Math.min(registro.demanda, 1000));
  const corta = simularDia(p, e, { precio: p.precioReferencia, capacidad: 10, marketing: '0' }, ctx).registro;
  assert.equal(corta.atendidos, 10);
  assert.equal(corta.rechazados, corta.demanda - 10);
});

test('la calificación nunca sale de 1,00–5,00 y los clientes nunca superan el mercado', () => {
  for (const pl of [arepas, tutorias]) {
    for (const seg of pl.segmentos) {
      for (const prop of ['precio', 'rapidez', 'calidad'] as const) {
        const q = resolverParametros(config, pl, seg.id, prop);
        for (let i = 0; i < 50; i++) {
          const r = jugarTemporada(q, BOTS.aleatorio!, `lim${i}`, i % 2 === 0);
          for (const reg of r.registros) {
            assert.ok(reg.calificacionFinal >= 100 && reg.calificacionFinal <= 500);
            assert.ok(reg.clientesFinal >= 0 && reg.clientesFinal <= q.mercadoPotencial * 1000);
          }
        }
      }
    }
  }
});

test('el valor de la cartera usa el precio de referencia, no el cobrado', () => {
  const v = valorCartera(p, 100_000);
  const esperado = Math.round(100 * p.frecuenciaCompra * ((p.precioReferencia - p.costoVariable) / 100) * p.diasValoracionCartera * 100);
  assert.equal(v, esperado);
});

test('la temporada termina en la quiebra', () => {
  // Precio mínimo y capacidad enorme: pierde dinero cada día
  const ruina = { nombre: 'ruina', decidir: () => ({ precio: 1, capacidad: 50_000, marketing: 'alto' as const }) };
  const r = jugarTemporada(p, () => ruina, 'q', false);
  assert.equal(r.quebrada, true);
  assert.equal(r.registros.length, (r.diaQuiebra ?? -1) + 1);
});
