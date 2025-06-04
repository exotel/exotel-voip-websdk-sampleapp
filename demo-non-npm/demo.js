/* demo.js  –  parallel UI panels for every credential blob
 * ─────────────────────────────────────────────────────────── */
const { ExotelWebClient } = window.exotelSDK;

/* ── collect creds from phone.js / phone2.js ───────────────── */
const blobs = [];
if (typeof phone  !== "undefined") blobs.push(...JSON.parse(phone));
if (typeof phone2 !== "undefined") blobs.push(...JSON.parse(phone2));
if (!blobs.length) { alert("Add creds in phone.js / phone2.js"); throw 0; }

const $ = id => document.getElementById(id);

/* container in DOM where we’ll inject panels */
const container = $("accounts");

/* keep a handle per account */
const registry = new Map();

/* ── build one control panel per account ────────────────────── */
blobs.forEach((cred, idx) => {
  const key = `${cred.Username}@${cred.Domain}`;
  const html = /* html */`
    <div class="acct" id="acct_${idx}">
      <h2>${key}
        <button class="logBtn" id="log_${idx}">Logs</button>
      </h2>

      <fieldset>
        <legend>Registration</legend>
        <button id="reg_${idx}">START</button>
        Status: <span id="status_${idx}" class="bold">offline</span>
      </fieldset>

      <fieldset>
        <legend>Call</legend>
        <button id="acc_${idx}">ACCEPT</button>
        <button id="rej_${idx}">REJECT</button>
        <button id="mute_${idx}">MUTE</button>
        <button id="hold_${idx}">HOLD</button><br><br>
        DTMF <input id="dtmf_${idx}" maxlength="1" size="1">
        &nbsp;Call state: <span id="call_${idx}" class="bold">idle</span>
      </fieldset>
    </div>`;
  container.insertAdjacentHTML("beforeend", html);

  /* turn cred blob → sipAccountInfo */
  const sip = {
    userName   : cred.Username,
    authUser   : cred.Username,
    domain     : `${cred.HostServer}:${cred.Port}`,
    sipdomain  : cred.Domain,
    displayname: cred.DisplayName ?? cred.Username,
    secret     : cred.Password,
    port       : cred.Port,
    security   : cred.Security,
    endpoint   : cred.EndPoint
  };

  /* spin up SDK */
  const sdk = new ExotelWebClient();
  sdk.registerLoggerCallback((t,m,a)=>console[t](`[${key}]`,m,...(a??[])));

  /* initialise (no auto-register) */
  sdk.initWebrtc(
    sip,
    (ev)=> update(`status_${idx}`, ev),
    (ev,phone,call)=>{ store.call=call; update(`call_${idx}`, ev); },
    ()=>{}
  );

  const store = { sdk, sip, reg:false, call:null };
  registry.set(idx, store);

  /* bind UI controls */
  $("reg_"+idx).onclick = () => {
    store.reg ? sdk.UnRegister() : sdk.DoRegister();
    store.reg = !store.reg;
    $("reg_"+idx).textContent = store.reg ? "STOP" : "START";
  };
  $("acc_"+idx).onclick  = () => store.call?.Answer?.();
  $("rej_"+idx).onclick  = () => store.call?.Hangup?.();
  $("mute_"+idx).onclick = () => {
    if (!store.call?.MuteToggle) return;
    store.call.MuteToggle();
    toggleText("mute_"+idx,"MUTE","UNMUTE");
  };
  $("hold_"+idx).onclick = () => {
    if (!store.call?.HoldToggle) return;
    store.call.HoldToggle();
    toggleText("hold_"+idx,"HOLD","UNHOLD");
  };
  $("dtmf_"+idx).onkeyup = e => {
    if (e.key!=="Enter"||!e.target.value) return;
    store.call?.sendDTMF?.(e.target.value); e.target.value="";
  };
  $("log_"+idx).onclick = () => sdk.downloadLogs?.();
});

/* helpers */
function update(id,val){ $(id).textContent=val; }
function toggleText(id,a,b){ const el=$(id); el.textContent=el.textContent===a?b:a; }

/* ── shared audio-device pickers (affect active tab) ────────── */
const inSel  = $("inputDevices");
const outSel = $("outputDevices");

async function refreshDevices(){
  const devs=await navigator.mediaDevices.enumerateDevices();
  inSel.innerHTML=""; outSel.innerHTML="";
  devs.filter(d=>d.kind==="audioinput" )
      .forEach(d=>append(inSel ,d));
  devs.filter(d=>d.kind==="audiooutput")
      .forEach(d=>append(outSel,d));
  function append(sel,d){
    const o=document.createElement("option");
    o.value=d.deviceId; o.textContent=d.label||d.kind;
    sel.appendChild(o);
  }
}
await refreshDevices();
navigator.mediaDevices.addEventListener("devicechange",refreshDevices);

/* whichever call is currently ringing/speaking will be affected */
inSel.onchange  = e => registry.forEach(r=>r.sdk.changeAudioInputDevice (e.target.value));
outSel.onchange = e => registry.forEach(r=>r.sdk.changeAudioOutputDevice(e.target.value));