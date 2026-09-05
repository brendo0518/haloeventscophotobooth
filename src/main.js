const KEY="boothos_v21";
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const load=()=>JSON.parse(localStorage.getItem(KEY)||'{"events":[],"templates":[],"device":{"paired":false,"name":"iPad Booth","online":false}}');
let db=load(), stream=null, page="dashboard", eventId=null;

function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function seed(){
 if(!db.events.length){
  db.events=[{id:uid(),name:"Demo Event",date:new Date().toLocaleDateString("en-AU"),active:false,photos:0,
   settings:{branding:"YOUR PHOTO BOOTH",welcome:"Tap to Start",countdown:3,template:"Classic Strip",mirror:true,original:true,locked:false},
   gallery:{password:"",enabled:true}}]; save();
 }
}
seed();

function layout(){
 document.body.innerHTML=`<div id="app"></div>`;
 render();
}
function render(){
 const app=document.querySelector("#app");
 if(page==="booth") return booth();
 if(page==="gallery") return gallery();
 app.innerHTML=`<div class="shell">
 <aside><div class="brand">BOOTH<span>OS</span></div>
 <nav>${["dashboard","events","templates","devices","galleries"].map(x=>`<button class="${page===x?"sel":""}" data-nav="${x}">${x[0].toUpperCase()+x.slice(1)}</button>`).join("")}</nav>
 <div class="version">V2.1 FOUNDATION</div></aside>
 <main><header><div><h1>${pageTitle()}</h1><p>${pageSub()}</p></div><button class="primary" id="new">+ New Event</button></header><div id="view"></div></main></div>`;
 document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>{page=b.dataset.nav;eventId=null;render()});
 document.querySelector("#new").onclick=createEvent;
 ({dashboard:dashboard,events:events,templates:templates,devices:devices,galleries:galleries}[page])();
}
function pageTitle(){return page==="dashboard"?"Dashboard":page[0].toUpperCase()+page.slice(1)}
function pageSub(){return ({dashboard:"Control your booth business from one place.",events:"Create events and push settings to the booth.",templates:"Build and manage photo layouts.",devices:"Pair and monitor your booth devices.",galleries:"Client-facing event galleries."})[page]}

function dashboard(){
 const v=document.querySelector("#view"), live=db.events.filter(e=>e.active).length, photos=db.events.reduce((n,e)=>n+e.photos,0);
 v.innerHTML=`<div class="stats"><div><b>${db.events.length}</b><span>Events</span></div><div><b>${live}</b><span>Live</span></div><div><b>${photos}</b><span>Photos</span></div><div><b>${db.device.paired?1:0}</b><span>Devices</span></div></div>
 <section class="panel"><div class="head"><h2>Recent Events</h2><button class="ghost" id="pair">${db.device.paired?"Paired":"Pair iPad"}</button></div>
 ${db.events.map(row).join("")||empty("No events yet.")}</section>`;
 bindRows();
 document.querySelector("#pair").onclick=()=>{db.device.paired=true;db.device.online=true;save();alert("Pairing complete. Pair code: 482913");render()};
}
function events(){
 document.querySelector("#view").innerHTML=`<section class="panel"><div class="head"><h2>All Events</h2><button class="primary" id="add">Create Event</button></div>${db.events.map(row).join("")||empty("No events yet.")}</section>`;
 document.querySelector("#add").onclick=createEvent; bindRows();
}
function row(e){return `<div class="row"><div><b>${esc(e.name)}</b><small>${esc(e.date)} · ${e.photos} photos</small></div><span class="pill ${e.active?"live":""}">${e.active?"LIVE":"READY"}</span><button class="ghost" data-event="${e.id}">Manage</button></div>`}
function bindRows(){document.querySelectorAll("[data-event]").forEach(b=>b.onclick=()=>manage(b.dataset.event))}
function empty(t){return `<div class="empty">${t}</div>`}

