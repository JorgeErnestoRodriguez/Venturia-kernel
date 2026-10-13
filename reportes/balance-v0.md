# Reporte de balance — v0

Generado con `node balance/ejecutar.ts 500`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 1.850 V** (capital inicial 750 V; multiplicador 2,47×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 69% | 0% | 1.963 | 1.674 | 2.288 |
| aleatorio | 0% | 15% | 604 | 239 | 975 |
| agresivo | 52% | 0% | 1.860 | 1.533 | 2.228 |
| holgado | 65% | 0% | 1.916 | 1.686 | 2.192 |
| ajustado | 10% | 0% | 1.589 | 1.312 | 1.851 |
| avaro | 0% | 0% | 1.221 | 1.012 | 1.451 |
| barato | 14% | 0% | 1.584 | 1.319 | 1.894 |
| cosechador | 63% | 0% | 1.923 | 1.655 | 2.225 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 53% | 0% | 32% | 40% | 3% | 0% | 15% | 50% | prudente |
| estudiantes · precio · con sábados | 79% | 0% | 60% | 95% | 7% | 0% | 29% | 78% | prudente |
| estudiantes · rapidez · sin sábados | 32% | 0% | 12% | 0% | 4% | 0% | 6% | 31% | prudente |
| estudiantes · rapidez · con sábados | 85% | 0% | 60% | 79% | 24% | 0% | 35% | 83% | prudente |
| estudiantes · calidad · sin sábados | 65% | 0% | 43% | 78% | 5% | 0% | 22% | 63% | prudente |
| estudiantes · calidad · con sábados | 88% | 0% | 71% | 99% | 12% | 0% | 42% | 86% | holgado |
| oficinistas · precio · sin sábados | 55% | 0% | 40% | 37% | 3% | 0% | 0% | 44% | prudente |
| oficinistas · precio · con sábados | 83% | 0% | 69% | 95% | 9% | 0% | 3% | 74% | prudente |
| oficinistas · rapidez · sin sábados | 35% | 0% | 19% | 0% | 4% | 0% | 0% | 23% | prudente |
| oficinistas · rapidez · con sábados | 88% | 0% | 73% | 78% | 27% | 0% | 1% | 79% | prudente |
| oficinistas · calidad · sin sábados | 68% | 0% | 56% | 80% | 6% | 0% | 2% | 60% | prudente |
| oficinistas · calidad · con sábados | 91% | 0% | 83% | 100% | 16% | 0% | 9% | 85% | holgado |

### Alertas

- Ninguna.

## App de tutorías

**Meta derivada: 2.050 V** (capital inicial 900 V; multiplicador 2,28×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 77% | 0% | 2.092 | 2.021 | 2.287 |
| aleatorio | 0% | 1% | 927 | 593 | 1.249 |
| agresivo | 62% | 0% | 2.120 | 1.868 | 2.358 |
| holgado | 0% | 0% | 1.465 | 1.288 | 1.624 |
| ajustado | 45% | 0% | 2.038 | 1.893 | 2.156 |
| avaro | 10% | 0% | 1.767 | 1.553 | 2.053 |
| barato | 0% | 0% | 1.314 | 1.115 | 1.474 |
| cosechador | 32% | 0% | 1.992 | 1.868 | 2.186 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 92% | 0% | 100% | 0% | 3% | 0% | 0% | 0% | agresivo |
| primaria · precio · con sábados | 52% | 0% | 73% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · rapidez · sin sábados | 64% | 0% | 100% | 0% | 40% | 0% | 0% | 0% | agresivo |
| primaria · rapidez · con sábados | 76% | 0% | 94% | 0% | 32% | 0% | 0% | 0% | agresivo |
| primaria · calidad · sin sábados | 100% | 0% | 100% | 0% | 53% | 0% | 0% | 79% | agresivo |
| primaria · calidad · con sábados | 100% | 0% | 100% | 0% | 25% | 0% | 0% | 30% | agresivo |
| preuniversitario · precio · sin sábados | 98% | 0% | 2% | 0% | 43% | 7% | 0% | 65% | prudente |
| preuniversitario · precio · con sábados | 40% | 0% | 0% | 0% | 14% | 7% | 0% | 0% | prudente |
| preuniversitario · rapidez · sin sábados | 69% | 0% | 0% | 0% | 86% | 5% | 0% | 6% | ajustado |
| preuniversitario · rapidez · con sábados | 28% | 0% | 0% | 0% | 77% | 4% | 0% | 0% | ajustado |
| preuniversitario · calidad · sin sábados | 100% | 0% | 100% | 0% | 90% | 51% | 0% | 100% | prudente |
| preuniversitario · calidad · con sábados | 100% | 0% | 81% | 0% | 76% | 51% | 0% | 99% | prudente |

### Alertas

- Elecciones de fundación desbalanceadas: la mejor (preuniversitario · calidad) rinde 11% más que la peor (preuniversitario · rapidez).
- Casi nadie quiebra: la mecánica de fracaso no se activa.

---
Tiempo de ejecución: 1,6 s.
