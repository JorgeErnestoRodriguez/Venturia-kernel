// Simulación de un día (sección 8 del documento de requerimientos).
// simularDia es una función pura: mismas entradas → mismo resultado en cualquier dispositivo.
//
// v1: imprevistos y oportunidades con plazo (motor/eventos.ts) cuando los parámetros traen catálogo;
// sin catálogo se comporta como v0 (k_evento = 1, Δ_evento = 0). Sin préstamo de emergencia.

import { acotar, pot, redondear } from './matematica.ts';
import { crearAleatorio } from './aleatorio.ts';
import {
  cerrarDia, costoVariableBase, estadoEventosInicial, iniciarDia, modificadores, pedidosComprometidos, precioRefEfectivo,
} from './eventos.ts';
import type { Acciones, Clima, ContextoTemporada, Estado, EstadoEventos, Parametros, Plan, RegistroDia } from './tipos.ts';

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
  const rImp = crearAleatorio(semilla, 'imprevistos');
  const rOpo = crearAleatorio(semilla, 'oportunidades');
  const rEst = crearAleatorio(semilla, 'estrella');
  const climas: Clima[] = [];
  const ruidos: number[] = [];
  const sorteoImprevisto: [number, number][] = [];
  const sorteoOportunidades: [number, number][] = [];
  for (let i = 0; i < dias; i++) {
    const x = rClima.siguiente();
    climas.push(x < p.probClima.soleado ? 'soleado'
      : x < p.probClima.soleado + p.probClima.nublado ? 'nublado' : 'lluvia');
    ruidos.push(rRuido.rango(p.ruidoMin, p.ruidoMax));
    sorteoImprevisto.push([rImp.siguiente(), rImp.siguiente()]);
    sorteoOportunidades.push([rOpo.siguiente(), rOpo.siguiente()]);
  }
  // Estrellas: semanas distintas entre la 1 y la penúltima; en cada una, un día hábil al azar
  const n = p.eventos?.oportunidades.estrellasPorTemporada ?? 0;
  const candidatas = Array.from({ length: Math.max(1, p.semanas - 1) }, (_, i) => i);
  const elegidas: number[] = [];
  for (let k = 0; k < Math.min(n, candidatas.length); k++) elegidas.push(candidatas.splice(rEst.entero(candidatas.length), 1)[0]!);
  const diaEstrella: number[] = [];
  for (let s = 0; s < p.semanas; s++) { const d = rEst.entero(5); diaEstrella.push(elegidas.includes(s) ? d : -1); }
  const rFra = crearAleatorio(semilla, 'franja-oportunidad');
  const franjaOportunidad = Array.from({ length: dias }, () => (rFra.siguiente() < 0.5 ? 'manana' as const : 'tarde' as const));
  return { semilla, climas, ruidos, sorteoImprevisto, sorteoOportunidades, diaEstrella, franjaOportunidad };
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
    ev: estadoEventosInicial(),
  };
}

/** Lleva un plan a los rangos permitidos (RF-A-03). El rango sigue al precio de referencia vigente. */
export function validarPlan(p: Parametros, plan: Plan, ev?: EstadoEventos): Plan {
  const ref = ev ? precioRefEfectivo(p, ev) : p.precioReferencia;
  const min = redondear(ref * p.precioMinFactor);
  const max = redondear(ref * p.precioMaxFactor);
  return {
    precio: acotar(redondear(plan.precio), min, max),
    capacidad: acotar(Math.floor(plan.capacidad), 0, 100000),
    marketing: plan.marketing,
  };
}

/** Valor de la cartera de clientes, en céntimos. Usa el precio de referencia, no el cobrado. */
export function valorCartera(p: Parametros, clientesMil: number, ev?: EstadoEventos): number {
  const ref = ev ? precioRefEfectivo(p, ev) : p.precioReferencia;
  const cv = ev ? costoVariableBase(p, ev) : p.costoVariable;
  const costoUnitario = cv + (p.carteraRestaCapacidad ? p.costoCapacidad : 0);
  const margen = Math.max(0, ref - costoUnitario) / 100;
  return redondear((clientesMil / 1000) * p.frecuenciaCompra * margen * p.diasValoracionCartera * 100);
}

export function patrimonio(p: Parametros, e: Estado): number {
  return e.caja + valorCartera(p, e.clientes, e.ev) - e.deuda;
}

