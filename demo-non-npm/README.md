# demo-non-npm
This is a basic non npm based sample application to showcase Exotel VOIP Websdk API integrations. Using this sample app you can have a demo of voip calling functionalities in the browser. This sample application works with exotel platform. Contact us to get an account.

# Exotel Voice WebSDK
This sample application requires a websdk package to work. Contact us to get the credentials to download the node.js package of the websdk. Follow the instructions provided in 

# Exotel Voice WebSDK Bundle Integration Guide
File: Exotel-Voice-Websdk-Integration-Guide.pdf

# Demonstrations

## Configuration

exotel sip account is required for performing action. this account is configured in phone.js.

```
[
    {
        "Username":"<VOIP Username>",
        "DisplayName":"<Display Name>",
        "HostServer":"<VOIP Proxy Address>",
        "Domain":"<VOIP Domain Address>",
        "Port":443,
        "Password":"<VOIP Password>",
        "CallTimeout":1000,
        "Security": "wss",
        "EndPoint": "wss",
        "AccountSID":"<Your Account SID>",
        "AccountNo":"<VOIP Username>",
        "AutoRegistration": true
    }            
]
```

## Running

The demos will run in Chrome, Firefox, or other web browsers which supports WebRTC.

In your web browser, open the `index.html` file in this directory to run the demos.

## how to run sample with http-server 

openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
http-server  -S 


## Development

This demonstration are build on simple html which provides some basic functionality(register,accept, reject, mute and hold) via a simple interface.

## Bundled SDK

`index.html` loads the bundle directly, before any of the demo scripts:

```html
<script type="text/javascript" src="./dist/exotelsdk.js"></script>
```

The bundle in `dist/` is built from client-sdk v3.0.14 / core-sdk v3.0.12 and exposes the
`exotelSDK` global. `SDK/exotelsdk-3.0.14.tar.gz` is the same build packaged for distribution —
extract it over `dist/` to refresh the bundle. Keep the `.wav` files that ship alongside
`exotelsdk.js`: the bundle loads `ringtone.wav`, `ringbacktone.wav`, `beep.wav` and `dtmf.wav`
by name, relative to itself, so removing them leaves the demo silent.

# Ring tone APIs (SDK v3.0.14)

The bundled SDK exposes the incoming ring tone to the application.

## API summary

All six are **instance** methods on the `exotelSDK.ExotelWebClient` object created in `demo.js`,
so they are available only after `initWebrtc(...)` has run. Called before that, the setters log
a warning and return `false`, and the getters return the defaults (`30` and `true`).

| Method | Returns | Notes |
| --- | --- | --- |
| `setRingingDuration(seconds)` | `boolean` | How long the incoming ring tone plays. Default `30` sec. Accepts a number or a numeric string; anything else (`true`, `[5]`, `""`, `null`, non-numeric text) and any value `<= 0` is rejected with `false` and the previous value is kept. |
| `getRingingDuration()` | `number` | Currently configured duration in seconds. |
| `setRingToneAutoStart(enabled)` | `boolean` | Whether the SDK plays the ring tone by itself on an incoming session. Default `true`. Accepts a boolean or the strings `"true"`/`"false"` (case-insensitive); anything else is rejected with `false`. |
| `getRingToneAutoStart()` | `boolean` | Current auto-start setting. |
| `startRingTone()` | `void` | Starts the ring tone. Never blocked by `setRingToneAutoStart(false)`. |
| `stopRingTone()` | `void` | Stops the ring tone and cancels its auto-stop timer. |

## Configuring the ringing duration

`demo.js` creates the client and initialises it like this:

```js
const exWebClient = new exotelSDK.ExotelWebClient();
// ...
exWebClient.initWebrtc(sipAccountInfo, RegisterEventCallBack, CallListenerCallback, SessionCallback);

// Ring for 45 seconds instead of the default 30
exWebClient.setRingingDuration(45);
console.log(exWebClient.getRingingDuration()); // 45
```

A numeric string works too, which is convenient when the value comes from an input or a config
blob: `exWebClient.setRingingDuration("45")`.

Changing the duration while a call is already ringing reschedules the auto-stop against the
time already spent ringing, so it can shorten a ring in progress but never extend it past the
new total. Setting a duration shorter than the elapsed ring time stops the ring immediately.

## Gating the ring tone on your own state

By default the SDK starts ringing as soon as an incoming session arrives. Turn auto-start off
to ring on your own terms — for example only once a push notification and the SIP INVITE agree
on the same AppServer call:

```js
// During setup, after initWebrtc
exWebClient.setRingToneAutoStart(false);

function CallListenerCallback(callObj, eventType, phone) {
  if (eventType === 'incoming') {
    // The SDK has NOT started the ring tone. Ring only once our own checks pass.
    if (isCallConfirmedByPush(callObj)) {
      exWebClient.startRingTone();
    }
  }
}
```

`startRingTone()` always plays, even with auto-start disabled — the setting governs only the
automatic start.

You do not have to stop the tone on the normal transitions: the SDK stops it itself when the
call is answered or terminated (answered, hung up, or cancelled by the caller), and in any case
it stops on its own after the configured duration. `stopRingTone()` is for stopping earlier on
your own signal — say your gating logic decides the call is stale, or your UI dismisses it —
and it is safe to call when nothing is ringing.

## Multi-account note

`index.html` can load a second account via `phone2.js` / `demo2.js`. The ring tone element and
its state (duration and auto-start) are shared process-wide, not per account: setting them on
one `ExotelWebClient` applies to both accounts, and one `stopRingTone()` stops the single
shared ring.

## Browser autoplay note

A browser may reject the first `play()` on a page that has not yet seen a user gesture. The SDK
retries every 500 ms until the ring starts or the ring is stopped, so an incoming call that
arrives before any interaction still rings once the page becomes eligible. Interacting with the
demo page once (for example clicking **Register**) is enough to avoid the delay.

# Logger callback severity (behaviour change in v3.0.14)

`registerLoggerCallback` now receives the real severity as its first argument — `"log"`,
`"info"`, `"warn"` or `"error"`. Before v3.0.14 every message arrived as `"log"`, so an
integrator could not tell an SDK error from an ordinary log line.

`common.js` in this demo already switches on that argument, so `warn` and `error` now route to
`console.warn` and `console.error` instead of all landing in `console.log`:

```js
exotelSDK.ExotelWebClient.registerLoggerCallback(function (type, message, args) {
    switch (type) {
        case "error": console.error(`common: ${message}`, args); break;
        case "warn":  console.warn(`common: ${message}`, args);  break;
        case "info":  console.info(`common: ${message}`, args);  break;
        default:      console.log(`common: ${message}`, args);   break;
    }
});
```
