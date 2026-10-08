# Reporte de balance — v0

Generado con `node balance/ejecutar.ts 500`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 1.950 V** (capital inicial 750 V; multiplicador 2,60×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 66% | 0% | 2.139 | 1.600 | 2.799 |
| aleatorio | 3% | 3% | 969 | 454 | 1.660 |
| agresivo | 96% | 0% | 2.911 | 2.135 | 3.864 |
| avaro | 15% | 0% | 1.424 | 980 | 2.050 |
| barato | 51% | 0% | 1.966 | 1.533 | 2.484 |
| cosechador | 67% | 0% | 2.168 | 1.611 | 2.848 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 2% | 0% | 55% | 0% | 1% | 3% | agresivo |
| estudiantes · precio · con sábados | 13% | 0% | 97% | 0% | 11% | 18% | agresivo |
| estudiantes · rapidez · sin sábados | 13% | 0% | 95% | 0% | 10% | 16% | agresivo |
| estudiantes · rapidez · con sábados | 55% | 0% | 100% | 0% | 46% | 58% | agresivo |
| estudiantes · calidad · sin sábados | 69% | 0% | 100% | 0% | 58% | 71% | agresivo |
| estudiantes · calidad · con sábados | 93% | 0% | 100% | 0% | 90% | 94% | agresivo |
| oficinistas · precio · sin sábados | 68% | 0% | 100% | 0% | 18% | 69% | agresivo |
| oficinistas · precio · con sábados | 93% | 1% | 100% | 4% | 61% | 92% | agresivo |
| oficinistas · rapidez · sin sábados | 89% | 1% | 100% | 8% | 50% | 90% | agresivo |
| oficinistas · rapidez · con sábados | 99% | 4% | 100% | 29% | 85% | 98% | agresivo |
| oficinistas · calidad · sin sábados | 100% | 10% | 100% | 56% | 89% | 100% | agresivo |
| oficinistas · calidad · con sábados | 100% | 23% | 100% | 80% | 99% | 100% | agresivo |

### Alertas

- **agresivo** supera al prudente (96% frente a 66%): posible estrategia dominante.
- Combinaciones desbalanceadas para el prudente: de 2% (estudiantes · precio · sin sábados) a 100% (oficinistas · calidad · con sábados).

## App de tutorías

**Meta derivada: 2.050 V** (capital inicial 900 V; multiplicador 2,28×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 65% | 0% | 2.147 | 1.875 | 2.615 |
| aleatorio | 0% | 0% | 1.055 | 790 | 1.405 |
| agresivo | 56% | 0% | 2.136 | 1.553 | 2.978 |
| avaro | 8% | 0% | 1.740 | 1.562 | 2.037 |
| barato | 16% | 0% | 1.668 | 1.432 | 2.132 |
| cosechador | 64% | 0% | 2.143 | 1.869 | 2.651 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | aleatorio | agresivo | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 8% | 0% | 0% | 0% | 0% | 10% | prudente |
| primaria · precio · con sábados | 50% | 0% | 68% | 0% | 0% | 38% | agresivo |
| primaria · rapidez · sin sábados | 98% | 0% | 100% | 0% | 0% | 96% | agresivo |
| primaria · rapidez · con sábados | 100% | 0% | 100% | 0% | 0% | 100% | agresivo |
| primaria · calidad · sin sábados | 100% | 0% | 100% | 21% | 89% | 100% | agresivo |
| primaria · calidad · con sábados | 100% | 0% | 100% | 42% | 99% | 100% | agresivo |
| preuniversitario · precio · sin sábados | 0% | 0% | 0% | 0% | 0% | 0% | cosechador |
| preuniversitario · precio · con sábados | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · rapidez · sin sábados | 40% | 0% | 0% | 0% | 0% | 47% | cosechador |
| preuniversitario · rapidez · con sábados | 88% | 0% | 0% | 0% | 0% | 84% | prudente |
| preuniversitario · calidad · sin sábados | 100% | 0% | 100% | 11% | 0% | 100% | cosechador |
| preuniversitario · calidad · con sábados | 100% | 0% | 100% | 25% | 8% | 100% | prudente |

### Alertas

- Combinaciones desbalanceadas para el prudente: de 0% (preuniversitario · precio · sin sábados) a 100% (primaria · calidad · sin sábados).
- Casi nadie quiebra: la mecánica de fracaso no se activa.

---
Tiempo de ejecución: 0,9 s.
