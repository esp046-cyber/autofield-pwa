/* Field tuple: [id,label,default,min,max,step] | [id,label,default,'select',[opts]] | [id,label,default,'text',rows] */
const f1=(n,d=1)=>(+n).toFixed(d);
const OIDS=[
['sysUpTime','1.3.6.1.2.1.1.3.0','System uptime'],['ifSpeed','1.3.6.1.2.1.2.2.1.5','Interface speed (bps)'],['ifHighSpeed','1.3.6.1.2.1.31.1.1.1.15','Interface speed (Mbps)'],
['ifOperStatus','1.3.6.1.2.1.2.2.1.8','Oper status'],['ifInOctets','1.3.6.1.2.1.2.2.1.10','Rx octets (32-bit)'],['ifOutOctets','1.3.6.1.2.1.2.2.1.16','Tx octets (32-bit)'],
['ifHCInOctets','1.3.6.1.2.1.31.1.1.1.6','Rx octets (64-bit)'],['ifHCOutOctets','1.3.6.1.2.1.31.1.1.1.10','Tx octets (64-bit)'],['ifInDiscards','1.3.6.1.2.1.2.2.1.13','Rx discards'],
['ifInErrors','1.3.6.1.2.1.2.2.1.14','Rx errors (FCS/CRC)'],['ifOutErrors','1.3.6.1.2.1.2.2.1.20','Tx errors'],
['dot1dBasePortDelayExceededDiscards','1.3.6.1.2.1.17.1.4.1.4','Bridge frames discarded: transit delay'],['dot1dBasePortMtuExceededDiscards','1.3.6.1.2.1.17.1.4.1.5','Bridge frames discarded: MTU'],
['dot1dTpFdbAddress','1.3.6.1.2.1.17.4.3.1.1','MAC forwarding table'],['lldpRemPortId','1.0.8802.1.1.2.1.4.1.1.7','LLDP remote port ID'],['lldpRemSysName','1.0.8802.1.1.2.1.4.1.1.9','LLDP remote system name'],
['cpmCPUTotal5minRev (Cisco/Stratix)','1.3.6.1.4.1.9.9.109.1.1.1.1.8','CPU 5-min %'],['ciscoMemoryPoolFree (Cisco/Stratix)','1.3.6.1.4.1.9.9.48.1.1.1.6','Free memory bytes'],
['ciscoEnvMonTemperatureStatusValue (Cisco/Stratix)','1.3.6.1.4.1.9.9.13.1.3.1.3','Temperature C'],['Hirschmann enterprise root','1.3.6.1.4.1.248','Verify exact CPU/temp OIDs in vendor HM2 MIB'],['Moxa enterprise root','1.3.6.1.4.1.8691','Verify exact CPU/temp OIDs in vendor MIB']];
const MX=[
['Siemens','TIA Portal V16','S7-1200','FW 4.0-4.4','HSP for newer CPUs; CP 1243-1 needs matching HSP'],['Siemens','TIA Portal V16','S7-1500','FW 2.5-2.8','Newer FW needs TIA update or HSP'],
['Siemens','TIA Portal V17','S7-1200','FW 4.5','Project upgrade from V16 required; no downgrade'],['Siemens','TIA Portal V17','S7-1500','FW 2.9','Check CP/CM FW'],
['Siemens','TIA Portal V18','S7-1200','FW 4.5-4.6','Upgrade projects; PLCSIM version must match'],['Siemens','TIA Portal V18','S7-1500','FW 3.0','FW 3.x features need V18+'],
['Siemens','TIA Portal V19','S7-1200','FW 4.6','Requires V19 install and updated HSPs'],['Siemens','TIA Portal V19','S7-1500','FW 3.1','Migrate 2.8->3.1 via V18/V19; back up project first'],
['Schneider','EcoStruxure Control Expert 15.x','Modicon M340','FW 3.x','Match BMXNOE/NOC Ethernet module FW'],['Schneider','EcoStruxure Control Expert 15.x','Modicon M580 (BMEP58xxxx)','FW 3.x-4.x','CPU and Ethernet/Copro modules must be on compatible FW set'],
['Schneider','EcoStruxure Machine Expert 2.x','M241/M251','FW 5.x','Controller FW must match Machine Expert version'],
['Rockwell','Studio 5000 Logix Designer v32','ControlLogix/CompactLogix 5380/5580','FW 32.x','FW major = software major'],['Rockwell','Studio 5000 Logix Designer v33','5380/5580','FW 33.x','Update ENxT/EN2T module FW in lockstep'],
['Rockwell','Studio 5000 Logix Designer v34','5380/5580','FW 34.x','Check ControlFLASH Plus kit'],['Rockwell','Studio 5000 Logix Designer v35','5380/5580','FW 35.x','FW major = software major'],['Rockwell','Studio 5000 Logix Designer v36','5380/5580','FW 36.x','FW major = software major']];
window.TOOLS=[
{id:'link',name:'Radio Link',f:[['f','Frequency (MHz)',450,30,6000,1],['d','Distance (km)',12,0.1,100,0.1],['ptx','Tx power (dBm)',27,0,40,0.5],['ltx','Tx cable loss (dB)',2,0,10,0.1],['gtx','Tx antenna (dBi)',10,0,30,0.5],['grx','Rx antenna (dBi)',10,0,30,0.5],['lrx','Rx cable loss (dB)',2,0,10,0.1],['sens','Rx sensitivity (dBm)',-105,-130,-60,1]],
run:v=>{const fs=20*Math.log10(v.d)+20*Math.log10(v.f)+32.44,rssi=v.ptx-v.ltx+v.gtx-fs+v.grx-v.lrx,m=rssi-v.sens;
return{rows:[['FSPL',f1(fs)+' dB'],['RSSI',f1(rssi)+' dBm'],['Fade margin',f1(m)+' dB'],['Fresnel radius (1st zone, mid-path)',f1(8.656*Math.sqrt(v.d/(v.f/1000)))+' m'],['EIRP',f1(v.ptx-v.ltx+v.gtx)+' dBm']],st:m<10?['bad','Unviable (<10 dB)']:m<20?['warn','Marginally viable (10-20 dB)']:['ok','Robust (>20 dB)']}}},
{id:'opc',name:'OPC UA Sizing',f:[['n','Monitored nodes',5000,1,100000,1],['T','Publishing interval (ms)',500,50,5000,10],['ts','Sampling interval (ms)',250,50,5000,10],['s','Subscriptions/sessions',4,1,100,1],['sec','Security mode',"Sign&Encrypt",'select',['None','Sign','Sign&Encrypt']],['ty','Tag data type',"Int/Float",'select',['Boolean','Int/Float','Complex']]],
run:v=>{const b={Boolean:200,'Int/Float':300,Complex:1200}[v.ty],sf={None:1,Sign:1.5,'Sign&Encrypt':3}[v.sec],
ram=60+v.n*b*(1+5*v.s)/1e6,cpu=(v.n*v.s*(1000/v.T)*2*sf+v.n*(1000/v.ts)*1)/1e4,kb=v.n*v.s*(1000/v.T)*(24+b/10)*8*1.1*(sf>1?1.15:1)/1000;
const tier=cpu<30&&ram<1000?'Raspberry Pi 4 / CM4':cpu<70&&ram<4000?'Siemens IPC227E class':'High-capacity server';
return{rows:[['Est. RAM',f1(ram)+' MB'],['Est. CPU load (1 core embedded)',f1(cpu)+' %'],['Egress (worst case, all values change)',kb>1000?f1(kb/1000,2)+' Mbps':f1(kb)+' kbps'],['Recommended tier',tier]],st:cpu<70?['ok','Within single-node limits']:['warn','Scale out / cluster']}}},
{id:'wire',name:'Wireshark Jitter',f:[['rpi','RPI / cycle (ms)',2,0.03,1000,0.01],['tol','Jitter tolerance +/- (ms)',0.5,0.001,100,0.001],['pr','Protocol',"EtherNet/IP CIP",'select',['Profinet IRT','Profinet RT','EtherNet/IP CIP','Modbus TCP']],['q','Delta times (ms, space/comma/newline separated)',"2.01 1.98 2.05 1.95 2.02 4.1 2.0 1.99",'text',4]],
run:v=>{const d=v.q.split(/[\s,;]+/).map(Number).filter(x=>isFinite(x)&&v.q.trim()!=='');if(d.length<2)return{err:'Need at least 2 delta values'};
const n=d.length,mean=d.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(d.reduce((a,b)=>a+(b-mean)**2,0)/n),mj=Math.max(...d.map(x=>Math.abs(x-v.rpi))),ooo=d.filter(x=>x<0).length;
const lost=d.reduce((a,x)=>a+(x>1.5*v.rpi?Math.round(x/v.rpi)-1:0),0),cap={'Profinet IRT':0.001,'Profinet RT':0.1*v.rpi,'EtherNet/IP CIP':0.25*v.rpi,'Modbus TCP':Infinity}[v.pr],lim=Math.min(v.tol,cap),ok=mj<=lim&&!lost&&!ooo;
return{rows:[['Samples',n],['Mean interval',f1(mean,3)+' ms'],['Std dev (sigma)',f1(sd,3)+' ms'],['Max jitter',f1(mj,3)+' ms'],['Est. drops',f1(100*lost/(n+lost))+' %'],['Out-of-order',f1(100*ooo/n)+' %'],['Applied jitter limit',isFinite(lim)?f1(lim,3)+' ms':'n/a']],st:ok?['ok','SLA compliant']:['bad','SLA violation']}}},
{id:'snmp',name:'SNMP / Switch',f:[['q','Search MIB name/OID/desc',"ifInErrors",'text',1],['host','Host',"192.168.1.1",'text',1],['com','Community',"public",'text',1],['dIn','Octet delta',1250000,0,4294967295,1],['dt','Poll interval (s)',10,1,3600,1],['sp','Link speed (Mbps)',100,10,100000,10]],
run:v=>{const q=v.q.trim().toLowerCase(),m=OIDS.filter(o=>o.join(' ').toLowerCase().includes(q)).slice(0,6),u=v.dIn*8/(v.dt*v.sp*1e6)*100;
const rows=m.flatMap(o=>[[o[0]+' - '+o[2]+' ('+o[1]+')','snmpwalk -v2c -c '+v.com+' '+v.host+' '+o[1],1]]);rows.push(['Port utilization',f1(u,2)+' %']);return{rows,st:u<70?['ok','Utilization OK']:['warn','High utilization']}}},
{id:'sis',name:'SIS Loop Time',f:[['a','T sensor (ms)',200,0,5000,1],['b','T input (ms)',20,0,1000,1],['c','T scan (ms)',50,0,1000,1],['d','T comm / watchdog (ms)',100,0,2000,1],['e','T output (ms)',20,0,1000,1],['g','T valve stroke (ms)',2000,0,60000,10],['pst','Process safety time PST (ms)',8000,100,120000,100]],
run:v=>{const t=v.a+v.b+v.c+v.d+v.e+v.g,r=t/v.pst*100;return{rows:[['T total',t+' ms'],['PST',v.pst+' ms'],['Margin ratio',f1(r)+' % of PST (limit 50 %)']],st:r<=50?['ok','PASS: <= 50% PST']:['bad','FAIL: exceeds 50% PST']}}},
{id:'mx',name:'Compatibility',f:[['q','Search',"",'text',1],['ven','Vendor','All','select',['All','Siemens','Schneider','Rockwell']]],
run:v=>{const q=v.q.trim().toLowerCase(),m=MX.filter(r=>(v.ven==='All'||r[0]===v.ven)&&r.join(' ').toLowerCase().includes(q));return{rows:m.map(r=>[r[0]+' | '+r[1]+' | '+r[2],r[3]+' - '+r[4]]).concat([['Note','Indicative data; confirm against vendor compatibility tools before flashing.']]),st:['warn',m.length+' match(es)']}}}];
