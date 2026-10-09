# Reporte de balance — v0

Generado con `node balance/ejecutar.ts 500`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 2.200 V** (capital inicial 750 V; multiplicador 2,93×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 65% | 0% | 2.375 | 1.887 | 2.994 |
| aleatorio | 2% | 1% | 1.179 | 625 | 1.884 |
| agresivo | 99% | 0% | 3.201 | 2.500 | 4.052 |
| avaro | 8% | 0% | 1.538 | 1.145 | 2.176 |
| barato | 49% | 0% | 2.190 | 1.805 | 2.598 |
| cosechador | 68% | 0% | 2.421 | 1.909 | 3.055 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 16% | 0% | 98% | 0% | 14% | 22% | agresivo |
| estudiantes · precio · con sábados | 58% | 0% | 100% | 0% | 54% | 64% | agresivo |
| estudiantes · rapidez · sin sábados | 7% | 0% | 89% | 0% | 3% | 12% | agresivo |
| estudiantes · rapidez · con sábados | 66% | 0% | 100% | 0% | 60% | 76% | agresivo |
| estudiantes · calidad · sin sábados | 12% | 0% | 97% | 0% | 7% | 15% | agresivo |
| estudiantes · calidad · con sábados | 52% | 0% | 100% | 0% | 41% | 57% | agresivo |
| oficinistas · precio · sin sábados | 91% | 1% | 100% | 8% | 63% | 92% | agresivo |
| oficinistas · precio · con sábados | 99% | 4% | 100% | 29% | 90% | 99% | agresivo |
| oficinistas · rapidez · sin sábados | 93% | 1% | 100% | 2% | 38% | 94% | agresivo |
| oficinistas · rapidez · con sábados | 100% | 10% | 100% | 25% | 93% | 100% | agresivo |
| oficinistas · calidad · sin sábados | 86% | 1% | 100% | 7% | 38% | 87% | agresivo |
| oficinistas · calidad · con sábados | 97% | 4% | 100% | 26% | 82% | 98% | agresivo |

### Alertas

- **agresivo** supera al prudente (99% frente a 65%): posible estrategia dominante.
- Combinaciones desbalanceadas para el prudente: de 7% (estudiantes · rapidez · sin sábados) a 100% (oficinistas · rapidez · con sábados).
- Casi nadie quiebra: la mecánica de fracaso no se activa.

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
Tiempo de ejecución: 1,0 s.
