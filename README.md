# 🍕 Pizza Drive-Thru: Arcade Idle Tycoon (Juego 2D)

Un juego interactivo estilo **Arcade Idle** en 2D desarrollado con **HTML5 Canvas**, **JavaScript nativo**, **Tailwind CSS** y sintetizador de audio procedural con **Web Audio API**.

---

## 🎮 Cómo Jugar e Iniciar

1. **Inicio rápido**:
   - Haz doble clic sobre [`index.html`](file:///c:/Users/Marcos/Desktop/Programacion/Nueva%20carpeta/index.html) o ejecuta [`iniciar_juego.bat`](file:///c:/Users/Marcos/Desktop/Programacion/Nueva%20carpeta/iniciar_juego.bat). Se abrirá inmediatamente en cualquier navegador web moderno (Edge, Chrome, Firefox, Safari, Brave).
2. **Servidor local con Python (opcional)**:
   - Ejecuta `python servidor_local.py` en la terminal para abrirlo en `http://localhost:5500`.

---

## 🕹️ Controles

- **Teclado (PC)**:
  - Teclas <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> o <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> para mover al personaje en cualquier dirección.
- **Móvil / Pantalla Táctil**:
  - **Joystick Virtual Dinámico**: Toca y arrastra el dedo por la mitad izquierda de la pantalla para controlar la dirección y velocidad del personaje con fluidez.

---

## 🔄 Bucle Principal de Juego (Core Gameplay Loop)

1. **🌾 Cosecha de Trigo**:
   - Acércate a la parcela de cultivo. Tu personaje blandirá automáticamente la **guadaña** con efectos de corte para cosechar trigo.
   - El trigo reaparece automáticamente tras unos segundos.
2. **🥡 Procesamiento en el Molino**:
   - Descarga el trigo cosechado en la tolva de entrada del **Molino de Harina** (con aspas giratorias animadas).
   - El molino procesa el trigo y genera sacos de harina que puedes recoger en su salida.
3. **🍕 Horneado en el Horno de Leña**:
   - Lleva los sacos de harina al horno.
   - El horno hornea pizzas continuamente (con fuego animado, humo y avisos sonoros). Las pizzas terminadas se apilan en el mostrador.
4. **🚗 Venta en el Drive-Thru**:
   - Los coches llegan en fila por el carril Drive-Thru mostrando un bocadillo con su pedido (de 1 a 5 pizzas).
   - Entrega las pizzas en la ventanilla. Al completarse el pedido, el coche toca la bocina y deja montones de billetes en el asfalto.
5. **💵 Recolección de Dinero**:
   - Camina sobre los fajos de billetes caídos en el suelo para recogerlos con sonido de caja registradora y números flotantes.

---

## ⭐ Sistema de Mejoras (Upgrades) y Zonas de Compra

Pisa los **círculos dorados luminosos** en el suelo para verter tu dinero acumulado y comprar mejoras progresivas:

### 1. Personaje:
- **⚡ Velocidad de Movimiento**: Aumenta la rapidez con la que caminas por el mapa.
- **🎒 Capacidad de Carga**: Amplía el número máximo de recursos y cajas de pizza que puedes apilar en tu espalda (de 6 a más de 20).
- **⚔️ Eficiencia de la Guadaña**: Cosecha más trigo por golpe y con mayor radio de alcance.

### 2. Automatización y Empleados:
- **👨‍🌾 Granjero Bot**: Cosecha el trigo y lo lleva al molino automáticamente.
- **👨‍🍳 Cocinero**: Opera el horno acelerando el horneado y traspasando harina automáticamente.
- **👩‍💼 Cajera**: Despacha las pizzas en la ventanilla del Drive-Thru y recoge el dinero del suelo.

### 3. Negocio e Instalaciones:
- **🔥 Horno Mejorado (Nivel 2 y 3)**: Mayor capacidad de almacenamiento y tiempo de cocción ultrarrápido.
- **🚗 Segundo Carril Drive-Thru**: Abre un segundo carril paralelo para atender el doble de coches al mismo tiempo.

---

## 🍅 Desbloqueo de Nuevos Ingredientes y Recetas

- **Nivel 1 — Pizza Básica**:
  - Ingrediente: Harina de trigo 🥡.
  - Precio de venta: **$5** por pizza.
- **Nivel 2 — Huerto de Tomates (Pizza Margarita)**:
  - Ingrediente: Harina + Tomate fresco 🍅.
  - Precio de venta: **$12** por pizza.
- **Nivel 3 — Establo de Vacas (Pizza 4 Quesos)**:
  - Ingrediente: Harina + Tomate + Queso artesanal 🧀.
  - Precio de venta: **$25** por pizza.

---

## 💥 Eventos Especiales y Modos de Juego

- **🚌 Autobús de la Fiesta (Evento en Vivo)**:
  - Cada 90 segundos aparece un autobús turístico pidiendo un pedido masivo (15 pizzas) con cuenta atrás de 45 segundos.
  - ¡Cumplir la entrega dentro del tiempo otorga un **Bonus x3 de Dinero** y explosión de confeti!
- **🔥 Modo Turbo ("Fiebre de la Pizza")**:
  - Botón especial con temporizador de recarga.
  - Al activarse, duplica la velocidad del personaje y triplica la velocidad de horneado durante 10 segundos.

---

## 💾 Persistencia y Audio

- **Guardado Automático**: Todo el dinero, mejoras, empleados y niveles se guardan automáticamente en `localStorage`.
- **Efectos de Sonido Nativos**: Sintetizador procedural con Web Audio API (no requiere archivos `.mp3` externos ni descargas).

