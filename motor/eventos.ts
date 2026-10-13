// v1: imprevistos y oportunidades con plazo (sección 8 del documento de requerimientos).
// Funciones puras sobre el estado de eventos; simularDia las llama en este orden:
//   inicio del día:  aplicarImprevisto → aplicarOportunidades → modificadores
//   cierre del día:  cerrarDia (cobros diferidos, contadores, disparos del imprevisto siguiente)

import { acotar, redondear } from './matematica.ts';
import type {
  Acciones, Clima, Compromiso, ContextoTemporada, Efecto, EstadoEventos, Imprevisto,
  Oportunidad, Parametros, TipoOportunidad,
} from './tipos.ts';

export function estadoEventosInicial(): EstadoEventos {
  return {
    diasVenta: 0, efectos: [], compromisos: [], diferidos: [],
    insumosPrepagados: { unidades: 0, hasta: 0 }, rentasPrepagadas: 0,
    pendiente: null, ultimoPorId: {}, imprevistos: 0,
    rachaUsoAlto: 0, ventanaUso: [], rachaPrecioAlto: 0, rachaSinMarketing: 0, ultimaDemanda: 0,
    factorPrecioRef: 1000, factorCostoVar: 1000, factorMeta: 1000, ajustarPrecio: false,
  };
}

/** Precio de referencia vigente (incluye la inflación), en céntimos. */
export const precioRefEfectivo = (p: Parametros, ev: EstadoEventos): number =>
  redondear(p.precioReferencia * ev.factorPrecioRef / 1000);

/** Costo variable base vigente (incluye la inflación, no los efectos temporales), en céntimos. */
export const costoVariableBase = (p: Parametros, ev: EstadoEventos): number =>
  redondear(p.costoVariable * ev.factorCostoVar / 1000);

/** Un monto expresado en G_d, en céntimos. */
export const montoGd = (p: Parametros, gd: number): number => redondear(gd * p.gananciaDiaria);

export interface Modificadores { demanda: number; costoVariable: number; capacidad: number; deltaQ: number }

/** Multiplicadores y deltas que actúan en el día de venta en curso, ya acotados a sus rangos. */
export function modificadores(p: Parametros, ev: EstadoEventos): Modificadores {
  const m: Modificadores = { demanda: 1, costoVariable: 1, capacidad: 1, deltaQ: 0 };
  if (!p.eventos) return m;
  const d = ev.diasVenta;
  for (const e of ev.efectos) {
    if (d < e.desde || d >= e.hasta) continue;
    if (e.variable === 'calificacion') m.deltaQ += e.valor / 100;
    else m[e.variable] *= e.valor / 1000;
  }
  const r = p.eventos.rangos;
  m.demanda = acotar(m.demanda, r.demanda[0], r.demanda[1]);
  m.costoVariable = acotar(m.costoVariable, r.costoVariable[0], r.costoVariable[1]);
  m.capacidad = acotar(m.capacidad, r.capacidad[0], r.capacidad[1]);
  m.deltaQ = acotar(m.deltaQ, r.calificacion[0], r.calificacion[1]);
  return m;
}

/** Pedidos comprometidos (contratos) que hay que atender hoy. */
export const pedidosComprometidos = (ev: EstadoEventos): number =>
  ev.compromisos.filter((c) => ev.diasVenta >= c.desde && ev.diasVenta < c.hasta).reduce((a, c) => a + c.unidades, 0);

/** Lo que cuesta en caja aplicar estos efectos hoy (sin contar pérdidas futuras). Céntimos ≥ 0. */
export function costoCaja(p: Parametros, ev: EstadoEventos, efectos: readonly Efecto[]): number {
  let c = 0;
  for (const e of efectos) {
    if (e.tipo === 'caja' && e.gd < 0) c += montoGd(p, -e.gd);
    if (e.tipo === 'prepagoInsumos') c += prepagoInsumos(p, ev, e.dias, e.descuento).monto;
    if (e.tipo === 'prepagoRenta') c += redondear(e.semanas * p.rentaSemanal * (1 - e.descuento));
  }
  return c;
}

function prepagoInsumos(p: Parametros, ev: EstadoEventos, dias: number, descuento: number): { unidades: number; monto: number } {
  const unidades = Math.max(0, ev.ultimaDemanda) * dias;
  return { unidades, monto: redondear(unidades * costoVariableBase(p, ev) * (1 - descuento)) };
}

