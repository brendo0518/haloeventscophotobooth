const $=id=>document.getElementById(id);

const defaults={
  eventName:"My Event",
  countdown:3,
  template:"Classic",
  original:true,
  camera:"user"
};

let s=load();
let stream=null,track=null,capturer=null,captured=null,busy=false;
let customTemplates=loadTemplates();

function load(){
  try{return {...{eventName:"My Event",countdown:3,template:"Classic",original:true,camera:"user"},
    ...JSON.parse(localStorage.getItem("pb")||"{}")};}
  catch{return {...defaults};}
}
function persist(){localStorage.setItem("pb",JSON.stringify(s));labels()}
function labels(){
  $("homeEvent").textContent=s.eventName||"My Event";
  $("badge").textContent=s.eventName||"My Event";
  $("eventName").value=s.eventName;
  $("countdownSetting").value=s.countdown;
  $("templateSetting").value=s.template;
  $("originalSetting").checked=!!s.original;
}
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active")}

function loadTemplates(){
  try{return JSON.parse(localStorage.getItem("pb-templates")||"[]")}catch{return []}
}
function saveTemplates(){localStorage.setItem("pb-templates",JSON.stringify(customTemplates))}
function renderTemplateGallery(){
  const box=$("templateGallery"); box.innerHTML="";
  customTemplates.forEach(t=>{
    const card=document.createElement("div");
    card.className="template-card"+(s.template===t.id?" selected":"");
    const img=document.createElement("img"); img.src=t.data; img.alt=t.name;
    const use=document.createElement("button"); use.textContent="✓"; use.title="Use template";
    use.onclick=()=>{s.template=t.id;saveSettingsAndGallery()};
    card.append(img,use); box.append(card);
  });
}
function saveSettingsAndGallery(){persist();renderTemplateGallery()}

async function start(){
  try{
    stop();
    const facing = "user";
    stream=await navigator.mediaDevices.getUserMedia({
      video:{
        facingMode:{ideal:facing},
        width:{ideal:4032},
        height:{ideal:3024},
        frameRate:{ideal:30,max:30}
      },audio:false
    });
    $("video").srcObject=stream;
    track=stream.getVideoTracks()[0];
    if("ImageCapture"in window)try{capturer=new ImageCapture(track)}catch{capturer=null}
    show("booth");
  }catch(e){
    $("errorText").textContent=(e.message||"Camera access failed.")+" Make sure Safari has camera permission and the site is HTTPS.";
    show("booth");$("error").classList.remove("hidden");
  }
}
function stop(){
  if(stream)stream.getTracks().forEach(t=>t.stop());
  stream=null;track=null;capturer=null;
}
async 

const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function take(){
  if(busy||!track)return;
  busy=true;$("takeBtn").disabled=true;
  try{
    for(let n=Number(s.countdown);n>0;n--){
      $("countdown").textContent=n; await wait(1000);
    }
    $("countdown").textContent="";
    const blob=await still();
    const done=await compose(blob);
    captured={original:blob,finished:done};
    $("resultImage").src=URL.createObjectURL(done);
    $("status").textContent="Photo captured.";
    show("result");
  }catch(e){$("status").textContent="Capture failed: "+(e.message||e)}
  busy=false;$("takeBtn").disabled=false;
}

async function still(){
  if(capturer?.takePhoto)try{
    const b=await capturer.takePhoto(); if(b?.size)return b;
  }catch{}
  const v=$("video"),q=track.getSettings?track.getSettings():{};
  const w=q.width||v.videoWidth,h=q.height||v.videoHeight;
  if(!w||!h)throw Error("Camera is not ready.");
  const c=$("canvas");c.width=w;c.height=h;
  const x=c.getContext("2d",{alpha:false});
  // Mirror front camera preview/capture so selfies feel natural.
  if(s.camera==="user"){x.translate(w,0);x.scale(-1,1)}
  x.drawImage(v,0,0,w,h);
  return new Promise(r=>c.toBlob(r,"image/jpeg",.98));
}

