# Handoff: Landing personal de Darling Salas — Propuesta "Inmersiva"

## Overview
Landing personal de **Darling Salas**, escritora. Página única con un recorrido por capítulos al hacer scroll: Darling → Escribo sobre (palabras) → Libros I–IV → La autora → Redes y contacto. El fondo de toda la página cambia de color al entrar en el universo de cada libro. Se alojará bajo la infraestructura de Brinza Solutions (subdominio), pero visualmente es 100% la marca personal de la autora; Brinza solo aparece en una línea discreta del footer.

Prioridad: **móvil** (tráfico desde Instagram/Facebook), rápida, elegante y clara. No debe parecer SaaS, tienda online ni plantilla de WordPress.

## About the Design Files
`P2 Inmersiva.dc.html` es una **referencia de diseño hecha en HTML** (prototipo de aspecto y comportamiento), no código de producción. Hay que **recrearla** en el stack elegido. Si no existe proyecto, se recomienda **Astro** (o Next.js con export estático) + CSS plano / CSS Modules, sin librerías de UI, con imágenes optimizadas (AVIF/WebP, `srcset`) y casi nada de JS (solo el controlador de scroll y el modal).

Para ver el prototipo: abrir `P2 Inmersiva.dc.html` en un navegador desde esta carpeta (necesita `support.js`, `image-slot.js` y `assets/` al lado). El marcado está en la plantilla y la lógica en la clase `Component` al final del archivo.

`content.js` contiene **todos los textos literales de la autora** (fragmentos y "Escribo sobre"). Deben usarse **sin modificar** la ortografía ni la puntuación: la autora pidió conservarlos tal cual.

## Fidelity
**Alta fidelidad.** Colores, tipografías, tamaños, composición e interacciones son finales. Recrear lo más fielmente posible.

## Design Tokens

### Tipografías (Google Fonts)
- **EB Garamond** 400 / 500 (títulos, citas, menú, palabras grandes).
- **Jost** 300 / 400 / 500 (interfaz y cuerpo). El cuerpo general va en 300.
- Rótulos (labels): Jost 11–12px, `letter-spacing: .28em` (los CTA usan .2em), `text-transform: uppercase`.
- No abusar de cursivas: el diseño no usa ninguna.

### Paleta por capítulo (fondo / texto)
| Capítulo | Fondo | Texto | Rótulo en cabecera |
|---|---|---|---|
| Hero | `#efe9df` | `#24211f` | Darling |
| Escribo sobre | `#e8e2d8` | `#24211f` | Palabras |
| I · La flor que atravesó el pavimento | `#d8cce7` | `#2e2440` | I · La flor |
| II · El último recuerdo que dejó tu muerte | `#2a2d36` | `#efe9df` | II · El recuerdo |
| III · Sobreviviendo a las sombras | `#c3c1bd` | `#1d1c1b` | III · Las sombras |
| IV · Amor en tiempos de nieve | `#e6dcc0` | `#1e2b45` | IV · La nieve |
| V · La autora | `#efe9df` | `#24211f` | La autora |
| VI · Contacto | `#24211f` | `#efe9df` | Contacto |

Colores de apoyo:
- Libro I: palabra de fondo `#c9badd`, línea vertical `#2e2a30`, punto `#9a7fc4`.
- Libro II: palabra de fondo `#353945`, líneas `#474b58` y una coral `#e8836b` al 50%.
- Libro III: marco y línea `#8f8c87`.
- Libro IV: círculo "luna" `#f3ead0`, palabra de fondo `#dccfae`.
- Menú: overlay `#24211f`, numerales `#9b948a`. Footer: texto `#8f887e`.

### Espaciado y forma
- Padding lateral: `clamp(20px, 6vw, 96px)` (la cabecera usa `clamp(20px, 4vw, 48px)`).
- **Sin border-radius** salvo los círculos decorativos y los botones redondos del modal (44px).
- **Sin cards.** Las sombras solo van en las portadas (ver cada libro).
- Easing general: `cubic-bezier(.2,.7,.2,1)`.

