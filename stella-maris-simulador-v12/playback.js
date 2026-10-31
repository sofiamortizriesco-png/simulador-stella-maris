import {solarPosition,zonedInstant} from './solar.js';
const $=id=>document.getElementById(id),pad=n=>String(n).padStart(2,'0');
export function createSolarPlayback({getClock,getSite,onTime,onPause}){
 let running=false,last=0,acc=0,minute=1080,key='',samples=[],events={dawn:null,dusk:null,peak:720},anchor=null;
 const chart=$('solarChart'),ctx=chart.getContext('2d');
 const parse=t=>t.split(':').reduce((v,n,i)=>v+Number(n)*(i===0?60:i===1?1:1/60),0);
 const hm=m=>m==null?'—':pad(Math.floor(m/60))+':'+pad(Math.floor(m%60));
 const stamp=m=>{const sec=Math.min(86399,Math.max(0,Math.round(m*60)));return pad(Math.floor(sec/3600))+':'+pad(Math.floor(sec/60)%60)+':'+pad(sec%60)};
 function at(m){return solarPosition(new Date(anchor.getTime()+m*60000),getSite().latitude,getSite().longitude)}
 function rebuild(){const c=getClock(),s=getSite(),k=c.date+':'+s.latitude+':'+s.longitude;if(k===key)return;key=k;anchor=zonedInstant(c.date,'12:00');anchor=new Date(anchor.getTime()-720*60000);samples=[];events={dawn:null,dusk:null,peak:0};let max=-90,prev=at(0).elevation;
 for(let m=0;m<=1440;m++){const e=at(m).elevation;if(m%10===0)samples.push({m,e});if(e>max){max=e;events.peak=m;}if(m&&prev<=0&&e>0)events.dawn=m-1+(0-prev)/(e-prev);if(m&&prev>0&&e<=0)events.dusk=m-1+(0-prev)/(e-prev);prev=e;}
 $('dawnTime').textContent=hm(events.dawn);$('duskTime').textContent=hm(events.dusk);$('peakTime').textContent=hm(events.peak);
 }
 function bounds(){return $('solarScope').value==='full'?[0,1439.98]:[events.dawn??0,events.dusk??1439.98]}
 function draw(){const w=chart.clientWidth||260,h=130,dpr=Math.min(devicePixelRatio,2);if(chart.width!==Math.round(w*dpr)||chart.height!==h*dpr){chart.width=Math.round(w*dpr);chart.height=h*dpr;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const left=24,right=w-9,top=10,bottom=106,x=m=>left+(right-left)*m/1440,y=e=>bottom-(bottom-top)*Math.max(0,e)/90;
 ctx.fillStyle='#eef0e9';ctx.fillRect(left,top,right-left,bottom-top);if(events.dawn!=null&&events.dusk!=null){ctx.fillStyle='#f5eedb';ctx.fillRect(x(events.dawn),top,x(events.dusk)-x(events.dawn),bottom-top);}ctx.font='9px system-ui';ctx.fillStyle='#77847b';for(const a of [0,45,90]){ctx.strokeStyle='#dde0d5';ctx.beginPath();ctx.moveTo(left,y(a));ctx.lineTo(right,y(a));ctx.stroke();ctx.fillText(a+'°',0,y(a)+3);}ctx.beginPath();for(const [i,p] of samples.entries()){if(i)ctx.lineTo(x(p.m),y(p.e));else ctx.moveTo(x(p.m),y(p.e));}ctx.strokeStyle='#b88e4e';ctx.lineWidth=2;ctx.stroke();for(const m of [0,360,720,1080,1440])ctx.fillText(m===1440?'24':hm(m).slice(0,2),x(m)-5,123);
 const e=at(minute).elevation;ctx.strokeStyle='#344a3f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x(minute),top);ctx.lineTo(x(minute),bottom);ctx.stroke();ctx.fillStyle='#344a3f';ctx.beginPath();ctx.arc(x(minute),y(e),4,0,Math.PI*2);ctx.fill();}
 function refresh(){rebuild();minute=parse(getClock().time);draw();}
 function pause(){if(!running)return;running=false;$('play').textContent='▶';$('play').classList.remove('playing');$('play').setAttribute('aria-label','Reproducir el día');$('play').setAttribute('aria-pressed','false');$('playbackStatus').textContent='En pausa · '+hm(minute);onPause();}
 function play(){refresh();const [a,b]=bounds();if(minute<a||minute>=b){minute=a;onTime(stamp(minute));}running=true;last=performance.now();acc=0;$('play').textContent='Ⅱ';$('play').classList.add('playing');$('play').setAttribute('aria-label','Pausar recorrido');$('play').setAttribute('aria-pressed','true');$('playbackStatus').textContent='Recorriendo el día · las sombras del prototipo se actualizan.';}
 function tick(now){if(!running)return;const dt=Math.min(.15,Math.max(0,(now-last)/1000));last=now;minute+=dt*+$('solarSpeed').value;acc+=dt;const [a,b]=bounds();if(minute>=b){if($('loopSun').checked)minute=a;else{minute=b;onTime(stamp(minute));pause();return;}}if(acc>=1/24){acc=0;onTime(stamp(minute));}}
 $('play').onclick=()=>running?pause():play();$('solarScope').onchange=pause;
 for(const [id,event] of [['solarDawn','dawn'],['solarPeak','peak'],['solarDusk','dusk']])$(id).onclick=()=>{pause();refresh();if(events[event]!=null)onTime(stamp(Math.min(1439.98,events[event])));};
 let scrubbing=false;function scrub(e){pause();const b=chart.getBoundingClientRect(),m=Math.max(0,Math.min(1439.98,1440*(e.clientX-b.left-24)/(b.width-33)));onTime(stamp(m));}
 chart.onpointerdown=e=>{scrubbing=true;chart.setPointerCapture(e.pointerId);scrub(e)};chart.onpointermove=e=>{if(scrubbing)scrub(e)};chart.onpointerup=()=>scrubbing=false;chart.onpointercancel=()=>scrubbing=false;
 document.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||e.target.closest('input,select,textarea,button,[contenteditable]'))return;e.preventDefault();running?pause():play();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});new ResizeObserver(draw).observe(chart);refresh();return {tick,refresh,pause,play};
}
