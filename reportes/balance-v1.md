# Reporte de balance — v1

Generado con `node balance/ejecutar.ts 500 v1`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v1: economía base con imprevistos y oportunidades con plazo; la temporada termina en la quiebra. Con inflación, la meta de la partida sube con ella (el patrimonio se compara con la meta ajustada). Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 950 V** (capital inicial 350 V; multiplicador 2,71×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 69% | 0% | 1.054 | 809 | 1.336 |
| oportunista | 91% | 0% | 1.237 | 970 | 1.576 |
| aleatorio | 0% | 100% | 202 | 79 | 301 |
| agresivo | 25% | 60% | 581 | 421 | 1.140 |
| holgado | 48% | 1% | 942 | 753 | 1.186 |
| ajustado | 0% | 45% | 451 | 315 | 642 |
| avaro | 0% | 25% | 173 | 72 | 270 |
| barato | 6% | 44% | 601 | 381 | 890 |
| cosechador | 19% | 0% | 783 | 562 | 1.021 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | oportunista | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 54% | 87% | 0% | 15% | 25% | 0% | 0% | 7% | 10% | oportunista |
| estudiantes · precio · con sábados | 92% | 98% | 0% | 29% | 80% | 0% | 0% | 12% | 34% | oportunista |
| estudiantes · rapidez · sin sábados | 38% | 84% | 0% | 16% | 9% | 0% | 0% | 8% | 9% | oportunista |
| estudiantes · rapidez · con sábados | 95% | 100% | 0% | 41% | 75% | 0% | 0% | 30% | 47% | oportunista |
| estudiantes · calidad · sin sábados | 50% | 87% | 0% | 15% | 22% | 0% | 0% | 5% | 9% | oportunista |
| estudiantes · calidad · con sábados | 93% | 98% | 0% | 28% | 79% | 0% | 0% | 10% | 33% | oportunista |
| oficinistas · precio · sin sábados | 48% | 83% | 0% | 18% | 18% | 0% | 0% | 0% | 4% | oportunista |
| oficinistas · precio · con sábados | 93% | 98% | 0% | 29% | 79% | 0% | 0% | 1% | 19% | oportunista |
| oficinistas · rapidez · sin sábados | 31% | 78% | 0% | 18% | 7% | 0% | 0% | 0% | 2% | oportunista |
| oficinistas · rapidez · con sábados | 94% | 100% | 0% | 42% | 73% | 0% | 0% | 2% | 34% | oportunista |
| oficinistas · calidad · sin sábados | 48% | 85% | 0% | 21% | 23% | 0% | 0% | 0% | 4% | oportunista |
| oficinistas · calidad · con sábados | 93% | 98% | 0% | 35% | 85% | 0% | 0% | 1% | 22% | oportunista |

### Eventos

- Ventaja de aprovechar las oportunidades (oportunista − prudente, patrimonio mediano): **19% de la meta** (tope: 20%).
- Imprevistos por temporada: prudente 5,8 · oportunista 5,8 · aleatorio 4,4 · agresivo 4,3 · holgado 5,9 · ajustado 7,9 · avaro 10,7 · barato 5,2 · cosechador 6,6 (objetivo ≈ 6).
- Oportunidades aceptadas por temporada (oportunista): 12,2; contratos incumplidos: 0,00.

### Alertas

- Ninguna.

## App de tutorías

**Meta derivada: 1.400 V** (capital inicial 450 V; multiplicador 3,11×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 62% | 0% | 1.461 | 1.227 | 1.683 |
| oportunista | 91% | 0% | 1.662 | 1.408 | 1.917 |
| aleatorio | 0% | 83% | 230 | 130 | 378 |
| agresivo | 35% | 10% | 1.301 | 734 | 1.609 |
| holgado | 0% | 28% | 726 | 446 | 946 |
| ajustado | 0% | 0% | 841 | 641 | 1.032 |
| avaro | 0% | 0% | 470 | 352 | 652 |
| barato | 0% | 60% | 523 | 368 | 794 |
| cosechador | 0% | 0% | 986 | 802 | 1.160 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | oportunista | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 61% | 86% | 0% | 48% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · precio · con sábados | 56% | 80% | 0% | 29% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · rapidez · sin sábados | 67% | 95% | 0% | 62% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · rapidez · con sábados | 69% | 95% | 0% | 53% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · calidad · sin sábados | 69% | 92% | 0% | 60% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · calidad · con sábados | 66% | 89% | 0% | 39% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · precio · sin sábados | 54% | 89% | 0% | 20% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · precio · con sábados | 56% | 87% | 0% | 7% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · rapidez · sin sábados | 53% | 94% | 0% | 26% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · rapidez · con sábados | 56% | 93% | 0% | 16% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · calidad · sin sábados | 66% | 96% | 0% | 35% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · calidad · con sábados | 67% | 93% | 0% | 22% | 0% | 0% | 0% | 0% | 0% | oportunista |

### Eventos

- Ventaja de aprovechar las oportunidades (oportunista − prudente, patrimonio mediano): **14% de la meta** (tope: 20%).
- Imprevistos por temporada: prudente 5,8 · oportunista 5,7 · aleatorio 5,9 · agresivo 5,4 · holgado 5,6 · ajustado 7,1 · avaro 10,8 · barato 4,6 · cosechador 6,7 (objetivo ≈ 6).
- Oportunidades aceptadas por temporada (oportunista): 12,2; contratos incumplidos: 0,00.

### Alertas

- Ninguna.

---
Tiempo de ejecución: 13,2 s.
