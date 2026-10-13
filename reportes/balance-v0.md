# Reporte de balance — v0

Generado con `node balance/ejecutar.ts 500`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 800 V** (capital inicial 350 V; multiplicador 2,29×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 61% | 0% | 847 | 644 | 1.071 |
| oportunista | 61% | 0% | 847 | 644 | 1.071 |
| aleatorio | 0% | 99% | 217 | 107 | 311 |
| agresivo | 36% | 56% | 619 | 452 | 1.013 |
| holgado | 56% | 0% | 824 | 691 | 1.024 |
| ajustado | 5% | 14% | 558 | 364 | 754 |
| avaro | 0% | 3% | 288 | 170 | 392 |
| barato | 12% | 39% | 592 | 406 | 822 |
| cosechador | 50% | 0% | 800 | 614 | 1.002 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | oportunista | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 42% | 42% | 0% | 20% | 30% | 1% | 0% | 13% | 39% | prudente |
| estudiantes · precio · con sábados | 76% | 76% | 0% | 44% | 96% | 3% | 0% | 28% | 71% | holgado |
| estudiantes · rapidez · sin sábados | 44% | 44% | 0% | 18% | 3% | 3% | 0% | 14% | 38% | prudente |
| estudiantes · rapidez · con sábados | 89% | 89% | 0% | 58% | 95% | 25% | 0% | 52% | 88% | prudente |
| estudiantes · calidad · sin sábados | 43% | 43% | 0% | 20% | 30% | 0% | 0% | 11% | 36% | prudente |
| estudiantes · calidad · con sábados | 76% | 76% | 0% | 45% | 95% | 3% | 0% | 25% | 71% | holgado |
| oficinistas · precio · sin sábados | 38% | 38% | 0% | 22% | 16% | 0% | 0% | 0% | 20% | prudente |
| oficinistas · precio · con sábados | 77% | 77% | 0% | 47% | 94% | 2% | 0% | 2% | 58% | holgado |
| oficinistas · rapidez · sin sábados | 37% | 37% | 0% | 21% | 0% | 2% | 0% | 0% | 16% | prudente |
| oficinistas · rapidez · con sábados | 90% | 90% | 0% | 63% | 95% | 21% | 0% | 2% | 76% | prudente |
| oficinistas · calidad · sin sábados | 43% | 43% | 0% | 26% | 26% | 0% | 0% | 0% | 23% | prudente |
| oficinistas · calidad · con sábados | 80% | 80% | 0% | 53% | 96% | 2% | 0% | 2% | 64% | holgado |

### Alertas

- Ninguna.

## App de tutorías

**Meta derivada: 1.050 V** (capital inicial 450 V; multiplicador 2,33×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 52% | 0% | 1.052 | 993 | 1.107 |
| oportunista | 52% | 0% | 1.052 | 993 | 1.107 |
| aleatorio | 0% | 81% | 263 | 176 | 391 |
| agresivo | 49% | 0% | 1.045 | 903 | 1.207 |
| holgado | 0% | 32% | 597 | 502 | 655 |
| ajustado | 5% | 0% | 908 | 790 | 1.022 |
| avaro | 0% | 0% | 571 | 457 | 788 |
| barato | 0% | 79% | 474 | 398 | 550 |
| cosechador | 0% | 0% | 904 | 820 | 988 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | oportunista | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 32% | 32% | 0% | 97% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · precio · con sábados | 7% | 7% | 0% | 37% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · rapidez · sin sábados | 63% | 63% | 0% | 100% | 0% | 1% | 0% | 0% | 0% | agresivo |
| primaria · rapidez · con sábados | 87% | 87% | 0% | 99% | 0% | 1% | 0% | 0% | 0% | agresivo |
| primaria · calidad · sin sábados | 88% | 88% | 0% | 100% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · calidad · con sábados | 64% | 64% | 0% | 84% | 0% | 0% | 0% | 0% | 0% | agresivo |
| preuniversitario · precio · sin sábados | 17% | 17% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · precio · con sábados | 12% | 12% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · rapidez · sin sábados | 35% | 35% | 0% | 1% | 0% | 30% | 0% | 0% | 0% | prudente |
| preuniversitario · rapidez · con sábados | 55% | 55% | 0% | 0% | 0% | 21% | 0% | 0% | 0% | prudente |
| preuniversitario · calidad · sin sábados | 92% | 92% | 0% | 62% | 0% | 2% | 0% | 0% | 0% | prudente |
| preuniversitario · calidad · con sábados | 71% | 71% | 0% | 3% | 0% | 0% | 0% | 0% | 0% | prudente |

### Alertas

- Ninguna.

---
Tiempo de ejecución: 4,5 s.
