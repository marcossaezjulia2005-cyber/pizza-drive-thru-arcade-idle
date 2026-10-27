/**
 * DriveThru - Gestión de vehículos, comandas y cola de espera
 */

class Vehicle {
  constructor(x, y, targetY, orderCount) {
    this.x = x;
    this.y = y;
    this.targetY = targetY;
    this.width = 54;
    this.height = 92;

    // Pedido
    this.orderCount = orderCount; // de 1 a 5 pizzas
    this.deliveredCount = 0;

    // Estado: 'moving' | 'waiting' | 'leaving'
    this.state = 'moving';
    this.speed = 220; // px/s

    // Variedad estética del vehículo
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#e11d48'];
    this.bodyColor = colors[Math.floor(Math.random() * colors.length)];
    this.roofColor = this.shadeColor(this.bodyColor, -25);
  }

  isSatisfied() {
    return this.deliveredCount >= this.orderCount;
  }

  update(dt) {
    if (this.state === 'moving') {
      if (this.y > this.targetY) {
        this.y -= this.speed * dt;
        if (this.y <= this.targetY) {
          this.y = this.targetY;
          this.state = 'waiting';
        }
      }
    } else if (this.state === 'leaving') {
      this.y -= (this.speed * 1.6) * dt;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Sombra del coche
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.drawRoundedRect(ctx, -this.width / 2 + 5, -this.height / 2 + 8, this.width, this.height, 14);
    ctx.fill();

    // 2. Chasis del vehículo
    ctx.fillStyle = this.bodyColor;
    this.drawRoundedRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Ruedas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-this.width / 2 - 4, -this.height / 2 + 12, 5, 18); // Delantera izq
    ctx.fillRect(this.width / 2 - 1, -this.height / 2 + 12, 5, 18);  // Delantera der
    ctx.fillRect(-this.width / 2 - 4, this.height / 2 - 30, 5, 18);  // Trasera izq
    ctx.fillRect(this.width / 2 - 1, this.height / 2 - 30, 5, 18);   // Trasera der

    // 4. Parabrisas delantero (curvado hacia el frente/arriba)
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    this.drawRoundedRect(ctx, -this.width / 2 + 7, -this.height / 2 + 18, this.width - 14, 16, 4);
    ctx.fill();

    // 5. Techo del coche
    ctx.fillStyle = this.roofColor;
    this.drawRoundedRect(ctx, -this.width / 2 + 8, -this.height / 2 + 32, this.width - 16, 32, 6);
    ctx.fill();

    // 6. Luna trasera
    ctx.fillStyle = '#93c5fd';
    this.drawRoundedRect(ctx, -this.width / 2 + 9, this.height / 2 - 24, this.width - 18, 10, 3);
    ctx.fill();

    // 7. Faros delanteros
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-this.width / 2 + 10, -this.height / 2 + 3, 4, 0, Math.PI * 2);
    ctx.arc(this.width / 2 - 10, -this.height / 2 + 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // 8. Luces de freno traseras
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-this.width / 2 + 8, this.height / 2 - 4, 8, 3);
    ctx.fillRect(this.width / 2 - 16, this.height / 2 - 4, 8, 3);

    // 9. Bocadillo flotante de comanda (solo si está esperando)
    if (this.state === 'waiting') {
      this.renderOrderBubble(ctx);
    }

