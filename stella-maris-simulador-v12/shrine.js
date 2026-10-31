import * as THREE from 'three';
// Hand-modelled observational approximation from the provided frontal and aerial references.
export function createShrine({parent,stone,ivory,cap,angle,figureAngle=90}){
 const root=new THREE.Group();root.name='Virgen y pedestal · reconstrucción visual';root.rotation.y=angle;parent.add(root);
 const add=(g,m=ivory,p=root)=>{const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;p.add(o);return o};
 const ell=(x,y,z,a,b,c,p=root,m=ivory)=>{const o=add(new THREE.SphereGeometry(1,24,18),m,p);o.position.set(x,y,z);o.scale.set(a,b,c);return o};
 const slab=(w,h,d,x,y,z,m=stone,p=root)=>{const o=add(new THREE.BoxGeometry(w,h,d),m,p);o.position.set(x,y,z);return o};
 const tube=(pts,r=.015,m=ivory,p=root)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(...v))),48,r,7,false),m,p);
 const base=add(new THREE.CylinderGeometry(.51,.85,2.45,40),stone);base.position.y=1.575;
 const rim=add(new THREE.CylinderGeometry(.56,.57,.14,40),cap);rim.position.y=2.86;
 // Horseshoe apron, two shoulders with a narrow central devotional recess.
 const foot=add(new THREE.CylinderGeometry(1.05,1.18,.18,32),stone);foot.position.set(0,.09,-.22);foot.scale.z=.95;
 for(const sign of [-1,1]){
  for(let i=0;i<5;i++){const b=slab(.44,.20,.82,sign*(.88-i*.09),.19+i*.18,-.27+i*.075);b.rotation.z=-sign*.10;}
  const g=add(new THREE.ConeGeometry(.37,.8,5),stone);g.position.set(sign*.57,.85,-.47);g.scale.z=1.3;
 }
 for(let i=0;i<3;i++)slab(.56,.12,.24,0,.12+i*.1,-1.02+i*.18,cap);
 // Small devotional plaques: scale and placement only, no invented inscriptions.
 const plaqueMaterial=new THREE.MeshStandardMaterial({color:'#dfddd2',roughness:.8});
 for(let row=0;row<7;row++)for(let col=0;col<5;col++){const a=(col-2)*.38+(row%2)*.06,r=.83-row*.045;const plaque=slab(.15+(col%2)*.035,.11,.013,Math.sin(a)*r,.46+row*.32,-Math.cos(a)*r,plaqueMaterial);plaque.rotation.y=-a;}
 const sculpture=new THREE.Group();root.add(sculpture);sculpture.name="Figura · orientación independiente";sculpture.rotation.y=figureAngle*Math.PI/180;sculpture.position.y=2.94;
 // Cloud/wave plinth under the robe, with continuous curling relief.
 const cloud=add(new THREE.CylinderGeometry(.34,.40,.32,40),ivory,sculpture);cloud.position.y=.16;
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ell(Math.sin(a)*.27,.27,Math.cos(a)*.25,.16,.20,.12,sculpture);}
 for(const sign of [-1,1])tube(Array.from({length:70},(_,i)=>{const a=i/69*Math.PI*3.6,r=.13*(1-i/85);return [sign*.19+Math.cos(a)*r,.22+Math.sin(a)*r,-.31]}),.024,ivory,sculpture);
 // Non-rotational cloth mesh, asymmetric folds and tapered silhouette.
 const levels=[[.30,.30,.21],[.45,.28,.18],[.75,.22,.15],[1.03,.20,.145],[1.28,.23,.15],[1.51,.30,.18],[1.65,.21,.16]];
 const positions=[],indices=[],segments=64;
 for(let l=0;l<levels.length;l++){const [y,rx,rz]=levels[l];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,fold=(.017*Math.cos(a*9+y*2)+.009*Math.cos(a*15-y*3))*(1-(y-.3)/2);positions.push(Math.sin(a)*(rx+fold)+.025*Math.sin(y*2),y,Math.cos(a)*(rz+fold));}}
 for(let l=0;l<levels.length-1;l++)for(let i=0;i<segments;i++){const k=l*(segments+1)+i;indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
 const cloth=new THREE.BufferGeometry();cloth.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));cloth.setIndex(indices);cloth.computeVertexNormals();const dress=add(cloth,ivory,sculpture);dress.material=ivory.clone();dress.material.side=THREE.DoubleSide;
 // Mantle falling from the hood to both sides; relief folds follow its fall.
 for(const sign of [-1,1]){
  tube([[sign*.10,1.89,.055],[sign*.21,1.70,.11],[sign*.27,1.43,.12],[sign*.24,1.12,.13],[sign*.32,.76,.08],[sign*.35,.52,-.02]],.065,ivory,sculpture);
  for(let j=0;j<3;j++)tube([[sign*(.16+j*.025),1.57,-.045],[sign*(.20+j*.025),1.22,-.08],[sign*(.15+j*.035),.84,-.14],[sign*(.22+j*.032),.39,-.18]],.011,ivory,sculpture);
 }
 const hood=ell(0,1.90,.018,.155,.225,.13,sculpture);ell(0,1.88,-.085,.100,.145,.071,sculpture);ell(0,1.87,-.153,.024,.045,.026,sculpture);ell(0,1.79,-.095,.046,.037,.044,sculpture);
 // Inset cheeks, brow, and lowered gaze in monochrome stone.
 tube([[-.062,1.913,-.144],[-.029,1.920,-.159],[-.008,1.915,-.163]],.006,ivory,sculpture);tube([[.008,1.915,-.163],[.029,1.920,-.159],[.062,1.913,-.144]],.006,ivory,sculpture);
 tube([[-.032,1.814,-.154],[0,1.809,-.159],[.032,1.814,-.154]],.005,ivory,sculpture);
 for(const sign of [-1,1]){
  tube([[sign*.16,1.59,-.04],[sign*.29,1.39,-.095],[sign*.19,1.40,-.22],[sign*.06,1.60,-.25]],.062,ivory,sculpture);
  ell(sign*.027,1.65,-.252,.033,.105,.031,sculpture);
  for(let finger=0;finger<4;finger++)tube([[sign*(.012+finger*.010),1.64,-.27],[sign*(.010+finger*.010),1.735,-.25]],.0045,ivory,sculpture);
 }
 const rosary=new THREE.MeshStandardMaterial({color:'#918d80',roughness:.72});
 const beads=Array.from({length:27},(_,i)=>{const t=i/26;return [.055+.055*Math.sin(t*Math.PI),1.54-t*.70,-.20-.018*Math.sin(t*Math.PI)]});tube(beads,.004,rosary,sculpture);for(const v of beads)ell(...v,.009,.009,.009,sculpture,rosary);slab(.012,.085,.009,.065,.79,-.22,rosary,sculpture);slab(.049,.012,.009,.065,.81,-.22,rosary,sculpture);
 // Flowers at the base, restrained in colour and proportion.
 const leaf=new THREE.MeshStandardMaterial({color:'#53654c',roughness:1});
 for(let i=0;i<35;i++){const a=i*2.399,r=.90+(i%4)*.10,x=Math.sin(a)*r,z=-.32+Math.cos(a)*r*.8;const c=new THREE.MeshStandardMaterial({color:['#cebc69','#d6c1b8','#b6879c','#dfddd2'][i%4],roughness:1});ell(x,.08,z,.10,.06,.09,root,leaf);for(let j=0;j<5;j++){const t=j*Math.PI*2/5;ell(x+Math.sin(t)*.036,.15,z+Math.cos(t)*.036,.031,.019,.030,root,c);}}
 return root;
}
