// Tipos del motor.
//
// Convención de unidades del ESTADO (siempre enteros):
//   dinero        → céntimos de Ventus (1 V = 100)
//   clientes      → milésimas de cliente (1 cliente = 1000)
//   calificación  → centésimas de estrella (3,00 = 300)
// Los PARÁMETROS (datos de plantilla) son constantes leídas de JSON y pueden ser decimales.

export type NivelMarketing = '0' | 'bajo' | 'medio' | 'alto';
export type PropuestaValor = 'precio' | 'rapidez' | 'calidad';
export type Clima = 'soleado' | 'nublado' | 'lluvia';

/** Parámetros ya resueltos para una empresa concreta (plantilla + segmento + propuesta). */
export interface Parametros {
  plantilla: string;
  segmento: string;
  propuesta: PropuestaValor;
  version: string;

  capitalInicial: number;          // céntimos
  clientesIniciales: number;       // milésimas
  califInicial: number;            // centésimas

  precioReferencia: number;        // céntimos (ya ajustado por la propuesta)
  costoVariable: number;           // céntimos por pedido (ya ajustado por la propuesta)
  costoCapacidad: number;          // céntimos por unidad de capacidad por día abierto
  rentaSemanal: number;            // céntimos

  mercadoPotencial: number;        // clientes
  sensibilidadPrecio: number;      // exponente e
  frecuenciaCompra: number;        // pedidos por cliente por día abierto

  costoMarketing: Record<NivelMarketing, number>;   // céntimos por día abierto
  eficienciaMarketing: Record<NivelMarketing, number>;
  costoPorClienteNuevo: number;    // céntimos

  tasaRecomendacion: number;
  abandonoBase: number;
  abandonoMalServicio: number;     // a1
  abandonoPrecio: number;          // a2

  qBase: number;                   // estrellas
  lambda: number;
  b1Rechazos: number;
  b2Precio: number;
  b3Saturacion: number;
  umbralSaturacion: number;

  ruidoMin: number;
  ruidoMax: number;
  probClima: Record<Clima, number>;
  factorClima: Record<Clima, number>;
  factorSabado: number;

  precioMinFactor: number;
  precioMaxFactor: number;
  diasValoracionCartera: number;
  semanas: number;
}

export interface Plan {
  precio: number;                  // céntimos
  capacidad: number;               // pedidos por día (entero ≥ 0)
  marketing: NivelMarketing;
}

export interface Estado {
  dia: number;                     // índice de calendario desde 0 (día 0 = lunes de la semana 1)
  caja: number;                    // céntimos
  clientes: number;                // milésimas
  calificacion: number;            // centésimas
  deuda: number;                   // céntimos (préstamo de emergencia; 0 en v0)
  clientesMaximos: number;         // milésimas; para el nivel de crecimiento público
  abreSabados: boolean;
  quebrada: boolean;
}

export interface RegistroDia {
  dia: number;
  diaSemana: number;               // 0 = lunes … 6 = domingo
  abierto: boolean;
  clima: Clima;
  plan: Plan;
  demanda: number;                 // pedidos que llegaron
  atendidos: number;
  rechazados: number;
  ingresos: number;                // céntimos
  costoVariable: number;
  costoCapacidad: number;
  costoMarketing: number;
  renta: number;
  ganancia: number;
  clientesNuevos: number;          // milésimas
  clientesPerdidos: number;        // milésimas
  clientesFinal: number;           // milésimas
  calificacionFinal: number;       // centésimas
  cajaFinal: number;               // céntimos
  patrimonioFinal: number;         // céntimos
  quiebra: boolean;
}

/** Contexto fijo de una temporada: lo que se deriva de la semilla al iniciarla. */
export interface ContextoTemporada {
  semilla: string;
  climas: Clima[];                 // uno por día de calendario
  ruidos: number[];                // multiplicador ε por día de calendario
}
