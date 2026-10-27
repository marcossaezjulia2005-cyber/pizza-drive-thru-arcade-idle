# 📋 Backlog del Proyecto: Pizza Drive-Thru Arcade Idle

> **Estado general del proyecto**: ¡Completado y publicado al 100%! 🍕🏆  
> **Todas las fases**: **Fase 1**, **Fase 2**, **Fase 3** y **Fase 4** ✅  
> **Última actualización**: 2026-10-27

---

## 📌 Resumen de Fases

| Fase | Descripción | Estado |
| :--- | :--- | :--- |
| **Fase 1** | MVT Core Loop (Entorno, Movimiento, Pila, Trigo, Molino, Horno) | 🟢 **Completada** |
| **Fase 2** | Drive-Thru, Clientes, Pedidos y Sistema de Dinero | 🟢 **Completada** |
| **Fase 3** | Árbol de Upgrades y Automatización (Granjero, Cocinero, Cajera) | 🟢 **Completada** |
| **Fase 4** | Recetas (Tomate/Queso), Eventos Especiales, Audio y Persistencia | 🟢 **Completada** |

---

## 🚀 Desglose Detallado de Tareas

### 🟢 FASE 1: MVT Core Loop (Movimiento y Cadena Productiva) — COMPLETADA ✅
- [x] **1.1 Infraestructura Base y Setup Web**:
  - [x] Canvas responsivo con soporte Retina/DPI y redimensionamiento dinámico.
  - [x] `GameLoop` desacoplado con cálculo de `deltaTime`.
- [x] **1.2 Entrada y Control**:
  - [x] `InputManager` para teclado (WASD / Flechas) y joystick virtual para móviles.
- [x] **1.3 Jugador y Sistema de Inventario Pila**:
  - [x] Avatar procedural con gorro de chef y animación de pasos.
  - [x] Movimiento fluido (150 px/s base) con colisiones AABB contra obstáculos y mapa.
  - [x] Pila física en la espalda con capacidad máxima base (5 unidades) y bamboleo elástico.
- [x] **1.4 Escenario y Mapa**:
  - [x] Huerto de trigo, molino con aspas, cocina con horno de piedra y carril asfaltado.
  - [x] Cámara 2D con seguimiento suave (lerp).
- [x] **1.5 Cadena de Producción (Trigo → Harina → Horno)**:
  - [x] **Campo de Trigo**: Cosecha automática con guadaña, cooldown de 3.0s y partículas.
  - [x] **Molino**: Aspas giratorias, tolva de entrada (trigo), proceso de 1.5s y tolva de salida (harina).
  - [x] **Horno**: Hoguera, partículas de humo/chispas, cocción (2.0s por pizza, máx. 10) y bandeja de salida.
  - [x] **Audio**: Sintetizador Web Audio API procedural.

---

### 🟢 FASE 2: Drive-Thru, Pedidos y Dinero — COMPLETADA ✅
- [x] **2.1 Spawner y Cola de Vehículos**:
  - [x] Hasta 3 coches simultáneos en el carril con detención en cola y diseños variados.
- [x] **2.2 Sistema de Pedidos (Comandas)**:
  - [x] Bocadillo flotante sobre el vehículo con icono 🍕 y conteo (1 a 5 pizzas).
- [x] **2.3 Ventanilla de Entrega**:
  - [x] Zona de servicio en la ventanilla (`🍕 Entrega Ventanilla`).
  - [x] Entrega secuencial rápida de pizzas desde la espalda del jugador.
- [x] **2.4 Sistema Económico y Recolección de Dinero**:
  - [x] Suelta de billetes verdes ($5/pizza) en la repisa de la ventanilla con claxon del coche.
  - [x] Absorción magnética de billetes al aproximarse con sonido de caja registradora.
  - [x] Textos flotantes ascendentes `+$X` y saldo actualizado en el HUD.

---

### 🟢 FASE 3: Upgrades y Empleados Automatizados — COMPLETADA ✅
- [x] **3.1 Círculos de Mejora Interactivos en Suelo**:
  - [x] Círculos dorados luminosos con vertido progresivo de dinero al pisarlos.
  - [x] Fórmula de costes escalonados ($C_n = C_0 \times 1.15^n$) y barra radial de progreso de compra.
- [x] **3.2 Árbol de Mejoras del Jugador**:
  - [x] ⚡ **Velocidad de Movimiento**: +20% por nivel acumulativo.
  - [x] 🎒 **Capacidad de Carga**: +3 slots adicionales por nivel en la mochila.
  - [x] 🔥 **Horno Rápido**: -25% de tiempo de cocción por nivel.
- [x] **3.3 Automatización y Empleados (IA con FSM)**:
  - [x] 👨‍🌾 **Granjero Bot**: Sombrero de paja y peto, siega trigo crecido y abastece la entrada del molino.
  - [x] 👨‍🍳 **Cocinero**: Delantal y gorro chef, traslada sacos de harina del molino al horno continuamente.
  - [x] 👩‍💼 **Cajera**: Uniforme con visera, toma pizzas del horno, las sirve en la ventanilla del Drive-Thru y recoge el dinero del suelo.

---

### 🟢 FASE 4: Recetas, Eventos Especiales, Audio y Guardado — COMPLETADA ✅
- [x] **4.1 Nuevos Ingredientes y Recetas**:
  - [x] 🍅 **Huerto de Tomates**: Desbloqueable ($150), cosecha de tomates frescos.
  - [x] 🧀 **Quesería Artesanal**: Desbloqueable ($250), producción de cuñas de queso.
  - [x] **Tabla de Recetas en el Horno**:
    - Pizza Básica (1 Harina) $\rightarrow$ **$5**
    - Pizza Margarita (1 Harina + 1 Tomate) $\rightarrow$ **$12**
    - Pizza 4 Quesos (1 Harina + 1 Tomate + 1 Queso) $\rightarrow$ **$25**
- [x] **4.2 Eventos Especiales**:
  - [x] 🚌 **Autobús Turístico**: Aparición periódica, comanda masiva de 15 pizzas con cuenta atrás de 45s, recompensa **Triple (x3)** y explosión de confeti de colores.
  - [x] 🔥 **Modo Turbo ("Fiebre de la Pizza")**: Botón con cooldown (60s), velocidad acelerada (x1.8) y cocción ultrarrápida durante 10s con aura de fuego.
- [x] **4.3 Audio Procedural (Web Audio API)**:
  - [x] Sonidos para horneado, caja, corte, claxon y fanfarria.
- [x] **4.4 Persistencia**:
  - [x] Guardado automático en `localStorage` (dinero, niveles de mejora y empleados).
  - [x] Botón de reinicio de partida (🔄).
