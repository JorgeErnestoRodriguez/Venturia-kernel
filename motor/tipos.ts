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
  costosFijosSemanales: number;    // céntimos; se cobran el domingo (alquiler, servicios, permisos…)

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
  factorCapacidadSabado: number;  // multiplicador del costo de capacidad los sábados

  precioMinFactor: number;
  precioMaxFactor: number;
  diasValoracionCartera: number;
  /** Si es true, el margen de la cartera también descuenta el costo de capacidad por pedido. */
  carteraRestaCapacidad: boolean;
  semanas: number;

  /** v1: catálogo de eventos de la plantilla. Sin él, el motor se comporta como v0. */
  eventos?: CatalogoEventos;
  /** v1: ganancia diaria de referencia del segmento (G_d), en céntimos. */
  gananciaDiaria: number;
}

// ---------- v1: imprevistos y oportunidades ----------

export type Efecto =
  | { tipo: 'caja'; gd: number }
  | { tipo: 'demanda' | 'costoVariable' | 'capacidad'; factor: number; dias: number; desde?: number }
  | { tipo: 'calificacionTemporal'; delta: number; dias: number; desde?: number }
  | { tipo: 'calificacion'; delta: number }
  | { tipo: 'clientes'; fraccion: number }
  | { tipo: 'inflacion'; factor: number; ajustarPrecio: boolean }
  | { tipo: 'pedido'; fraccionDemanda?: number; unidades?: number; dias: number; desde: number; penalizacion: number; cancelaAlFallar?: boolean }
  | { tipo: 'ingresoDiferido'; gd: number; enDias: number; segunClima?: boolean }
  | { tipo: 'prepagoInsumos'; dias: number; descuento: number }
  | { tipo: 'prepagoFijos'; semanas: number; descuento: number }
  | { tipo: 'resena'; umbral: number; malo: number; bueno: number; dias: number }
  | { tipo: 'revelar'; dato: string };

export type Disparo =
  | { tipo: 'aleatorio'; maximoPorTemporada?: number }
  | { tipo: 'usoAltoSeguido'; umbral: number; dias: number }
  | { tipo: 'usoAltoEnVentana'; umbral: number; dias: number; ventana: number }
  | { tipo: 'rechazos'; umbral: number }
  | { tipo: 'calificacionMinima'; valor: number }
  | { tipo: 'calificacionRelativa'; margen: number }   // calificación ≥ calificación base de la propuesta + margen
  | { tipo: 'calificacionMaxima'; valor: number }
  | { tipo: 'precioAltoSeguido'; factor: number; dias: number }
  | { tipo: 'sinMarketingSeguido'; dias: number };

export interface OpcionImprevisto { id: string; texto: string; efectos: Efecto[] }
export interface Imprevisto {
  id: string; nombre: string; aplica: string[]; disparo: Disparo;
  opciones: OpcionImprevisto[]; porDefecto: string; concepto: string;
}
export type TipoOportunidad = 'monetaria' | 'reputacional' | 'equipo' | 'ahorro' | 'informacion' | 'estrella';
export interface Oportunidad {
  id: string; nombre: string; tipo: TipoOportunidad; aplica: string[]; efectos: Efecto[]; concepto: string;
}

export interface CatalogoEventos {
  rangos: { demanda: [number, number]; costoVariable: [number, number]; capacidad: [number, number]; calificacion: [number, number] };
  imprevistos: { probabilidadAleatorioPorDia: number; diasSinRepetir: number; catalogo: Imprevisto[] };
  oportunidades: { porDia: number; pesos: Record<Exclude<TipoOportunidad, 'estrella'>, number>; estrellasPorTemporada: number; climaIngresoDiferido: Record<Clima, number>; catalogo: Oportunidad[] };
}

/** Lo que el jugador decide además del plan, en un día abierto. */
export interface Acciones {
  respuestaImprevisto?: string;    // id de la opción; sin respuesta, la opción por defecto
  oportunidadesAceptadas?: string[];
}

/** Efecto temporal activo. Los factores se guardan en milésimas y los deltas en centésimas. */
export interface EfectoActivo {
  variable: 'demanda' | 'costoVariable' | 'capacidad' | 'calificacion';
  valor: number;
  desde: number;                   // primer día de venta (contador de días abiertos) en que actúa
  hasta: number;                  // primer día de venta en que ya no actúa
}

export interface Compromiso {
  origen: string;
  unidades: number;                // pedidos por día
  desde: number;
  hasta: number;
  penalizacion: number;            // centésimas de estrella si se incumple
  cancelaAlFallar: boolean;
}

export interface EstadoEventos {
  diasVenta: number;               // días abiertos ya simulados
  efectos: EfectoActivo[];
  compromisos: Compromiso[];
  diferidos: { diaVenta: number; monto: number; segunClima: boolean }[];
  insumosPrepagados: { unidades: number; hasta: number };
  fijosPrepagados: number;         // domingos cuyos costos fijos ya están pagados
  pendiente: string | null;        // imprevisto que el jugador verá en su próximo día abierto
  ultimoPorId: Record<string, number>;   // último día de venta en que apareció cada imprevisto
  imprevistos: number;             // aparecidos en la temporada
  rachaUsoAlto: number;
  ventanaUso: number[];            // 1 = uso alto, últimos días abiertos
  rachaPrecioAlto: number;
  rachaSinMarketing: number;
  ultimaDemanda: number;
  factorPrecioRef: number;         // milésimas (inflación)
  factorCostoVar: number;          // milésimas (inflación)
  factorMeta: number;              // milésimas (inflación)
  ajustarPrecio: boolean;          // el jugador eligió subir su precio con la inflación
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
  ev: EstadoEventos;
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
  costosFijos: number;             // céntimos; solo el domingo
  ganancia: number;
  clientesNuevos: number;          // milésimas
  clientesPerdidos: number;        // milésimas
  clientesFinal: number;           // milésimas
  calificacionFinal: number;       // centésimas
  cajaFinal: number;               // céntimos
  patrimonioFinal: number;         // céntimos
  quiebra: boolean;
  /** v1 */
  imprevisto: { id: string; opcion: string } | null;
  oportunidades: { ofrecidas: string[]; aceptadas: string[] };
  ingresosEventos: number;         // céntimos: pedidos comprometidos e ingresos diferidos
  cajaEventos: number;             // céntimos: pagos y cobros directos de imprevistos y oportunidades
  incumplidos: string[];
  factorDemanda: number;           // multiplicador de demanda por eventos que actuó ese día
}

/** Contexto fijo de una temporada: lo que se deriva de la semilla al iniciarla. */
export interface ContextoTemporada {
  semilla: string;
  climas: Clima[];                 // uno por día de calendario
  ruidos: number[];                // multiplicador ε por día de calendario
  /** v1: sorteos fijos por día de calendario, en [0, 1). */
  sorteoImprevisto: [number, number][];
  sorteoOportunidades: [number, number][];
  diaEstrella: number[];           // por semana: día de la semana (0–4) en que aparece la estrella; −1 = esa semana no hay
  franjaOportunidad: ('manana' | 'tarde')[];   // por día de calendario: media jornada en que aparece la oportunidad
}
