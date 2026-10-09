# Reporte de balance — v0

Generado con `node balance/ejecutar.ts 500`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 1.950 V** (capital inicial 750 V; multiplicador 2,60×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 63% | 0% | 2.091 | 1.648 | 2.668 |
| aleatorio | 0% | 3% | 879 | 386 | 1.516 |
| agresivo | 64% | 0% | 2.144 | 1.583 | 2.817 |
| avaro | 28% | 0% | 1.538 | 1.145 | 2.176 |
| barato | 44% | 0% | 1.912 | 1.562 | 2.285 |
| cosechador | 62% | 0% | 2.081 | 1.630 | 2.666 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 14% | 0% | 13% | 0% | 12% | 14% | agresivo |
| estudiantes · precio · con sábados | 52% | 0% | 74% | 0% | 43% | 49% | agresivo |
| estudiantes · rapidez · sin sábados | 6% | 0% | 0% | 0% | 1% | 6% | prudente |
| estudiantes · rapidez · con sábados | 56% | 0% | 24% | 0% | 45% | 54% | prudente |
| estudiantes · calidad · sin sábados | 11% | 0% | 7% | 0% | 5% | 11% | prudente |
| estudiantes · calidad · con sábados | 47% | 0% | 68% | 0% | 29% | 45% | agresivo |
| oficinistas · precio · sin sábados | 92% | 1% | 99% | 46% | 64% | 91% | agresivo |
| oficinistas · precio · con sábados | 98% | 1% | 100% | 70% | 87% | 98% | agresivo |
| oficinistas · rapidez · sin sábados | 94% | 0% | 90% | 36% | 41% | 93% | prudente |
| oficinistas · rapidez · con sábados | 100% | 2% | 100% | 79% | 89% | 100% | prudente |
| oficinistas · calidad · sin sábados | 88% | 1% | 97% | 39% | 40% | 86% | agresivo |
| oficinistas · calidad · con sábados | 97% | 1% | 100% | 69% | 76% | 97% | agresivo |

### Alertas

- Combinaciones desbalanceadas para el prudente: de 6% (estudiantes · rapidez · sin sábados) a 100% (oficinistas · rapidez · con sábados).

## App de tutorías

**Meta derivada: 2.200 V** (capital inicial 900 V; multiplicador 2,44×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 71% | 0% | 2.277 | 2.111 | 2.444 |
| aleatorio | 0% | 0% | 1.158 | 891 | 1.405 |
| agresivo | 53% | 0% | 2.248 | 1.875 | 2.701 |
| avaro | 0% | 0% | 1.842 | 1.753 | 1.938 |
| barato | 0% | 0% | 1.768 | 1.630 | 1.893 |
| cosechador | 73% | 0% | 2.286 | 2.115 | 2.462 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 93% | 0% | 100% | 0% | 0% | 93% | agresivo |
| primaria · precio · con sábados | 99% | 0% | 100% | 0% | 0% | 98% | agresivo |
| primaria · rapidez · sin sábados | 91% | 0% | 100% | 0% | 0% | 92% | agresivo |
| primaria · rapidez · con sábados | 100% | 0% | 100% | 0% | 0% | 100% | agresivo |
| primaria · calidad · sin sábados | 99% | 0% | 100% | 0% | 0% | 98% | agresivo |
| primaria · calidad · con sábados | 100% | 0% | 100% | 0% | 0% | 100% | agresivo |
| preuniversitario · precio · sin sábados | 20% | 0% | 0% | 0% | 0% | 24% | cosechador |
| preuniversitario · precio · con sábados | 70% | 0% | 0% | 0% | 0% | 66% | prudente |
| preuniversitario · rapidez · sin sábados | 0% | 0% | 0% | 0% | 0% | 0% | cosechador |
| preuniversitario · rapidez · con sábados | 26% | 0% | 0% | 0% | 0% | 39% | cosechador |
| preuniversitario · calidad · sin sábados | 65% | 0% | 0% | 0% | 0% | 69% | cosechador |
| preuniversitario · calidad · con sábados | 95% | 0% | 30% | 0% | 0% | 94% | prudente |

### Alertas

- Combinaciones desbalanceadas para el prudente: de 0% (preuniversitario · rapidez · sin sábados) a 100% (primaria · rapidez · con sábados).
- Casi nadie quiebra: la mecánica de fracaso no se activa.

---
Tiempo de ejecución: 1,2 s.
