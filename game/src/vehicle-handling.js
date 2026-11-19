import * as T from '../vendor/three.module.min.js';

export function driveVehicle(car,input,world,dt) {
  const steer = Number(input.down('KeyA'))-Number(input.down('KeyD'));
  const throttle = Number(input.down('KeyW'))-Number(input.down('KeyS'));
  const handbrake = input.down('Space');
  const {model}=car;
  const brake = throttle && car.speed*throttle < -.3;
  const accel = brake?model.brake:model.push*(throttle<0?.54:1);
  car.steer += (steer-car.steer)*(1-Math.exp(-dt*10));
  car.speed += (throttle*accel-car.speed*(throttle?.22:.53))*dt;
  if(handbrake) car.speed *= Math.exp(-dt*1.28);
  const top = model.max*(1-car.damage*.007);
  car.speed = T.MathUtils.clamp(car.speed,-Math.min(12,top*.43),top);
  const motion = Math.min(Math.abs(car.speed)/5,1), fast = 1/(1+Math.abs(car.speed)*.025);
  car.yaw+=car.steer*model.turn*motion*fast*Math.sign(car.speed)*dt*(handbrake?1.47:1);
  const a = 1-Math.exp(-dt*(handbrake?1.5:model.grip));
  car.vx += (-Math.sin(car.yaw)*car.speed-car.vx)*a;
  car.vz += (-Math.cos(car.yaw)*car.speed-car.vz)*a;
  car.contact = Math.max(0, car.contact-dt);
  const x=car.x+car.vx*dt,z=car.z+car.vz*dt;
  const nose=Math.min(model.l*.31,1.35), dx=Math.sin(car.yaw)*nose,dz=Math.cos(car.yaw)*nose;
  const fits=(x,z)=>world.free(x-dx,z-dz,model.w*.37)&&world.free(x+dx,z+dz,model.w*.37);
  if(fits(x,z)) { car.x=x; car.z=z; return false; }
  if(fits(x,car.z)) car.x=x;
  if(fits(car.x,z)) car.z=z;
  const impact = Math.abs(car.speed);
  const struck = impact>4 && car.contact===0;
  if(struck) {
    car.damage=Math.min(100,car.damage+impact*.63/model.mass);
    car.contact=.35;
  }
  car.speed *= -.27; car.vx*=.11; car.vz*=.11;
  return struck;
}

export function moveOnFoot(hero,input,camera,world,dt) {
  const strafe=Number(input.down('KeyD'))-Number(input.down('KeyA'));
  const travel=Number(input.down('KeyW'))-Number(input.down('KeyS'));
  const angle=camera.yaw;
  const drift=Math.hypot(strafe,travel);
  const pace=input.aim?3.0:(input.down('ShiftLeft')?10.1:5.8);
  const vx=(Math.cos(angle)*strafe-Math.sin(angle)*travel)*pace/(drift||1);
  const vz=(-Math.sin(angle)*strafe-Math.cos(angle)*travel)*pace/(drift||1);
  const a=1-Math.exp(-dt*18);
  hero.vx+=(vx-hero.vx)*a; hero.vz+=(vz-hero.vz)*a;
  if(world.free(hero.x+hero.vx*dt,hero.z,.41)) hero.x+=hero.vx*dt;
  if(world.free(hero.x,hero.z+hero.vz*dt,.41)) hero.z+=hero.vz*dt;
  if(drift||input.aim||input.fire) {
    const goal=input.aim||input.fire?angle:Math.atan2(-vx,-vz);
    hero.yaw+=Math.atan2(Math.sin(goal-hero.yaw),Math.cos(goal-hero.yaw))*a;
  }
  return Math.hypot(hero.vx,hero.vz);
}

export function nearestVehicle(hero,cars,radius=4.1) {
  let winner=null;
  for(const car of cars) {
    const distance=Math.hypot(hero.x-car.x,hero.z-car.z);
    if (distance<radius && Math.abs(car.speed)<15) { winner=car; radius=distance; }
  }
  return winner;
}
