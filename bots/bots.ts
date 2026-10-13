// Estrategias automáticas para el balance. Cada bot representa un estilo de jugador.
// Solo usan lo que el jugador ve (estado, historial, imprevisto y oportunidades del día), salvo el
// precio de referencia, que en el juego es oculto: aquí los bots lo conocen para representar a un
// jugador informado.
//
// v1: cada bot tiene además una política ante los eventos:
//   imprevistos   'defecto' (piloto automático) | 'mejor' (estima el valor de cada opción) | 'azar'
//   oportunidades 'ninguna' | 'buenas' (acepta las de valor estimado positivo, salvo las de información) | 'azar'

import { crearAleatorio } from '../motor/aleatorio.ts';
import {
  aplicarEfectos, costoCaja, costoVariableBase, modificadores, montoGd, opcionesHabilitadas,
  pedidosComprometidos, precioRefEfectivo,
} from '../motor/eventos.ts';
import type { Bot, Decision, Vista } from '../motor/temporada.ts';
import type { Efecto, EstadoEventos, NivelMarketing } from '../motor/tipos.ts';

/** Demanda esperada sin efectos de eventos, como la estimaría un jugador atento:
 *  el sábado, la del último sábado abierto; entre semana, la del último día hábil abierto.
 *  Sin historial comparable, una estimación con los clientes actuales. */
export function demandaEsperada(v: Vista): number {
  const esSabado = v.diaSemana === 5;
  const base = (i: number): number => { const r = v.historial[i]!; return r.demanda / (r.factorDemanda || 1); };
  for (let i = v.historial.length - 1; i >= 0; i--) {
    const r = v.historial[i];
    if (r && r.abierto && (r.diaSemana === 5) === esSabado) return base(i);
  }
  for (let i = v.historial.length - 1; i >= 0; i--) {
    const r = v.historial[i];
    if (r && r.abierto) return base(i);
  }
  const p = v.parametros;
  return (v.estado.clientes / 1000) * p.frecuenciaCompra * (v.estado.calificacion / 300);
}

type PoliticaImprevistos = 'defecto' | 'mejor' | 'azar';
type PoliticaOportunidades = 'ninguna' | 'buenas' | 'azar';

interface Estilo {
  nombre: string;
  precio: number;                          // factor sobre el precio de referencia vigente
  holgura: number;                         // capacidad / demanda esperada
  marketing: (v: Vista) => NivelMarketing;
  imprevistos?: PoliticaImprevistos;
  oportunidades?: PoliticaOportunidades;
}

/** Valor estimado (céntimos) de aplicar unos efectos, para un jugador que ajusta su capacidad. */
export function valorEstimado(v: Vista, efectos: readonly Efecto[], holgura: number): number {
  const p = v.parametros, ev = v.estado.ev;
  const D = demandaEsperada(v);
  const ref = precioRefEfectivo(p, ev), cv = costoVariableBase(p, ev), ck = p.costoCapacidad;
  const margen = ref - cv - ck;
  const diasVenta = Math.max(1, Math.round(v.diasRestantes * (v.estado.abreSabados ? 6 : 5) / 7));
  const domingos = Math.floor((v.diasRestantes + v.diaSemana) / 7);
  let val = 0;
  for (const e of efectos) {
    switch (e.tipo) {
      case 'caja': val += montoGd(p, e.gd); break;
      case 'demanda': val += (e.factor - 1) * D * margen * Math.min(e.dias, diasVenta); break;
      case 'costoVariable': val -= (e.factor - 1) * cv * D * Math.min(e.dias, diasVenta); break;
      case 'capacidad': {
        const n = Math.min(e.dias, diasVenta);
        val += e.factor < 1 ? -(1 / e.factor - 1) * D * holgura * ck * n : (1 - 1 / e.factor) * D * holgura * ck * n;
        break;
      }
      case 'calificacionTemporal': val += e.delta / 3 * D * margen * Math.min(e.dias, diasVenta); break;
      case 'calificacion': val += e.delta / 3 * D * margen * Math.min(5, diasVenta); break;
      case 'clientes': val += e.fraccion * (v.estado.clientes / 1000) * p.frecuenciaCompra * margen * Math.min(14, diasVenta); break;
      case 'pedido': {
        const u = e.unidades ?? (e.fraccionDemanda ?? 0) * ev.ultimaDemanda;
        val += u * margen * Math.min(e.dias, Math.max(0, diasVenta - e.desde));
        break;
      }
      case 'ingresoDiferido': if (e.enDias < diasVenta) val += montoGd(p, e.gd) * (e.segunClima ? 0.97 : 1); break;
      case 'prepagoInsumos': val += ev.ultimaDemanda * e.dias * cv * e.descuento * 0.8; break;
      case 'prepagoRenta': val += (e.semanas <= domingos ? 1 : -1) * e.semanas * p.rentaSemanal * e.descuento; break;
      case 'resena':
        val += (v.estado.calificacion / 100 < e.umbral ? e.malo * 5 : e.bueno * e.dias) / 3 * D * margen;
        break;
      case 'inflacion': case 'revelar': break;
    }
  }
  return val;
}

