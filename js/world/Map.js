/**
 * GameMap - Entorno 2D con renderizado de capas y colisiones AABB
 */
class GameMap {
  constructor(width = 1400, height = 1000) {
    this.width = width;
    this.height = height;

    // Obstáculos sólidos (cajas AABB: {x, y, w, h})
    this.obstacles = [
      // Paredes exteriores (límites del mapa)
      { x: -50, y: -50, w: width + 100, h: 50 }, // Techo
      { x: -50, y: height, w: width + 100, h: 50 }, // Suelo
      { x: -50, y: -50, w: 50, h: height + 100 }, // Izquierda
      { x: width, y: -50, w: 50, h: height + 100 }, // Derecha

      // Molino (bloque central sólido)
      { x: 380, y: 220, w: 80, h: 80 },

      // Horno de pizza (bloque sólido)
      { x: 740, y: 220, w: 80, h: 80 },

      // Mostrador / Barra de separación entre cocina y carril Drive-Thru
      { x: 980, y: 80, w: 20, h: 320 }, // Muro con ventanilla
      { x: 980, y: 480, w: 20, h: 440 }
    ];
  }

  checkCollision(x, y, radius) {
    // Comprobar colisión de un círculo (jugador) contra cada caja AABB
    for (const obs of this.obstacles) {
      // Punto más cercano en el rectángulo al centro del círculo
      const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.w));
      const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.h));

      const dx = x - closestX;
      const dy = y - closestY;

      if ((dx * dx + dy * dy) < (radius * radius)) {
        return true; // Hay colisión
      }
    }
    return false;
  }

  render(ctx) {
    // 1. Suelo general: Césped verde estilizado
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 0, this.width, this.height);

    // Patrón suave de césped
    ctx.fillStyle = '#22c55e';
    for (let x = 30; x < 900; x += 90) {
      for (let y = 30; y < this.height; y += 90) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Zona de la Cocina / Pizzería (Suelo de losas rústicas)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(320, 140, 660, 720);

    // Cuadrícula de azulejos de cocina
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    for (let x = 320; x <= 980; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 140);
      ctx.lineTo(x, 860);
      ctx.stroke();
    }
    for (let y = 140; y <= 860; y += 40) {
      ctx.beginPath();
      ctx.moveTo(320, y);
      ctx.lineTo(980, y);
      ctx.stroke();
    }

    // Borde de la cocina
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(320, 140, 660, 720);

    // 3. Carril Drive-Thru (Asfalto a la derecha)
    ctx.fillStyle = '#334155';
    ctx.fillRect(1000, 0, 360, this.height);

    // Líneas viales divisorias amarillas
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.setLineDash([30, 25]);
    ctx.beginPath();
    ctx.moveTo(1180, 0);
    ctx.lineTo(1180, this.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cartel "DRIVE-THRU" pintado en el asfalto
    ctx.save();
    ctx.translate(1180, 480);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 36px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DRIVE - THRU 🚗', 0, 0);
    ctx.restore();

    // 4. Ventanilla de Servicio en el muro (hueco entre x: 980, y: 400 a 480)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(976, 400, 28, 80);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(976, 400, 28, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VENTANILLA', 990, 392);

    // 5. Muros y mostradores
    ctx.fillStyle = '#475569';
    this.obstacles.forEach(obs => {
      // No dibujar los límites exteriores invisibles
      if (obs.x >= 0 && obs.y >= 0 && obs.x < this.width && obs.y < this.height) {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      }
    });
  }
}

window.GameMap = GameMap;

