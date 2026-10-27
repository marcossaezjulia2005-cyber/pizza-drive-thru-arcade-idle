/**
 * SaveSystem - Sistema de persistencia automática en localStorage
 */

class SaveSystem {
  constructor(game) {
    this.game = game;
    this.storageKey = 'pizza_idle_tycoon_save_v1';
    this.autoSaveInterval = 3.0; // Guardado cada 3 segundos
    this.timer = 0;

    // Guardado al cerrar o recargar pestaña
    window.addEventListener('beforeunload', () => {
      this.save();
    });

    // Botón de reinicio de partida
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres reiniciar tu progreso desde cero?')) {
          this.reset();
        }
      });
    }
  }

  save() {
    try {
      const data = {
        money: this.game.money,
        upgrades: this.game.upgradeManager ? this.game.upgradeManager.zones.map(z => ({ id: z.id, level: z.level })) : [],
        employees: {
          farmer: !!(this.game.employeeManager && this.game.employeeManager.farmer),
          cook: !!(this.game.employeeManager && this.game.employeeManager.cook),
          cashier: !!(this.game.employeeManager && this.game.employeeManager.cashier)
        },
        timestamp: Date.now()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Error al guardar partida en localStorage:', e);
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (typeof data.money === 'number') {
        this.game.money = data.money;
      }

      // Cargar mejoras
      if (data.upgrades && this.game.upgradeManager) {
        data.upgrades.forEach(u => {
          const zone = this.game.upgradeManager.zones.find(z => z.id === u.id);
          if (zone) {
            zone.level = u.level;
            if (zone.onUpgrade && zone.level > 0) {
              zone.onUpgrade(zone.level, this.game);
            }
          }
        });
      }

      // Cargar empleados
      if (data.employees && this.game.employeeManager) {
        if (data.employees.farmer) this.game.employeeManager.unlockFarmer();
        if (data.employees.cook) this.game.employeeManager.unlockCook();
        if (data.employees.cashier) this.game.employeeManager.unlockCashier();
      }

      return true;
    } catch (e) {
      console.warn('Error al cargar datos guardados:', e);
      return false;
    }
  }

  reset() {
    try {
      localStorage.removeItem(this.storageKey);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.autoSaveInterval) {
      this.timer = 0;
      this.save();
    }
  }
}

window.SaveSystem = SaveSystem;

