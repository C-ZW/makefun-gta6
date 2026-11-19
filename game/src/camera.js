import * as T from '../vendor/three.module.min.js';

export function thirdPersonCamera(camera) {
  const target = new T.Vector3(), goal = new T.Vector3();
  let ready = false;
  return {
    yaw:0, orbit:0, pitch:0, shake:0,
    snap() { ready = false; },
    update(dt, actor, car, world, input) {
      const a = 1-Math.exp(-dt*(car ? 6.5 : 11));
      if (car) {
        this.yaw += Math.atan2(Math.sin(car.yaw-this.yaw), Math.cos(car.yaw-this.yaw))*a;
        this.orbit *= Math.exp(-dt*(Math.abs(car.speed)>5 ? 2.2 : .75));
        this.orbit -= input.dx*.004;
      } else {
        this.yaw -= input.dx*.004;
        this.orbit = 0;
      }
      this.pitch = T.MathUtils.clamp(this.pitch + input.dy*.003, -.28,.45);
      const heading = this.yaw+this.orbit;
      const distance = car ? 9.3 + Math.min(Math.abs(car.speed)*.052,2.6) : 5.1;
      const height = car ? 3.9 : 2.42;
      const shoulder = car ? .15 : .94;
      const sin = Math.sin(heading), cos = Math.cos(heading);
      const x = actor.x, z = actor.z, ground = world.height(x,z);
      goal.set(x+sin*distance+cos*shoulder, ground+height+this.pitch*distance, z+cos*distance-sin*shoulder);
      for (let ratio=1; ratio>.25; ratio-=.13) {
        const px = x+(goal.x-x)*ratio, pz = z+(goal.z-z)*ratio;
        if (world.free(px,pz,.34)) { goal.x=px; goal.z=pz; break; }
      }
      const lead = car ? 6 : 9;
      target.set(x-sin*lead+cos*shoulder*.7, ground+(car ? 1.35 : 2.0)-this.pitch*3, z-cos*lead-sin*shoulder*.7);
      this.shake *= Math.exp(-dt*7);
      goal.y += Math.sin(performance.now()*.085)*this.shake;
      if (!ready) { camera.position.copy(goal); ready = true; }
      camera.position.lerp(goal,a);
      camera.lookAt(target);
    }
  };
}
