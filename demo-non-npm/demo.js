const exWebClient = new exotelSDK.ExotelWebClient();
var call = null;
var shouldAutoRetry = false;
function UserAgentRegistration() {
    var sipInfo = JSON.parse(phone)[0]

    var sipAccountInfo = {
        'userName': sipInfo.Username,
        'authUser': sipInfo.Username,
        'sipdomain': sipInfo.Domain,
        'domain': sipInfo.HostServer + ":" + sipInfo.Port,
        'displayname': sipInfo.DisplayName,
        'secret': sipInfo.Password,
        'port': sipInfo.Port,
        'security': sipInfo.Security,
        'endpoint': sipInfo.EndPoint
    };
    exWebClient.initWebrtc(sipAccountInfo, RegisterEventCallBack, CallListenerCallback, SessionCallback)
    console.log("Test.js: Calling DoRegister")
    exWebClient.DoRegister();
}

function registerToggle() {
    if (document.getElementById("registerButton").innerHTML === "REGISTER") {
        shouldAutoRetry = true;
        UserAgentRegistration();
    } else {
        shouldAutoRetry = false;
        exWebClient.unregister();
    }
}

function CallListenerCallback(callObj, eventType, sipInfo) {
    call = exWebClient.getCall();
    document.getElementById("call_status").innerHTML = eventType;
}

function RegisterEventCallBack(state, sipInfo) {
    document.getElementById("status").innerHTML = state;
    if (state === 'registered') {
        document.getElementById("registerButton").innerHTML = "UNREGISTER";
    } else {
        document.getElementById("registerButton").innerHTML = "REGISTER";
        if (shouldAutoRetry) {
            exWebClient.DoRegister();
        }
    }
}

function SessionCallback(state, sipInfo) {
    console.log('Session state:', state, 'for number...', sipInfo);
}

function toggleMuteButton() {
    if (call) {
        call.Mute();
        if (document.getElementById("muteButton").innerHTML === "UNMUTE") {
            document.getElementById("muteButton").innerHTML = "MUTE";
        } else {
            document.getElementById("muteButton").innerHTML = "UNMUTE";
        }
    }
}

function acceptCall() {
    if (call) {
        call.Answer();
    }
}

function rejectCall() {
    if (call) {
        call.Hangup();
    }
}

function toggleHoldButton() {
    if (call) {
        call.HoldToggle();
        if (document.getElementById("holdButton").innerHTML === "UNHOLD") {
            document.getElementById("holdButton").innerHTML = "HOLD";
        } else {
            document.getElementById("holdButton").innerHTML = "UNHOLD";
        }
    }
}

function sendDTMF(digit) {
    if (call) {
        call.sendDTMF(digit);
    }
}