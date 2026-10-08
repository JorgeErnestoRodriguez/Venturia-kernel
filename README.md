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
- **Tasas y multiplicadores** se escriben como decimales y el motor los usa como constantes; solo el estado (dinero, clientes, calificación) se guarda en enteros.
- **Valores iniciales.** Son puntos de partida para calibrar, no valores balanceados. La meta de patrimonio no se fija a mano: se deriva de la simulación (la que alcanza entre el 60% y el 70% del bot prudente).

## Uso

Requiere Node.js 22.18 o superior (ejecuta TypeScript directamente).

```bash
npm install          # solo instala TypeScript para verificar tipos
npm test             # pruebas del motor (incluye determinismo)
npm run typecheck    # verificación de tipos
npm run balance      # simulador de balance → reportes/balance-v0.md y .json
node balance/ejecutar.ts 2000   # más partidas por combinación
```

## Determinismo

El estado se guarda siempre en enteros: céntimos de Ventus, milésimas de cliente y centésimas de estrella.
Los cálculos intermedios usan solo +, −, × y ÷ de IEEE-754, que dan el mismo resultado en cualquier motor de JavaScript;
`ln`, `exp` y la potencia están implementadas en `motor/matematica.ts` porque `Math.pow`, `Math.exp` y `Math.log` pueden variar entre navegadores.
El generador aleatorio (`motor/aleatorio.ts`) usa canales separados por semilla para que añadir un uso nuevo no altere los existentes.

## Etapas

- **v0:** economía base (demanda, ganancia, clientes, calificación, cartera, calendario, quiebra) y bots.
- **v1:** imprevistos y oportunidades con plazo, con la verificación del tope del 20%.