function createEvent(){
 const name=prompt("Event name","My Event"); if(!name)return;
 const e={id:uid(),name,date:new Date().toLocaleDateString("en-AU"),active:false,photos:0,
 settings:{branding:name.toUpperCase(),welcome:"Tap to Start",countdown:3,template:"Classic Strip",mirror:true,original:true,locked:false},
 gallery:{password:"",enabled:true}};
 db.events.unshift(e);save();manage(e.id);
}
function manage(id){
 eventId=id; const e=db.events.find(x=>x.id===id); if(!e)return;
 document.querySelector("#view").innerHTML=`<div class="two">
 <section class="panel"><div class="head"><h2>Booth Settings</h2><span class="pill ${e.active?"live":""}">${e.active?"LIVE":"READY"}</span></div>
 <label>Branding<input id="branding" value="${esc(e.settings.branding)}"></label>
 <label>Welcome text<input id="welcome" value="${esc(e.settings.welcome)}"></label>
 <label>Countdown<select id="countdown"><option value="0">0 seconds</option><option value="3">3 seconds</option><option value="5">5 seconds</option><option value="10">10 seconds</option></select></label>
 <label>Template<select id="template"><option>Classic Strip</option><option>Birthday</option><option>Minimal</option></select></label>
 <label class="check"><input id="mirror" type="checkbox" ${e.settings.mirror?"checked":""}> Mirror front-camera preview</label>
 <label class="check"><input id="original" type="checkbox" ${e.settings.original?"checked":""}> Save original-quality capture</label>
 <button class="primary wide" id="push">Save & Push to iPad</button></section>
 <section class="panel"><div class="head"><h2>Remote Control</h2><span class="status">${db.device.online?"● iPad online":"○ iPad offline"}</span></div>
 <button class="action" id="launch">Open Booth</button><button class="action" id="start">Start Event</button>
 <button class="action" id="lock">${e.settings.locked?"Unlock":"Lock"} Booth</button><button class="action" id="restart">Restart Booth</button>
 <hr><h3>Client Gallery</h3><label>Password<input id="password" value="${esc(e.gallery.password)}" placeholder="Optional password"></label>
 <button class="ghost wide" id="gallery">Open Gallery</button></section></div>`;
 document.querySelector("#countdown").value=e.settings.countdown;
 document.querySelector("#template").value=e.settings.template;
 document.querySelector("#push").onclick=()=>{
  e.settings={branding:document.querySelector("#branding").value,welcome:document.querySelector("#welcome").value,countdown:+document.querySelector("#countdown").value,template:document.querySelector("#template").value,mirror:document.querySelector("#mirror").checked,original:document.querySelector("#original").checked,locked:e.settings.locked};
  e.gallery.password=document.querySelector("#password").value; save(); toast("Settings pushed to iPad");
 };
 document.querySelector("#launch").onclick=()=>{page="booth";render()};
 document.querySelector("#start").onclick=()=>{e.active=true;db.device.online=true;save();toast("Event started")};
 document.querySelector("#lock").onclick=()=>{e.settings.locked=!e.settings.locked;save();manage(id)};
 document.querySelector("#restart").onclick=()=>toast("Restart command sent");
 document.querySelector("#gallery").onclick=()=>{page="gallery";eventId=id;render()};
}

function templates(){
 document.querySelector("#view").innerHTML=`<div class="template-grid">${["Classic Strip","Birthday","Minimal"].map((n,i)=>`<div class="template"><div class="preview p${i}"><span>${n}</span></div><b>${n}</b><small>Built-in template</small></div>`).join("")}</div>
 <section class="panel upload"><h2>Custom PNG/JPG Overlay</h2><input type="file" id="upload" accept="image/png,image/jpeg"><p id="file">No file selected.</p></section>`;
 document.querySelector("#upload").onchange=x=>document.querySelector("#file").textContent=x.target.files[0]?.name||"No file selected.";
}
function devices(){
 document.querySelector("#view").innerHTML=`<section class="panel"><div class="device"><div class="device-icon">▣</div><div><b>iPad Booth</b><small>Front camera only · ${db.device.online?"Connected":"Not connected"}</small></div><span class="pill ${db.device.online?"live":""}">${db.device.online?"ONLINE":"OFFLINE"}</span><button class="primary" id="pairDevice">Pair</button></div><p class="hint">This V2 foundation keeps pairing/settings local. A hosted realtime backend is required for control across different networks.</p></section>`;
 document.querySelector("#pairDevice").onclick=()=>{db.device.paired=true;db.device.online=true;save();render()};
}
function galleries(){
 document.querySelector("#view").innerHTML=`<section class="panel">${db.events.map(e=>`<div class="row"><div><b>${esc(e.name)}</b><small>${e.gallery.password?"Password protected":"No password"}</small></div><button class="ghost" data-g="${e.id}">Open</button></div>`).join("")||empty("Create an event first.")}</section>`;
 document.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{eventId=b.dataset.g;page="gallery";render()});
}

