/**
 * SpecialEvents - Gestión del Autobús Turístico y Modo Turbo ("Fiebre de la Pizza")
 */

class ConfettiParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 260;
    this.vy = -Math.random() * 200 - 80;
    this.gravity = 240;
    this.size = Math.random() * 6 + 4;
    this.color = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)];
    this.life = 2.0;
    this.maxLife = 2.0;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 10;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.rotation += this.rotSpeed * dt;
    this.life -= dt;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

class TourBus {
  constructor(x, y, targetY, orderCount = 15) {
    this.x = x;
    this.y = y;
    this.targetY = targetY;
    this.width = 66;
    this.height = 150;
    this.orderCount = orderCount;
    this.deliveredCount = 0;
    this.state = 'moving'; // 'moving' | 'waiting' | 'leaving'
    this.speed = 180;
    this.isBus = true;

    this.timer = 45.0; // 45 segundos para cumplir el pedido
    this.timeExpired = false;
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
    } else if (this.state === 'waiting') {
      this.timer -= dt;
      if (this.timer <= 0 && !this.isSatisfied()) {
        this.timeExpired = true;
        this.state = 'leaving'; // Se marcha enfadado por tiempo agotado
      }
    } else if (this.state === 'leaving') {
      this.y -= (this.speed * 1.5) * dt;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Sombra alargada
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.drawRoundedRect(ctx, -this.width / 2 + 6, -this.height / 2 + 10, this.width, this.height, 16);
    ctx.fill();

    // 2. Chasis del autobús (amarillo fiesta)
    ctx.fillStyle = '#eab308';
    this.drawRoundedRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 14);
    ctx.fill();
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Rayas decorativas moradas
    ctx.fillStyle = '#9333ea';
    ctx.fillRect(-this.width / 2, -15, this.width, 24);

    // 4. Cartel luminoso frontal
    ctx.fillStyle = '#1e1b4b';
    this.drawRoundedRect(ctx, -this.width / 2 + 8, -this.height / 2 + 10, this.width - 16, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARTY BUS 🚌', 0, -this.height / 2 + 24);

    // 5. Ventanillas laterales
    ctx.fillStyle = '#bae6fd';
    for (let i = 0; i < 4; i++) {
      const wY = -this.height / 2 + 40 + i * 24;
      this.drawRoundedRect(ctx, -this.width / 2 + 6, wY, 12, 16, 3);
      ctx.fill();
      this.drawRoundedRect(ctx, this.width / 2 - 18, wY, 12, 16, 3);
      ctx.fill();
    }

    // 6. Bocadillo de comanda y cuenta atrás
    if (this.state === 'waiting') {
      this.renderBusBubble(ctx);
    }

    ctx.restore();
  }

  renderBusBubble(ctx) {
    ctx.save();
    ctx.translate(-this.width / 2 - 38, -10);

    // Fondo del bocadillo
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    this.drawRoundedRect(ctx, -38, -32, 76, 64, 12);
    ctx.fill();
    ctx.stroke();

    // Icono y título
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 12px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡EVENTO BUS!', 0, -14);

    // Progreso
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Fredoka, sans-serif';
    ctx.fillText(`🍕 ${this.deliveredCount}/${this.orderCount}`, 0, 6);

    // Cuenta atrás
    const secs = Math.max(0, Math.ceil(this.timer));
    ctx.fillStyle = secs < 10 ? '#ef4444' : '#38bdf8';
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillText(`⏱️ ${secs}s`, 0, 24);

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
}

class SpecialEventManager {
  constructor(game) {
    this.game = game;

    // Temporizador para el autobús (cada 90s)
    this.busInterval = 90.0;
    this.busTimer = 45.0; // El primero aparece a los 45s de partida
    this.activeBus = null;

    // Modo Turbo ("Fiebre de la Pizza")
    this.turboActive = false;
    this.turboDuration = 10.0;
    this.turboTimer = 0;
    this.turboCooldownTime = 60.0;
    this.turboCooldown = 0;

    // Partículas de confeti
    this.confetti = [];

    this.initTurboButton();
  }

