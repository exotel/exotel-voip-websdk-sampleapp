const exWebClient = new exotelSDK.ExotelWebClient();
exWebClient.registerLoggerCallback(function (type, message, args) {

    switch (type) {
        case "log":
            console.log(`demo: ${message}`, args);
            break;
        case "info":
            console.info(`demo: ${message}`, args);
            break;
        case "error":
            console.error(`demo: ${message}`, args);
            break;
        case "warn":
            console.warn(`demo: ${message}`, args);
            break;
        default:
            console.log(`demo: ${message}`, args);
            break;
    }
});

exWebClient.registerAudioDeviceChangeCallback(function (deviceId) {
    console.log(`demo:audioInputDeviceCallback device changed to ${deviceId}`);
}, function (deviceId) {
    console.log(`demo:audioOutputDeviceCallback device changed to ${deviceId}`);
});

var call = null;


function initSDK() {
    isInitialized = true;
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
}

function UserAgentRegistration() {
    console.log("Test.js: Calling DoRegister")
    exWebClient.DoRegister();
}

var toggleRegister = true;
function registerToggle() {
    let toggler = toggleRegister;
    toggleRegister = !toggleRegister;
    if (toggler) {
        UserAgentRegistration();
        document.getElementById("registerButton").innerHTML = "STOP";
    } else {
        console.log("doing unregistration");
        exWebClient.UnRegister();
        document.getElementById("registerButton").innerHTML = "START";
    }
}

function CallListenerCallback(callObj, eventType, sipInfo) {
    call = exWebClient.getCall();
    document.getElementById("call_status").innerHTML = eventType;
}

function CurrentInputDeviceCallback(currentInputDevice) {
    console.log("Current input device: ", currentInputDevice);
    document.getElementById("current_input_device").innerHTML = currentInputDevice;
}

function CurrentOutputDeviceCallback(currentOutputDevice) {
    console.log("Current output device: ", currentOutputDevice);
    document.getElementById("current_output_device").innerHTML = currentOutputDevice;
}

function RegisterEventCallBack(state, sipInfo) {
    document.getElementById("status").innerHTML = state;
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

// Function to change input device change
function changeAudioInputDevice() {
    const selectedDeviceId = document.getElementById('inputDevices').value;
    exWebClient.changeAudioInputDevice(
        selectedDeviceId,
        () => console.log(`Input device changed successfully`),
        (error) => console.log(`Failed to change input device: ${error}`)
    );
}

// Function to change output device change
function changeAudioOutputDevice() {
    const selectedDeviceId = document.getElementById('outputDevices').value;
    exWebClient.changeAudioOutputDevice(
        selectedDeviceId,
        () => console.log(`Output device changed successfully`),
        (error) => console.log(`Failed to change output device: ${error}`)
    );
}

//populate the device dropdowns
async function populateDeviceDropdowns() {

    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputDevices = devices.filter(device => device.kind === 'audioinput');
    const outputDevices = devices.filter(device => device.kind === 'audiooutput');
    const defaultInputDevice = inputDevices.find(device => device.deviceId === "default");
    const defaultOutputDevice = outputDevices.find(device => device.deviceId === "default");

    const inputDropdown = document.getElementById('inputDevices');
    inputDropdown.innerHTML = "";
    const outputDropdown = document.getElementById('outputDevices');
    outputDropdown.innerHTML = "";
    inputDevices.forEach(device => {
        if (device.deviceId == "" || device.deviceId == "default") {
            return;
        }

        const option = document.createElement('option');
        option.value = device.deviceId;
        if (device.groupId == defaultInputDevice.groupId) {
            option.selected = true;
        }
        option.textContent = device.label || `Input Device ${device.deviceId}`;
        inputDropdown.appendChild(option);
    });

    outputDevices.forEach(device => {
        if (device.deviceId == "" || device.deviceId == "default") {
            return;
        }
        const option = document.createElement('option');
        option.value = device.deviceId;
        if (device.groupId == defaultOutputDevice.groupId) {
            option.selected = true;
        }
        option.textContent = device.label || `Output Device ${device.deviceId}`;
        outputDropdown.appendChild(option);
    });
}

// Populate dropdowns when the page loads
window.addEventListener('load', populateDeviceDropdowns);

// Re-populate devices list when the device list changes
navigator.mediaDevices.addEventListener('devicechange', populateDeviceDropdowns);

initSDK();