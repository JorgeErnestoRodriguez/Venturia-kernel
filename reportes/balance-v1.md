# Reporte de balance — v1

Generado con `node balance/ejecutar.ts 300 v1`. 300 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v1: economía base con imprevistos y oportunidades con plazo; la temporada termina en la quiebra. Con inflación, la meta de la partida sube con ella (el patrimonio se compara con la meta ajustada). Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 850 V** (capital inicial 350 V; multiplicador 2,43×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 61% | 1% | 913 | 659 | 1.205 |
| oportunista | 99% | 0% | 1.446 | 1.105 | 1.829 |
| aleatorio | 0% | 100% | 172 | 39 | 283 |
| agresivo | 32% | 62% | 587 | 427 | 1.107 |
| holgado | 63% | 1% | 903 | 715 | 1.145 |
| ajustado | 0% | 47% | 453 | 318 | 642 |
| avaro | 0% | 26% | 171 | 74 | 273 |
| barato | 11% | 46% | 589 | 384 | 867 |
| cosechador | 33% | 0% | 767 | 559 | 997 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | oportunista | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 43% | 97% | 0% | 20% | 30% | 0% | 0% | 9% | 19% | oportunista |
| estudiantes · precio · con sábados | 72% | 99% | 0% | 38% | 85% | 1% | 0% | 22% | 48% | oportunista |
| estudiantes · rapidez · sin sábados | 50% | 99% | 0% | 22% | 26% | 0% | 0% | 14% | 21% | oportunista |
| estudiantes · rapidez · con sábados | 84% | 100% | 0% | 43% | 90% | 1% | 0% | 41% | 66% | oportunista |
| estudiantes · calidad · sin sábados | 47% | 97% | 0% | 23% | 54% | 0% | 0% | 11% | 24% | oportunista |
| estudiantes · calidad · con sábados | 72% | 99% | 0% | 36% | 93% | 0% | 0% | 22% | 52% | oportunista |
| oficinistas · precio · sin sábados | 42% | 98% | 0% | 25% | 27% | 0% | 0% | 1% | 7% | oportunista |
| oficinistas · precio · con sábados | 74% | 99% | 0% | 38% | 85% | 0% | 0% | 3% | 37% | oportunista |
| oficinistas · rapidez · sin sábados | 46% | 99% | 0% | 25% | 22% | 0% | 0% | 1% | 10% | oportunista |
| oficinistas · rapidez · con sábados | 83% | 100% | 0% | 41% | 90% | 1% | 0% | 7% | 54% | oportunista |
| oficinistas · calidad · sin sábados | 48% | 97% | 0% | 30% | 54% | 0% | 0% | 2% | 15% | oportunista |
| oficinistas · calidad · con sábados | 75% | 99% | 0% | 41% | 95% | 0% | 0% | 5% | 45% | oportunista |

### Eventos

- Ventaja de aprovechar las oportunidades (oportunista − prudente, patrimonio mediano): **63% de la meta** (tope: 60%).
- Imprevistos por temporada: prudente 5,7 · oportunista 5,8 · aleatorio 5,0 · agresivo 4,2 · holgado 5,5 · ajustado 7,9 · avaro 10,7 · barato 5,1 · cosechador 6,5 (objetivo ≈ 6).
- Oportunidades aceptadas por temporada (oportunista): 26,1; contratos incumplidos: 0,00.

### Alertas

- **oportunista** supera al prudente (99% frente a 61%): posible estrategia dominante.
- Las oportunidades valen 63% de la meta (tope 60%): quien no se conecta queda en desventaja.

## App de tutorías

**Meta derivada: 1.350 V** (capital inicial 450 V; multiplicador 3,00×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 65% | 0% | 1.429 | 1.185 | 1.656 |
| oportunista | 100% | 0% | 1.922 | 1.619 | 2.212 |
| aleatorio | 0% | 89% | 185 | 87 | 313 |
| agresivo | 39% | 11% | 1.283 | 714 | 1.588 |
| holgado | 0% | 31% | 713 | 454 | 928 |
| ajustado | 0% | 0% | 851 | 658 | 1.028 |
| avaro | 0% | 0% | 472 | 353 | 653 |
| barato | 0% | 63% | 530 | 378 | 775 |
| cosechador | 0% | 0% | 975 | 794 | 1.143 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | oportunista | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 51% | 99% | 0% | 53% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · precio · con sábados | 59% | 98% | 0% | 37% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · rapidez · sin sábados | 69% | 100% | 0% | 66% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · rapidez · con sábados | 76% | 100% | 0% | 55% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · calidad · sin sábados | 78% | 100% | 0% | 68% | 0% | 0% | 0% | 0% | 0% | oportunista |
| primaria · calidad · con sábados | 76% | 100% | 0% | 44% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · precio · sin sábados | 42% | 99% | 0% | 17% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · precio · con sábados | 55% | 99% | 0% | 8% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · rapidez · sin sábados | 58% | 100% | 0% | 26% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · rapidez · con sábados | 70% | 100% | 0% | 21% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · calidad · sin sábados | 75% | 100% | 0% | 44% | 0% | 0% | 0% | 0% | 0% | oportunista |
| preuniversitario · calidad · con sábados | 74% | 100% | 0% | 30% | 0% | 0% | 0% | 0% | 0% | oportunista |

### Eventos

- Ventaja de aprovechar las oportunidades (oportunista − prudente, patrimonio mediano): **37% de la meta** (tope: 60%).
- Imprevistos por temporada: prudente 5,5 · oportunista 5,4 · aleatorio 6,3 · agresivo 5,2 · holgado 5,2 · ajustado 7,2 · avaro 10,8 · barato 4,4 · cosechador 6,3 (objetivo ≈ 6).
- Oportunidades aceptadas por temporada (oportunista): 25,3; contratos incumplidos: 0,00.

### Alertas

- **oportunista** supera al prudente (100% frente a 65%): posible estrategia dominante.
- Elecciones de fundación desbalanceadas: la mejor (preuniversitario · calidad) rinde 11% más que la peor (preuniversitario · precio).

---
Tiempo de ejecución: 10,1 s.