/** Opciones que el jugador puede elegir: las que cuestan caja exigen tenerla (tope de daño). */
export function opcionesHabilitadas(p: Parametros, ev: EstadoEventos, caja: number, imp: Imprevisto): string[] {
  return imp.opciones.filter((o) => costoCaja(p, ev, o.efectos) <= Math.max(0, caja)).map((o) => o.id);
}

/** Opción que se aplica: la elegida si está habilitada; si no, la por defecto; si tampoco, la primera habilitada. */
export function opcionAplicada(p: Parametros, ev: EstadoEventos, caja: number, imp: Imprevisto, elegida?: string): string {
  const ok = opcionesHabilitadas(p, ev, caja, imp);
  if (elegida && ok.includes(elegida)) return elegida;
  if (ok.includes(imp.porDefecto)) return imp.porDefecto;
  return ok[0] ?? imp.porDefecto;
}

export interface ResultadoEfectos {
  ev: EstadoEventos;
  caja: number;                    // variación de caja (céntimos)
  clientes: number;                // variación de clientes (milésimas)
  calificacion: number;            // variación directa de calificación (centésimas)
}

/** Aplica efectos al inicio de un día de venta. No muta las entradas. */
export function aplicarEfectos(
  p: Parametros, ev0: EstadoEventos, efectos: readonly Efecto[], origen: string,
  clientes: number, calificacion: number,
): ResultadoEfectos {
  const ev: EstadoEventos = {
    ...ev0, efectos: [...ev0.efectos], compromisos: [...ev0.compromisos], diferidos: [...ev0.diferidos],
    insumosPrepagados: { ...ev0.insumosPrepagados }, ultimoPorId: { ...ev0.ultimoPorId },
  };
  const r: ResultadoEfectos = { ev, caja: 0, clientes: 0, calificacion: 0 };
  const hoy = ev.diasVenta;
  for (const e of efectos) {
    switch (e.tipo) {
      case 'caja': r.caja += montoGd(p, e.gd); break;
      case 'demanda': case 'costoVariable': case 'capacidad': {
        const desde = hoy + (e.desde ?? 0);
        ev.efectos.push({ variable: e.tipo, valor: redondear(e.factor * 1000), desde, hasta: desde + e.dias });
        break;
      }
      case 'calificacionTemporal': {
        const desde = hoy + (e.desde ?? 0);
        ev.efectos.push({ variable: 'calificacion', valor: redondear(e.delta * 100), desde, hasta: desde + e.dias });
        break;
      }
      case 'calificacion': r.calificacion += redondear(e.delta * 100); break;
      case 'clientes': r.clientes += redondear((clientes + r.clientes) * e.fraccion); break;
      case 'inflacion':
        ev.factorPrecioRef = redondear(ev.factorPrecioRef * e.factor);
        ev.factorCostoVar = redondear(ev.factorCostoVar * e.factor);
        ev.factorMeta = redondear(ev.factorMeta * e.factor);
        ev.ajustarPrecio = e.ajustarPrecio;
        break;
      case 'pedido': {
        const unidades = e.unidades ?? Math.max(1, redondear((e.fraccionDemanda ?? 0) * ev.ultimaDemanda));
        const c: Compromiso = {
          origen, unidades, desde: hoy + e.desde, hasta: hoy + e.desde + e.dias,
          penalizacion: redondear(e.penalizacion * 100), cancelaAlFallar: e.cancelaAlFallar ?? false,
        };
        ev.compromisos.push(c);
        break;
      }
      case 'ingresoDiferido':
        ev.diferidos.push({ diaVenta: hoy + e.enDias, monto: montoGd(p, e.gd), segunClima: e.segunClima ?? false });
        break;
      case 'prepagoInsumos': {
        const { unidades, monto } = prepagoInsumos(p, ev, e.dias, e.descuento);
        r.caja -= monto;
        ev.insumosPrepagados = { unidades: ev.insumosPrepagados.unidades + unidades, hasta: hoy + e.dias };
        break;
      }
      case 'prepagoRenta':
        r.caja -= redondear(e.semanas * p.rentaSemanal * (1 - e.descuento));
        ev.rentasPrepagadas += e.semanas;
        break;
      case 'resena':
        if ((calificacion + r.calificacion) / 100 < e.umbral) r.calificacion += redondear(e.malo * 100);
        else ev.efectos.push({ variable: 'calificacion', valor: redondear(e.bueno * 100), desde: hoy, hasta: hoy + e.dias });
        break;
      case 'revelar': break;       // v1: sin efecto en la economía (los bots no usan información oculta)
    }
  }
  return r;
}

