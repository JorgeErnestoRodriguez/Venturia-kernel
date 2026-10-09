# Reporte de balance — v0

Generado con `node balance/ejecutar.ts 500`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 2.000 V** (capital inicial 750 V; multiplicador 2,67×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 63% | 0% | 2.162 | 1.658 | 2.817 |
| aleatorio | 1% | 1% | 968 | 451 | 1.645 |
| agresivo | 50% | 0% | 2.004 | 1.473 | 2.683 |
| holgado | 90% | 0% | 2.625 | 2.000 | 3.382 |
| avaro | 18% | 0% | 1.477 | 1.080 | 2.114 |
| barato | 29% | 0% | 1.827 | 1.452 | 2.224 |
| cosechador | 63% | 0% | 2.155 | 1.671 | 2.787 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | holgado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 13% | 0% | 5% | 81% | 0% | 2% | 13% | holgado |
| estudiantes · precio · con sábados | 53% | 0% | 27% | 100% | 0% | 19% | 52% | holgado |
| estudiantes · rapidez · sin sábados | 5% | 0% | 1% | 24% | 0% | 0% | 6% | holgado |
| estudiantes · rapidez · con sábados | 59% | 0% | 26% | 100% | 0% | 25% | 61% | holgado |
| estudiantes · calidad · sin sábados | 10% | 0% | 4% | 75% | 0% | 1% | 10% | holgado |
| estudiantes · calidad · con sábados | 48% | 0% | 21% | 100% | 0% | 11% | 49% | holgado |
| oficinistas · precio · sin sábados | 92% | 1% | 79% | 100% | 20% | 34% | 91% | holgado |
| oficinistas · precio · con sábados | 99% | 3% | 96% | 100% | 54% | 74% | 99% | holgado |
| oficinistas · rapidez · sin sábados | 94% | 1% | 80% | 100% | 11% | 20% | 94% | holgado |
| oficinistas · rapidez · con sábados | 100% | 5% | 99% | 100% | 61% | 83% | 100% | holgado |
| oficinistas · calidad · sin sábados | 88% | 1% | 73% | 100% | 18% | 17% | 88% | holgado |
| oficinistas · calidad · con sábados | 98% | 2% | 93% | 100% | 53% | 56% | 98% | holgado |

### Alertas

- **holgado** supera al prudente (90% frente a 63%): posible estrategia dominante.
- Combinaciones desbalanceadas para el prudente: de 5% (estudiantes · rapidez · sin sábados) a 100% (oficinistas · rapidez · con sábados).
- Casi nadie quiebra: la mecánica de fracaso no se activa.

## App de tutorías

**Meta derivada: 2.050 V** (capital inicial 900 V; multiplicador 2,28×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 64% | 0% | 2.115 | 1.905 | 2.324 |
| aleatorio | 0% | 0% | 929 | 661 | 1.172 |
| agresivo | 50% | 0% | 2.053 | 1.756 | 2.363 |
| holgado | 20% | 0% | 1.870 | 1.643 | 2.091 |
| avaro | 0% | 0% | 1.623 | 1.545 | 1.711 |
| barato | 0% | 0% | 1.458 | 1.329 | 1.592 |
| cosechador | 40% | 0% | 2.017 | 1.857 | 2.182 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | holgado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 81% | 0% | 85% | 0% | 0% | 0% | 21% | agresivo |
| primaria · precio · con sábados | 97% | 0% | 91% | 53% | 0% | 0% | 66% | prudente |
| primaria · rapidez · sin sábados | 97% | 0% | 99% | 0% | 0% | 0% | 28% | agresivo |
| primaria · rapidez · con sábados | 100% | 0% | 100% | 32% | 0% | 0% | 97% | agresivo |
| primaria · calidad · sin sábados | 99% | 0% | 99% | 51% | 0% | 0% | 77% | agresivo |
| primaria · calidad · con sábados | 100% | 0% | 100% | 100% | 0% | 0% | 98% | agresivo |
| preuniversitario · precio · sin sábados | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · precio · con sábados | 17% | 0% | 0% | 0% | 0% | 0% | 4% | prudente |
| preuniversitario · rapidez · sin sábados | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · rapidez · con sábados | 39% | 0% | 0% | 0% | 0% | 0% | 7% | prudente |
| preuniversitario · calidad · sin sábados | 44% | 0% | 5% | 0% | 0% | 0% | 12% | prudente |
| preuniversitario · calidad · con sábados | 92% | 0% | 23% | 0% | 0% | 0% | 67% | prudente |

### Alertas

- Combinaciones desbalanceadas para el prudente: de 0% (preuniversitario · rapidez · sin sábados) a 100% (primaria · rapidez · con sábados).
- Casi nadie quiebra: la mecánica de fracaso no se activa.

---
Tiempo de ejecución: 1,5 s.
