/**
 * Stations - Estaciones de trabajo del ciclo productivo:
 * - WheatField: Parcela de trigo con siega y regeneración (3.0s)
 * - Mill: Molino con aspas giratorias (1 Trigo -> 1 Harina, 1.5s)
 * - Oven: Horno de leña (1 Harina -> 1 Pizza, 2.0s, máx 10)
 */

// -------------------------------------------------------------
// 1. CAMPO DE TRIGO
// -------------------------------------------------------------
class WheatField {
  constructor(x, y, rows = 3, cols = 4) {
    this.x = x;
    this.y = y;
    this.rows = rows;
    this.cols = cols;
    this.spacing = 38;
    this.width = cols * this.spacing;
    this.height = rows * this.spacing;

    this.cooldownTime = 3.0; // Regeneración tras 3.0s (RF-02.1)
    this.plants = [];

    // Generar brotes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.plants.push({
          x: x + c * this.spacing + this.spacing / 2,
          y: y + r * this.spacing + this.spacing / 2,
          state: 'grown', // 'grown' | 'growing'
          timer: 0,
          swayOffset: Math.random() * Math.PI * 2
        });
      }
    }

    this.particles = [];
  }

  update(dt, player) {
    // 1. Actualizar regeneración de plantas
    this.plants.forEach(plant => {
      if (plant.state === 'growing') {
        plant.timer += dt;
        if (plant.timer >= this.cooldownTime) {
          plant.state = 'grown';
          plant.timer = 0;
        }
      }
    });

    // 2. Comprobar siega por proximidad del jugador
    const harvestRange = 45;
    let harvestedAny = false;

    for (let plant of this.plants) {
      if (plant.state === 'grown' && player.canPickItem()) {
        const dist = Math.hypot(player.x - plant.x, player.y - plant.y);
        if (dist <= harvestRange) {
          plant.state = 'growing';
          plant.timer = 0;
          player.addItem('wheat');
          harvestedAny = true;
          this.spawnWheatParticles(plant.x, plant.y);
        }
      }
    }

    if (harvestedAny) {
      player.triggerSwing();
    }

    // 3. Actualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  spawnWheatParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 120,
        vy: -Math.random() * 90 - 30,
        life: 0.45,
        maxLife: 0.45,
        color: Math.random() > 0.5 ? '#f59e0b' : '#fbbf24'
      });
    }
  }

  render(ctx, time) {
    // Parcela de tierra fértil
    ctx.fillStyle = '#452b14';
    ctx.beginPath();
    this.drawRoundedRect(ctx, this.x - 8, this.y - 8, this.width + 16, this.height + 16, 12);
    ctx.fill();

    // Borde de parcela
    ctx.strokeStyle = '#2d1b0d';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Surcos de cultivo
    ctx.strokeStyle = '#382210';
    ctx.lineWidth = 2;
    for (let r = 0; r < this.rows; r++) {
      const lineY = this.y + r * this.spacing + this.spacing / 2;
      ctx.beginPath();
      ctx.moveTo(this.x, lineY);
      ctx.lineTo(this.x + this.width, lineY);
      ctx.stroke();
    }

    // Dibujar plantas de trigo
    this.plants.forEach(plant => {
      const sway = Math.sin(time * 3 + plant.swayOffset) * 4;
      if (plant.state === 'grown') {
        // Tallo
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(plant.x, plant.y + 6);
        ctx.quadraticCurveTo(plant.x + sway / 2, plant.y - 6, plant.x + sway, plant.y - 18);
        ctx.stroke();

        // Espiga de trigo dorada
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(plant.x + sway, plant.y - 18, 5, 10, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Brote en crecimiento con indicador de progreso
        const progress = plant.timer / this.cooldownTime;
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(plant.x, plant.y, 3 + progress * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Partículas
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillRect(p.x, p.y, 4, 4);
      ctx.globalAlpha = 1.0;
    });
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

// -------------------------------------------------------------
// 2. MOLINO DE HARINA
// -------------------------------------------------------------
class Mill {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.bladeAngle = 0;

    // Lógica productiva RF-02.2 (1 Trigo -> 1 Harina, 1.5s)
    this.processTime = 1.5;
    this.currentTimer = 0;
    this.wheatInput = 0;
    this.flourOutput = 0;
    this.maxFlourOutput = 12;

    // Cooldown para descargas continuas suaves
    this.transferCooldown = 0;

    // Zonas de interacción
    this.inputZone = { x: x - 45, y: y + 35, radius: 30 };
    this.outputZone = { x: x + 45, y: y + 35, radius: 30 };
  }

  update(dt, player) {
    // Girar aspas continuamente
    const isProcessing = this.wheatInput > 0;
    this.bladeAngle += dt * (isProcessing ? 4.5 : 1.2);

    // Procesamiento
    if (this.wheatInput > 0 && this.flourOutput < this.maxFlourOutput) {
      this.currentTimer += dt;
      if (this.currentTimer >= this.processTime) {
        this.wheatInput--;
        this.flourOutput++;
        this.currentTimer = 0;
        if (window.audio) window.audio.playDing();
      }
    } else if (this.wheatInput === 0) {
      this.currentTimer = 0;
    }

    if (this.transferCooldown > 0) {
      this.transferCooldown -= dt;
    }

    // Interacción con el jugador
    if (this.transferCooldown <= 0) {
      // 1. Zona de Entrada: Depositar trigo
      const distInput = Math.hypot(player.x - this.inputZone.x, player.y - this.inputZone.y);
      if (distInput <= this.inputZone.radius) {
        const item = player.popItem('wheat');
        if (item) {
          this.wheatInput++;
          this.transferCooldown = 0.15;
          if (window.audio) window.audio.playDeposit();
        }
      }

      // 2. Zona de Salida: Recoger harina
      const distOutput = Math.hypot(player.x - this.outputZone.x, player.y - this.outputZone.y);
      if (distOutput <= this.outputZone.radius) {
        if (this.flourOutput > 0 && player.canPickItem()) {
          this.flourOutput--;
          player.addItem('flour');
          this.transferCooldown = 0.15;
        }
      }
    }
  }

  render(ctx) {
    // 1. Zonas de interacción en el suelo
    this.renderZone(ctx, this.inputZone.x, this.inputZone.y, this.inputZone.radius, '📥 Entrada Trigo', '#f59e0b', this.wheatInput);
    this.renderZone(ctx, this.outputZone.x, this.outputZone.y, this.outputZone.radius, '📤 Salida Harina', '#38bdf8', this.flourOutput);

    // 2. Edificio del Molino (Cuerpo circular)
    ctx.save();
    ctx.translate(this.x, this.y);

    // Sombra del molino
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 48, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Torre del molino cilíndrica de piedra
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tejado cónico de madera
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    // Eje de las aspas
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Barra de progreso de molienda
    if (this.wheatInput > 0) {
      const progress = this.currentTimer / this.processTime;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 32, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.stroke();
    }

    // Aspas giratorias (4 aspas)
    ctx.save();
    ctx.rotate(this.bladeAngle);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-3, -70, 6, 70);
      // Tela del aspa
      ctx.fillStyle = 'rgba(254, 243, 199, 0.85)';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1;
      ctx.fillRect(3, -65, 18, 50);
      ctx.strokeRect(3, -65, 18, 50);
    }
    ctx.restore();

    ctx.restore();
  }

  renderZone(ctx, x, y, radius, label, color, count) {
    ctx.save();
    // Círculo luminoso
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '22';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Etiqueta y contador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - radius - 6);

    ctx.fillStyle = color;
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillText(`(${count})`, x, y + 5);

    ctx.restore();
  }
}

