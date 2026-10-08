// Una temporada completa: el planificador por lotes (RF-A-16).
// Cada día de calendario se simula; el jugador (o bot) decide solo en los días abiertos.
// v0: la temporada termina en la quiebra (sin reintento ni préstamo de emergencia).

import { crearContexto, diaSemana, DIAS_SEMANA, estadoInicial, estaAbierto, patrimonio, simularDia } from './simulacion.ts';
import type { Estado, Parametros, Plan, RegistroDia } from './tipos.ts';

/** Lo que un jugador puede ver para decidir. El precio de referencia es oculto en el juego;
 *  se expone aquí solo para que los bots representen a un jugador informado. */
export interface Vista {
  dia: number;
  diaSemana: number;
  diasRestantes: number;
  estado: Readonly<Estado>;
  historial: readonly RegistroDia[];
  parametros: Readonly<Parametros>;
  planVigente: Plan | null;
}

export interface Bot {
  nombre: string;
  decidir(v: Vista): Plan;
}

export interface ResultadoTemporada {
  plantilla: string;
  segmento: string;
  propuesta: string;
  abreSabados: boolean;
  bot: string;
  semilla: string;
  registros: RegistroDia[];
  estadoFinal: Estado;
  quebrada: boolean;
  diaQuiebra: number | null;
  patrimonioFinal: number;          // céntimos
}

export function jugarTemporada(
  p: Parametros,
  crearBot: (semilla: string) => Bot,
  semilla: string,
  abreSabados: boolean,
): ResultadoTemporada {
  const ctx = crearContexto(p, semilla);
  const bot = crearBot(semilla);
  const total = p.semanas * DIAS_SEMANA;
  let estado = estadoInicial(p, abreSabados);
  let plan: Plan | null = null;
  const registros: RegistroDia[] = [];
  let diaQuiebra: number | null = null;

  for (let d = 0; d < total; d++) {
    if (estaAbierto(d, abreSabados) || plan === null) {
      plan = bot.decidir({
        dia: d, diaSemana: diaSemana(d), diasRestantes: total - d,
        estado, historial: registros, parametros: p, planVigente: plan,
      });
    }
    const r = simularDia(p, estado, plan, ctx);
    estado = r.estado;
    registros.push(r.registro);
    if (r.registro.quiebra) { diaQuiebra = d; break; }
  }

  return {
    plantilla: p.plantilla, segmento: p.segmento, propuesta: p.propuesta,
    abreSabados, bot: bot.nombre, semilla,
    registros, estadoFinal: estado,
    quebrada: diaQuiebra !== null, diaQuiebra,
    patrimonioFinal: patrimonio(p, estado),
  };
}
