const exWebClient2 = new exotelSDK.ExotelWebClient();

exWebClient2.registerLoggerCallback(function (type, message, args) {
    switch (type) {
        case "log":
            console.log(`demo2: ${message}`, args);
            break;
        case "info":
            console.info(`demo2: ${message}`, args);
            break;
        case "error":
            console.error(`demo2: ${message}`, args);
            break;
        case "warn":
            console.warn(`demo2: ${message}`, args);
            break;
        default:
            console.log(`demo2: ${message}`, args);
            break;
    }
});

exWebClient2.registerAudioDeviceChangeCallback(
    deviceId => console.log(`demo2:input device changed to ${deviceId}`),
    deviceId => console.log(`demo2:output device changed to ${deviceId}`)
);

var call2 = null;
var isInitialized2 = false;

function initSDK2() {
    isInitialized2 = true;
    var sipInfo = JSON.parse(phone2)[0];

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
    exWebClient2.initWebrtc(sipAccountInfo, RegisterEventCallBack2, CallListenerCallback2, SessionCallback2);
    exWebClient2.setPreferredCodec("opus");
}

function UserAgentRegistration2() {
    console.log("demo2.js: Calling DoRegister");
    exWebClient2.DoRegister();
}

var toggleRegister2 = true;
function registerToggle2() {
    let toggler = toggleRegister2;
    toggleRegister2 = !toggleRegister2;
    if (toggler) {
        UserAgentRegistration2();
        document.getElementById("registerButton2").innerHTML = "STOP";
    } else {
        console.log("doing unregistration for demo2");
        exWebClient2.UnRegister();
        document.getElementById("registerButton2").innerHTML = "START";
    }
}

function CallListenerCallback2(callObj, eventType, sipInfo) {
    call2 = exWebClient2.getCall();
    document.getElementById("call_status2").innerHTML = eventType;
}

function RegisterEventCallBack2(state, sipInfo) {
    document.getElementById("status2").innerHTML = state;
}

function SessionCallback2(state, sipInfo) {
    console.log('demo2: Session state:', state, 'for number...', sipInfo);
}

function acceptCall2() {
    if (call2) {
        call2.Answer();
    }
}

function rejectCall2() {
    if (call2) {
        call2.Hangup();
    }
}

function toggleMuteButton2() {
    if (call2) {
        call2.MuteToggle();
        const btn = document.getElementById("muteButton2");
        btn.innerHTML = (btn.innerHTML === "UNMUTE") ? "MUTE" : "UNMUTE";
    }
}

function toggleHoldButton2() {
    if (call2) {
        call2.HoldToggle();
        const btn = document.getElementById("holdButton2");
        btn.innerHTML = (btn.innerHTML === "UNHOLD") ? "HOLD" : "UNHOLD";
    }
}

function sendDTMF2(digit) {
    if (call2) {
        call2.sendDTMF(digit);
    }
}

function downloadLogs2() {
    exWebClient2.downloadLogs();
}

window.addEventListener('load', () => {
    initSDK2();
});
