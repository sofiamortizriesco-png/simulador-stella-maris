import * as THREE from 'three';
import {createShrine} from './shrine.js';
export const DEFAULT_DIMENSIONS={length:18,width:6,benchLength:1.5,benchWidth:.45,benchHeight:.45,wallHeight:.60,wallThickness:.30,pillarHeight:.90,monumentHeight:4,leftWallLength:7,leftWallAngle:70,coastEdgeAngle:130,coastRunAngle:0,secondWallAngle:-5,figureAngle:90,coastDrop:2.2};
export function buildTerrain({siteGroup,landscape,materials,map,angle,dims,mesh,box}){
 for(const group of [siteGroup,landscape]){group.traverse(o=>o.geometry?.dispose());group.clear();}
 const p=dims,L=p.length,W=p.width,u=x=>x*L/18,v=x=>x*W/6;
 // Local e follows the street; n points toward the street. The red-line correction is a two-segment edge.
 const a=(90-p.leftWallAngle)*Math.PI/180,coastAngle=(p.coastEdgeAngle-90)*Math.PI/180,runAngle=p.coastRunAngle*Math.PI/180,secondAngle=p.secondWallAngle*Math.PI/180;
 const leftA=[-.72,0],leftB=[leftA[0]-p.leftWallLength*Math.cos(a),p.leftWallLength*Math.sin(a)];
 const edgeA=[u(1.05),v(.25)],edgeK=[u(2),v(.25)+u(.95)*Math.tan(coastAngle)],edgeB=[u(6.2),edgeK[1]+u(4.2)*Math.tan(runAngle)];
 const secondA=[edgeB[0]+u(1.2),edgeB[1]+u(1.2)*Math.tan(runAngle)],secondB=[secondA[0]+u(3.1),secondA[1]+u(3.1)*Math.tan(secondAngle)];
 const minU=Math.min(u(-7.5),leftB[0]-.2),maxU=Math.max(u(10.5),secondB[0]+.2);
 const outlineLocal=[[minU,leftB[1]],[...leftB],[...leftA],[u(.2),v(-.3)],[...edgeA],[...edgeK],[...edgeB],[...secondA],[...secondB],[maxU,secondB[1]],[maxU,v(5.8)],[u(6),v(6.15)],[u(1),v(6.1)],[u(-4),v(6.3)],[minU,v(6.1)]];
 const outline=outlineLocal.map(([e,n])=>{const q=map(e,n);return new THREE.Vector2(q.x,-q.z)});
 const paving=new THREE.ShapeGeometry(new THREE.Shape(outline));const uv=paving.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+12)/24,(uv.getY(i)+9)/18);
 const shrine=createShrine({parent:siteGroup,stone:materials.stone,ivory:materials.statue,cap:materials.cap,angle,figureAngle:p.figureAngle});shrine.scale.setScalar(p.monumentHeight/5.065);
 const benches=[];const positions=[[-5.56,5.59,-.025],[-1.74,5.42,.012],[2.8,5.3,.018],[8.55,5.13,-.01],[.85,3.6,28*Math.PI/180],[3.5,1.95,65*Math.PI/180]];
 for(const [i,[e,n,a]] of positions.entries()){const g=new THREE.Group();g.name='Banca '+(i+1);g.position.copy(map(u(e),v(n)));g.rotation.y=angle+a;siteGroup.add(g);box(p.benchLength-.03,p.benchHeight-.06,p.benchWidth-.035,0,(p.benchHeight-.06)/2,0,materials.stone,g);box(p.benchLength,.06,p.benchWidth,0,p.benchHeight-.03,0,materials.cap,g);benches.push(g);}
 const A=map(...leftA),B=map(...leftB),C=map(...secondA),D=map(...secondB);
 const walls=[[A.x,-A.z,B.x,-B.z],[C.x,-C.z,D.x,-D.z]];
 // No angle labels, reference axes or overlays in the reconstructed space.
 const annotations=new THREE.Group();annotations.name='Sin anotaciones en terreno';siteGroup.add(annotations);
 // The line marked BARRERA is a real-height stone guard wall, with caps and piers.
 const coastalBarrier=new THREE.Group();coastalBarrier.name='Barrera costera junto al pedestal';siteGroup.add(coastalBarrier);
 for(const [from,to] of [[edgeA,edgeK],[edgeK,edgeB]]){const section=new THREE.Group();section.position.copy(map((from[0]+to[0])/2,(from[1]+to[1])/2));const start=map(...from),end=map(...to),dx=end.x-start.x,dz=end.z-start.z;section.rotation.y=-Math.atan2(dz,dx);coastalBarrier.add(section);const len=Math.hypot(dx,dz);box(len,p.wallHeight-.055,p.wallThickness,0,(p.wallHeight-.055)/2,0,materials.stone,section);box(len,.055,p.wallThickness+.07,0,p.wallHeight-.0275,0,materials.cap,section);}
 const pierPoints=[edgeA,edgeK,[(edgeK[0]+edgeB[0])/2,(edgeK[1]+edgeB[1])/2],edgeB];
 for(const pt of pierPoints){const g=new THREE.Group();g.position.copy(map(...pt));g.rotation.y=angle;coastalBarrier.add(g);box(p.wallThickness+.08,p.pillarHeight-.055,p.wallThickness+.08,0,(p.pillarHeight-.055)/2,0,materials.stone,g);box(p.wallThickness+.15,.055,p.wallThickness+.15,0,p.pillarHeight-.0275,0,materials.cap,g);}
 function slab(w,h,d,e,n,y,m){const g=new THREE.Group();g.position.copy(map(e,n));g.position.y=y;g.rotation.y=angle;landscape.add(g);box(w,h,d,0,0,0,m,g);return g;}
 const asphalt=new THREE.MeshStandardMaterial({color:'#62696a',roughness:.98}),pale=new THREE.MeshStandardMaterial({color:'#cfcbbd',roughness:.95}),sand=new THREE.MeshStandardMaterial({color:'#c9b993',roughness:1});
 slab(L+8,.10,1.05,u(3),v(6.8),-.05,pale);slab(L+25,.12,5.4,u(3),v(10),-.19,asphalt);
 // Raised kerb as repeated sections rather than a floating road plane.
 for(let e=-7.5;e<10.5;e+=.8)slab(.77,.14,.15,u(e+.4),v(7.38),.01,materials.cap);
 const slopeMat=new THREE.MeshStandardMaterial({color:'#929582',roughness:1});
 const boundary=[leftB,leftA,edgeA,edgeK,edgeB,secondA,secondB,[maxU,secondB[1]]];
 for(let j=0;j<boundary.length-1;j++){if(j===4)continue;const a=boundary[j],b=boundary[j+1],vertices=[],indices=[],steps=14;for(let i=0;i<=steps;i++){const t=i/steps,e=a[0]+(b[0]-a[0])*t,n=a[1]+(b[1]-a[1])*t;for(let k=0;k<=8;k++){const depth=k/8*5.5,q=map(e,n-depth);vertices.push(q.x,-p.coastDrop*k/8+.05*Math.sin(e*1.7)*Math.sin(k/8*Math.PI),q.z);}}for(let i=0;i<steps;i++)for(let k=0;k<8;k++){const o=i*9+k;indices.push(o,o+9,o+1,o+1,o+9,o+10);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const m=mesh(g,slopeMat,landscape);m.material.side=THREE.DoubleSide;m.castShadow=false;}
 const edgeAt=e=>{for(let j=0;j<boundary.length-1;j++){const a=boundary[j],b=boundary[j+1];if(e>=a[0]&&e<=b[0])return a[1]+(b[1]-a[1])*(e-a[0])/(b[0]-a[0]||1);}return e<leftB[0]?leftB[1]:secondB[1];};
 const stair=(e,n,bearing,width)=>{const g=new THREE.Group();g.position.copy(map(e,n));g.rotation.y=bearing;landscape.add(g);const steps=12,rise=p.coastDrop/steps;for(let i=0;i<steps;i++)box(width,rise,.32,0,-rise*(i+.5),.32*(i+.5),materials.stone,g);return g;};
 // Access at the far endpoint of the diagonal and independent coastal access.
 const leftAccess=stair(...leftB,angle+Math.PI/2,1.15);
 const rightAccess=stair((edgeB[0]+secondA[0])/2,(edgeB[1]+secondA[1])/2,angle-runAngle,1.15);
 slab(L+50,.08,16,u(3),-12,-p.coastDrop-.04,sand);
 const sea=new THREE.MeshStandardMaterial({color:'#719fa5',roughness:.45,metalness:.05});slab(200,.04,150,u(3),-95,-p.coastDrop-.12,sea);
 const leaves=new THREE.MeshStandardMaterial({color:'#6d795c',roughness:1});for(let i=0;i<42;i++){const e=minU+(i*1.11)%(maxU-minU),depth=.30+(i%5)*.45,n=edgeAt(e)-depth;if(e>edgeB[0]-.4&&e<secondA[0]+.6)continue;const g=mesh(new THREE.IcosahedronGeometry(.38+(i%4)*.09,2),leaves,landscape);g.position.copy(map(e,n));g.position.y=-p.coastDrop*depth/5.5+.12;g.scale.set(1.7,.65,1.2);}
 const rockMat=new THREE.MeshStandardMaterial({color:'#a5a18e',roughness:1});for(let i=0;i<13;i++){const g=mesh(new THREE.DodecahedronGeometry(.28+(i%4)*.11),rockMat,landscape);g.position.copy(map(u(-5+i*1.38),-5.4-(i%3)*.4));g.position.y=-p.coastDrop+.17;g.scale.set(1.5,.7,1.05);}
 const lamp=new THREE.Group();lamp.position.copy(map(u(9.1),v(.8)));siteGroup.add(lamp);const metal=new THREE.MeshStandardMaterial({color:'#b9b5a9',metalness:.5,roughness:.6});const pole=mesh(new THREE.CylinderGeometry(.055,.075,5,12),metal,lamp);pole.position.y=2.5;for(const y of [4.25,4.65])box(.25,.20,.13,.08,y,0,materials.cap,lamp);
 return {paving,benches,walls,shrine,annotations,coastalBarrier,reference:{leftA,leftB,edgeA,edgeK,edgeB,secondA,secondB},accesses:[leftAccess,rightAccess]};
}