function gallery(){
 const e=db.events.find(x=>x.id===eventId)||db.events[0];
 if(!e){page="dashboard";return render()}
 document.querySelector("#app").innerHTML=`<div class="gallery"><header><b>${esc(e.settings.branding)}</b><button class="ghost" id="back">Dashboard</button></header>
 <div class="galleryhero"><h1>${esc(e.name)}</h1><p>Client Gallery</p></div>
 ${e.gallery.password?`<div class="gate"><h2>Private Gallery</h2><p>Enter the event password to view photos.</p><input id="gp" type="password" placeholder="Gallery password"><button class="primary" id="unlock">Unlock</button></div>`:`<div class="galleryempty">No photos uploaded to this gallery yet.</div>`}</div>`;
 document.querySelector("#back").onclick=()=>{page="dashboard";render()};
 if(e.gallery.password)document.querySelector("#unlock").onclick=()=>{if(document.querySelector("#gp").value===e.gallery.password)document.querySelector(".gate").innerHTML="<h2>Gallery unlocked</h2><p>Photos will appear here once cloud storage is connected.</p>";else toast("Incorrect password")};
}

async function booth(){
 const e=db.events.find(x=>x.id===eventId)||db.events[0];
 document.querySelector("#app").innerHTML=`<div class="booth"><video id="video" autoplay playsinline muted></video><div class="shade"></div><div class="boothbrand">${esc(e.settings.branding)}</div>
 <div class="boothcenter"><div id="msg">${esc(e.settings.welcome)}</div><button id="shot">●</button></div><button id="close" class="close">×</button><canvas id="canvas"></canvas></div>`;
 const v=document.querySelector("#video");
 try{
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"user"},width:{ideal:1920},height:{ideal:1080}},audio:false});
  v.srcObject=stream;
 }catch(err){document.querySelector("#msg").textContent="Allow camera access in Safari, then reopen the booth."}
 document.querySelector("#shot").onclick=()=>capture(e);
 document.querySelector("#close").onclick=()=>{stream?.getTracks().forEach(t=>t.stop());page="dashboard";render()};
}
async function capture(e){
 const msg=document.querySelector("#msg"),btn=document.querySelector("#shot");btn.disabled=true;
 for(let n=e.settings.countdown;n>0;n--){msg.textContent=n;await new Promise(r=>setTimeout(r,1000))}
 const v=document.querySelector("#video"),c=document.querySelector("#canvas");
 if(!v.videoWidth){msg.textContent="Camera not ready";btn.disabled=false;return}
 c.width=v.videoWidth;c.height=v.videoHeight;const ctx=c.getContext("2d");
 if(e.settings.mirror){ctx.translate(c.width,0);ctx.scale(-1,1)}
 ctx.drawImage(v,0,0,c.width,c.height);ctx.setTransform(1,0,0,1,0,0);
 ctx.fillStyle="rgba(0,0,0,.58)";ctx.fillRect(0,c.height-92,c.width,92);
 ctx.fillStyle="#fff";ctx.font=`700 ${Math.max(26,c.width/38)}px system-ui`;ctx.textAlign="center";ctx.fillText(e.settings.branding,c.width/2,c.height-38);
 const url=c.toDataURL("image/jpeg",.96),a=document.createElement("a");a.href=url;a.download=`${e.name.replace(/[^a-z0-9]+/gi,"-")}-${Date.now()}.jpg`;a.click();
 e.photos++;save();msg.textContent="Saved ✓";await new Promise(r=>setTimeout(r,900));msg.textContent=e.settings.welcome;btn.disabled=false;
}
function toast(t){const x=document.createElement("div");x.className="toast";x.textContent=t;document.body.append(x);setTimeout(()=>x.remove(),1800)}
render();