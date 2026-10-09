// Conversión de los datos editables (JSON) a parámetros del motor.
// El motor no lee archivos: recibe los objetos ya cargados (RNF-04).

import type { Clima, NivelMarketing, Parametros, PropuestaValor } from './tipos.ts';
import { redondear } from './matematica.ts';

type MapaNiveles = Record<NivelMarketing, number>;

export interface DatosConfig {
  version: string;
  temporada: { semanas: number; calificacionInicial: number };
  propuestasDeValor: Record<PropuestaValor, {
    qBase: number; factorCostoVariable: number; factorPrecioReferencia: number;
    /** Opcionales (por defecto 1): efectos propios de cada propuesta. */
    factorFrecuencia?: number;
    factorCostoCapacidad?: number;
    factorCostoCliente?: number;
    factorCastigoSaturacion?: number;
    factorAbandonoMalServicio?: number;
    umbralSaturacion?: number;
  }>;
  marketing: { eficiencia: MapaNiveles };
  calificacion: {
    lambda: number; b1Rechazos: number; b2PrecioSobreReferencia: number;
    b3Saturacion: number; umbralSaturacion: number;
  };
  clientes: { a1MalServicio: number; a2PrecioSobreReferencia: number };
  demanda: { ruidoMin: number; ruidoMax: number };
  clima: { probabilidad: Record<Clima, number> };
  plan: { precioMinFactor: number; precioMaxFactor: number };
  cartera: { diasValoracion: number; restarCostoCapacidad?: boolean };
}

export interface DatosSegmento {
  id: string;
  nombre: string;
  precioReferencia: number;
  mercadoPotencial: number;
  sensibilidadPrecio: number;
  frecuenciaCompra: number;
  costoVariablePorPedido: number;
  costoCapacidadPorUnidad: number;
}

export interface DatosPlantilla {
  id: string;
  version: string;
  nombre: string;
  inicio: { capital: number; clientes: number };
  costos: { rentaSemanal: number };
  segmentos: DatosSegmento[];
  marketing: { costoDiario: MapaNiveles; costoPorClienteNuevo: number };
  clientes: { tasaRecomendacion: number; abandonoBase: number };
  factores: { clima: Record<Clima, number>; sabado: number };
}

const aCentimos = (v: number): number => redondear(v * 100);

export function resolverParametros(
  config: DatosConfig,
  plantilla: DatosPlantilla,
  segmentoId: string,
  propuesta: PropuestaValor,
): Parametros {
  const seg = plantilla.segmentos.find((s) => s.id === segmentoId);
  if (!seg) throw new Error(`Segmento desconocido: ${plantilla.id}/${segmentoId}`);
  const pv = config.propuestasDeValor[propuesta];
  const niveles: NivelMarketing[] = ['0', 'bajo', 'medio', 'alto'];
  const costoMarketing = {} as MapaNiveles;
  for (const n of niveles) costoMarketing[n] = aCentimos(plantilla.marketing.costoDiario[n]);

  return {
    plantilla: plantilla.id,
    segmento: seg.id,
    propuesta,
    version: `${config.version}+${plantilla.id}@${plantilla.version}`,

    capitalInicial: aCentimos(plantilla.inicio.capital),
    clientesIniciales: redondear(plantilla.inicio.clientes * 1000),
    califInicial: redondear(config.temporada.calificacionInicial * 100),

    precioReferencia: aCentimos(seg.precioReferencia * pv.factorPrecioReferencia),
    costoVariable: aCentimos(seg.costoVariablePorPedido * pv.factorCostoVariable),
    costoCapacidad: aCentimos(seg.costoCapacidadPorUnidad * (pv.factorCostoCapacidad ?? 1)),
    rentaSemanal: aCentimos(plantilla.costos.rentaSemanal),

    mercadoPotencial: seg.mercadoPotencial,
    sensibilidadPrecio: seg.sensibilidadPrecio,
    frecuenciaCompra: seg.frecuenciaCompra * (pv.factorFrecuencia ?? 1),

    costoMarketing,
    eficienciaMarketing: { ...config.marketing.eficiencia },
    costoPorClienteNuevo: aCentimos(plantilla.marketing.costoPorClienteNuevo * (pv.factorCostoCliente ?? 1)),

    tasaRecomendacion: plantilla.clientes.tasaRecomendacion,
    abandonoBase: plantilla.clientes.abandonoBase,
    abandonoMalServicio: config.clientes.a1MalServicio * (pv.factorAbandonoMalServicio ?? 1),
    abandonoPrecio: config.clientes.a2PrecioSobreReferencia,

    qBase: pv.qBase,
    lambda: config.calificacion.lambda,
    b1Rechazos: config.calificacion.b1Rechazos,
    b2Precio: config.calificacion.b2PrecioSobreReferencia,
    b3Saturacion: config.calificacion.b3Saturacion * (pv.factorCastigoSaturacion ?? 1),
    umbralSaturacion: pv.umbralSaturacion ?? config.calificacion.umbralSaturacion,

    ruidoMin: config.demanda.ruidoMin,
    ruidoMax: config.demanda.ruidoMax,
    probClima: { ...config.clima.probabilidad },
    factorClima: { ...plantilla.factores.clima },
    factorSabado: plantilla.factores.sabado,

    precioMinFactor: config.plan.precioMinFactor,
    precioMaxFactor: config.plan.precioMaxFactor,
    diasValoracionCartera: config.cartera.diasValoracion,
    carteraRestaCapacidad: config.cartera.restarCostoCapacidad ?? false,
    semanas: config.temporada.semanas,
  };
}
