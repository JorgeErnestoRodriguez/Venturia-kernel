# Reporte de balance — v0

Generado con `node balance/ejecutar.ts 500`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 2.150 V** (capital inicial 750 V; multiplicador 2,87×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 65% | 0% | 2.327 | 1.786 | 2.977 |
| aleatorio | 0% | 10% | 759 | 272 | 1.387 |
| agresivo | 56% | 0% | 2.222 | 1.646 | 2.916 |
| holgado | 65% | 0% | 2.298 | 1.770 | 2.929 |
| ajustado | 27% | 0% | 1.877 | 1.427 | 2.439 |
| avaro | 4% | 0% | 1.423 | 1.039 | 2.044 |
| barato | 24% | 0% | 1.926 | 1.555 | 2.337 |
| cosechador | 62% | 0% | 2.287 | 1.781 | 2.900 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 8% | 0% | 4% | 0% | 0% | 0% | 0% | 6% | prudente |
| estudiantes · precio · con sábados | 59% | 0% | 45% | 86% | 1% | 0% | 20% | 55% | holgado |
| estudiantes · rapidez · sin sábados | 0% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| estudiantes · rapidez · con sábados | 57% | 0% | 38% | 35% | 3% | 0% | 21% | 51% | prudente |
| estudiantes · calidad · sin sábados | 14% | 0% | 8% | 0% | 0% | 0% | 1% | 12% | prudente |
| estudiantes · calidad · con sábados | 73% | 0% | 57% | 96% | 3% | 0% | 32% | 67% | holgado |
| oficinistas · precio · sin sábados | 87% | 0% | 75% | 98% | 25% | 3% | 11% | 84% | prudente |
| oficinistas · precio · con sábados | 100% | 0% | 96% | 100% | 61% | 9% | 57% | 99% | holgado |
| oficinistas · rapidez · sin sábados | 85% | 0% | 65% | 67% | 37% | 0% | 1% | 82% | prudente |
| oficinistas · rapidez · con sábados | 100% | 0% | 99% | 100% | 91% | 13% | 59% | 100% | prudente |
| oficinistas · calidad · sin sábados | 93% | 0% | 84% | 100% | 32% | 6% | 19% | 90% | prudente |
| oficinistas · calidad · con sábados | 100% | 0% | 98% | 100% | 73% | 18% | 70% | 100% | holgado |

### Alertas

- Combinaciones desbalanceadas para el prudente: de 0% (estudiantes · rapidez · sin sábados) a 100% (oficinistas · rapidez · con sábados).

## App de tutorías

**Meta derivada: 2.000 V** (capital inicial 900 V; multiplicador 2,22×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 61% | 0% | 2.070 | 1.815 | 2.306 |
| aleatorio | 0% | 0% | 929 | 661 | 1.172 |
| agresivo | 57% | 0% | 2.107 | 1.733 | 2.447 |
| holgado | 0% | 0% | 1.473 | 1.326 | 1.632 |
| ajustado | 36% | 0% | 1.927 | 1.743 | 2.138 |
| avaro | 0% | 0% | 1.623 | 1.545 | 1.711 |
| barato | 0% | 0% | 1.334 | 1.208 | 1.464 |
| cosechador | 36% | 0% | 1.921 | 1.749 | 2.103 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 100% | 0% | 100% | 0% | 17% | 0% | 0% | 0% | agresivo |
| primaria · precio · con sábados | 100% | 0% | 100% | 0% | 54% | 0% | 0% | 71% | agresivo |
| primaria · rapidez · sin sábados | 98% | 0% | 100% | 0% | 78% | 0% | 0% | 0% | agresivo |
| primaria · rapidez · con sábados | 100% | 0% | 100% | 0% | 100% | 0% | 0% | 88% | agresivo |
| primaria · calidad · sin sábados | 100% | 0% | 100% | 0% | 76% | 0% | 0% | 98% | agresivo |
| primaria · calidad · con sábados | 100% | 0% | 100% | 0% | 96% | 0% | 0% | 100% | agresivo |
| preuniversitario · precio · sin sábados | 0% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · precio · con sábados | 7% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · rapidez · sin sábados | 0% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | ajustado |
| preuniversitario · rapidez · con sábados | 0% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · calidad · sin sábados | 30% | 0% | 5% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · calidad · con sábados | 100% | 0% | 77% | 0% | 5% | 0% | 0% | 72% | prudente |

### Alertas

- Combinaciones desbalanceadas para el prudente: de 0% (preuniversitario · precio · sin sábados) a 100% (primaria · precio · con sábados).
- Casi nadie quiebra: la mecánica de fracaso no se activa.

---
Tiempo de ejecución: 1,6 s.
