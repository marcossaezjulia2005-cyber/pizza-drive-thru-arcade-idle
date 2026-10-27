/**
 * NewIngredients - Nuevos ingredientes y recetas:
 * - Huerto de Tomates 🍅 -> Pizza Margarita ($12)
 * - Quesería / Establo 🧀 -> Pizza 4 Quesos ($25)
 */

class TomatoPatch {
  constructor(x, y, rows = 2, cols = 3) {
    this.x = x;
    this.y = y;
    this.rows = rows;
    this.cols = cols;
    this.spacing = 38;
    this.width = cols * this.spacing;
    this.height = rows * this.spacing;
    this.unlocked = false;

    this.cooldownTime = 3.0;
    this.plants = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.plants.push({
          x: x + c * this.spacing + this.spacing / 2,
          y: y + r * this.spacing + this.spacing / 2,
          state: 'grown',
          timer: 0
        });
      }
    }
  }

  update(dt, player) {
    if (!this.unlocked) return;

    this.plants.forEach(plant => {
      if (plant.state === 'growing') {
        plant.timer += dt;
        if (plant.timer >= this.cooldownTime) {
          plant.state = 'grown';
          plant.timer = 0;
        }
      }
    });

    const harvestRange = 40;
    for (let plant of this.plants) {
      if (plant.state === 'grown' && player.canPickItem()) {
        const dist = Math.hypot(player.x - plant.x, player.y - plant.y);
        if (dist <= harvestRange) {
          plant.state = 'growing';
          plant.timer = 0;
          player.addItem('tomato');
          if (window.audio) window.audio.playHarvest();
          break;
        }
      }
    }
  }

  render(ctx) {
    if (!this.unlocked) return;

    ctx.save();
    // Parcela de tierra
    ctx.fillStyle = '#3f220d';
    ctx.fillRect(this.x - 6, this.y - 6, this.width + 12, this.height + 12);
    ctx.strokeStyle = '#271204';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 6, this.y - 6, this.width + 12, this.height + 12);

    // Plantas de tomate
    this.plants.forEach(plant => {
      // Mata verde
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(plant.x, plant.y, 11, 0, Math.PI * 2);
      ctx.fill();

      // Tomates rojos listos
      if (plant.state === 'grown') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(plant.x - 4, plant.y - 2, 4.5, 0, Math.PI * 2);
        ctx.arc(plant.x + 4, plant.y + 2, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Cartel identificador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍅 Tomates', this.x + this.width / 2, this.y - 12);
    ctx.restore();
  }
}

class CheeseStation {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.unlocked = false;
    this.cheeseStock = 0;
    this.maxCheese = 6;
    this.produceTimer = 0;
    this.produceInterval = 3.5;
    this.zoneRadius = 32;
  }

  update(dt, player) {
    if (!this.unlocked) return;

    if (this.cheeseStock < this.maxCheese) {
      this.produceTimer += dt;
      if (this.produceTimer >= this.produceInterval) {
        this.cheeseStock++;
        this.produceTimer = 0;
      }
    }

    // Recogida por proximidad
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist <= this.zoneRadius && this.cheeseStock > 0 && player.canPickItem()) {
      this.cheeseStock--;
      player.addItem('cheese');
      if (window.audio) window.audio.playPickup(1.2);
    }
  }

  render(ctx) {
    if (!this.unlocked) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Zona interactiva
    ctx.strokeStyle = '#facc15';
    ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.zoneRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Icono queso
    ctx.font = '22px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧀', 0, 4);

    // Stock
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.fillText(`Quesería (${this.cheeseStock}/${this.maxCheese})`, 0, this.zoneRadius + 14);

    ctx.restore();
  }
}

window.TomatoPatch = TomatoPatch;
window.CheeseStation = CheeseStation;
