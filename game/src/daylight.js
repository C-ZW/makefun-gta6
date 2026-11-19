import * as T from '../vendor/three.module.min.js';
export function coastalSky(scene){
  const light=new T.DirectionalLight(0xffdda5,2.25);light.position.set(-90,105,87);scene.add(light);
  light.castShadow=true;Object.assign(light.shadow.camera,{left:-172,right:172,top:178,bottom:-178,near:.1,far:410});
  light.shadow.mapSize.set(2048,2048);light.shadow.bias=-.00045;light.shadow.normalBias=.055;
  const ambient=new T.HemisphereLight(0xf8e2cd,0xd7a3ad,1.55);scene.add(ambient);
  const uniforms={sun:{value:new T.Vector3(.22,.23,-1).normalize()},night:{value:0}};
  const mat=new T.ShaderMaterial({uniforms,side:T.BackSide,depthWrite:false,fog:false,
    vertexShader:'varying vec3 v;void main(){v=position;vec4 p=projectionMatrix*viewMatrix*vec4(cameraPosition+position,1.);gl_Position=p.xyww;}',
    fragmentShader:`varying vec3 v;uniform vec3 sun;uniform float night;
    float hash(float n){return fract(sin(n)*43758.545);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float n=i.x+i.y*57.;return mix(mix(hash(n),hash(n+1.),f.x),mix(hash(n+57.),hash(n+58.),f.x),f.y);}
    void main(){vec3 d=normalize(v);float y=max(0.,d.y);vec3 c=mix(vec3(1.,.76,.58),vec3(.31,.70,.79),smoothstep(.01,.56,y));c=mix(c,vec3(.15,.47,.66),smoothstep(.48,1.,y));
    vec2 s=d.xz/(max(.045,y)+.10);float cloud=noise(s*vec2(1.3,6.))+noise(s*vec2(4.,10.))*.32;
    c=mix(c,vec3(1.,.87,.74),smoothstep(.80,1.04,cloud)*.55*smoothstep(.03,.15,y));
    float dist=distance(d,sun);c=mix(c,vec3(1.,.80,.52),exp(-dist*4.)*.70);c=mix(c,vec3(1.,.97,.76),1.-smoothstep(.057,.060,dist));
    vec3 dusk=mix(vec3(.57,.34,.40),vec3(.09,.18,.32),smoothstep(0.,.38,y));dusk=mix(dusk,vec3(.32,.30,.44),smoothstep(.82,1.06,cloud)*.38);
    vec2 sp=vec2(atan(d.x,d.z)*125.,d.y*210.);float st=step(.992,hash(dot(floor(sp),vec2(13.,45.))))*(1.-smoothstep(.02,.13,length(fract(sp)-.5)));
    dusk+=vec3(.7,.76,.77)*st*smoothstep(.08,.42,y);c=mix(c,dusk,night*.95);gl_FragColor=vec4(c,1.);}`});
  const sky=new T.Mesh(new T.SphereGeometry(700,24,12),mat);sky.frustumCulled=false;sky.renderOrder=-100;scene.add(sky);
  scene.fog=new T.FogExp2(0xf9cbb1,.0031);
  const nightFog=new T.Color(0x4c526b);
  return time=>{const angle=(time/620+18.5667/24)*Math.PI*2,n=Math.max(0,Math.min(1,(Math.cos(angle)-.10)*1.18));uniforms.night.value=n;
   light.intensity=2.18-1.62*n;ambient.intensity=1.50-.72*n;scene.fog.color.set(0xf5cab0).lerp(nightFog,n);uniforms.sun.value.y=.25-.51*n};
}
