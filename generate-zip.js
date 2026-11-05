/* Usage: node generate-zip.js [out.zip]  -- no dependencies. Generates PNG/ICO assets, then zips the project. */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const root=__dirname,out=process.argv[2]||path.join(root,'autofield-pwa.zip');
const TB=new Uint32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0});
const crc=b=>{let c=~0;for(const x of b)c=TB[(c^x)&255]^(c>>>8);return(~c)>>>0};
const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]),c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])};
function png(w,h,px){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=px(x,y),o=y*(w*4+1)+1+x*4;raw[o]=p[0];raw[o+1]=p[1];raw[o+2]=p[2];raw[o+3]=p[3]}
const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;
return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))])}
const BG=[11,31,58,255],CY=[0,229,255,255],WH=[255,255,255,255];
const icon=(s,mask,round=true)=>png(s,s,(x,y)=>{const cx=x/s-.5,cy=y/s-.5;
if(!mask&&round){const qx=Math.max(Math.abs(cx)-.28,0),qy=Math.max(Math.abs(cy)-.28,0);if(Math.hypot(qx,qy)>.22)return[0,0,0,0]}
const d=Math.hypot(cx,cy)/(mask?.8:1);if(d<.1)return WH;if(d>.28&&d<.34)return CY;if(Math.abs(cy)<.012&&d<.42)return CY;return BG});
const w=(f,b)=>{fs.mkdirSync(path.dirname(path.join(root,f)),{recursive:true});fs.writeFileSync(path.join(root,f),b)};
for(const s of[72,96,128,144,152,192,384,512])w(`icons/icon-${s}.png`,icon(s,false));
for(const s of[192,512])w(`icons/icon-maskable-${s}.png`,icon(s,true));
w('apple-touch-icon.png',icon(180,true,false));w('og-image.png',png(1200,630,(x,y)=>{const cx=x-170,cy=y-315,d=Math.hypot(cx,cy);return d>78&&d<100||(y>300&&y<312&&x>300&&x<1100)?CY:BG}));
const p32=icon(32,false),ico=Buffer.alloc(22);ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico[6]=32;ico[7]=32;ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(p32.length,14);ico.writeUInt32LE(22,18);w('favicon.ico',Buffer.concat([ico,p32]));
const shot=(W,H)=>png(W,H,(x,y)=>{if(y<H*.08)return CY;const col=W>600?Math.floor(x/(W/3)):0,cardY=Math.floor((y-H*.12)/(H*.2)),inCard=((y-H*.12)%(H*.2))<H*.17&&((x%(W/(W>600?3:1)))>W*.02&&(x%(W/(W>600?3:1)))<(W/(W>600?3:1))-W*.02);return y>H*.12&&cardY<4&&inCard?[18,48,90,255]:BG});
w('screenshots/screenshot-mobile.png',shot(390,844));w('screenshots/screenshot-desktop.png',shot(1280,720));
const files=[];(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory()){if(f!=='node_modules'&&f!=='.git')walk(p)}else if(!f.endsWith('.zip'))files.push(p)}})(root);
const parts=[],cd=[];let off=0;
for(const f of files){const name=Buffer.from(path.relative(root,f).split(path.sep).join('/')),data=fs.readFileSync(f),z=zlib.deflateRawSync(data),c=crc(data);
const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);h.writeUInt16LE(8,8);h.writeUInt16LE(0x21,12);h.writeUInt32LE(c,14);h.writeUInt32LE(z.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);
const e=Buffer.alloc(46);e.writeUInt32LE(0x02014b50,0);e.writeUInt16LE(20,4);e.writeUInt16LE(20,6);e.writeUInt16LE(8,10);e.writeUInt16LE(0x21,14);e.writeUInt32LE(c,16);e.writeUInt32LE(z.length,20);e.writeUInt32LE(data.length,24);e.writeUInt16LE(name.length,28);e.writeUInt32LE(off,42);
parts.push(h,name,z);cd.push(e,name);off+=30+name.length+z.length}
const cdb=Buffer.concat(cd),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cdb.length,12);end.writeUInt32LE(off,16);
fs.writeFileSync(out,Buffer.concat([...parts,cdb,end]));console.log('Wrote',out,files.length,'files');
