# 📋 Backlog del Proyecto: Pizza Drive-Thru Arcade Idle

> **Estado general del proyecto**: En desarrollo 🚀  
> **Fases completadas**: **Fase 1 (MVT Core Loop)** y **Fase 2 (Drive-Thru, Clientes y Ventas)** ✅  
> **Última actualización**: 2026-10-27

---

## 📌 Resumen de Fases

| Fase | Descripción | Estado |
| :--- | :--- | :--- |
| **Fase 1** | MVT Core Loop (Entorno, Movimiento, Pila, Trigo, Molino, Horno) | 🟢 **Completada** |
| **Fase 2** | Drive-Thru, Clientes, Pedidos y Sistema de Dinero | 🟢 **Completada** |
| **Fase 3** | Árbol de Upgrades y Automatización (Granjero, Cocinero, Cajera) | 🟡 **Siguiente en cola** |
| **Fase 4** | Recetas (Tomate/Queso), Eventos Especiales, Audio y Persistencia | ⚪ Pendiente |

---

## 🚀 Desglose Detallado de Tareas

### 🟢 FASE 1: MVT Core Loop (Movimiento y Cadena Productiva) — COMPLETADA ✅
- [x] **1.1 Infraestructura Base y Setup Web**:
  - [x] Crear estructura de archivos (`index.html`, `css/styles.css`, scripts en `js/`).
  - [x] Configurar Canvas con soporte de alta densidad (Retina/DPI) y redimensionamiento responsivo.
  - [x] Implementar `GameLoop` con cálculo preciso de `deltaTime`.
- [x] **1.2 Entrada y Control**:
  - [x] `InputManager`: Captura de teclado (WASD / Flechas) y normalización en 8 direcciones.
  - [x] Joystick virtual flotante para dispositivos táctiles y móviles.
- [x] **1.3 Jugador y Sistema de Inventario Pila**:
  - [x] Renderizado procedural del avatar (cuerpo, gorro de chef, orientación visual).
  - [x] Movimiento fluido con velocidad base (150 px/s) y colisiones AABB con el mapa.
  - [x] `InventoryStack`: Pila física en la espalda con capacidad máxima (5 slots base) y animación elástica.
- [x] **1.4 Escenario y Mapa**:
  - [x] Dibujo de zonas: parcela de cultivo de trigo, molino de harina, cocina con horno de leña, carril Drive-Thru asfaltado.
  - [x] Sistema de cámara 2D con seguimiento suave (lerp) del jugador.
- [x] **1.5 Cadena de Producción (Trigo → Harina → Horno)**:
  - [x] **Campo de Trigo**: Tallos animados, siega automática por cercanía (guadaña con animación y sonido), cooldown de 3.0s y partículas.
  - [x] **Molino de Harina**: Aspas giratorias continuas, tolva de entrada (trigo), proceso de 1.5s y tolva de salida (sacos de harina).
  - [x] **Horno de Leña**: Hoguera con partículas de humo/chispas, entrada de harina, horneado (2.0s por pizza, máx. 10) y bandeja de salida.
  - [x] **Sintetizador Web Audio API**: Efectos de corte, recogida en espalda, descarga y aviso de horneado listo.

---

### 🟢 FASE 2: Drive-Thru, Pedidos y Dinero — COMPLETADA ✅
- [x] **2.1 Spawner y Cola de Vehículos**:
  - [x] Spawner con hasta 3 coches en cola en el carril de asfalto.
  - [x] Diseños procedurales con variedad de colores (deportivo rojo, azul eléctrico, verde, amarillo, etc.), lunas, techo y luces.
  - [x] Movimiento y detención fluida en cada posición de la fila.
- [x] **2.2 Sistema de Pedidos (Comandas)**:
  - [x] Bocadillo flotante interactivo sobre el coche en ventanilla con icono 🍕 y progreso `entregadas/solicitadas` (1 a 5 pizzas).
- [x] **2.3 Ventanilla de Entrega**:
  - [x] Zona de servicio en la ventanilla de la cocina (`x: 940, y: 440`).
  - [x] Transferencia secuencial rápida de pizzas desde la espalda del jugador hacia el vehículo.
- [x] **2.4 Sistema Económico y Recolección de Dinero**:
  - [x] Al completar la entrega, el coche toca la bocina (`playHorn`) y acelera hacia la salida.
  - [x] Desove de fajos de billetes verdes ($5 por pizza) en la repisa de la ventanilla.
  - [x] Recolección magnética al acercarse con sonido de caja registradora (`playMoney`).
  - [x] Textos flotantes ascendentes `+$X` con sombreado y desvanecimiento.
  - [x] Actualización en vivo del saldo en la caja del HUD.

---

### ⚪ FASE 3: Upgrades y Empleados Automatizados (Próximo paso)
- [ ] **3.1 Círculos de Mejora Interactivos**:
  - [ ] Zonas de compra circulares en el suelo con llenado gradual de dinero al pisarlas.
  - [ ] Fórmula de costes escalonados ($C_n = C_0 \times 1.15^n$).
- [ ] **3.2 Árbol de Mejoras del Jugador**:
  - [ ] Velocidad de movimiento (+20% por nivel).
  - [ ] Capacidad de carga (+3 slots por nivel).
  - [ ] Eficiencia de guadaña.
- [ ] **3.3 Automatización y Empleados (FSM)**:
  - [ ] 👨‍🌾 **Granjero Bot**: Siega trigo y abastece la tolva del molino.
  - [ ] 👨‍🍳 **Cocinero**: Traslada harina del molino al horno y acelera la cocción.
  - [ ] 👩‍💼 **Cajera**: Toma pizzas del mostrador, entrega a los coches y recoge dinero del suelo.
- [ ] **3.4 Mejoras de Instalaciones**:
  - [ ] Mejora de capacidad y velocidad del horno (Niveles 2 y 3).
  - [ ] Apertura del **segundo carril Drive-Thru**.

---

### ⚪ FASE 4: Recetas, Eventos Especiales, Audio y Guardado
- [ ] **4.1 Nuevos Ingredientes y Recetas**:
  - [ ] Huerto de Tomates $\rightarrow$ Pizza Margarita ($12).
  - [ ] Establo de Vacas / Quesería $\rightarrow$ Pizza 4 Quesos ($25).
- [ ] **4.2 Eventos Especiales**:
  - [ ] 🚌 **Autobús Turístico**: Evento cada 90-180s, comanda masiva de 15 pizzas en 45s, recompensa triple y confeti.
  - [ ] 🔥 **Modo Turbo ("Fiebre de la Pizza")**: Doble velocidad y horneado $\times 3$ durante 10s (cooldown 60s).
- [ ] **4.3 Audio Procedural (Web Audio API)**:
  - [ ] Efectos ampliados (turbomodo, confeti, bus).
- [ ] **4.4 Persistencia**:
  - [ ] Guardado automático en `localStorage` (progreso, dinero, niveles de mejora y empleados).
  - [ ] Botón de reinicio de partida.