  initTurboButton() {
    const btn = document.getElementById('turbo-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.activateTurbo();
      });
    }
  }

  activateTurbo() {
    if (this.turboActive || this.turboCooldown > 0) return;

    this.turboActive = true;
    this.turboTimer = this.turboDuration;
    if (window.audio) window.audio.playDing();

    // Notificación en pantalla
    if (this.game.moneyManager) {
      this.game.moneyManager.floatingTexts.spawn(this.game.player.x, this.game.player.y - 40, '🔥 ¡FIEBRE DE LA PIZZA! x2 VELOCIDAD', '#f97316');
    }
  }

  triggerConfetti(x, y) {
    for (let i = 0; i < 45; i++) {
      this.confetti.push(new ConfettiParticle(x, y));
    }
  }

  update(dt) {
    // 1. Gestión del Modo Turbo
    if (this.turboActive) {
      this.turboTimer -= dt;
      if (this.turboTimer <= 0) {
        this.turboActive = false;
        this.turboCooldown = this.turboCooldownTime;
      }
    } else if (this.turboCooldown > 0) {
      this.turboCooldown = Math.max(0, this.turboCooldown - dt);
    }

    // Actualizar botón UI de Turbo
    const btn = document.getElementById('turbo-btn');
    const label = document.getElementById('turbo-timer-label');
    if (btn && label) {
      if (this.turboActive) {
        btn.classList.add('ring-4', 'ring-orange-500', 'animate-pulse');
        label.textContent = `🔥 ACTIVO (${Math.ceil(this.turboTimer)}s)`;
      } else if (this.turboCooldown > 0) {
        btn.classList.remove('ring-4', 'ring-orange-500', 'animate-pulse');
        label.textContent = `⏳ ${Math.ceil(this.turboCooldown)}s`;
        btn.style.opacity = '0.55';
      } else {
        btn.classList.remove('ring-4', 'ring-orange-500', 'animate-pulse');
        label.textContent = `🔥 ¡TURBO!`;
        btn.style.opacity = '1.0';
      }
    }

    // 2. Multiplicadores por Turbo
    const speedMultiplier = this.turboActive ? 1.8 : 1.0;
    this.game.player.speed = this.game.player.baseSpeed * (1 + (this.game.upgradeManager.zones[0].level || 0) * 0.20) * speedMultiplier;

    // 3. Temporizador de Autobús
    if (!this.activeBus) {
      this.busTimer -= dt;
      if (this.busTimer <= 0 && this.game.driveThru.vehicles.length === 0) {
        // Spawnea el autobús
        this.activeBus = new TourBus(1090, 1150, 440, 15);
        this.game.driveThru.vehicles.unshift(this.activeBus);
        this.busTimer = this.busInterval;

        if (window.audio) window.audio.playHorn();
        if (this.game.moneyManager) {
          this.game.moneyManager.floatingTexts.spawn(940, 400, '🚌 ¡LLEGÓ EL AUTOBÚS TURÍSTICO! (x3 BONUS)', '#facc15');
        }
      }
    } else {
      // Si el bus ya terminó o se marchó
      if (this.activeBus.state === 'leaving' && this.activeBus.y < -160) {
        this.activeBus = null;
      }
    }

    // 4. Actualizar partículas de confeti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const p = this.confetti[i];
      p.update(dt);
      if (p.life <= 0) {
        this.confetti.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // Renderizar confeti
    this.confetti.forEach(p => p.render(ctx));

    // Efecto visual dorado/fuego en bordes si el Modo Turbo está activo
    if (this.turboActive) {
      ctx.save();
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.35)';
      ctx.lineWidth = 14;
      ctx.strokeRect(0, 0, this.game.map.width, this.game.map.height);
      ctx.restore();
    }
  }
}

window.SpecialEventManager = SpecialEventManager;

