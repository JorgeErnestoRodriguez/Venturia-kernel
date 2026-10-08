# Venturia — kernel

Motor de simulación y simulador de balance del kernel de Venturia (línea A).
La especificación vive en el documento *Venturia — Requerimientos del kernel*; este repositorio la implementa.

## Estructura prevista

| Carpeta | Contenido |
| --- | --- |
| `datos/` | Plantillas de negocio y configuración global, como datos editables (RNF-09) |
| `motor/` | Simulación de un día como función pura, determinista, con aritmética entera (RNF-02, RNF-03) |
| `bots/` | Estrategias automáticas de juego para el balance |
| `balance/` | Ejecutor por lotes y reporte de las 12 combinaciones |

## Convenciones de datos

- **Moneda.** 1 Ventus (V) ≈ 1 USD de referencia. En los JSON los montos se escriben en V con hasta 2 decimales; el motor los convierte a céntimos enteros al cargarlos.
- **Tasas y multiplicadores** se escriben como decimales; el motor los convierte a enteros en milésimas.
- **Valores iniciales.** Son puntos de partida para calibrar, no valores balanceados. La meta de patrimonio no se fija a mano: se deriva de la simulación (la que alcanza entre el 60% y el 70% del bot prudente).

## Etapas

- **v0:** economía base (demanda, ganancia, clientes, calificación, cartera, calendario, quiebra) y bots.
- **v1:** imprevistos y oportunidades con plazo, con la verificación del tope del 20%.
