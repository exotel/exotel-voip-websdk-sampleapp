# demo-npm
This is a basic npm based sample application to showcase Exotel VOIP Websdk API integrations. Using this sample app you can have a demo of voip calling functionalities in the browser. This sample application works with exotel platform. Contact us to get an account.

# Exotel Voice WebSDK
This sample application requires a websdk package to work. Contact us to get the credentials to download the node.js package of the websdk. Follow the instructions provided in 

# Exotel Voice WebSDK Integration Guide
File: Exotel-Voice-Websdk-Bundled-Integration-Guide.pdf

# Exotel Voice WebSDK API documentation
File: Exotel-Voice-Websdk-Bundled-Integration-Guide.pdf

# Ring tone APIs (SDK v3.0.14)

This demo depends on `@exotel-npm-dev/webrtc-client-sdk` `^3.0.14`, which exposes the
incoming ring tone to the application. Install/refresh dependencies before trying these:

```
npm install
```

## API summary

All six are **instance** methods on `ExotelWebClient`, so they are available only after
`initWebrtc(...)` has run. Called before that, the setters log a warning and return `false`,
and the getters return the defaults (`30` and `true`).

| Method | Returns | Notes |
| --- | --- | --- |
| `setRingingDuration(seconds)` | `boolean` | How long the incoming ring tone plays. Default `30` sec. Accepts a number or a numeric string; anything else (`true`, `[5]`, `""`, `null`, non-numeric text) and any value `<= 0` is rejected with `false` and the previous value is kept. |
| `getRingingDuration()` | `number` | Currently configured duration in seconds. |
| `setRingToneAutoStart(enabled)` | `boolean` | Whether the SDK plays the ring tone by itself on an incoming session. Default `true`. Accepts a boolean or the strings `"true"`/`"false"` (case-insensitive); anything else is rejected with `false`. |
| `getRingToneAutoStart()` | `boolean` | Current auto-start setting. |
| `startRingTone()` | `void` | Starts the ring tone. Never blocked by `setRingToneAutoStart(false)`. |
| `stopRingTone()` | `void` | Stops the ring tone and cancels its auto-stop timer. |

## Configuring the ringing duration

```js
import { ExotelWebClient } from '@exotel-npm-dev/webrtc-client-sdk';

const exWebClient = new ExotelWebClient();
exWebClient.initWebrtc(sipAccountInfo, RegisterEventCallBack, CallListenerCallback, SessionCallback);

// Ring for 45 seconds instead of the default 30
exWebClient.setRingingDuration(45);
console.log(exWebClient.getRingingDuration()); // 45
```

Changing the duration while a call is already ringing reschedules the auto-stop against the
time already spent ringing, so it can shorten a ring in progress but never extend it past the
new total. Setting a duration shorter than the elapsed ring time stops the ring immediately.

## Gating the ring tone on your own state

By default the SDK starts ringing as soon as an incoming session arrives. An app that must
first reconcile its own state — for example waiting for a push notification and the SIP INVITE
to agree on the same AppServer call — turns auto-start off and rings when it is ready:

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

The ring tone element and its state (duration and auto-start) are shared process-wide, not
per account. In a multi-account setup, `setRingingDuration` / `setRingToneAutoStart` on one
`ExotelWebClient` applies to every account in the page, and one `stopRingTone()` stops the
single shared ring.

# Logger callback severity (behaviour change in v3.0.14)

`registerLoggerCallback` now receives the real severity as its first argument — `"log"`,
`"info"`, `"warn"` or `"error"`. Before v3.0.14 every message arrived as `"log"`, so an
integrator could not tell an SDK error from an ordinary log line. If your callback switches on
that argument, `warn` and `error` will start routing to their own branches:

```js
ExotelWebClient.registerLoggerCallback(function (type, message, args) {
  switch (type) {
    case 'error': console.error(message, args); break;
    case 'warn':  console.warn(message, args);  break;
    case 'info':  console.info(message, args);  break;
    default:      console.log(message, args);   break;
  }
});
```