## Screens / Views (una sola página)

### Cabecera fija (siempre visible)
- `position: fixed`, 72px de alto, fondo transparente. El color del texto sigue al del capítulo activo.
- Izquierda: "D · S" (EB Garamond 22px, `letter-spacing: .08em`) → enlaza al hero.
- Centro: nombre del capítulo activo (rótulo 11px, .28em, mayúsculas).
- Derecha: botón "MENÚ" / "CERRAR".
- Barra de progreso de lectura: 2px en el borde superior, ancho = % de scroll y color = texto actual.
- **Menú:** overlay a pantalla completa `#24211f`, centrado verticalmente. Enlaces en EB Garamond `clamp(40px, 7vw, 88px)` precedidos de un numeral romano pequeño (I–V): Inicio, Libros, Sobre mí, Escritos, Contacto.

### 1. Hero (100vh)
- **Foto:** `assets/darling-hero.jpg`, ya tratada en monocromo con tinte lila y grano. Va anclada a la derecha (`right: -4vw; top: 12vh`), con ancho `clamp(260px, 46vw, 640px)`, proporción 520/580, y se sale ligeramente del viewport. Parallax: `translateY(scrollY * 0.12)` solo mientras se sale.
- **Abajo a la izquierda:**
  - H1 "Darling" / "Salas" en dos líneas: EB Garamond 400, `clamp(76px, 15vw, 250px)`, `line-height: .82`, `letter-spacing: -.03em`.
  - Frase: «Hay despedidas que nos rompen para siempre.» (EB Garamond `clamp(20px, 2vw, 26px)`, `max-width: 22ch`).
  - Debajo: "DESLIZA PARA ENTRAR" + una línea de 48px.

### 2. Escribo sobre (sección de 380vh con contenido sticky)
- Un contenedor `position: sticky; top: 0; height: 100vh`.
- ⚠️ Ningún ancestro puede tener `overflow: hidden/auto`. Usar `overflow-x: clip` en el root y en el body; si no, el sticky se rompe.
- **Arriba:** "ESCRIBO SOBRE" a la izquierda y el contador "01 / 05" a la derecha.
- **Centro:**
  - La palabra activa en EB Garamond `min(12vw, 20vh)`, `line-height: .9`.
  - Su texto literal en EB Garamond `clamp(16px, 1.35vw, 20px)`, `line-height: 1.5`, `white-space: pre-line`, `flex: 0 1 46ch`, `max-height: 46vh` con scroll interno si no cabe.
  - En escritorio van lado a lado (flex-wrap, alineados abajo); en móvil se apilan.
- **Abajo:** un filete de 1px y la fila con las 5 palabras ("01 MEMORIA"…), la activa con opacidad 1 y el resto con 0.4.
- Palabras, en orden: Memoria, Familia, Duelo, Amor, Resiliencia. Textos en `content.js`.
- Palabra activa = `floor(progresoSección * 5)`, limitado a 0–4. Cada cambio entra con la animación `fragIn` (opacidad 0→1, translateY 16px→0, 0.8s; el texto 1s).

### 3–6. Libros (cada uno `min-height: 150vh`, `overflow: hidden`, contenido centrado verticalmente)
Patrón común:
- **Rótulo** con el numeral romano.
- **H2:** EB Garamond `clamp(40px, 5.4vw, 76px)`, `line-height: 1`.
- **Cita** destacada: EB Garamond `clamp(22px, 2.2vw, 28px)`, `line-height: 1.35`, siempre entre « ».
- **Sinopsis** corta (Jost 16px, `line-height: 1.75`, `max-width: 40ch`).
- **CTAs** de texto: "COMPRAR" (subrayado con `border-bottom: 1px`) y "LEER FRAGMENTO". Son enlaces, no botones grandes.
- **Aparición** del bloque de texto: opacidad 0→1 y translateY 40px→0 según cuánto ha entrado la sección (`(0.8·vh − top) / (0.5·vh)`).
- **Portadas:** planas (no 3D: la autora lo descartó), con una ligera rotación y un parallax de `top * 0.06px` (máx. ±140px).

