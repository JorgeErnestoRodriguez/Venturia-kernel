// Una temporada completa: el planificador por lotes (RF-A-16).
// Cada día de calendario se simula; el jugador (o bot) decide solo en los días abiertos.
// La temporada termina en la quiebra (sin reintento ni préstamo de emergencia).
// Un bot que no responde imprevistos ni oportunidades juega como el piloto automático mínimo:
// opción por defecto y ninguna oportunidad aceptada.

import { crearContexto, diaSemana, DIAS_SEMANA, estadoInicial, estaAbierto, patrimonio, simularDia } from './simulacion.ts';
import { oportunidadesDelDia } from './eventos.ts';
import type { Acciones, Estado, Imprevisto, Oportunidad, Parametros, Plan, RegistroDia } from './tipos.ts';

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
  /** v1: imprevisto que aparece hoy (si hay) y oportunidades del día. */
  imprevisto: Imprevisto | null;
  oportunidades: readonly Oportunidad[];
}

export interface Decision { plan: Plan; acciones?: Acciones }

export interface Bot {
  nombre: string;
  decidir(v: Vista): Plan | Decision;
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
  factorMeta: number;               // la meta de esta partida es meta × factorMeta (inflación)
}

const esDecision = (x: Plan | Decision): x is Decision => 'plan' in x;

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
    let acciones: Acciones | undefined;
    const abierto = estaAbierto(d, abreSabados);
    if (abierto || plan === null) {
      const imprevisto = abierto && estado.ev.pendiente
        ? p.eventos?.imprevistos.catalogo.find((i) => i.id === estado.ev.pendiente) ?? null : null;
      const r = bot.decidir({
        dia: d, diaSemana: diaSemana(d), diasRestantes: total - d,
        estado, historial: registros, parametros: p, planVigente: plan,
        imprevisto, oportunidades: abierto ? oportunidadesDelDia(p, ctx, d) : [],
      });
      if (esDecision(r)) { plan = r.plan; acciones = r.acciones; } else plan = r;
    }
    const res = simularDia(p, estado, plan, ctx, acciones);
    // Inflación con «ajustar el precio»: el plan vigente sube con ella (también para el piloto automático)
    if (res.estado.ev.ajustarPrecio && plan) {
      plan = { ...plan, precio: Math.round(plan.precio * res.estado.ev.factorPrecioRef / 1000) };
      res.estado.ev = { ...res.estado.ev, ajustarPrecio: false };
    }
    estado = res.estado;
    registros.push(res.registro);
    if (res.registro.quiebra) { diaQuiebra = d; break; }
  }

  return {
    plantilla: p.plantilla, segmento: p.segmento, propuesta: p.propuesta,
    abreSabados, bot: bot.nombre, semilla,
    registros, estadoFinal: estado,
    quebrada: diaQuiebra !== null, diaQuiebra,
    patrimonioFinal: patrimonio(p, estado),
    factorMeta: estado.ev.factorMeta / 1000,
  };
}
