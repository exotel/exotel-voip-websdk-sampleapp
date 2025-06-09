/* eslint-env browser */
const ui2 = {
  user     : document.getElementById("u2"),
  status   : document.getElementById("s2"),
  callInfo : document.getElementById("c2"),
  reg      : document.getElementById("reg2"),
  accept   : document.getElementById("accept2"),
  reject   : document.getElementById("reject2"),
  mute     : document.getElementById("mute2"),
  hold     : document.getElementById("hold2")
};

const cred2 = window.phone2[0];
ui2.user.textContent = cred2.Username;

const sip2 = {
  userName   : cred2.Username,
  authUser   : cred2.Username,
  domain     : `${cred2.HostServer}:${cred2.Port}`,
  sipdomain  : cred2.Domain,
  displayname: cred2.DisplayName ?? cred2.Username,
  secret     : cred2.Password,
  port       : cred2.Port,
  security   : cred2.Security,
  endpoint   : cred2.EndPoint
};

const client2       = new ExotelWebClient();
let   activeCall2   = null;
let   registered2   = false;

function onRegEvent2(ev) {
  registered2 = ev === "connected";
  ui2.status.textContent = registered2 ? "registered2" : ev;
  ui2.status.className   = `status ${registered2 ? "ok" : "err"}`;
  ui2.reg.textContent    = registered2 ? "STOP" : "REGISTER";
}

function onCallEvent2(ev) {
  if (ev === "i_new_call") {
    activeCall2          = client2.getCall();
    ui2.callInfo.textContent = "incoming …";
  } else if (ev === "connected") {
    ui2.callInfo.textContent = "in-progress";
  } else if (ev === "terminated") {
    ui2.callInfo.textContent = "—";
    activeCall2 = null;
  }
}

function onSessEvent2() {}

client2.initWebrtc(sip2, onRegEvent2, onCallEvent2, onSessEvent2);

/* buttons */
ui2.reg.onclick = () => {
  if (registered2) {
    client2.unregister();
  } else {
    client2.DoRegister();
  }
};
ui2.accept.onclick = () => {
  if (activeCall2) { client2.getCallController().answerCall(activeCall2); }
};
ui2.reject.onclick = () => {
  if (activeCall2) { client2.getCallController().rejectCall(activeCall2); }
};
ui2.mute.onclick = () => {
  client2.webRTCMuteUnmute();
  ui2.mute.textContent = client2.getMuteStatus() ? "UNMUTE" : "MUTE";
};
ui2.hold.onclick = () => {
  const h = ui2.hold.dataset.hold === "1";
  client2.holdAction(!h);
  ui2.hold.dataset.hold = h ? "0" : "1";
  ui2.hold.textContent  = h ? "HOLD" : "RESUME";
};
