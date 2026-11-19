import * as T from '../vendor/three.module.min.js';
export function coastalSky(scene){
  const light=new T.DirectionalLight(0xffdda5,2.25);light.position.set(-125,115,-95);scene.add(light);
  const ambient=new T.HemisphereLight(0xf8e2cd,0xd7a3ad,1.55);scene.add(ambient);
  const uniforms={sun:{value:new T.Vector3(-.44,.23,-1).normalize()},night:{value:0}};
  const mat=new T.ShaderMaterial({uniforms,side:T.BackSide,depthWrite:false,fog:false,
    vertexShader:'varying vec3 v;void main(){v=position;vec4 p=projectionMatrix*viewMatrix*vec4(cameraPosition+position,1.);gl_Position=p.xyww;}',
    fragmentShader:`varying vec3 v;uniform vec3 sun;uniform float night;
    float hash(float n){return fract(sin(n)*43758.545);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float n=i.x+i.y*57.;return mix(mix(hash(n),hash(n+1.),f.x),mix(hash(n+57.),hash(n+58.),f.x),f.y);}
    void main(){vec3 d=normalize(v);float y=max(0.,d.y);vec3 c=mix(vec3(1.,.76,.58),vec3(.31,.70,.79),smoothstep(.01,.56,y));c=mix(c,vec3(.15,.47,.66),smoothstep(.48,1.,y));
    vec2 s=d.xz/(max(.045,y)+.10);float cloud=noise(s*vec2(1.3,6.))+noise(s*vec2(4.,10.))*.32;
    c=mix(c,vec3(1.,.87,.74),smoothstep(.80,1.04,cloud)*.55*smoothstep(.03,.15,y));
    float dist=distance(d,sun);c=mix(c,vec3(1.,.80,.52),exp(-dist*4.)*.70);c=mix(c,vec3(1.,.97,.76),1.-smoothstep(.057,.060,dist));c=mix(c,vec3(.085,.14,.26)+y*.08,night*.92);gl_FragColor=vec4(c,1.);}`});
  const sky=new T.Mesh(new T.SphereGeometry(700,24,12),mat);sky.frustumCulled=false;sky.renderOrder=-100;scene.add(sky);
  scene.fog=new T.FogExp2(0xf9cbb1,.0031);
  return time=>{const n=(1-Math.cos(time*Math.PI*2/620))*.5;uniforms.night.value=n;light.intensity=2.18-1.78*n;ambient.intensity=1.5-.86*n;scene.fog.color.set(0xf5cab0).lerp(new T.Color(0x344068),n);uniforms.sun.value.y=.21-.43*n};
}
