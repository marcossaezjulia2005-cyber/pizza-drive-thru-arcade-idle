/**
 * MoneyPickup & FloatingTextManager - Gestión de dinero en el suelo y feedback numérico
 */

class FloatingText {
  constructor(x, y, text, color = '#10b981') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 0.85; // Duración en segundos
    this.maxLife = 0.85;
    this.vy = -45; // Ascenso vertical
  }

  update(dt) {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  render(ctx) {
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 18px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class FloatingTextManager {
  constructor() {
    this.texts = [];
  }

  spawn(x, y, text, color = '#34d399') {
    this.texts.push(new FloatingText(x, y, text, color));
  }

  update(dt) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.update(dt);
      if (t.life <= 0) {
        this.texts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    this.texts.forEach(t => t.render(ctx));
  }
}

class CashStack {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.targetX = x + (Math.random() - 0.5) * 50;
    this.targetY = y + (Math.random() - 0.5) * 40;
    this.currentX = x;
    this.currentY = y;
    this.value = value;

    this.radius = 16;
    this.collected = false;

    // Fisiología del desove con rebote
    this.spawnProgress = 0;
    this.magnetSpeed = 380;
  }

  update(dt, player, game, floatingTexts) {
    // Animación inicial de desove/dispersión
    if (this.spawnProgress < 1.0) {
      this.spawnProgress = Math.min(1.0, this.spawnProgress + dt * 4);
      this.currentX = this.x + (this.targetX - this.x) * this.spawnProgress;
      this.currentY = this.y + (this.targetY - this.y) * this.spawnProgress;
    }

    // Proximidad con el jugador
    const dx = player.x - this.currentX;
    const dy = player.y - this.currentY;
    const dist = Math.hypot(dx, dy);

    // Atracción magnética si está cerca (radio 65px)
    if (dist < 65) {
      this.currentX += (dx / dist) * this.magnetSpeed * dt;
      this.currentY += (dy / dist) * this.magnetSpeed * dt;

      // Colisión final / Absorción
      if (dist < 22) {
        this.collected = true;
        game.money += this.value;
        if (window.audio) window.audio.playMoney();
        floatingTexts.spawn(this.currentX, this.currentY - 10, `+$${this.value}`, '#34d399');
      }
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.currentX, this.currentY);

    // Sombra del fajo de billetes
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Billetes verdes apilados (2 capas)
    ctx.fillStyle = '#15803d';
    this.drawRoundedRect(ctx, -10, -5, 20, 11, 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    this.drawRoundedRect(ctx, -9, -7, 18, 10, 2);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Faja blanca central con símbolo $
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-3, -7, 6, 10);

    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 7px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', 0, 1);

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

class MoneyManager {
  constructor(game) {
    this.game = game;
    this.cashList = [];
    this.floatingTexts = new FloatingTextManager();
  }

  spawnCash(x, y, totalAmount) {
    // Dividir en billetes o fajos de $5 para dinamismo visual
    const numStacks = Math.max(1, Math.round(totalAmount / 5));
    const valuePerStack = totalAmount / numStacks;

    for (let i = 0; i < numStacks; i++) {
      this.cashList.push(new CashStack(x, y, valuePerStack));
    }
  }

  update(dt, player) {
    for (let i = this.cashList.length - 1; i >= 0; i--) {
      const cash = this.cashList[i];
      cash.update(dt, player, this.game, this.floatingTexts);
      if (cash.collected) {
        this.cashList.splice(i, 1);
      }
    }
    this.floatingTexts.update(dt);
  }

  render(ctx) {
    this.cashList.forEach(cash => cash.render(ctx));
    this.floatingTexts.render(ctx);
  }
}

window.MoneyManager = MoneyManager;

