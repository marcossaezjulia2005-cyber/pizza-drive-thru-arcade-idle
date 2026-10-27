/**
 * Upgrades - Sistema de zonas de mejora progresivas en el suelo
 * Fórmula según especificaciones: Cn = C0 * 1.15^n
 */

class UpgradeZone {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius || 32;
    this.id = options.id;
    this.name = options.name;
    this.icon = options.icon;
    this.color = options.color || '#f59e0b'; // Dorado por defecto

    this.baseCost = options.baseCost;
    this.level = 0;
    this.maxLevel = options.maxLevel || 999;
    this.isOneTime = options.isOneTime || false; // Para contratación de empleados

    this.invested = 0;
    this.onUpgrade = options.onUpgrade;

    this.transferTimer = 0;
  }

  getCurrentCost() {
    if (this.isOneTime) return this.baseCost;
    return Math.round(this.baseCost * Math.pow(1.15, this.level));
  }

  isMaxed() {
    return this.level >= this.maxLevel;
  }

  update(dt, player, game) {
    if (this.isMaxed()) return;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    const inZone = dist <= this.radius;

    if (inZone && game.money > 0) {
      this.transferTimer -= dt;
      if (this.transferTimer <= 0) {
        const cost = this.getCurrentCost();
        const needed = cost - this.invested;

        // Ritmo de transferencia proporcional para fluidez
        const transferAmount = Math.min(game.money, Math.max(1, Math.ceil(needed / 10)));

        game.money -= transferAmount;
        this.invested += transferAmount;
        this.transferTimer = 0.06;

        if (window.audio) window.audio.playPickup(1.5);

        // Feedback de texto flotante
        if (game.moneyManager && game.moneyManager.floatingTexts) {
          game.moneyManager.floatingTexts.spawn(this.x, this.y - 30, `-$${transferAmount}`, '#f59e0b');
        }

        // ¿Mejora completada?
        if (this.invested >= cost) {
          this.level++;
          this.invested = 0;
          if (this.onUpgrade) {
            this.onUpgrade(this.level, game);
          }
          if (window.audio) window.audio.playDing();
        }
      }
    } else {
      this.transferTimer = 0;
    }
  }

  render(ctx) {
    if (this.isMaxed()) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const cost = this.getCurrentCost();
    const progress = this.invested / cost;

    // 1. Círculo exterior luminoso pulsante
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color + '18';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Arco de progreso de compra
    if (progress > 0) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius - 1, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.stroke();
    }

    // 3. Icono central
    ctx.font = '20px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.icon, 0, -4);

    // 4. Nombre y nivel
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    const lvlText = this.isOneTime ? '' : ` (Nv. ${this.level + 1})`;
    ctx.fillText(this.name + lvlText, 0, this.radius + 14);

    // 5. Precio restante
    const remaining = cost - this.invested;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillText(`$${remaining}`, 0, 16);

    ctx.restore();
  }
}

class UpgradeManager {
  constructor(game) {
    this.game = game;
    this.zones = [];
    this.initZones();
  }

  initZones() {
    // 1. Velocidad del Jugador (+20% por nivel)
    this.zones.push(new UpgradeZone({
      id: 'player_speed',
      name: 'Velocidad',
      icon: '⚡',
      color: '#38bdf8',
      x: 370,
      y: 770,
      baseCost: 15,
      maxLevel: 10,
      onUpgrade: (level, game) => {
        game.player.speed = game.player.baseSpeed * (1 + level * 0.20);
      }
    }));

    // 2. Capacidad de Carga Mochila (+3 slots por nivel)
    this.zones.push(new UpgradeZone({
      id: 'player_capacity',
      name: 'Mochila',
      icon: '🎒',
      color: '#a855f7',
      x: 480,
      y: 770,
      baseCost: 20,
      maxLevel: 10,
      onUpgrade: (level, game) => {
        game.player.maxCapacity = 5 + level * 3;
      }
    }));

    // 3. Velocidad del Horno (-25% de tiempo de cocción)
    this.zones.push(new UpgradeZone({
      id: 'oven_speed',
      name: 'Horno Rápido',
      icon: '🔥',
      color: '#f97316',
      x: 590,
      y: 770,
      baseCost: 30,
      maxLevel: 5,
      onUpgrade: (level, game) => {
        game.oven.cookTime = Math.max(0.6, 2.0 * Math.pow(0.75, level));
      }
    }));

    // 4. Contratar Granjero Bot (Automatización trigo -> molino)
    this.zones.push(new UpgradeZone({
      id: 'hire_farmer',
      name: 'Granjero',
      icon: '👨‍🌾',
      color: '#84cc16',
      x: 210,
      y: 470,
      baseCost: 50,
      isOneTime: true,
      maxLevel: 1,
      onUpgrade: (level, game) => {
        if (game.employeeManager) {
          game.employeeManager.unlockFarmer();
        }
      }
    }));

    // 5. Contratar Cocinero (Automatización molino -> horno)
    this.zones.push(new UpgradeZone({
      id: 'hire_cook',
      name: 'Cocinero',
      icon: '👨‍🍳',
      color: '#e11d48',
      x: 600,
      y: 460,
      baseCost: 80,
      isOneTime: true,
      maxLevel: 1,
      onUpgrade: (level, game) => {
        if (game.employeeManager) {
          game.employeeManager.unlockCook();
        }
      }
    }));

    // 6. Contratar Cajera (Automatización horno -> Drive-Thru y cobro)
    this.zones.push(new UpgradeZone({
      id: 'hire_cashier',
      name: 'Cajera',
      icon: '👩‍💼',
      color: '#ec4899',
      x: 880,
      y: 560,
      baseCost: 120,
      isOneTime: true,
      maxLevel: 1,
      onUpgrade: (level, game) => {
        if (game.employeeManager) {
          game.employeeManager.unlockCashier();
        }
      }
    }));
  }

  update(dt, player) {
    this.zones.forEach(zone => zone.update(dt, player, this.game));
  }

  render(ctx) {
    this.zones.forEach(zone => zone.render(ctx));
  }
}

window.UpgradeManager = UpgradeManager;