Cada libro:
- **I — La flor que atravesó el pavimento**
  - Composición: texto a la izquierda y portada a la derecha, desbordando ligeramente.
  - Portada `assets/portada-la-flor.jpeg` (1009×1561), ancho `clamp(240px, 34vw, 480px)`, `rotate(-3deg)`, sombra `30px 40px 80px -40px rgba(60,40,90,.55)`.
  - Fondo: "La flor" gigante (`clamp(120px, 24vw, 380px)`) arriba a la izquierda y una línea vertical al 58% con un punto de 22px que hace parallax (la grieta del pavimento).
  - La cita de la sección es el primer fragmento (multilínea, con `pre-line`).
- **II — El último recuerdo que dejó tu muerte**
  - Composición espejada: portada a la izquierda y texto a la derecha.
  - Portada `assets/portada-ultimo-recuerdo.png`, ancho `clamp(240px, 32vw, 440px)`, `filter: saturate(.55) contrast(.96)` (la autora pidió bajarle la saturación), `rotate(2.5deg)`, sombra `0 40px 90px -30px rgba(0,0,0,.9)` + contorno de 1px `#3a3e4a`.
  - Fondo: "Recuerdo" gigante arriba a la derecha y tres líneas horizontales al 70%.
- **III — Sobreviviendo a las sombras**
  - Composición centrada: portada arriba y texto debajo, centrado.
  - Portada `assets/portada-sombras.png`, ancho `clamp(220px, 24vw, 320px)`.
  - Fondo gris grafito, a juego con el dibujo en claroscuro, y un marco rectangular de 1px centrado con una línea horizontal.
  - Cita: «La despedida dolió, pero lo que vino después me destruyó».
- **IV — Amor en tiempos de nieve**
  - Composición: portada a la izquierda y texto a la derecha.
  - Portada `assets/portada-amor-nieve.jpeg` (1036×1600), ancho `clamp(230px, 28vw, 400px)`, `filter: saturate(.7)`, `rotate(-2deg)`.
  - Fondo: gran círculo "luna" `#f3ead0` (`min(78vw, 860px)`) a la izquierda con parallax y "Nieve" gigante abajo a la derecha.
  - Por ahora solo tiene el título y el CTA "Comprar"; faltan la sinopsis, las frases y "Leer fragmento".

### 7. V — La autora (min-height 120vh)
- **Retrato** vertical 3:4 (máx. 380px) que desborda a la izquierda. **Falta la foto** (es un hueco en el prototipo).
- **Rótulo** "V — LA AUTORA".
- **Frase** (EB Garamond `clamp(34px, 4.4vw, 60px)`, `max-width: 20ch`): «Una autora que encontró en las palabras una forma de quedarse cerca de lo que alguna vez perdió.»
- **Párrafo** (Jost 16px): "Darling Salas escribe sobre el duelo, las ausencias, la memoria, el amor y la reconstrucción. Sus obra nacen de una mirada íntima hacia aquello que nos atraviesa y permanece incluso después de que una historia termina." (pendiente de confirmar "Sus obra" → "Sus obras").

### 8. VI — Contacto + footer (fondo `#24211f`)
- **Rótulo** "VI — SIGUE EL RECORRIDO".
- **Usuario** "@darlingsalas" en EB Garamond `clamp(48px, 9vw, 140px)`.
- **Enlaces:** Instagram · Facebook · Escritos · correo. Usuario y correo son provisionales.
- **Footer** (11px, `#8f887e`): "© 2026 Darling Salas" a la izquierda y "Sitio desarrollado por Brinza Solutions" a la derecha. Muy discreto.