function crearBot(e: Estilo, semilla: string): Bot {
  const r = crearAleatorio(semilla, `bot-${e.nombre}`);
  return {
    nombre: e.nombre,
    decidir: (v): Decision => {
      const p = v.parametros;
      let ev: EstadoEventos = v.estado.ev;
      let caja = v.estado.caja;
      const colchon = p.rentaSemanal;
      const acciones: Decision['acciones'] = {};
      let efectosHoy: Efecto[] = [];

      // Imprevisto
      if (v.imprevisto) {
        const ok = opcionesHabilitadas(p, ev, caja, v.imprevisto);
        let elegida: string | undefined;
        if (e.imprevistos === 'azar') elegida = ok[r.entero(ok.length)];
        else if (e.imprevistos === 'mejor') {
          let mejor = -Infinity;
          for (const o of v.imprevisto.opciones.filter((x) => ok.includes(x.id))) {
            const c = costoCaja(p, ev, o.efectos);
            const val = valorEstimado(v, o.efectos, e.holgura) - (caja - c < colchon && c > 0 ? 1e9 : 0);
            if (val > mejor) { mejor = val; elegida = o.id; }
          }
        }
        if (elegida) acciones.respuestaImprevisto = elegida;
        const opcion = v.imprevisto.opciones.find((o) => o.id === (elegida ?? v.imprevisto!.porDefecto));
        if (opcion) { efectosHoy = [...opcion.efectos]; caja -= costoCaja(p, ev, opcion.efectos); }
      }

      // Oportunidades
      const aceptadas: string[] = [];
      for (const o of v.oportunidades) {
        const c = costoCaja(p, ev, o.efectos);
        let acepta = false;
        if (e.oportunidades === 'azar') acepta = r.siguiente() < 0.5 && c <= caja;
        else if (e.oportunidades === 'buenas') {
          acepta = o.tipo !== 'informacion' && caja - c >= colchon && valorEstimado(v, o.efectos, e.holgura) > 0;
        }
        if (acepta) { aceptadas.push(o.id); efectosHoy.push(...o.efectos); caja -= c; }
      }
      if (aceptadas.length) acciones.oportunidadesAceptadas = aceptadas;

      // Plan: anticipa los efectos que actuarán hoy y los pedidos comprometidos
      if (efectosHoy.length && p.eventos) ev = aplicarEfectos(p, ev, efectosHoy, 'plan', v.estado.clientes, v.estado.calificacion).ev;
      const mod = modificadores(p, ev);
      const demanda = demandaEsperada(v) * mod.demanda;
      const plan = {
        precio: precioRefEfectivo(p, ev) * e.precio,
        capacidad: Math.ceil((demanda * e.holgura + pedidosComprometidos(ev)) / mod.capacidad),
        marketing: e.marketing(v),
      };
      return { plan, acciones };
    },
  };
}

export type FabricaBot = (semilla: string) => Bot;
const fabrica = (e: Estilo): FabricaBot => (semilla) => crearBot(e, semilla);
const fijo = (m: NivelMarketing) => (): NivelMarketing => m;
const NIVELES: NivelMarketing[] = ['0', 'bajo', 'medio', 'alto'];

export const BOTS: Record<string, FabricaBot> = {
  /** Precio de referencia, capacidad con 20% de holgura y marketing medio: los mejores niveles
   *  constantes según experimento-capacidad y experimento-cac. Responde bien los imprevistos y no
   *  acepta oportunidades (la meta debe ser alcanzable sin ellas). Define la meta. */
  prudente: fabrica({ nombre: 'prudente', precio: 1.0, holgura: 1.2, marketing: fijo('medio'), imprevistos: 'mejor', oportunidades: 'ninguna' }),

  /** Igual que el prudente, y además aprovecha las oportunidades. Mide el tope del 20%. */
  oportunista: fabrica({ nombre: 'oportunista', precio: 1.0, holgura: 1.2, marketing: fijo('medio'), imprevistos: 'mejor', oportunidades: 'buenas' }),

  /** Decisiones al azar dentro de rangos razonables. Debe llegar poco a la meta. */
  aleatorio: (semilla) => {
    const r = crearAleatorio(semilla, 'bot-aleatorio');
    const base = crearBot({ nombre: 'aleatorio', precio: 1, holgura: 1, marketing: fijo('bajo'), imprevistos: 'azar', oportunidades: 'azar' }, semilla);
    return {
      nombre: 'aleatorio',
      decidir: (v) => {
        const d = base.decidir(v) as Decision;
        const ref = precioRefEfectivo(v.parametros, v.estado.ev);
        return {
          plan: { precio: ref * r.rango(0.6, 1.4), capacidad: Math.ceil(demandaEsperada(v) * r.rango(0.5, 1.8)), marketing: NIVELES[r.entero(4)] ?? 'bajo' },
          acciones: d.acciones,
        };
      },
    };
  },

  /** Igual que el prudente, pero con marketing alto. Detecta si el marketing máximo domina. */
  agresivo: fabrica({ nombre: 'agresivo', precio: 1.0, holgura: 1.2, marketing: fijo('alto') }),

  /** Igual que el prudente, pero con 50% de capacidad de sobra. Detecta si sobredimensionar domina. */
  holgado: fabrica({ nombre: 'holgado', precio: 1.0, holgura: 1.5, marketing: fijo('medio') }),

  /** Igual que el prudente, pero con la capacidad justa. Detecta si ahorrar capacidad domina. */
  ajustado: fabrica({ nombre: 'ajustado', precio: 1.0, holgura: 1.0, marketing: fijo('medio') }),

  /** Cobrar caro y no gastar en marketing. */
  avaro: fabrica({ nombre: 'avaro', precio: 1.3, holgura: 1.0, marketing: fijo('0') }),

  /** Competir por precio: 20% por debajo de la referencia. */
  barato: fabrica({ nombre: 'barato', precio: 0.8, holgura: 1.2, marketing: fijo('medio') }),

  /** Marketing medio las 2 primeras semanas y nada después (exploit de fin de temporada). */
  cosechador: fabrica({ nombre: 'cosechador', precio: 1.0, holgura: 1.2, marketing: (v) => (v.dia < 14 ? 'medio' : '0') }),
};