// ---------- Generación ----------

const TIPOS: Exclude<TipoOportunidad, 'estrella'>[] = ['monetaria', 'reputacional', 'equipo', 'ahorro', 'informacion'];

/** Oportunidades que se ofrecen en un día de calendario abierto (derivadas solo de la semilla). */
export function oportunidadesDelDia(p: Parametros, ctx: ContextoTemporada, dia: number): Oportunidad[] {
  if (!p.eventos) return [];
  const cat = p.eventos.oportunidades;
  const propias = cat.catalogo.filter((o) => o.aplica.includes(p.plantilla));
  const semana = Math.floor(dia / 7), ds = dia % 7;
  const res: Oportunidad[] = [];
  const sorteos = ctx.sorteoOportunidades[dia] ?? [0, 0];
  for (let k = 0; k < cat.porDia; k++) {
    const x = sorteos[k] ?? 0;
    let elegida: Oportunidad | undefined;
    if (k === 0 && cat.estrellaCadaSemanas > 0 && semana % cat.estrellaCadaSemanas === 0 && ctx.diaEstrella[semana] === ds) {
      elegida = propias.find((o) => o.tipo === 'estrella');
    } else {
      // Tipo según los pesos; dentro del tipo, uniforme. Se reutiliza el mismo sorteo escalado.
      let acum = 0, tipo = TIPOS[TIPOS.length - 1]!;
      const total = TIPOS.reduce((a, t) => a + cat.pesos[t], 0);
      for (const t of TIPOS) { acum += cat.pesos[t] / total; if (x < acum) { tipo = t; break; } }
      const lo = acum - cat.pesos[tipo] / total;
      const y = (x - lo) / (cat.pesos[tipo] / total);
      const delTipo = propias.filter((o) => o.tipo === tipo && !res.some((r) => r.id === o.id));
      elegida = delTipo[Math.min(delTipo.length - 1, Math.floor(y * delTipo.length))];
    }
    if (elegida) res.push(elegida);
  }
  return res;
}

// ---------- Inicio y cierre del día ----------

export interface InicioDia {
  ev: EstadoEventos;
  caja: number; clientes: number; calificacion: number;      // variaciones
  imprevisto: { id: string; opcion: string } | null;
  ofrecidas: string[];
  aceptadas: string[];
}

/** Aplica el imprevisto pendiente y las oportunidades aceptadas, al inicio de un día abierto. */
export function iniciarDia(
  p: Parametros, ev0: EstadoEventos, caja: number, clientes: number, calificacion: number,
  ctx: ContextoTemporada, dia: number, acciones: Acciones | undefined,
): InicioDia {
  const out: InicioDia = { ev: ev0, caja: 0, clientes: 0, calificacion: 0, imprevisto: null, ofrecidas: [], aceptadas: [] };
  if (!p.eventos) return out;
  const sumar = (r: ResultadoEfectos): void => {
    out.ev = r.ev; out.caja += r.caja; out.clientes += r.clientes; out.calificacion += r.calificacion;
  };

  if (ev0.pendiente) {
    const imp = p.eventos.imprevistos.catalogo.find((i) => i.id === ev0.pendiente)!;
    const opcion = opcionAplicada(p, ev0, caja, imp, acciones?.respuestaImprevisto);
    sumar(aplicarEfectos(p, ev0, imp.opciones.find((o) => o.id === opcion)!.efectos, imp.id, clientes, calificacion));
    out.ev = {
      ...out.ev, pendiente: null, imprevistos: out.ev.imprevistos + 1,
      ultimoPorId: { ...out.ev.ultimoPorId, [imp.id]: ev0.diasVenta },
    };
    out.imprevisto = { id: imp.id, opcion };
  }

  const ofrecidas = oportunidadesDelDia(p, ctx, dia);
  out.ofrecidas = ofrecidas.map((o) => o.id);
  for (const id of acciones?.oportunidadesAceptadas ?? []) {
    const o = ofrecidas.find((x) => x.id === id);
    if (!o || out.aceptadas.includes(id)) continue;
    if (costoCaja(p, out.ev, o.efectos) > Math.max(0, caja + out.caja)) continue;   // sin caja no se puede aceptar
    sumar(aplicarEfectos(p, out.ev, o.efectos, o.id, clientes + out.clientes, calificacion + out.calificacion));
    out.aceptadas.push(id);
  }
  return out;
}

export interface CierreDia {
  ev: EstadoEventos;
  ingresoDiferido: number;         // céntimos cobrados hoy
}

