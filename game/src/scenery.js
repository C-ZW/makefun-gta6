import * as T from '../vendor/three.module.min.js';

export function sceneryBatch(scene) {
  const groups = new Map();
  const shape = {
    box: new T.BoxGeometry(1, 1, 1),
    ball: new T.IcosahedronGeometry(1, 1),
    round: new T.CylinderGeometry(1, 1, 1, 10),
    taper: new T.CylinderGeometry(.65, 1, 1, 8),
    roof: new T.ConeGeometry(1, 1, 4),
    shade: new T.PlaneGeometry(1,1)
  };
  // BufferGeometry.computeVertexNormals mutates its geometry.
  const leaf = new T.BufferGeometry();
  leaf.setAttribute('position', new T.Float32BufferAttribute([
    0,0,0, .26,.06,.45, 0,.27,.45, 0,0,0, 0,.27,.45, -.26,.06,.45,
    .26,.06,.45, 0,-.23,1, 0,.27,.45, 0,.27,.45, 0,-.23,1, -.26,.06,.45
  ], 3));
  leaf.computeVertexNormals();
  shape.leaf = leaf;
  const dummy = new T.Object3D();
  return {
    part(kind, color, x, y, z, w, h, d, yaw = 0, pitch = 0, roll = 0, glow = false) {
      const key = kind + (glow ? ':light' : '');
      if (!groups.has(key)) groups.set(key, { geometry: shape[kind], glow, parts: [] });
      dummy.position.set(x,y,z);
      dummy.scale.set(w,h,d);
      dummy.rotation.set(pitch,yaw,roll,'YXZ');
      dummy.updateMatrix();
      groups.get(key).parts.push([dummy.matrix.clone(), new T.Color(color)]);
    },
    bake() {
      for (const {geometry,glow,parts} of groups.values()) {
        const mat = geometry===shape.shade
          ? new T.MeshBasicMaterial({transparent:true,opacity:.17,depthWrite:false,side:T.DoubleSide})
          : glow ? new T.MeshBasicMaterial() : new T.MeshStandardMaterial({roughness:.88, side:T.DoubleSide});
        const mesh = new T.InstancedMesh(geometry, mat, parts.length);
        parts.forEach(([matrix,color], i) => { mesh.setMatrixAt(i,matrix); mesh.setColorAt(i,color); });
        mesh.computeBoundingSphere();
        scene.add(mesh);
      }
    }
  };
}

export function randomFrom(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function labelPlane(scene, {text, sub = '', x, y, z, w, h, yaw = 0, color = '#ffdfa1', ink = '#173538', plate = '#fcaa67'}) {
  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ink; ctx.fillRect(0,0,768,192);
  ctx.strokeStyle = plate; ctx.lineWidth = 5; ctx.strokeRect(10,10,748,172);
  ctx.textAlign = 'center'; ctx.fillStyle = color;
  ctx.font = '900 91px Arial'; ctx.fillText(text,384,sub ? 113 : 129,716);
  if (sub) {
    ctx.font = '700 27px Arial'; ctx.fillStyle = plate; ctx.fillText(sub,384,151,704);
  }
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  const sign = new T.Mesh(new T.PlaneGeometry(w,h), new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));
  sign.position.set(x,y,z); sign.rotation.y = yaw;
  scene.add(sign);
  return sign;
}

export function shadowDisc(radius = 1, depth = 1, opacity = .28) {
  const mesh = new T.Mesh(new T.CircleGeometry(1,16), new T.MeshBasicMaterial({
    color:0x252137, transparent:true, opacity, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2
  }));
  mesh.rotation.x = -Math.PI/2;
  mesh.scale.set(radius,depth,1);
  mesh.position.y = .043;
  return mesh;
}