// -------------------------------------------------------------
// 3. HORNO DE PIZZA
// -------------------------------------------------------------
class Oven {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // Logica productiva RF-02.3 y Recetas Fase 4
    this.cookTime = 2.0;
    this.currentTimer = 0;
    this.flourInput = 0;
    this.tomatoInput = 0;
    this.cheeseInput = 0;

    // Bandeja de pizzas preparadas con valor: { type: 'pizza', value: 5|12|25 }
    this.readyPizzas = [];
    this.maxPizzas = 10;

    this.transferCooldown = 0;

    // Zonas de interaccion
    this.inputZone = { x: x - 48, y: y + 30, radius: 34 };
    this.outputZone = { x: x + 48, y: y + 30, radius: 34 };

    this.smokeParticles = [];
  }

  get pizzaOutput() {
    return this.readyPizzas.length;
  }

  update(dt, player) {
    const isBaking = this.flourInput > 0 && this.readyPizzas.length < this.maxPizzas;

    // Proceso de horneado
    if (isBaking) {
      this.currentTimer += dt;
      if (this.currentTimer >= this.cookTime) {
        this.flourInput--;
        let pizzaValue = 5; // Basica

        // Determinar mejor receta posible
        if (this.tomatoInput > 0 && this.cheeseInput > 0) {
          this.tomatoInput--;
          this.cheeseInput--;
          pizzaValue = 25; // 4 Quesos
        } else if (this.tomatoInput > 0) {
          this.tomatoInput--;
          pizzaValue = 12; // Margarita
        }

        this.readyPizzas.push({ type: 'pizza', value: pizzaValue });
        this.currentTimer = 0;
        if (window.audio) window.audio.playDing();
      }

      // Generar particulas de humo/chispas
      if (Math.random() < 0.35) {
        this.smokeParticles.push({
          x: this.x + (Math.random() - 0.5) * 20,
          y: this.y - 25,
          vx: (Math.random() - 0.5) * 15,
          vy: -Math.random() * 30 - 20,
          radius: Math.random() * 4 + 3,
          life: 0.8,
          maxLife: 0.8,
          color: Math.random() > 0.4 ? 'rgba(249, 115, 22, 0.7)' : 'rgba(100, 116, 139, 0.5)'
        });
      }
    } else if (this.flourInput === 0) {
      this.currentTimer = 0;
    }

    // Particulas de humo
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.x += p.vx * dt;
      p.radius += dt * 3;
      p.life -= dt;
      if (p.life <= 0) {
        this.smokeParticles.splice(i, 1);
      }
    }

    if (this.transferCooldown > 0) {
      this.transferCooldown -= dt;
    }

    // Interaccion con el jugador
    if (this.transferCooldown <= 0) {
      // 1. Zona de Entrada: Depositar harina, tomate o queso
      const distInput = Math.hypot(player.x - this.inputZone.x, player.y - this.inputZone.y);
      if (distInput <= this.inputZone.radius) {
        let deposited = false;

        const cheese = player.popItem('cheese');
        if (cheese) {
          this.cheeseInput++;
          deposited = true;
        } else {
          const tomato = player.popItem('tomato');
          if (tomato) {
            this.tomatoInput++;
            deposited = true;
          } else {
            const flour = player.popItem('flour');
            if (flour) {
              this.flourInput++;
              deposited = true;
            }
          }
        }

        if (deposited) {
          this.transferCooldown = 0.15;
          if (window.audio) window.audio.playDeposit();
        }
      }

      // 2. Zona de Salida: Recoger pizzas calientes listas
      const distOutput = Math.hypot(player.x - this.outputZone.x, player.y - this.outputZone.y);
      if (distOutput <= this.outputZone.radius) {
        if (this.readyPizzas.length > 0 && player.canPickItem()) {
          const readyItem = this.readyPizzas.pop();
          player.addItem('pizza', readyItem.value);
          this.transferCooldown = 0.15;
        }
      }
    }
  }

  render(ctx) {
    // 1. Zonas de interaccion en el suelo
    const ingredientsCount = 🥡 🍅 🧀;
    this.renderZone(ctx, this.inputZone.x, this.inputZone.y, this.inputZone.radius, '📥 Carga', '#38bdf8', ingredientsCount);
    this.renderZone(ctx, this.outputZone.x, this.outputZone.y, this.outputZone.radius, 🍕 Bandeja, '#f59e0b', ${this.readyPizzas.length}/);

    // 2. Edificio del Horno de Piedra
    ctx.save();
    ctx.translate(this.x, this.y);

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 26, 44, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cúpula del horno (ladrillo refractario)
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 38, Math.PI, 0, false);
    ctx.lineTo(38, 20);
    ctx.lineTo(-38, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Boca del horno (fuego)
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 10, 20, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    // Llamas animadas si está horneando
    if (this.flourInput > 0 && this.pizzaOutput < this.maxPizzas) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 10, 14, Math.PI, 0, false);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 10, 8, Math.PI, 0, false);
      ctx.fill();

      // Barra de progreso circular
      const progress = this.currentTimer / this.cookTime;
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -12, 16, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.stroke();
    }

    // Chimenea superior
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, -42, 16, 16);

    ctx.restore();

    // Partículas de humo saliendo de la chimenea
    this.smokeParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderZone(ctx, x, y, radius, label, color, count) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '22';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - radius - 6);

    ctx.fillStyle = color;
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillText(`(${count})`, x, y + 5);

    ctx.restore();
  }
}

window.WheatField = WheatField;
window.Mill = Mill;
window.Oven = Oven;