export function simularDia(
  p: Parametros,
  estado: Estado,
  planPropuesto: Plan,
  ctx: ContextoTemporada,
  acciones?: Acciones,
): { estado: Estado; registro: RegistroDia } {
  const dia = estado.dia;
  const ds = diaSemana(dia);
  const abierto = estaAbierto(dia, estado.abreSabados);
  const clima = ctx.climas[dia] ?? 'soleado';
  let ev = estado.ev;
  let renta = 0;
  if (ds === DOMINGO) {
    if (ev.rentasPrepagadas > 0) ev = { ...ev, rentasPrepagadas: ev.rentasPrepagadas - 1 };
    else renta = p.rentaSemanal;
  }

  let demanda = 0, atendidos = 0, rechazados = 0;
  let ingresos = 0, costoVariable = 0, costoCapacidad = 0, costoMarketing = 0;
  let nuevosMil = 0, perdidosMil = 0;
  let calificacion = estado.calificacion;
  let caja = estado.caja, clientesMil = estado.clientes;
  let imprevisto: RegistroDia['imprevisto'] = null;
  let ofrecidas: string[] = [], aceptadas: string[] = [], incumplidos: string[] = [];
  let ingresosEventos = 0, cajaEventos = 0, factorDemanda = 1;
  let plan = validarPlan(p, planPropuesto, ev);

  if (abierto) {
    // Imprevisto pendiente y oportunidades aceptadas (inicio del día)
    const ini = iniciarDia(p, ev, caja, clientesMil, calificacion, ctx, dia, acciones);
    ev = ini.ev;
    caja += ini.caja; cajaEventos += ini.caja;
    clientesMil = Math.max(0, clientesMil + ini.clientes);
    calificacion = acotar(calificacion + ini.calificacion, 100, 500);
    imprevisto = ini.imprevisto; ofrecidas = ini.ofrecidas; aceptadas = ini.aceptadas;
    plan = validarPlan(p, planPropuesto, ev);
    const mod = modificadores(p, ev);
    factorDemanda = mod.demanda;

    const C = clientesMil / 1000;
    const q = calificacion / 100;
    const qEf = acotar(q + mod.deltaQ, 1, 5);
    const P = plan.precio / 100;
    const Pref = precioRefEfectivo(p, ev) / 100;
    const cvU = redondear(costoVariableBase(p, ev) * mod.costoVariable);
    const kSabado = ds === SABADO ? p.factorSabado : 1;
    const ruido = ctx.ruidos[dia] ?? 1;

    // Demanda
    const dReal = C * p.frecuenciaCompra * pot(Pref / P, p.sensibilidadPrecio)
      * (qEf / 3) * p.factorClima[clima] * kSabado * mod.demanda * ruido;
    demanda = Math.max(0, redondear(dReal));

    // Capacidad disponible: los contratos se atienden primero
    const capDisp = Math.floor(plan.capacidad * mod.capacidad);
    const comprometidos = pedidosComprometidos(ev);
    const servidosContrato = Math.min(comprometidos, capDisp);
    if (servidosContrato < comprometidos) {
      let restante = servidosContrato;
      const siguen = [];
      for (const c of ev.compromisos) {
        const activo = ev.diasVenta >= c.desde && ev.diasVenta < c.hasta;
        if (activo && restante >= c.unidades) restante -= c.unidades;
        else if (activo) {
          incumplidos.push(c.origen);
          calificacion = acotar(calificacion - c.penalizacion, 100, 500);
          if (c.cancelaAlFallar) continue;
        }
        siguen.push(c);
      }
      ev = { ...ev, compromisos: siguen };
    }

    // Atención y dinero
    atendidos = Math.min(demanda, capDisp - servidosContrato);
    rechazados = demanda - atendidos;
    const precioContrato = precioRefEfectivo(p, ev);
    ingresosEventos += servidosContrato * precioContrato;
    ingresos = atendidos * plan.precio + servidosContrato * precioContrato;
    const unidades = atendidos + servidosContrato;
    const prepagadas = ev.diasVenta < ev.insumosPrepagados.hasta ? Math.min(unidades, ev.insumosPrepagados.unidades) : 0;
    if (prepagadas > 0) ev = { ...ev, insumosPrepagados: { ...ev.insumosPrepagados, unidades: ev.insumosPrepagados.unidades - prepagadas } };
    costoVariable = (unidades - prepagadas) * cvU;
    costoCapacidad = ds === SABADO
      ? redondear(plan.capacidad * p.costoCapacidad * p.factorCapacidadSabado)
      : plan.capacidad * p.costoCapacidad;
    costoMarketing = p.costoMarketing[plan.marketing];

    // Clientes
    const rho = demanda > 0 ? rechazados / demanda : 0;
    const sobreprecio = Math.max(0, P / Pref - 1);
    const saturacion = Math.max(0, 1 - C / p.mercadoPotencial);
    const nuevos = (p.eficienciaMarketing[plan.marketing] * (costoMarketing / 100) / (p.costoPorClienteNuevo / 100)
      + p.tasaRecomendacion * atendidos * (qEf / 5)) * saturacion;
    const perdidos = C * (p.abandonoBase + p.abandonoMalServicio * rho + p.abandonoPrecio * sobreprecio);
    nuevosMil = redondear(nuevos * 1000);
    perdidosMil = Math.min(clientesMil + nuevosMil, redondear(perdidos * 1000));

    // Calificación
    const uso = capDisp > 0 ? unidades / capDisp : 1;
    const qActual = calificacion / 100;
    const qObj = acotar(
      p.qBase - p.b1Rechazos * rho - p.b2Precio * sobreprecio - p.b3Saturacion * Math.max(0, uso - p.umbralSaturacion),
      1, 5,
    );
    calificacion = acotar(redondear((qActual + p.lambda * (qObj - qActual)) * 100), 100, 500);

    // Cierre: cobros diferidos, contadores y disparos
    const cierre = cerrarDia(p, ev, ctx, dia, clima, {
      uso, rechazo: rho, calificacion: calificacion / 100, precio: plan.precio, marketing: plan.marketing, demanda,
    });
    ev = cierre.ev;
    ingresos += cierre.ingresoDiferido;
    ingresosEventos += cierre.ingresoDiferido;
  }

  const ganancia = ingresos - costoVariable - costoCapacidad - costoMarketing - renta;
  const clientes = clientesMil + nuevosMil - perdidosMil;
  caja += ganancia;
  const quiebra = caja < 0;

  const nuevo: Estado = {
    ...estado,
    dia: dia + 1,
    caja,
    clientes,
    calificacion,
    clientesMaximos: Math.max(estado.clientesMaximos, clientes),
    quebrada: estado.quebrada || quiebra,
    ev,
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
      imprevisto, oportunidades: { ofrecidas, aceptadas }, ingresosEventos, cajaEventos, incumplidos, factorDemanda,
    },
  };
}
