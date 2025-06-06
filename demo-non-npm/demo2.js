/* eslint-env browser */
const { ExotelWebClient } = window.exotelSDK;

const ui = {
  user     : document.getElementById("u2"),
  status   : document.getElementById("s2"),
  callInfo : document.getElementById("c2"),
  stop     : document.getElementById("stop2"),
  accept   : document.getElementById("accept2"),
  reject   : document.getElementById("reject2"),
  mute     : document.getElementById("mute2"),
  hold     : document.getElementById("hold2")
};

const cred = window.phone2[0];
const sip  = {
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

const client     = new ExotelWebClient();
let   activeCall = null;
ui.user.textContent = cred.Username;

function onRegEvent(ev) {
  if (ev === "connected") {
    ui.status.textContent = "registered";
    ui.status.style.color = "green";
  } else {
    ui.status.textContent = ev;
    ui.status.style.color = "crimson";
  }
  updateButtonState();
}
function onCallEvent(ev) {
  if (ev === "i_new_call") {
    activeCall = client.getCall();
    ui.callInfo.textContent = "incoming …";
  } else if (ev === "connected") {
    ui.callInfo.textContent = "in-progress";
  } else if (ev === "terminated") {
    ui.callInfo.textContent = "—";
    activeCall = null;
  }
  updateButtonState();
}

client.initWebrtc(sip, onRegEvent, onCallEvent, () => {});
setTimeout(() => cred.AutoRegistration && client.DoRegister(), 100);

ui.stop  .onclick = () => client.unregister();
ui.accept.onclick = () => client.getCallController().answerCall(activeCall);
ui.reject.onclick = () => client.getCallController().rejectCall(activeCall);
ui.mute  .onclick = () => {
  client.webRTCMuteUnmute();
  ui.mute.textContent = client.getMuteStatus() ? "UNMUTE" : "MUTE";
};
ui.hold  .onclick = () => {
  const h = ui.hold.dataset.hold === "1";
  client.holdAction(!h);
  ui.hold.dataset.hold = h ? "0" : "1";
  ui.hold.textContent  = h ? "HOLD" : "RESUME";
};

function updateButtonState() {
  const reg = ui.status.textContent === "registered";
  ui.stop.disabled   = !reg;
  ui.accept.disabled = !(reg && activeCall && ui.callInfo.textContent === "incoming …");
  ui.reject.disabled = ui.accept.disabled;
  ui.mute.disabled   = !activeCall;
  ui.hold.disabled   = !activeCall;
}
updateButtonState();
