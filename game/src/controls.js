export const controlGuide = [
  ['W A S D','Move / drive'], ['MOUSE','Look / aim'], ['LMB / RMB','Attack / aim'],
  ['SHIFT','Sprint'], ['SPACE','Handbrake'], ['E','Enter / exit'],
  ['F','Interact'], ['1–4 / R','Equip / reload'], ['Q','Radio'],
  ['J / ESC','Journal / pause']
];

export function keyboardMouse() {
  const input = {held:new Set(), pressed:new Set(), dx:0, dy:0, fire:false, aim:false};
  addEventListener('keydown', event => {
    if (event.code === 'Tab' || event.code === 'Space') event.preventDefault();
    if (!input.held.has(event.code)) input.pressed.add(event.code);
    input.held.add(event.code);
  });
  addEventListener('keyup', event => input.held.delete(event.code));
  addEventListener('blur', () => {
    input.held.clear(); input.pressed.clear(); input.fire=false; input.aim=false;
  });
  addEventListener('mousemove', event => {
    if (document.pointerLockElement) { input.dx+=event.movementX; input.dy+=event.movementY; }
  });
  addEventListener('mousedown', event => {
    if (!document.pointerLockElement) return;
    if (event.button===0) input.fire=true;
    if (event.button===2) input.aim=true;
  });
  addEventListener('mouseup', event => {
    if (event.button===0) input.fire=false;
    if (event.button===2) input.aim=false;
  });
  addEventListener('contextmenu', event => event.preventDefault());
  return Object.assign(input, {
    down(key) { return this.held.has(key); },
    take(key) { return this.pressed.delete(key); },
    end() { this.dx=0; this.dy=0; this.pressed.clear(); }
  });
}
