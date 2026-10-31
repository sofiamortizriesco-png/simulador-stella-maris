import * as THREE from 'three';
// Pixel-cell contours: produce actual closed mesh surfaces, not a transparent decal.
export function imagePlateGeometry(image,{width=.35,length=.32,thickness=.004,threshold=150,invert=false,resolution=192}={}){
 const nx=resolution,ny=Math.max(24,Math.round(resolution*length/width));
 const canvas=document.createElement('canvas');canvas.width=nx;canvas.height=ny;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,nx,ny);
 const ar=image.width/image.height, pa=width/length;
 let dw=nx,dh=ny;if(ar>pa)dh=nx/ar;else dw=ny*ar;
 ctx.drawImage(image,(nx-dw)/2,(ny-dh)/2,dw,dh);
 const pix=ctx.getImageData(0,0,nx,ny).data,solid=new Uint8Array(nx*ny);let holes=0;
 for(let i=0;i<solid.length;i++){const lum=.2126*pix[i*4]+.7152*pix[i*4+1]+.0722*pix[i*4+2];const cut=pix[i*4+3]>80&&(invert?lum>threshold:lum<threshold);solid[i]=cut?0:1;holes+=+cut;}
 if(holes/solid.length>.9)throw new Error('El calado elimina más del 90% de la placa. Invierte el color o cambia el umbral.');
 const edges=new Map(), key=(x,y)=>x+','+y;
 function edge(x,y,X,Y){const k=key(x,y);if(!edges.has(k))edges.set(k,[]);edges.get(k).push([X,Y]);}
 const at=(x,y)=>x>=0&&x<nx&&y>=0&&y<ny&&solid[y*nx+x];
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)if(at(x,y)){
 if(!at(x,y-1))edge(x,y,x+1,y);if(!at(x+1,y))edge(x+1,y,x+1,y+1);if(!at(x,y+1))edge(x+1,y+1,x,y+1);if(!at(x-1,y))edge(x,y+1,x,y);
 }
 const loops=[];
 while(edges.size){const start=edges.keys().next().value, first=start.split(',').map(Number),loop=[];let cur=first,prev=null,guard=0;
 do{loop.push(cur);let k=key(...cur),choices=edges.get(k);if(!choices?.length)break;
 let ix=0;if(prev&&choices.length>1){const dx=cur[0]-prev[0],dy=cur[1]-prev[1];let best=-99;choices.forEach((v,i)=>{const ex=v[0]-cur[0],ey=v[1]-cur[1],cross=dx*ey-dy*ex,dot=dx*ex+dy*ey;const score=cross>0?3:dot>0?2:cross<0?1:0;if(score>best){best=score;ix=i;}});}
 const next=choices.splice(ix,1)[0];if(!choices.length)edges.delete(k);prev=cur;cur=next;guard++;}while(key(...cur)!==start&&guard<200000);
 if(loop.length<4)continue;
 const simp=loop.filter((p,i)=>{const a=loop[(i+loop.length-1)%loop.length],b=loop[(i+1)%loop.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
 const points=simp.map(([x,y])=>new THREE.Vector2((x/nx-.5)*width,(.5-y/ny)*length));
 if(Math.abs(THREE.ShapeUtils.area(points))>width*length/(nx*ny)*.6)loops.push(points);
 }
 const outer=loops.filter(p=>THREE.ShapeUtils.area(p)<0).map(p=>({p,shape:new THREE.Shape(p)}));
 function contains(p,v){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a.y>v.y)!==(b.y>v.y)&&v.x<(b.x-a.x)*(v.y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
 for(const loop of loops.filter(p=>THREE.ShapeUtils.area(p)>0)){const owners=outer.filter(o=>contains(o.p,loop[0])).sort((a,b)=>Math.abs(THREE.ShapeUtils.area(a.p))-Math.abs(THREE.ShapeUtils.area(b.p)));if(owners[0])owners[0].shape.holes.push(new THREE.Path(loop));}
 if(!outer.length)throw new Error('No se encontró una superficie sólida. Revisa los colores del dibujo.');
 const geo=new THREE.ExtrudeGeometry(outer.map(o=>o.shape),{depth:thickness,bevelEnabled:false,steps:1,curveSegments:1});
 geo.translate(0,0,-thickness/2);geo.rotateX(-Math.PI/2);geo.computeVertexNormals();
 return {geometry:geo,coverage:holes/solid.length,resolution:nx,contours:loops.length};
}
export function starPlateGeometry(width=.35,length=.32,thickness=.004){
 const shape=new THREE.Shape();shape.moveTo(-width/2,-length/2);shape.lineTo(width/2,-length/2);shape.lineTo(width/2,length/2);shape.lineTo(-width/2,length/2);shape.closePath();
 const hole=new THREE.Path();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?.035:.105;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(!i)hole.moveTo(x,y);else hole.lineTo(x,y);}hole.closePath();shape.holes.push(hole);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false});geo.translate(0,0,-thickness/2);geo.rotateX(-Math.PI/2);return geo;
}
