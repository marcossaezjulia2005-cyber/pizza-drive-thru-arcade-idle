/**
 * Camera2D - Cámara de seguimiento suave (Lerp) centrada en el jugador
 */
class Camera2D {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    this.lerpSpeed = 0.1; // Suavizado de seguimiento
  }

  resize(w, h) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  setWorldBounds(w, h) {
    this.worldWidth = w;
    this.worldHeight = h;
  }

  update(targetX, targetY) {
    // Posición deseada: centrar al objetivo en la pantalla
    const desiredX = targetX - this.viewportWidth / 2;
    const desiredY = targetY - this.viewportHeight / 2;

    // Interpolación lineal (lerp)
    this.x += (desiredX - this.x) * this.lerpSpeed;
    this.y += (desiredY - this.y) * this.lerpSpeed;

    // Limitar dentro de los bordes del mapa
    this.x = Math.max(0, Math.min(this.x, Math.max(0, this.worldWidth - this.viewportWidth)));
    this.y = Math.max(0, Math.min(this.y, Math.max(0, this.worldHeight - this.viewportHeight)));
  }

  apply(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }
}

window.Camera2D = Camera2D;

