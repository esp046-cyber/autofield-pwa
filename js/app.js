(()=>{const $=s=>document.querySelector(s),T=window.TOOLS,H=new URLSearchParams(location.hash.slice(1));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cur=T.some(t=>t.id===H.get('t'))?H.get('t'):T[0].id,md='';
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1500)};
const copy=async s=>{try{await navigator.clipboard.writeText(s);toast('Copied')}catch{toast('Copy failed')}};
const tool=()=>T.find(t=>t.id===cur);
function tabs(){$('#tabs').innerHTML=T.map(t=>`<button class="${t.id===cur?'on':''}" data-t="${t.id}">${t.name}</button>`).join('')}
function form(){$('#form').innerHTML=tool().f.map(f=>{const v=esc(H.get(f[0])??f[2]);
if(f[3]==='select')return`<label>${f[1]}<select data-k="${f[0]}">${f[4].map(o=>`<option ${o==H.get(f[0])||(!H.get(f[0])&&o==f[2])?'selected':''}>${o}</option>`).join('')}</select></label>`;
if(f[3]==='text')return`<label>${f[1]}<textarea data-k="${f[0]}" rows="${f[4]}">${v}</textarea></label>`;
const a=`min="${f[3]}" max="${f[4]}" step="${f[5]}" value="${v}" data-k="${f[0]}"`;return`<label>${f[1]}<span class="r"><input type="range" ${a}><input type="number" inputmode="decimal" ${a}></span></label>`}).join('');calc()}
function calc(){const t=tool(),v={};document.querySelectorAll('[data-k]').forEach(e=>v[e.dataset.k]=(e.type==='range'||e.type==='number')?parseFloat(e.value):e.value);
const f=t.f.find(f=>typeof f[3]==='number'&&(isNaN(v[f[0]])||v[f[0]]<f[3]||v[f[0]]>f[4]));
let r=f?{err:`${f[1]} must be ${f[3]} to ${f[4]}`}:t.run(v);
if(r.err){$('#out').innerHTML=`<p class="err">${esc(r.err)}</p>`;md='';return}
$('#out').innerHTML=`<div class="st ${r.st[0]}">${esc(r.st[1])}</div>`+r.rows.map((x,i)=>`<div class="card"><small>${esc(x[0])}</small><b>${esc(x[1])}</b>${x[2]?` <button data-c="${i}">Copy</button>`:''}</div>`).join('');
$('#out').onclick=e=>{const i=e.target.dataset.c;if(i!=null)copy(r.rows[i][1])};
const p=new URLSearchParams({t:cur});for(const k in v)p.set(k,v[k]);try{history.replaceState(null,'','#'+p)}catch{}
md=`### ${t.name}\n\n**Status:** ${r.st[1]}\n\n| Parameter | Value |\n|---|---|\n`+r.rows.map(x=>`| ${x[0]} | ${String(x[1]).replace(/\|/g,'/')} |`).join('\n')+`\n\nInputs: ${Object.entries(v).map(([k,x])=>k+'='+String(x).replace(/\s+/g,' ')).join(', ')}\n\nLink: ${location.href}\n`}
document.addEventListener('input',e=>{const k=e.target.dataset?.k;if(!k)return;document.querySelectorAll(`[data-k="${k}"]`).forEach(x=>{if(x!==e.target)x.value=e.target.value});for(const x of document.querySelectorAll('[data-k]'))H.set(x.dataset.k,x.value);calc()});
$('#tabs').onclick=e=>{const t=e.target.dataset.t;if(t){cur=t;tabs();form()}};
$('#bShare').onclick=async()=>{try{await navigator.share({title:'AutoField: '+tool().name,text:md,url:location.href})}catch{copy(location.href)}};
$('#bMd').onclick=()=>copy(md);
const mode=m=>{const on=document.body.classList.toggle(m);const o=m==='sun'?'night':'sun';if(on)document.body.classList.remove(o);try{localStorage.af_mode=on?m:''}catch{}};
$('#bSun').onclick=()=>mode('sun');$('#bNight').onclick=()=>mode('night');try{if(localStorage.af_mode)document.body.classList.add(localStorage.af_mode)}catch{}
let wl=null;const wb=$('#bWake');wb.onclick=async()=>{if(wl){await wl.release();wl=null;wb.textContent='Wake: off';return}
try{wl=await navigator.wakeLock.request('screen');wb.textContent='Wake: on';wl.onrelease=()=>{wl=null;wb.textContent='Wake: off'}}catch{toast('Wake Lock unavailable')}};
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'&&wb.textContent==='Wake: on'&&!wl){try{wl=await navigator.wakeLock.request('screen')}catch{}}});
$('#bTray').onclick=()=>$('#tray').hidden=!$('#tray').hidden;$('#tClose').onclick=()=>$('#tray').hidden=true;
const P1=["Analyze why my SCADA radio link drops intermittently in heavy rain at 450 MHz over a 12 km path.","Calculate the required F-Host watchdog time when bridging Safety I/O across two managed Ethernet switches.","Draft an email justifying a Siemens S7-1500 firmware upgrade from v2.8 to v3.1 for a TIA Portal v19 migration.","Diagnose high packet jitter in Wireshark on an EtherNet/IP CIP motion loop with a 2 ms RPI.","Translate Hirschmann RSP port error counters to SNMP OIDs for Zabbix monitoring.","Estimate memory and thread-pool overhead for an OPC UA server publishing 50,000 tags at 100 ms.","Explain SIL 2 vs SIL 3 loop response requirements for ESD ball valves under IEC 61511.","Write a recovery procedure for a Modicon M580 CPU stuck in HALT after a firmware flash.","Verify whether a 15 dBi Yagi at 27 dBm meets EIRP legal limits.","Generate a checklist for validating ground loop isolation on RS-485 Modbus RTU drops."];
const P2=["Implement haptic feedback with the Web Vibration API for critical safety alarms.","Use CSS @container queries to adapt calculator outputs from watch to ultrawide tablet.","Local-first sync with CRDTs and IndexedDB for collaborative offline diagnostics.","Design tokens for adaptive contrast: OLED #000 to Direct Sunlight (WCAG AAA 7:1).","Glove-friendly bottom-sheet gestures with spring-physics CSS curves.","Rolling live numbers with font-variant-numeric: tabular-nums.","Best practices for Web App Manifest shortcuts to jump to calculators.","Strategies for stale-while-revalidate cache invalidation with BroadcastChannel alerts.","Animated SVG link-path diagram driven by slider input.","Web Audio API pass/warn/fail chirps for high-noise plant environments."];
const pl=(el,a)=>{el.innerHTML=a.map(x=>`<p>${esc(x)}</p>`).join('');el.onclick=e=>{if(e.target.tagName==='P')copy(e.target.textContent)}};pl($('#p1'),P1);pl($('#p2'),P2);
try{if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!navigator.standalone&&!localStorage.af_a2)$('#a2hs').hidden=false}catch{}
$('#a2x').onclick=()=>{$('#a2hs').hidden=true;try{localStorage.af_a2=1}catch{}};
tabs();form()})();
