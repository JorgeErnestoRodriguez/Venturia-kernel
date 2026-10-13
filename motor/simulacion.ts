// Simulación de un día (sección 8 del documento de requerimientos).
// simularDia es una función pura: mismas entradas → mismo resultado en cualquier dispositivo.
//
// v0: sin imprevistos ni oportunidades (k_evento = 1, Δ_evento = 0), sin préstamo de emergencia.

import { acotar, pot, redondear } from './matematica.ts';
import { crearAleatorio } from './aleatorio.ts';
import type { Clima, ContextoTemporada, Estado, Parametros, Plan, RegistroDia } from './tipos.ts';

export const DIAS_SEMANA = 7;
export const LUNES = 0;
export const SABADO = 5;
export const DOMINGO = 6;

export function diaSemana(dia: number): number {
  return dia % DIAS_SEMANA;
}

export function estaAbierto(dia: number, abreSabados: boolean): boolean {
  const d = diaSemana(dia);
  return d < SABADO || (d === SABADO && abreSabados);
}

/** Deriva de la semilla todo lo aleatorio de la temporada, antes de jugarla. */
export function crearContexto(p: Parametros, semilla: string): ContextoTemporada {
  const dias = p.semanas * DIAS_SEMANA;
  const rClima = crearAleatorio(semilla, 'clima');
  const rRuido = crearAleatorio(semilla, 'ruido-demanda');
  const climas: Clima[] = [];
  const ruidos: number[] = [];
  for (let i = 0; i < dias; i++) {
    const x = rClima.siguiente();
    climas.push(x < p.probClima.soleado ? 'soleado'
      : x < p.probClima.soleado + p.probClima.nublado ? 'nublado' : 'lluvia');
    ruidos.push(rRuido.rango(p.ruidoMin, p.ruidoMax));
  }
  return { semilla, climas, ruidos };
}

export function estadoInicial(p: Parametros, abreSabados: boolean): Estado {
  return {
    dia: 0,
    caja: p.capitalInicial,
    clientes: p.clientesIniciales,
    calificacion: p.califInicial,
    deuda: 0,
    clientesMaximos: p.clientesIniciales,
    abreSabados,
    quebrada: false,
  };
}

/** Lleva un plan a los rangos permitidos (RF-A-03). */
export function validarPlan(p: Parametros, plan: Plan): Plan {
  const min = redondear(p.precioReferencia * p.precioMinFactor);
  const max = redondear(p.precioReferencia * p.precioMaxFactor);
  return {
    precio: acotar(redondear(plan.precio), min, max),
    capacidad: acotar(Math.floor(plan.capacidad), 0, 100000),
    marketing: plan.marketing,
  };
}

/** Valor de la cartera de clientes, en céntimos. Usa el precio de referencia, no el cobrado. */
export function valorCartera(p: Parametros, clientesMil: number): number {
  const costoUnitario = p.costoVariable + (p.carteraRestaCapacidad ? p.costoCapacidad : 0);
  const margen = Math.max(0, p.precioReferencia - costoUnitario) / 100;
  return redondear((clientesMil / 1000) * p.frecuenciaCompra * margen * p.diasValoracionCartera * 100);
}

export function patrimonio(p: Parametros, e: Estado): number {
  return e.caja + valorCartera(p, e.clientes) - e.deuda;
}

export function simularDia(
  p: Parametros,
  estado: Estado,
  planPropuesto: Plan,
  ctx: ContextoTemporada,
): { estado: Estado; registro: RegistroDia } {
  const plan = validarPlan(p, planPropuesto);
  const dia = estado.dia;
  const ds = diaSemana(dia);
  const abierto = estaAbierto(dia, estado.abreSabados);
  const clima = ctx.climas[dia] ?? 'soleado';
  const renta = ds === DOMINGO ? p.rentaSemanal : 0;

  let demanda = 0, atendidos = 0, rechazados = 0;
  let ingresos = 0, costoVariable = 0, costoCapacidad = 0, costoMarketing = 0;
  let nuevosMil = 0, perdidosMil = 0;
  let calificacion = estado.calificacion;

  if (abierto) {
    const C = estado.clientes / 1000;
    const q = estado.calificacion / 100;
    const P = plan.precio / 100;
    const Pref = p.precioReferencia / 100;
    const kSabado = ds === SABADO ? p.factorSabado : 1;
    const ruido = ctx.ruidos[dia] ?? 1;

    // Demanda
    const dReal = C * p.frecuenciaCompra * pot(Pref / P, p.sensibilidadPrecio)
      * (q / 3) * p.factorClima[clima] * kSabado * ruido;
    demanda = Math.max(0, redondear(dReal));

    // Atención y dinero
    atendidos = Math.min(demanda, plan.capacidad);
    rechazados = demanda - atendidos;
    ingresos = atendidos * plan.precio;
    costoVariable = atendidos * p.costoVariable;
    costoCapacidad = ds === SABADO
      ? redondear(plan.capacidad * p.costoCapacidad * p.factorCapacidadSabado)
      : plan.capacidad * p.costoCapacidad;
    costoMarketing = p.costoMarketing[plan.marketing];

    // Clientes
    const rho = demanda > 0 ? rechazados / demanda : 0;
    const sobreprecio = Math.max(0, P / Pref - 1);
    const saturacion = Math.max(0, 1 - C / p.mercadoPotencial);
    const nuevos = (p.eficienciaMarketing[plan.marketing] * (costoMarketing / 100) / (p.costoPorClienteNuevo / 100)
      + p.tasaRecomendacion * atendidos * (q / 5)) * saturacion;
    const perdidos = C * (p.abandonoBase + p.abandonoMalServicio * rho + p.abandonoPrecio * sobreprecio);
    nuevosMil = redondear(nuevos * 1000);
    perdidosMil = Math.min(estado.clientes + nuevosMil, redondear(perdidos * 1000));

    // Calificación
    const uso = plan.capacidad > 0 ? atendidos / plan.capacidad : 1;
    const qObj = acotar(
      p.qBase - p.b1Rechazos * rho - p.b2Precio * sobreprecio - p.b3Saturacion * Math.max(0, uso - p.umbralSaturacion),
      1, 5,
    );
    calificacion = acotar(redondear((q + p.lambda * (qObj - q)) * 100), 100, 500);
  }

  const ganancia = ingresos - costoVariable - costoCapacidad - costoMarketing - renta;
  const clientes = estado.clientes + nuevosMil - perdidosMil;
  const caja = estado.caja + ganancia;
  const quiebra = caja < 0;

  const nuevo: Estado = {
    ...estado,
    dia: dia + 1,
    caja,
    clientes,
    calificacion,
    clientesMaximos: Math.max(estado.clientesMaximos, clientes),
    quebrada: estado.quebrada || quiebra,
  };

  return {
    estado: nuevo,
    registro: {
      dia, diaSemana: ds, abierto, clima, plan,
      demanda, atendidos, rechazados,
      ingresos, costoVariable, costoCapacidad, costoMarketing, renta, ganancia,
      clientesNuevos: nuevosMil, clientesPerdidos: perdidosMil, clientesFinal: clientes,
      calificacionFinal: calificacion, cajaFinal: caja,
      patrimonioFinal: patrimonio(p, nuevo),
      quiebra,
    },
  };
}
