# Reporte de balance — v0

Generado con `node balance/ejecutar.ts 500`. 500 partidas por combinación y bot, con las mismas semillas para todos los bots.

Alcance v0: economía base, sin imprevistos ni oportunidades; la temporada termina en la quiebra. Montos en Ventus (V).

## Venta de arepas

**Meta derivada: 800 V** (capital inicial 350 V; multiplicador 2,29×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 61% | 0% | 847 | 647 | 1.071 |
| oportunista | 61% | 0% | 847 | 647 | 1.071 |
| aleatorio | 0% | 100% | 221 | 111 | 312 |
| agresivo | 36% | 58% | 623 | 455 | 1.013 |
| holgado | 59% | 0% | 830 | 678 | 1.028 |
| ajustado | 4% | 14% | 561 | 374 | 739 |
| avaro | 0% | 3% | 286 | 173 | 388 |
| barato | 12% | 40% | 593 | 411 | 820 |
| cosechador | 50% | 0% | 799 | 616 | 998 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | oportunista | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| estudiantes · precio · sin sábados | 52% | 52% | 0% | 25% | 49% | 2% | 0% | 19% | 46% | prudente |
| estudiantes · precio · con sábados | 81% | 81% | 0% | 49% | 98% | 4% | 0% | 35% | 76% | holgado |
| estudiantes · rapidez · sin sábados | 32% | 32% | 0% | 11% | 0% | 3% | 0% | 8% | 26% | prudente |
| estudiantes · rapidez · con sábados | 86% | 86% | 0% | 49% | 88% | 17% | 0% | 43% | 84% | prudente |
| estudiantes · calidad · sin sábados | 43% | 43% | 0% | 20% | 30% | 0% | 0% | 11% | 36% | prudente |
| estudiantes · calidad · con sábados | 76% | 76% | 0% | 45% | 95% | 3% | 0% | 25% | 71% | holgado |
| oficinistas · precio · sin sábados | 47% | 47% | 0% | 29% | 35% | 1% | 0% | 0% | 26% | prudente |
| oficinistas · precio · con sábados | 81% | 81% | 0% | 54% | 97% | 3% | 0% | 3% | 64% | holgado |
| oficinistas · rapidez · sin sábados | 27% | 27% | 0% | 16% | 0% | 1% | 0% | 0% | 11% | prudente |
| oficinistas · rapidez · con sábados | 87% | 87% | 0% | 54% | 88% | 14% | 0% | 1% | 69% | prudente |
| oficinistas · calidad · sin sábados | 43% | 43% | 0% | 26% | 26% | 0% | 0% | 0% | 23% | prudente |
| oficinistas · calidad · con sábados | 80% | 80% | 0% | 53% | 96% | 2% | 0% | 2% | 64% | holgado |

### Alertas

- Ninguna.

## App de tutorías

**Meta derivada: 1.050 V** (capital inicial 450 V; multiplicador 2,33×).

### Resultado por bot (todas las combinaciones)

| Bot | Llega a la meta | Quiebra | Patrimonio mediano | P10 | P90 |
| --- | --- | --- | --- | --- | --- |
| prudente | 52% | 0% | 1.053 | 1.001 | 1.104 |
| oportunista | 52% | 0% | 1.053 | 1.001 | 1.104 |
| aleatorio | 0% | 82% | 267 | 181 | 389 |
| agresivo | 52% | 0% | 1.057 | 902 | 1.203 |
| holgado | 0% | 34% | 603 | 520 | 649 |
| ajustado | 2% | 0% | 916 | 808 | 1.008 |
| avaro | 0% | 0% | 577 | 461 | 782 |
| barato | 0% | 82% | 489 | 407 | 543 |
| cosechador | 0% | 0% | 902 | 823 | 989 |

### Llega a la meta, por combinación y bot

| Combinación | prudente | oportunista | aleatorio | agresivo | holgado | ajustado | avaro | barato | cosechador | Mejor bot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primaria · precio · sin sábados | 74% | 74% | 0% | 100% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · precio · con sábados | 28% | 28% | 0% | 67% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · rapidez · sin sábados | 27% | 27% | 0% | 100% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · rapidez · con sábados | 61% | 61% | 0% | 95% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · calidad · sin sábados | 88% | 88% | 0% | 100% | 0% | 0% | 0% | 0% | 0% | agresivo |
| primaria · calidad · con sábados | 64% | 64% | 0% | 84% | 0% | 0% | 0% | 0% | 0% | agresivo |
| preuniversitario · precio · sin sábados | 65% | 65% | 0% | 12% | 0% | 2% | 0% | 0% | 0% | prudente |
| preuniversitario · precio · con sábados | 33% | 33% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | prudente |
| preuniversitario · rapidez · sin sábados | 4% | 4% | 0% | 0% | 0% | 14% | 0% | 0% | 0% | prudente |
| preuniversitario · rapidez · con sábados | 23% | 23% | 0% | 0% | 0% | 8% | 0% | 0% | 0% | prudente |
| preuniversitario · calidad · sin sábados | 92% | 92% | 0% | 62% | 0% | 2% | 0% | 0% | 0% | prudente |
| preuniversitario · calidad · con sábados | 71% | 71% | 0% | 3% | 0% | 0% | 0% | 0% | 0% | prudente |

### Alertas

- Ninguna.

---
Tiempo de ejecución: 3,4 s.