async function compose(blob){
  const im=await createImageBitmap(blob);
  const c=document.createElement("canvas");c.width=im.width;c.height=im.height;
  const x=c.getContext("2d",{alpha:false});x.drawImage(im,0,0);

  const custom=customTemplates.find(t=>t.id===s.template);
  if(custom){
    const overlay=await loadImage(custom.data);
    x.drawImage(overlay,0,0,c.width,c.height);
    return new Promise(r=>c.toBlob(r,"image/jpeg",.98));
  }

  const w=c.width,h=c.height,fs=Math.max(24,Math.min(w,h)*.055),m=Math.max(24,Math.min(w,h)*.035);
  const name=s.eventName||"Photo Booth";
  x.textAlign="center";x.font=`800 ${fs}px -apple-system,BlinkMacSystemFont,sans-serif`;

  if(s.template==="Classic"){
    x.fillStyle="#fffc";x.fillRect(0,h-fs*2.2,w,fs*2.2);
    x.fillStyle="#111";x.fillText(name,w/2,h-fs*.72);
  }else if(s.template==="Birthday"){
    x.fillStyle="#ec4899d1";x.fillRect(0,0,w,fs*1.8);
    x.fillStyle="#fff";x.fillText(name,w/2,fs*1.18);
  }else{
    x.strokeStyle="#fff";x.lineWidth=Math.max(6,Math.min(w,h)*.012);
    x.strokeRect(m,m,w-2*m,h-2*m);
    x.fillStyle="#0007";const tw=x.measureText(name).width;
    x.fillRect(w/2-tw/2-m,h-fs*1.55,tw+2*m,fs*1.15);
    x.fillStyle="#fff";x.fillText(name,w/2,h-fs*.68);
  }
  return new Promise(r=>c.toBlob(r,"image/jpeg",.98));
}
function loadImage(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src})}

async function shareOrDownload(blob){
  const fn=`PhotoBooth-${Date.now()}.jpg`;
  if(navigator.share&&navigator.canShare){
    try{
      const f=new File([blob],fn,{type:"image/jpeg"});
      if(navigator.canShare({files:[f]})){
        await navigator.share({files:[f],title:s.eventName||"Photo Booth"});
        $("status").textContent="Share opened — choose Save Image.";
        return;
      }
    }catch(e){if(e.name==="AbortError")return}
  }
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=fn;a.click();
  $("status").textContent="Photo ready to save.";
}

$("startBtn").onclick=start;
$("takeBtn").onclick=take;
$("null").onclick=flipCamera;
$("exitBtn").onclick=()=>{stop();show("home")};
$("errorClose").onclick=()=>{stop();$("error").classList.add("hidden");show("home")};
$("retakeBtn").onclick=()=>show("booth");
$("saveBtn").onclick=()=>captured&&shareOrDownload(s.original?captured.original:captured.finished);
$("settingsBtn").onclick=()=>{labels();renderTemplateGallery();show("settings")};
$("settingsClose").onclick=()=>{persist();show("home")};
$("eventName").oninput=e=>{s.eventName=e.target.value;labels()};
$("countdownSetting").onchange=e=>{s.countdown=+e.target.value;persist()};
$("templateSetting").onchange=e=>{s.template=e.target.value;saveSettingsAndGallery()};
$("originalSetting").onchange=e=>{s.original=e.target.checked;persist()};
$("resetBtn").onclick=()=>{s={...defaults};saveSettingsAndGallery()};

$("templateUpload").addEventListener("change",e=>{
  [...e.target.files].forEach(file=>{
    if(!file.type.match(/^image\/(png|jpeg)$/))return;
    const reader=new FileReader();
    reader.onload=()=>{
      customTemplates.push({id:"custom-"+Date.now()+"-"+Math.random().toString(16).slice(2),name:file.name,data:reader.result});
      saveTemplates();renderTemplateGallery();
    };
    reader.readAsDataURL(file);
  });
  e.target.value="";
});

labels();renderTemplateGallery();
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
