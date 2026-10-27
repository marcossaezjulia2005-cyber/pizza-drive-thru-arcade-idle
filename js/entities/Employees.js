/**
 * Employees - Sistema de Empleados Automatizados con FSM (Finite State Machines)
 * - FarmerBot: Siega trigo y abastece el molino
 * - CookBot: Transporta harina del molino al horno
 * - CashierBot: Despacha pizzas en la ventanilla y recoge el dinero del suelo
 */

class BaseBot {
  constructor(x, y, color, hatType) {
    this.x = x;
    this.y = y;
    this.speed = 125; // px/s
    this.radius = 18;
    this.facingAngle = 0;
    this.stack = [];
    this.maxCapacity = 4;
    this.color = color;
    this.hatType = hatType; // 'straw' | 'cook' | 'visor'
    this.walkCycle = 0;
    this.isMoving = false;
  }

  moveTo(targetX, targetY, dt, arrivalDistance = 15) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= arrivalDistance) {
      this.isMoving = false;
      return true; // Ha llegado
    }

    this.isMoving = true;
    this.facingAngle = Math.atan2(dy, dx);
    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
    this.walkCycle += dt * 8;
    return false;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pila en la espalda
    this.renderStack(ctx);

    ctx.rotate(this.facingAngle);

    // Pies
    const legOffset = Math.sin(this.walkCycle) * 4;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-7, -6 + legOffset, 5, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(-7, 6 - legOffset, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo / Ropa
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cabeza
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(3, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Ojos
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(7, -2, 1.5, 0, Math.PI * 2);
    ctx.arc(7, 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Sombrero según tipo
    if (this.hatType === 'straw') {
      // Sombrero de paja campesino
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(2, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.arc(2, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.hatType === 'cook') {
      // Gorro de cocinero
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(1, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.hatType === 'visor') {
      // Visera de cajera
      ctx.fillStyle = '#be185d';
      ctx.beginPath();
      ctx.arc(2, 0, 8, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderStack(ctx) {
    if (this.stack.length === 0) return;
    ctx.save();
    ctx.translate(-11, 0);
    this.stack.forEach((item, index) => {
      const yOffset = -index * 9;
      if (item === 'wheat') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-8, yOffset - 7, 16, 7);
      } else if (item === 'flour') {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(-9, yOffset - 8, 18, 8);
      } else if (item === 'pizza') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-10, yOffset - 7, 20, 7);
      }
    });
    ctx.restore();
  }
}

// -------------------------------------------------------------
// 1. GRANJERO BOT
// -------------------------------------------------------------
class FarmerBot extends BaseBot {
  constructor(x, y) {
    super(x, y, '#2563eb', 'straw'); // Peto azul y sombrero de paja
    this.state = 'FIND_WHEAT';
    this.targetPlant = null;
    this.harvestTimer = 0;
  }

  update(dt, wheatField, mill) {
    if (this.state === 'FIND_WHEAT') {
      // Buscar planta lista
      this.targetPlant = wheatField.plants.find(p => p.state === 'grown');
      if (this.targetPlant && this.stack.length < this.maxCapacity) {
        this.state = 'WALK_TO_WHEAT';
      } else if (this.stack.length > 0) {
        this.state = 'WALK_TO_MILL';
      }
    } else if (this.state === 'WALK_TO_WHEAT') {
      if (!this.targetPlant || this.targetPlant.state !== 'grown') {
        this.state = 'FIND_WHEAT';
        return;
      }
      const arrived = this.moveTo(this.targetPlant.x, this.targetPlant.y, dt, 18);
      if (arrived) {
        // Cosechar
        this.targetPlant.state = 'growing';
        this.targetPlant.timer = 0;
        this.stack.push('wheat');
        wheatField.spawnWheatParticles(this.targetPlant.x, this.targetPlant.y);
        if (window.audio) window.audio.playHarvest();

        if (this.stack.length >= this.maxCapacity) {
          this.state = 'WALK_TO_MILL';
        } else {
          this.state = 'FIND_WHEAT';
        }
      }
    } else if (this.state === 'WALK_TO_MILL') {
      const arrived = this.moveTo(mill.inputZone.x, mill.inputZone.y, dt, 24);
      if (arrived) {
        // Descargar trigo
        while (this.stack.length > 0) {
          this.stack.pop();
          mill.wheatInput++;
        }
        if (window.audio) window.audio.playDeposit();
        this.state = 'FIND_WHEAT';
      }
    }
  }
}

// -------------------------------------------------------------
// 2. COCINERO BOT
// -------------------------------------------------------------
class CookBot extends BaseBot {
  constructor(x, y) {
    super(x, y, '#16a34a', 'cook'); // Delantal verde y gorro chef
    this.state = 'IDLE';
    this.checkTimer = 0;
  }

  update(dt, mill, oven) {
    if (this.state === 'IDLE') {
      this.checkTimer += dt;
      if (this.checkTimer >= 0.5) {
        this.checkTimer = 0;
        // Si hay harina en el molino y el horno no está saturado
        if (mill.flourOutput > 0 && oven.flourInput < 6 && this.stack.length < this.maxCapacity) {
          this.state = 'WALK_TO_MILL';
        } else if (this.stack.length > 0) {
          this.state = 'WALK_TO_OVEN';
        }
      }
    } else if (this.state === 'WALK_TO_MILL') {
      const arrived = this.moveTo(mill.outputZone.x, mill.outputZone.y, dt, 24);
      if (arrived) {
        // Recoger harina
        while (mill.flourOutput > 0 && this.stack.length < this.maxCapacity) {
          mill.flourOutput--;
          this.stack.push('flour');
        }
        this.state = 'WALK_TO_OVEN';
      }
    } else if (this.state === 'WALK_TO_OVEN') {
      const arrived = this.moveTo(oven.inputZone.x, oven.inputZone.y, dt, 24);
      if (arrived) {
        // Depositar harina en el horno
        while (this.stack.length > 0) {
          this.stack.pop();
          oven.flourInput++;
        }
        if (window.audio) window.audio.playDeposit();
        this.state = 'IDLE';
      }
    }
  }
}

// -------------------------------------------------------------
// 3. CAJERA BOT
// -------------------------------------------------------------
class CashierBot extends BaseBot {
  constructor(x, y) {
    super(x, y, '#db2777', 'visor'); // Rosa fucsia con visera
    this.state = 'IDLE';
    this.checkTimer = 0;
    this.targetCash = null;
  }

  update(dt, oven, driveThru, moneyManager, game) {
    // 1. Prioridad: Recoger dinero en el suelo si hay billetes sueltos
    if (moneyManager.cashList.length > 0) {
      const closestCash = moneyManager.cashList[0];
      const arrived = this.moveTo(closestCash.currentX, closestCash.currentY, dt, 20);
      if (arrived || Math.hypot(closestCash.currentX - this.x, closestCash.currentY - this.y) < 26) {
        closestCash.collected = true;
        game.money += closestCash.value;
        if (window.audio) window.audio.playMoney();
        moneyManager.floatingTexts.spawn(this.x, this.y - 12, `+$${closestCash.value}`, '#ec4899');
      }
      return;
    }

    // 2. Despacho de pizzas a los coches
    if (this.state === 'IDLE') {
      this.checkTimer += dt;
      if (this.checkTimer >= 0.4) {
        this.checkTimer = 0;
        const headVehicle = driveThru.vehicles[0];
        const carNeedsPizza = headVehicle && headVehicle.state === 'waiting' && !headVehicle.isSatisfied();

        if (carNeedsPizza) {
          if (this.stack.length > 0) {
            this.state = 'WALK_TO_WINDOW';
          } else if (oven.pizzaOutput > 0) {
            this.state = 'WALK_TO_OVEN';
          }
        }
      }
    } else if (this.state === 'WALK_TO_OVEN') {
      const arrived = this.moveTo(oven.outputZone.x, oven.outputZone.y, dt, 24);
      if (arrived) {
        while (oven.pizzaOutput > 0 && this.stack.length < this.maxCapacity) {
          oven.pizzaOutput--;
          this.stack.push('pizza');
        }
        this.state = 'WALK_TO_WINDOW';
      }
    } else if (this.state === 'WALK_TO_WINDOW') {
      const arrived = this.moveTo(driveThru.serviceZone.x, driveThru.serviceZone.y, dt, 24);
      if (arrived) {
        const headVehicle = driveThru.vehicles[0];
        if (headVehicle && headVehicle.state === 'waiting' && !headVehicle.isSatisfied() && this.stack.length > 0) {
          this.stack.pop();
          headVehicle.deliveredCount++;
          if (window.audio) window.audio.playPickup(1.4);
          if (headVehicle.isSatisfied()) {
            driveThru.completeOrder(headVehicle, moneyManager);
          }
        } else {
          this.state = 'IDLE';
        }
      }
    }
  }
}

// -------------------------------------------------------------
// GESTOR DE EMPLEADOS
// -------------------------------------------------------------
class EmployeeManager {
  constructor(game) {
    this.game = game;
    this.farmer = null;
    this.cook = null;
    this.cashier = null;
  }

  unlockFarmer() {
    if (!this.farmer) {
      this.farmer = new FarmerBot(220, 380);
      if (this.game.moneyManager && this.game.moneyManager.floatingTexts) {
        this.game.moneyManager.floatingTexts.spawn(this.farmer.x, this.farmer.y - 25, '¡Granjero Contratado! 👨‍🌾', '#84cc16');
      }
    }
  }

  unlockCook() {
    if (!this.cook) {
      this.cook = new CookBot(580, 320);
      if (this.game.moneyManager && this.game.moneyManager.floatingTexts) {
        this.game.moneyManager.floatingTexts.spawn(this.cook.x, this.cook.y - 25, '¡Cocinero Contratado! 👨‍🍳', '#e11d48');
      }
    }
  }

  unlockCashier() {
    if (!this.cashier) {
      this.cashier = new CashierBot(900, 480);
      if (this.game.moneyManager && this.game.moneyManager.floatingTexts) {
        this.game.moneyManager.floatingTexts.spawn(this.cashier.x, this.cashier.y - 25, '¡Cajera Contratada! 👩‍💼', '#ec4899');
      }
    }
  }

  update(dt) {
    if (this.farmer) this.farmer.update(dt, this.game.wheatField, this.game.mill);
    if (this.cook) this.cook.update(dt, this.game.mill, this.game.oven);
    if (this.cashier) this.cashier.update(dt, this.game.oven, this.game.driveThru, this.game.moneyManager, this.game);
  }

  render(ctx) {
    if (this.farmer) this.farmer.render(ctx);
    if (this.cook) this.cook.render(ctx);
    if (this.cashier) this.cashier.render(ctx);
  }
}

window.EmployeeManager = EmployeeManager;