## Interactions & Behavior
- **Cambio de fondo por capítulo:** el capítulo activo es el último cuya parte superior está por encima del 55% del viewport. Fondo y color de texto del root cambian con `transition: background-color 1.4s ease, color 1.4s ease`, y todo hereda `currentColor`.
- **Scroll:** un solo listener pasivo con `requestAnimationFrame`. Mide los `getBoundingClientRect()` de las secciones y calcula el capítulo activo, la revelación por sección, el progreso de "Escribo sobre" y el progreso total. Alternativa: IntersectionObserver + `animation-timeline: scroll()` donde haya soporte.
- **Parallax:** muy sutil, siempre limitado a ±140px.
- **Modal "Leer fragmento"** (libros I–III):
  - Overlay a pantalla completa con el fondo y el color de ese libro.
  - Arriba: título del libro y "CERRAR".
  - Centro: un fragmento en EB Garamond. El tamaño depende de la longitud del texto: hasta 110 caracteres `clamp(34px, 5.6vw, 80px)` con `max-width: 20ch`; de 111 a 160 `clamp(28px, 4.2vw, 60px)`; de 161 a 300 `clamp(22px, 2.8vw, 40px)`; más de 300 `clamp(18px, 2.1vw, 28px)`. Por encima de 200 caracteres, `max-width: 40ch`.
  - `white-space: pre-line` (los poemas conservan sus saltos de línea).
  - El contenedor hace scroll (`align-items: flex-start` y el párrafo con `margin: auto 0`, para que en pantallas bajas no se recorte el principio).
  - Abajo: botones circulares ← → de 44px, contador "1 / 8" y "COMPRAR EL LIBRO".
  - Clic sobre el texto = siguiente fragmento (cíclico). Cada cambio anima con `fragIn` (0.7s).
  - Añadir también: cerrar con Esc, flechas del teclado, gesto de swipe en móvil y bloquear el scroll del body mientras está abierto.
- **Hover:** enlaces con `opacity: .7`.
- `prefers-reduced-motion`: desactivar el parallax y las animaciones de entrada.

## State
- `activeChapter` (0–7), `progress` (0–1), `wordIndex` (0–4) y la revelación/top de cada sección.
- `menuOpen` (bool).
- `fragment: { book: null | 0..2, index }`.

## Assets
- `assets/darling-hero.jpg`: retrato de la autora, ya recortado y tratado (monocromo con tinte lila y grano). Es provisional hasta tener la foto artística definitiva.
- Portadas oficiales: `portada-la-flor.jpeg`, `portada-ultimo-recuerdo.png`, `portada-sombras.png`, `portada-amor-nieve.jpeg`.
- **Faltan:**
  - la foto de "La autora";
  - los enlaces reales de compra de cada libro;
  - las redes y el correo reales;
  - la sinopsis y los fragmentos del libro IV;
  - las sinopsis definitivas de I–III (las actuales son provisionales).

## Files
- `P2 Inmersiva.dc.html`: prototipo de referencia (marcado y estilos inline, más la lógica en la clase `Component` al final).
- `content.js`: textos literales de "Escribo sobre" y de los fragmentos de cada libro.
- `assets/`: foto y portadas.
- `support.js`, `image-slot.js`: solo para que el prototipo abra en el navegador; no forman parte de la implementación.

## Notas para producción
- SEO: `<title>Darling Salas — Escritora</title>`, meta description, Open Graph con la portada o el retrato (importante al compartir en redes) y JSON-LD `Person` + `Book` por libro.
- La estructura de libros debe ser una colección de datos (título, color de fondo/texto, portada, cita, sinopsis, fragmentos, URL de compra) para poder añadir libros futuros sin tocar el diseño.
- Dejar prevista una sección/colección "Escritos" (poemas, reflexiones, noticias, presentaciones).
