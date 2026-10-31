// NOAA / Meeus geometric solar position. Azimuth clockwise from true north.
const rad=Math.PI/180, norm=x=>(x%360+360)%360;
export const SITE={latitude:-33.5015893,longitude:-71.6204554,timezone:'America/Santiago'};
export function zonedInstant(day,time,zone=SITE.timezone){
 const [y,m,d]=day.split('-').map(Number), [h,mi,se=0]=time.split(':').map(Number);
 const wanted=Date.UTC(y,m-1,d,h,mi,se), fmt=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 let t=wanted;
 for(let i=0;i<4;i++){const parts=Object.fromEntries(fmt.formatToParts(new Date(t)).map(p=>[p.type,p.value]));const wall=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second);const diff=wanted-wall;if(!diff) return new Date(t);t+=diff;}
 throw new Error('La hora elegida no existe por el cambio de horario. Prueba otra hora.');
}
export function solarPosition(date,latitude=SITE.latitude,longitude=SITE.longitude){
 const jd=date.getTime()/86400000+2440587.5,T=(jd-2451545)/36525;
 const L=norm(280.46646+T*(36000.76983+T*.0003032));
 const M=norm(357.52911+T*(35999.05029-.0001537*T));
 const e=.016708634-T*(.000042037+.0000001267*T);
 const C=Math.sin(M*rad)*(1.914602-T*(.004817+.000014*T))+Math.sin(2*M*rad)*(.019993-.000101*T)+Math.sin(3*M*rad)*.000289;
 const lambda=L+C-.00569-.00478*Math.sin((125.04-1934.136*T)*rad);
 const eps0=23+(26+(21.448-T*(46.815+T*(.00059-T*.001813)))/60)/60;
 const eps=eps0+.00256*Math.cos((125.04-1934.136*T)*rad);
 const decl=Math.asin(Math.sin(eps*rad)*Math.sin(lambda*rad));
 const y=Math.tan(eps*rad/2)**2;
 const eq=4/rad*(y*Math.sin(2*L*rad)-2*e*Math.sin(M*rad)+4*e*y*Math.sin(M*rad)*Math.cos(2*L*rad)-.5*y*y*Math.sin(4*L*rad)-1.25*e*e*Math.sin(2*M*rad));
 const minutes=date.getUTCHours()*60+date.getUTCMinutes()+date.getUTCSeconds()/60;
 const solarMinutes=((minutes+eq+4*longitude)%1440+1440)%1440;
 const H=(solarMinutes/4-180)*rad,lat=latitude*rad;
 const sinEl=Math.sin(lat)*Math.sin(decl)+Math.cos(lat)*Math.cos(decl)*Math.cos(H);
 const elevation=Math.asin(Math.max(-1,Math.min(1,sinEl)))/rad;
 const azimuth=norm(Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(lat)-Math.tan(decl)*Math.cos(lat))/rad+180);
 return {elevation,azimuth,declination:decl/rad,equationOfTime:eq,shadowAzimuth:norm(azimuth+180),shadowPerMeter:elevation>0?1/Math.tan(elevation*rad):null};
}
