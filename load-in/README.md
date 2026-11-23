# SONAR Load-In

Juego para celular: carga el equipo de producción en la caja del camión antes de que se acabe el tiempo.

## Cómo abrirlo
Abre `index.html` en el navegador (Chrome, Safari o Edge). No necesita instalar nada.

## Estructura
```
index.html          Pantallas y estructura de la página
css/styles.css      Estilos
assets/logo.png     Logo SONAR
js/01-config.js     Ajustes: niveles, tamaño de caja, tiempo, pistas, estrellas
js/02-pieces.js     Las 7 piezas (truss, sub, cabezas, line array L/J, escalera, blinders)
js/03-levels.js     Generador de niveles (siempre con solución)
js/04-truck.js      Dibujo del camión
js/05-sound.js      Efectos de sonido
js/06-store.js      Progreso guardado en el teléfono
js/07-game.js       Lógica del juego: arrastrar, girar, pistas, ganar y perder
js/08-ui.js         Pantallas de inicio, niveles y resultados
js/09-main.js       Arranque
```

## Ajustes rápidos (js/01-config.js)
- `LEVEL_COUNT`: número de niveles
- `GRIDS`: tamaño de la caja según el nivel
- `HINTS_PER_LEVEL`: pistas por nivel
- `timeLimitFor`: tiempo para cada nivel
- `starsFor`: tiempos para 1, 2 o 3 estrellas
