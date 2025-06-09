/* eslint-env browser */
const { ExotelWebClient } = window.exotelSDK;

/* ---------- UI handles ---------- */
const ui = {
  user     : document.getElementById("u1"),
  status   : document.getElementById("s1"),
  callInfo : document.getElementById("c1"),
  reg      : document.getElementById("reg1"),
  accept   : document.getElementById("accept1"),
  reject   : document.getElementById("reject1"),
  mute     : document.getElementById("mute1"),
  hold     : document.getElementById("hold1")
};

/* ---------- credential → SIP object ---------- */
const cred = window.phone[0];
ui.user.textContent = cred.Username;

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

/* ---------- Exotel client ---------- */
const client       = new ExotelWebClient();
let   activeCall   = null;
let   registered   = false;

/* callbacks */
function onRegEvent(ev /* "connected" | … */) {
  registered = ev === "connected";
  ui.status.textContent = registered ? "registered" : ev;
  ui.status.className   = `status ${registered ? "ok" : "err"}`;
  ui.reg.textContent    = registered ? "STOP" : "REGISTER";
}

function onCallEvent(ev) {
  if (ev === "i_new_call") {
    activeCall          = client.getCall();
    ui.callInfo.textContent = "incoming …";
  } else if (ev === "connected") {
    ui.callInfo.textContent = "in-progress";
  } else if (ev === "terminated") {
    ui.callInfo.textContent = "—";
    activeCall = null;
  }
}

function onSessEvent() { /* not used here */ }

/* initialise stack – **no auto-register** */
client.initWebrtc(sip, onRegEvent, onCallEvent, onSessEvent);

/* ---------- buttons ---------- */
ui.reg.onclick = () => {
  if (registered) {
    client.unregister();
  } else {
    client.DoRegister();
  }
};

ui.accept.onclick = () => {
  if (activeCall) { client.getCallController().answerCall(activeCall); }
};
ui.reject.onclick = () => {
  if (activeCall) { client.getCallController().rejectCall(activeCall); }
};
ui.mute.onclick = () => {
  client.webRTCMuteUnmute();
  ui.mute.textContent = client.getMuteStatus() ? "UNMUTE" : "MUTE";
};
ui.hold.onclick = () => {
  const h = ui.hold.dataset.hold === "1";
  client.holdAction(!h);
  ui.hold.dataset.hold = h ? "0" : "1";
  ui.hold.textContent  = h ? "HOLD" : "RESUME";
};