    ctx.restore();
  }

  renderOrderBubble(ctx) {
    ctx.save();
    // Posición del bocadillo al lado izquierdo del coche (hacia la ventanilla)
    ctx.translate(-this.width / 2 - 32, 0);

    // Fondo del bocadillo blanco
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.drawRoundedRect(ctx, -30, -22, 60, 44, 10);
    ctx.fill();
    ctx.stroke();

    // Flecha indicadora del bocadillo
    ctx.beginPath();
    ctx.moveTo(30, -5);
    ctx.lineTo(38, 0);
    ctx.lineTo(30, 5);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Icono de pizza
    ctx.font = '16px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍕', 0, -2);

    // Conteo comanda (entregadas / solicitadas)
    ctx.fillStyle = this.deliveredCount === this.orderCount ? '#16a34a' : '#ea580c';
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillText(`${this.deliveredCount}/${this.orderCount}`, 0, 15);

    ctx.restore();
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  shadeColor(color, percent) {
    let num = parseInt(color.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}

/**
 * DriveThruSystem - Gestiona la cola de coches y la entrega de pedidos
 */
class DriveThruSystem {
  constructor(game) {
    this.game = game;
    this.laneX = 1090; // Centro del carril Drive-Thru
    this.maxQueue = 3;  // Máximo 3 coches en espera (RF-03/04)

    // Posiciones Y de cada puesto en la cola
    this.queueSlotsY = [440, 610, 780];

    this.vehicles = [];
    this.spawnTimer = 1.0; // Spawnea rápido el primer coche
    this.spawnInterval = 3.5;

    // Ventanilla de entrega del lado de la cocina
    this.serviceZone = { x: 940, y: 440, radius: 44 };
    this.transferCooldown = 0;
  }

  update(dt, player, moneyManager) {
    // 1. Spawner automático si hay hueco en la cola
    if (this.vehicles.length < this.maxQueue) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnVehicle();
        this.spawnTimer = this.spawnInterval;
      }
    }

    // 2. Actualizar posiciones de destino y estados de cada coche
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      if (v.state !== 'leaving') {
        v.targetY = this.queueSlotsY[i];
      }
      v.update(dt);
    }

    // 3. Eliminar coches que ya salieron de la pantalla (y < -150)
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      if (this.vehicles[i].y < -150) {
        this.vehicles.splice(i, 1);
      }
    }

    // 4. Proceso de entrega de pedidos al coche en cabecera (slot 0)
    if (this.transferCooldown > 0) {
      this.transferCooldown -= dt;
    }

    const headVehicle = this.vehicles[0];
    if (headVehicle && headVehicle.state === 'waiting' && !headVehicle.isSatisfied()) {
      // Comprobar si el jugador está en la zona de servicio de la ventanilla
      const dist = Math.hypot(player.x - this.serviceZone.x, player.y - this.serviceZone.y);
      if (dist <= this.serviceZone.radius && this.transferCooldown <= 0) {
        // Extraer una pizza de la mochila del jugador
        const pizzaItem = player.popItem('pizza');
        if (pizzaItem) {
          headVehicle.deliveredCount++;
          this.transferCooldown = 0.22; // Ritmo ágil de entrega
          if (window.audio) window.audio.playPickup(1.3);

          // Si completó el pedido
          if (headVehicle.isSatisfied()) {
            this.completeOrder(headVehicle, moneyManager);
          }
        }
      }
    }
  }

  spawnVehicle() {
    const order = Math.floor(Math.random() * 5) + 1; // 1 a 5 pizzas (RF-03/04)
    const spawnY = 1100; // Entran desde abajo
    const targetSlotIndex = this.vehicles.length;
    const targetY = this.queueSlotsY[targetSlotIndex];

    const v = new Vehicle(this.laneX, spawnY, targetY, order);
    this.vehicles.push(v);
  }

  completeOrder(vehicle, moneyManager) {
    vehicle.state = 'leaving';

    // Bocina del coche complacido
    if (window.audio) window.audio.playHorn();

    // Bonificación triple si es el autobús turístico
    const multiplier = vehicle.isBus ? 3 : 1;
    const rewardPerPizza = 5 * multiplier;
    const totalMoney = vehicle.orderCount * rewardPerPizza;

    if (vehicle.isBus && this.game.specialEvents) {
      this.game.specialEvents.triggerConfetti(960, 440);
      if (this.game.moneyManager) {
        this.game.moneyManager.floatingTexts.spawn(940, 410, '🎉 ¡BONUS TRIPLE BUS x3! 🎉', '#facc15');
      }
    }

    if (moneyManager) {
      moneyManager.spawnCash(955, 440, totalMoney);
    }
  }

  render(ctx) {
    // 1. Zona de ventanilla interactiva en la cocina
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(this.serviceZone.x, this.serviceZone.y, this.serviceZone.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍕 Entrega Ventanilla', this.serviceZone.x, this.serviceZone.y - this.serviceZone.radius - 6);
    ctx.restore();

    // 2. Renderizar todos los vehículos
    this.vehicles.forEach(v => v.render(ctx));
  }
}

window.DriveThruSystem = DriveThruSystem;
