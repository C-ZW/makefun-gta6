import * as T from '../vendor/three.module.min.js';

export function createAtmosphere(scene) {
  const light = new T.DirectionalLight(0xffc090, 2.45);
  const fill = new T.HemisphereLight(0xf5e9dc, 0x837e92, 2.05);
  scene.add(light,fill);
  scene.fog = new T.FogExp2(0xf4ba90,.00225);
  const colors = {
    top: {value:new T.Color()}, low:{value:new T.Color()}, sun:{value:new T.Vector3()},
    dark:{value:0}, tick:{value:0}
  };
  const sky = new T.Mesh(new T.SphereGeometry(1,32,20),new T.ShaderMaterial({
    uniforms:colors, side:T.BackSide, depthWrite:false,
    vertexShader:`
      varying vec3 direction;
      void main(){ direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
    `,
    fragmentShader:`
      uniform vec3 top,low,sun;
      uniform float dark;
      varying vec3 direction;
      float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p) {
        vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
      }
      void main(){
        vec3 d=normalize(direction);
        float up=max(0.,d.y);
        float solar=max(dot(d,sun),0.);
        vec3 c=mix(low,top,smoothstep(-.035,.63,d.y));
        c+=vec3(.33,.12,.035)*pow(solar,19.)*(1.-dark);
        c+=vec3(1.,.6,.27)*smoothstep(.99938,.99954,solar)*(1.-dark);
        vec2 p=d.xz/(up+.16)*vec2(3.1,7.8);
        float n=noise(p)+.47*noise(p*2.1)+.2*noise(p*4.2);
        float clouds=smoothstep(.79,1.17,n)*smoothstep(.01,.18,up)*(1.-smoothstep(.66,.97,up));
        c=mix(c,mix(vec3(.48,.13,.12)+solar*vec3(.35,.28,.18),vec3(.06,.075,.16),dark),clouds*.60);
        float stars=step(.997,hash(floor(d.xz/(up+.08)*300.)))*smoothstep(.11,.45,up);
        c+=stars*dark*.36;
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }
    `
  }));
  sky.renderOrder=-100; sky.scale.setScalar(1100); sky.frustumCulled=false; scene.add(sky);
  const water = new T.Mesh(new T.PlaneGeometry(4100,4100),new T.ShaderMaterial({
    uniforms:colors,
    vertexShader:`
      varying vec3 loc;
      void main(){loc=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(loc,1.);}
    `,
    fragmentShader:`
      uniform vec3 low,sun;
      uniform float tick,dark;
      varying vec3 loc;
      void main() {
        vec3 d=normalize(loc-cameraPosition);
        float a=sin(loc.x*.27+loc.z*.17+tick*1.2)+.48*cos(loc.x*.79-loc.z*.43+tick*1.75);
        float b=sin(loc.z*.80+loc.x*.24-tick*1.1);
        float rip=smoothstep(.48,1.43,a+b*.22);
        vec3 c=mix(vec3(.024,.25,.28),vec3(.10,.49,.45),rip*.60);
        float sunpath=pow(max(dot(normalize(vec3(d.x,0.,d.z)),normalize(vec3(sun.x,0.,sun.z))),0.),14.);
        c+=vec3(.67,.30,.08)*sunpath*rip*(1.-dark);
        c=mix(c*.37,c,1.-dark);
        c=mix(c,low,smoothstep(80.,900.,distance(loc,cameraPosition))*.75);
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }
    `
  }));
  water.rotation.x = -Math.PI/2; water.position.y = -.64; scene.add(water);
  const dayTop = new T.Color(0x70bdd1), dayLow = new T.Color(0xffc5a4);
  const nightTop = new T.Color(0x101837), nightLow = new T.Color(0x455476);
  const condition = {hour:18.1, frozen:false};
  return Object.assign(condition, {
    tick(dt,camera) {
      if (!this.frozen) this.hour = (this.hour + dt/27)%24;
      const night = Math.min(1, Math.max(0, (this.hour-19.2)/1.7, (6.6-this.hour)/1.5));
      const elevation = Math.max(.11, Math.sin((this.hour-5)/15*Math.PI)*.8);
      colors.sun.value.set(.53,elevation,-.83).normalize();
      colors.top.value.copy(dayTop).lerp(nightTop,night);
      colors.low.value.copy(dayLow).lerp(nightLow,night);
      colors.tick.value += dt; colors.dark.value = night;
      scene.fog.color.copy(colors.low.value);
      light.position.copy(colors.sun.value).multiplyScalar(80);
      light.intensity = 2.2 - 1.79*night;
      fill.intensity = 2.16 - 1.42*night;
      sky.position.copy(camera.position);
    }
  });
}
