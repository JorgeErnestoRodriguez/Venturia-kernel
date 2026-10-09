// Estrategias automáticas para el balance. Cada bot representa un estilo de jugador.
// Solo usan lo que el jugador ve (estado, historial), salvo el precio de referencia,
// que en el juego es oculto: aquí los bots lo conocen para representar a un jugador informado.

import { crearAleatorio } from '../motor/aleatorio.ts';
import type { Bot, Vista } from '../motor/temporada.ts';
import type { NivelMarketing, Plan } from '../motor/tipos.ts';

/** Demanda esperada, como la estimaría un jugador atento:
 *  el sábado, la del último sábado abierto; entre semana, la del último día hábil abierto.
 *  Sin historial comparable, una estimación con los clientes actuales. */
export function demandaEsperada(v: Vista): number {
  const esSabado = v.diaSemana === 5;
  for (let i = v.historial.length - 1; i >= 0; i--) {
    const r = v.historial[i];
    if (r && r.abierto && (r.diaSemana === 5) === esSabado) return r.demanda;
  }
  for (let i = v.historial.length - 1; i >= 0; i--) {
    const r = v.historial[i];
    if (r && r.abierto) return r.demanda;
  }
  const p = v.parametros;
  return (v.estado.clientes / 1000) * p.frecuenciaCompra * (v.estado.calificacion / 300);
}

function planBase(v: Vista, factorPrecio: number, factorCapacidad: number, marketing: NivelMarketing): Plan {
  return {
    precio: v.parametros.precioReferencia * factorPrecio,
    capacidad: Math.ceil(demandaEsperada(v) * factorCapacidad),
    marketing,
  };
}

export type FabricaBot = (semilla: string) => Bot;

export const BOTS: Record<string, FabricaBot> = {
  /** Precio de referencia, capacidad con 5% de holgura, marketing medio (el mejor nivel
   *  constante según balance/experimento-cac.ts). Define la meta. */
  prudente: () => ({
    nombre: 'prudente',
    decidir: (v) => planBase(v, 1.0, 1.05, 'medio'),
  }),

  /** Decisiones al azar dentro de rangos razonables. Debe llegar poco a la meta. */
  aleatorio: (semilla) => {
    const r = crearAleatorio(semilla, 'bot-aleatorio');
    const niveles: NivelMarketing[] = ['0', 'bajo', 'medio', 'alto'];
    return {
      nombre: 'aleatorio',
      decidir: (v) => planBase(v, r.rango(0.6, 1.4), r.rango(0.5, 1.8), niveles[r.entero(4)] ?? 'bajo'),
    };
  },

  /** Igual que el prudente, pero con marketing alto. Detecta si el marketing máximo domina. */
  agresivo: () => ({
    nombre: 'agresivo',
    decidir: (v) => planBase(v, 1.0, 1.05, 'alto'),
  }),

  /** Igual que el prudente, pero con 30% de capacidad de sobra. Detecta si sobredimensionar domina. */
  holgado: () => ({
    nombre: 'holgado',
    decidir: (v) => planBase(v, 1.0, 1.3, 'medio'),
  }),

  /** Cobrar caro y no gastar en marketing. */
  avaro: () => ({
    nombre: 'avaro',
    decidir: (v) => planBase(v, 1.3, 1.0, '0'),
  }),

  /** Competir por precio: 20% por debajo de la referencia. */
  barato: () => ({
    nombre: 'barato',
    decidir: (v) => planBase(v, 0.8, 1.05, 'medio'),
  }),

  /** Marketing medio las 2 primeras semanas y nada después (exploit de fin de temporada). */
  cosechador: () => ({
    nombre: 'cosechador',
    decidir: (v) => planBase(v, 1.0, 1.05, v.dia < 14 ? 'medio' : '0'),
  }),
};
