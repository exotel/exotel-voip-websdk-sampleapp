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
        registerAudioDeviceChangeCallback();
    } else {
        shouldAutoRetry = false;
        exWebClient.unregister();
    }
}

function registerAudioDeviceChangeCallback() {
    exWebClient.registerAudioDeviceChangeCallback(CurrentInputDeviceCallback,CurrentOutputDeviceCallback);
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

// Function to change input device change
function changeAudioInputDevice() {
    const selectedDeviceId = document.getElementById('inputDevices').value;
    const resetDeviceOnCallEnd = true;
    exWebClient.changeAudioInputDevice(
        selectedDeviceId,
        (deviceId) => alert(`Input device changed successfully to: ${deviceId}`),
        (error) => alert(`Failed to change input device: ${error}`),
        resetDeviceOnCallEnd
    );
}

// Function to change output device change
function changeAudioOutputDevice() {
    const selectedDeviceId = document.getElementById('outputDevices').value;
    const resetDeviceOnCallEnd = true;
    exWebClient.changeAudioOutputDevice(
        selectedDeviceId,
        (deviceId) => alert(`Output device changed successfully to: ${deviceId}`),
        (error) => alert(`Failed to change output device: ${error}`),
        resetDeviceOnCallEnd
    );
}

//populate the device dropdowns
async function populateDeviceDropdowns() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputDevices = devices.filter(device => device.kind === 'audioinput');
    const outputDevices = devices.filter(device => device.kind === 'audiooutput');

    const inputDropdown = document.getElementById('inputDevices');
    const outputDropdown = document.getElementById('outputDevices');

    inputDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Input Device ${device.deviceId}`;
        inputDropdown.appendChild(option);
    });

    outputDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Output Device ${device.deviceId}`;
        outputDropdown.appendChild(option);
    });
}

// Populate dropdowns when the page loads
window.addEventListener('load', populateDeviceDropdowns);

// Re-populate devices list when the device list changes
navigator.mediaDevices.addEventListener('devicechange', populateDeviceDropdowns);