/** Cierre de un día abierto: cobros diferidos, contadores de disparo y elección del imprevisto siguiente. */
export function cerrarDia(
  p: Parametros, ev0: EstadoEventos, ctx: ContextoTemporada, dia: number, clima: Clima,
  datos: { uso: number; rechazo: number; calificacion: number; precio: number; marketing: string; demanda: number },
): CierreDia {
  const hoy = ev0.diasVenta;
  const ev: EstadoEventos = { ...ev0, ultimoPorId: { ...ev0.ultimoPorId } };
  let ingresoDiferido = 0;
  if (p.eventos) {
    const climaF = p.eventos.oportunidades.climaIngresoDiferido;
    for (const d of ev.diferidos) if (d.diaVenta === hoy) ingresoDiferido += d.segunClima ? redondear(d.monto * climaF[clima]) : d.monto;
  }
  ev.diferidos = ev0.diferidos.filter((d) => d.diaVenta > hoy);
  ev.efectos = ev0.efectos.filter((e) => e.hasta > hoy + 1);
  ev.compromisos = ev0.compromisos.filter((c) => c.hasta > hoy + 1);
  if (ev.insumosPrepagados.hasta <= hoy + 1) ev.insumosPrepagados = { unidades: 0, hasta: 0 };

  // Contadores
  const usoAlto = datos.uso > 0.95 ? 1 : 0;
  ev.rachaUsoAlto = usoAlto ? ev0.rachaUsoAlto + 1 : 0;
  ev.ventanaUso = [...ev0.ventanaUso, usoAlto].slice(-7);
  ev.rachaPrecioAlto = datos.precio > 1.15 * precioRefEfectivo(p, ev0) ? ev0.rachaPrecioAlto + 1 : 0;
  ev.rachaSinMarketing = datos.marketing === '0' ? ev0.rachaSinMarketing + 1 : 0;
  ev.ultimaDemanda = datos.demanda;
  ev.diasVenta = hoy + 1;

  if (p.eventos && ev.pendiente === null) ev.pendiente = elegirImprevisto(p, ev, ctx, dia, datos);
  return { ev, ingresoDiferido };
}

function disparado(imp: Imprevisto, ev: EstadoEventos, datos: { uso: number; rechazo: number; calificacion: number }): boolean {
  const d = imp.disparo;
  switch (d.tipo) {
    case 'aleatorio': return false;
    case 'usoAltoSeguido': return ev.rachaUsoAlto >= d.dias;
    case 'usoAltoEnVentana': return ev.ventanaUso.slice(-d.ventana).reduce((a, b) => a + b, 0) >= d.dias;
    case 'rechazos': return datos.rechazo > d.umbral;
    case 'calificacionMinima': return datos.calificacion >= d.valor;
    case 'calificacionMaxima': return datos.calificacion <= d.valor;
    case 'precioAltoSeguido': return ev.rachaPrecioAlto >= d.dias;
    case 'sinMarketingSeguido': return ev.rachaSinMarketing >= d.dias;
  }
}

/** Máximo un imprevisto por día: primero los condicionales (orden del catálogo), si no, quizá uno aleatorio. */
function elegirImprevisto(
  p: Parametros, ev: EstadoEventos, ctx: ContextoTemporada, dia: number,
  datos: { uso: number; rechazo: number; calificacion: number },
): string | null {
  const cat = p.eventos!.imprevistos;
  const hoy = ev.diasVenta;           // ya incrementado: el imprevisto aparecerá en este día de venta
  const libre = (i: Imprevisto): boolean => {
    const u = ev.ultimoPorId[i.id];
    return i.aplica.includes(p.plantilla) && (u === undefined || hoy - u >= cat.diasSinRepetir);
  };
  const cond = cat.catalogo.find((i) => i.disparo.tipo !== 'aleatorio' && libre(i) && disparado(i, ev, datos));
  if (cond) return cond.id;
  const [x, y] = ctx.sorteoImprevisto[dia] ?? [1, 0];
  if (x >= cat.probabilidadAleatorioPorDia) return null;
  const aleatorios = cat.catalogo.filter((i) => {
    if (i.disparo.tipo !== 'aleatorio' || !libre(i)) return false;
    const max = i.disparo.maximoPorTemporada;
    return max === undefined || (ev.ultimoPorId[i.id] === undefined) || max > 1;
  });
  return aleatorios[Math.floor(y * aleatorios.length)]?.id ?? null;
}
