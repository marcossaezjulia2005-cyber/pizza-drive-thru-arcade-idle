/**
 * InputManager - Gestión de controles de teclado y Joystick táctil virtual
 */
class InputManager {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // Vector de movimiento normalizado
    this.vector = { x: 0, y: 0 };

    // Joystick virtual
    this.joystickActive = false;
    this.joystickOrigin = { x: 0, y: 0 };
    this.joystickPos = { x: 0, y: 0 };
    this.maxJoystickRadius = 45;

    this.initKeyboard();
    this.initTouch();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Iniciar contexto de audio con la primera interacción
      if (window.audio) window.audio.resumeIfNeeded();

      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.up = true;
      if (k === 's' || k === 'arrowdown') this.keys.down = true;
      if (k === 'a' || k === 'arrowleft') this.keys.left = true;
      if (k === 'd' || k === 'arrowright') this.keys.right = true;
      this.updateVector();
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.up = false;
      if (k === 's' || k === 'arrowdown') this.keys.down = false;
      if (k === 'a' || k === 'arrowleft') this.keys.left = false;
      if (k === 'd' || k === 'arrowright') this.keys.right = false;
      this.updateVector();
    });
  }

  initTouch() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const container = document.getElementById('joystick-container');
    const knob = document.getElementById('joystick-knob');

    if (isTouchDevice && container) {
      container.style.display = 'block';

      const handleStart = (e) => {
        if (window.audio) window.audio.resumeIfNeeded();
        const touch = e.touches ? e.touches[0] : e;
        const rect = container.getBoundingClientRect();
        this.joystickOrigin = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        this.joystickActive = true;
        this.handleMove(touch);
      };

      const handleEnd = () => {
        this.joystickActive = false;
        this.joystickPos = { x: 0, y: 0 };
        this.vector = { x: 0, y: 0 };
        if (knob) {
          knob.style.transform = `translate(0px, 0px)`;
        }
      };

      container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleStart(e);
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!this.joystickActive) return;
        const touch = e.touches[0];
        this.handleMove(touch);
      }, { passive: false });

      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }
  }

  handleMove(pointer) {
    const knob = document.getElementById('joystick-knob');
    const dx = pointer.clientX - this.joystickOrigin.x;
    const dy = pointer.clientY - this.joystickOrigin.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      this.vector = { x: 0, y: 0 };
      if (knob) knob.style.transform = `translate(0px, 0px)`;
      return;
    }

    const clampedDist = Math.min(distance, this.maxJoystickRadius);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    if (knob) {
      knob.style.transform = `translate(${kx}px, ${ky}px)`;
    }

    this.vector = {
      x: kx / this.maxJoystickRadius,
      y: ky / this.maxJoystickRadius
    };
  }

  updateVector() {
    if (this.joystickActive) return; // Prioridad táctil si se está usando

    let vx = 0;
    let vy = 0;

    if (this.keys.left) vx -= 1;
    if (this.keys.right) vx += 1;
    if (this.keys.up) vy -= 1;
    if (this.keys.down) vy += 1;

    // Normalizar vector en 8 direcciones
    const len = Math.hypot(vx, vy);
    if (len > 0) {
      this.vector = { x: vx / len, y: vy / len };
    } else {
      this.vector = { x: 0, y: 0 };
    }
  }

  getVector() {
    return this.vector;
  }
}

window.input = new InputManager();

