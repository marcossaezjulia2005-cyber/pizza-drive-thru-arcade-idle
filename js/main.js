/**
 * Main - Orquestador y Game Loop principal de Pizza Drive-Thru
 */
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Inicializar mundo y cámara
    this.map = new GameMap(1400, 1000);
    this.camera = new Camera2D(window.innerWidth, window.innerHeight);
    this.camera.setWorldBounds(this.map.width, this.map.height);

    // Inicializar jugador (Spawn cerca del trigo y el molino)
    this.player = new Player(250, 420);

    // Inicializar estaciones de la Fase 1
    // Parcela de trigo en la zona verde izquierda
    this.wheatField = new WheatField(70, 240, 4, 4);

    // Molino de harina en la zona intermedia (x: 420, y: 260)
    this.mill = new Mill(420, 260);

    // Horno de pizza en la cocina (x: 780, y: 260)
    this.oven = new Oven(780, 260);

    // Sistema de dinero y textos flotantes
    this.moneyManager = new MoneyManager(this);

    // Sistema de Empleados Automatizados (FSM)
    this.employeeManager = new EmployeeManager(this);

    // Sistema de Upgrades y zonas de compra en suelo
    this.upgradeManager = new UpgradeManager(this);

    // Sistema de Drive-Thru y coches
    this.driveThru = new DriveThruSystem(this);

    // Nuevos ingredientes (Fase 4)
    this.tomatoPatch = new TomatoPatch(70, 470, 2, 4);
    this.cheeseStation = new CheeseStation(640, 160);

    // Eventos Especiales (Autobus y Modo Turbo)
    this.specialEvents = new SpecialEventManager(this);

    // Sistema de Persistencia (localStorage)
    this.saveSystem = new SaveSystem(this);

    // Estado económico y progreso
    this.money = 0;

    // Control de tiempo para delta time
    this.lastTime = performance.now();
    this.gameTime = 0;

    // Vincular redimensionamiento de ventana
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Botón de silenciar audio
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = window.audio.toggleMute();
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // Cargar partida guardada si existe
    this.saveSystem.load();

    // Iniciar bucle
    requestAnimationFrame((t) => this.loop(t));
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    this.camera.resize(w, h);
  }

  update(dt) {
    this.gameTime += dt;

    // 1. Obtener vector de entrada del jugador
    const inputVec = window.input ? window.input.getVector() : { x: 0, y: 0 };

    // 2. Actualizar jugador
    this.player.update(dt, inputVec, this.map);

    // 3. Actualizar estaciones de trabajo
    this.wheatField.update(dt, this.player);
    this.mill.update(dt, this.player);
    this.oven.update(dt, this.player);

    // 4. Actualizar Drive-Thru y Dinero
    this.driveThru.update(dt, this.player, this.moneyManager);
    this.moneyManager.update(dt, this.player);

    // 5. Actualizar Zonas de Mejora y Empleados Automatizados
    this.upgradeManager.update(dt, this.player);
    this.employeeManager.update(dt);

    // 6. Actualizar Nuevos Ingredientes, Eventos y Guardado (Fase 4)
    this.tomatoPatch.update(dt, this.player);
    this.cheeseStation.update(dt, this.player);
    this.specialEvents.update(dt);
    this.saveSystem.update(dt);

    // 6. Actualizar cámara suave centrada en el jugador
    this.camera.update(this.player.x, this.player.y);

    // 7. Actualizar HUD en pantalla
    this.updateHUD();
  }

  render() {
    // Limpiar pantalla
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    // Aplicar traslación de la cámara
    this.camera.apply(this.ctx);

    // Capa 1: Mapa (Suelo, cocina, asfalto, muros)
    this.map.render(this.ctx);

    // Capa 2: Zonas de Upgrade en el suelo
    this.upgradeManager.render(this.ctx);

    // Capa 3: Estaciones de producción e ingredientes
    this.wheatField.render(this.ctx, this.gameTime);
    this.tomatoPatch.render(this.ctx);
    this.cheeseStation.render(this.ctx);
    this.mill.render(this.ctx);
    this.oven.render(this.ctx);

    // Capa 4: Vehículos y carril Drive-Thru
    this.driveThru.render(this.ctx);

    // Capa 5: Fajos de dinero y textos flotantes
    this.moneyManager.render(this.ctx);

    // Capa 6: Empleados automatizados
    this.employeeManager.render(this.ctx);

    // Capa 7: Jugador con su pila en la espalda
    this.player.render(this.ctx);

    // Capa 8: Efectos de Eventos Especiales (Confeti y Modo Turbo)
    this.specialEvents.render(this.ctx);

    this.ctx.restore();
  }

  updateHUD() {
    // Conteo en inventario del jugador
    const wheatCount = this.player.countItem('wheat');
    const flourCount = this.player.countItem('flour');
    const pizzaCount = this.player.countItem('pizza');
    const tomatoCount = this.player.countItem('tomato');
    const cheeseCount = this.player.countItem('cheese');
    const totalStack = this.player.stack.length;
    const maxCapacity = this.player.maxCapacity;

    const wheatEl = document.getElementById('hud-wheat');
    const flourEl = document.getElementById('hud-flour');
    const pizzaEl = document.getElementById('hud-pizza');
    const tomatoEl = document.getElementById('hud-tomato');
    const cheeseEl = document.getElementById('hud-cheese');
    const capacityEl = document.getElementById('hud-capacity');
    const moneyEl = document.getElementById('hud-money');

    if (wheatEl) wheatEl.textContent = wheatCount;
    if (flourEl) flourEl.textContent = flourCount;
    if (pizzaEl) pizzaEl.textContent = pizzaCount;
    if (tomatoEl) tomatoEl.textContent = tomatoCount;
    if (cheeseEl) cheeseEl.textContent = cheeseCount;
    if (capacityEl) {
      capacityEl.textContent = `${totalStack}/${maxCapacity}`;
      capacityEl.style.color = totalStack >= maxCapacity ? '#ef4444' : '#ffffff';
    }
    if (moneyEl) moneyEl.textContent = `$${this.money}`;
  }

  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Clamp para evitar saltos
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Iniciar al cargar la ventana
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});

