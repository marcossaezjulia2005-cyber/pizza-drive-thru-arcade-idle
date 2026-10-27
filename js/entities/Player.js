/**
 * Player - Entidad del jugador con movimiento, colisiones e inventario de pila apilada
 */
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 22; // Radio de colisión circular / caja AABB
    this.facingAngle = 0; // Ángulo de orientación en radianes

    // Estadísticas base según especificaciones RF-01.3
    this.baseSpeed = 150; // px/s
    this.speed = this.baseSpeed;
    this.maxCapacity = 5; // Capacidad base de carga (5 unidades)
    this.toolEfficiency = 1; // Eficiencia de siega

    // Inventario tipo Pila (Stack)
    this.stack = []; // Elementos: { type: 'wheat'|'flour'|'pizza' }

    // Animación y visuales
    this.walkCycle = 0;
    this.isMoving = false;
    this.swingProgress = 0; // Animación de guadaña (0 a 1)

    // Físicas del apilado elástico
    this.wobbleAngle = 0;
    this.wobbleVelocity = 0;
  }

  canPickItem() {
    return this.stack.length < this.maxCapacity;
  }

  addItem(type) {
    if (this.canPickItem()) {
      this.stack.push({ type });
      if (window.audio) window.audio.playPickup(1 + this.stack.length * 0.1);
      return true;
    }
    return false;
  }

  popItem(typeFilter = null) {
    if (this.stack.length === 0) return null;
    if (!typeFilter) {
      return this.stack.pop();
    }
    // Buscar el último del tipo especificado (LIFO para ese tipo)
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].type === typeFilter) {
        const item = this.stack.splice(i, 1)[0];
        return item;
      }
    }
    return null;
  }

  countItem(type) {
    return this.stack.filter(item => item.type === type).length;
  }

  triggerSwing() {
    this.swingProgress = 1.0;
    if (window.audio) window.audio.playHarvest();
  }

  update(dt, inputVector, map) {
    this.isMoving = (inputVector.x !== 0 || inputVector.y !== 0);

    if (this.isMoving) {
      const targetAngle = Math.atan2(inputVector.y, inputVector.x);
      // Suavizado del giro
      let angleDiff = targetAngle - this.facingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.facingAngle += angleDiff * Math.min(1, dt * 15);

      // Movimiento propuesto
      const moveX = inputVector.x * this.speed * dt;
      const moveY = inputVector.y * this.speed * dt;

      // Colisiones AABB con el mapa en ambos ejes de forma independiente (deslizamiento)
      const newX = this.x + moveX;
      if (!map.checkCollision(newX, this.y, this.radius)) {
        this.x = newX;
      }

      const newY = this.y + moveY;
      if (!map.checkCollision(this.x, newY, this.radius)) {
        this.y = newY;
      }

      this.walkCycle += dt * 10;
    } else {
      this.walkCycle = 0;
    }

    // Efecto de guadaña
    if (this.swingProgress > 0) {
      this.swingProgress = Math.max(0, this.swingProgress - dt * 4.5);
    }

    // Físicas de oscilación de la pila en la espalda
    const targetWobble = this.isMoving ? Math.sin(this.walkCycle) * 0.12 : 0;
    this.wobbleAngle += (targetWobble - this.wobbleAngle) * Math.min(1, dt * 12);
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Sombra bajo el personaje
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Renderizado de la Pila en la espalda (se dibuja detrás o detrás del torso)
    this.renderStack(ctx);

    // 3. Rotación hacia la dirección en la que camina
    ctx.rotate(this.facingAngle);

    // Pies / Zapatos animados
    const legOffset = Math.sin(this.walkCycle) * 6;
    ctx.fillStyle = '#263238';
    // Pie izquierdo
    ctx.beginPath();
    ctx.ellipse(-10, -8 + legOffset, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pie derecho
    ctx.beginPath();
    ctx.ellipse(-10, 8 - legOffset, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo / Chaqueta de Chef
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Pañuelo / Delantal rojo italiano
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(3, 0, 9, -Math.PI / 3, Math.PI / 3);
    ctx.fill();

    // Cabeza y Gorro de Chef
    ctx.fillStyle = '#fed7aa'; // Piel
    ctx.beginPath();
    ctx.arc(4, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Pliegue del gorro de chef blanco
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(2, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ojos
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(9, -3, 2, 0, Math.PI * 2);
    ctx.arc(9, 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Guadaña / Efecto de corte
    if (this.swingProgress > 0) {
      this.renderScytheSwing(ctx);
    }

    ctx.restore();
  }

  renderScytheSwing(ctx) {
    ctx.save();
    const swingAngle = (1.0 - this.swingProgress) * Math.PI * 1.2 - Math.PI * 0.6;
    ctx.rotate(swingAngle);

    // Mango de madera
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(10, 8);
    ctx.lineTo(36, 12);
    ctx.stroke();

    // Hoja curvada de la guadaña plateada
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(36, 12, 16, -Math.PI / 2, Math.PI / 5, false);
    ctx.stroke();

    // Estela de corte translúcida
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, 48, -0.6, 0.6);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.restore();
  }

  renderStack(ctx) {
    if (this.stack.length === 0) return;

    ctx.save();
    // Posición base de la mochila en la espalda
    ctx.translate(-14, 0);
    ctx.rotate(this.wobbleAngle);

    const itemHeight = 11;
    this.stack.forEach((item, index) => {
      const yOffset = -index * itemHeight;

      if (item.type === 'wheat') {
        // Gavilla de trigo dorado
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        this.drawRoundedRect(ctx, -12, yOffset - 9, 24, 9, 3);
        // Cintas de atado
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-4, yOffset - 9, 8, 9);
      } else if (item.type === 'flour') {
        // Saco de harina blanco/marfil
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        this.drawRoundedRect(ctx, -13, yOffset - 10, 26, 10, 4);
        // Sello azul
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, yOffset - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'pizza') {
        // Caja de pizza cuadrada octogonal
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        this.drawRoundedRect(ctx, -15, yOffset - 10, 30, 9, 2);
        // Logo de pizza roja en la tapa
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, yOffset - 5.5, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'tomato') {
        // Tomate fresco
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, yOffset - 5, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(-1.5, yOffset - 9, 3, 3);
      } else if (item.type === 'cheese') {
        // Cuña de queso
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, -10, yOffset - 8, 20, 8, 2);
      }
    });

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
    ctx.fill();
    ctx.stroke();
  }
}

window.Player = Player;

